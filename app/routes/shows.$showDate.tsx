import {
  Form,
  isRouteErrorResponse,
  Link,
  redirect,
  useLoaderData,
  useRouteError,
} from "react-router";
import { ArrowLeft, Calendar, Clock, Heart, Music } from "lucide-react";
import { getShowByDate } from "~/services/show.server";
import {
  isShowFavorited,
  toggleFavorite,
  toggleTrackFavorite,
  getUserFavoriteTrackIds,
} from "~/services/favorite.server";
import { getOptionalUser, requireAuth } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { TrackRow } from "~/components/track-row";
import { AlbumCover } from "~/components/album-cover";
import type { PlayableTrack } from "~/lib/player-context";
import { mergeMeta } from "~/lib/meta";
import type { Route } from "./+types/shows.$showDate";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { showDate } = params;

  try {
    const show = await getShowByDate(showDate);

    if (!show) {
      throw new Response("Show not found", { status: 404 });
    }

    const userId = await getOptionalUser(request);
    const [isFavorited, favoriteTrackIds] = userId
      ? await Promise.all([
          isShowFavorited(userId, show.id),
          getUserFavoriteTrackIds(userId),
        ])
      : [null, new Set<string>()];

    const tracksBySet = new Map<string, typeof show.tracks>();
    for (const track of show.tracks) {
      const existing = tracksBySet.get(track.setName) ?? [];
      existing.push(track);
      tracksBySet.set(track.setName, existing);
    }

    return {
      show: {
        id: show.id,
        date: show.date.toISOString().split("T")[0],
        tourName: show.tourName,
        duration: show.duration,
        notes: show.notes,
        albumCoverUrl: show.albumCoverUrl,
        venue: show.venue,
      },
      sets: Array.from(tracksBySet.entries()).map(([setName, tracks]) => ({
        name: setName,
        tracks: tracks.map((t) => ({
          id: t.id,
          position: t.position,
          duration: t.duration,
          mp3Url: t.mp3Url,
          song: t.song,
          isFavorited: favoriteTrackIds.has(t.id),
        })),
      })),
      isFavorited,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Failed to load show:", error);
    throw new Response("Failed to load show", { status: 500 });
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const { showDate } = params;

  try {
    const userId = await requireAuth(request);
    const formData = await request.formData();
    const intent = String(formData.get("intent") ?? "");

    if (intent === "track-favorite") {
      const trackId = String(formData.get("trackId") ?? "");
      if (!trackId) throw new Response("Track ID required", { status: 400 });
      const isFavorited = await toggleTrackFavorite(userId, trackId);
      return { isFavorited };
    }

    // show-favorite (default)
    const show = await getShowByDate(showDate);
    if (!show) throw new Response("Show not found", { status: 404 });
    await toggleFavorite(userId, show.id);
    return redirect(`/shows/${showDate}`);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Failed to toggle favorite:", error);
    throw new Response("Failed to toggle favorite", { status: 500 });
  }
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ShowDetail() {
  const { show, sets, isFavorited } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/shows"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Shows
      </Link>

      <div className="show-detail-gradient -mx-4 mb-8 flex gap-5 rounded-xl px-4 py-5">
        <AlbumCover
          src={show.albumCoverUrl}
          alt={`${formatDate(show.date)} album cover`}
          size="lg"
          className="hidden sm:block"
        />
        <AlbumCover
          src={show.albumCoverUrl}
          alt={`${formatDate(show.date)} album cover`}
          size="md"
          className="sm:hidden"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {formatDate(show.date)}
            </h1>
            <Form method="post" className="shrink-0">
              <input type="hidden" name="intent" value="show-favorite" />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="transition-colors"
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`size-5 transition-colors ${
                    isFavorited
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                />
              </Button>
            </Form>
          </div>

          <p className="mt-1.5 text-base font-medium text-foreground/80">
            {show.venue.name}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {show.venue.city}, {show.venue.state}
            {show.venue.country !== "USA" && `, ${show.venue.country}`}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {show.tourName && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                {show.tourName}
              </span>
            )}
            {show.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" />
                {formatDuration(show.duration)}
              </span>
            )}
          </div>
        </div>
      </div>

      {sets.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
          <Music className="mx-auto mb-3 size-8 text-muted-foreground/60" />
          <p className="font-medium text-foreground">No setlist available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The setlist for this show hasn&apos;t been added yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {sets.map((set) => {
            const setTracks: PlayableTrack[] = set.tracks
              .filter((t) => t.mp3Url)
              .map((t) => ({
                id: t.id,
                mp3Url: t.mp3Url!,
                songTitle: t.song.title,
                showDate: show.date,
                venueName: show.venue.name,
                setName: set.name,
                position: t.position,
              }));

            return (
              <div key={set.name}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {set.name}
                </h2>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  {set.tracks.map((track, i) => (
                    <div key={track.id}>
                      {i > 0 && <Separator />}
                      <TrackRow
                        track={track}
                        showDate={show.date}
                        venueName={show.venue.name}
                        setName={set.name}
                        setTracks={setTracks}
                        isFavorited={track.isFavorited}
                        isLoggedIn={isFavorited !== null}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function meta({ data, matches }: Route.MetaArgs) {
  const parentMeta = matches.flatMap((match) => match?.meta ?? []);
  if (!data?.show) {
    return mergeMeta(parentMeta, [{ title: "Show Not Found | Reprise" }]);
  }
  const title = `${data.show.date} - ${data.show.venue.name} | Reprise`;
  return mergeMeta(parentMeta, [
    { title },
    { property: "og:title", content: title },
    { property: "og:url", content: `https://reprise.dev/shows/${data.show.date}` },
  ]);
}

export function ErrorBoundary() {
  const error = useRouteError();
  const is404 =
    isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/shows"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Shows
      </Link>
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <Music className="mx-auto mb-3 size-8 text-muted-foreground/60" />
        <h1 className="text-lg font-semibold">
          {is404 ? "Show not found" : "Something went wrong"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {is404
            ? "We couldn't find a show for that date."
            : "Something went wrong loading this show."}
        </p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link to="/shows">Browse shows</Link>
        </Button>
      </div>
    </div>
  );
}
