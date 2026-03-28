import { Form, Link, redirect, useLoaderData } from "react-router";
import { ArrowLeft, Calendar, Clock, Heart, MapPin } from "lucide-react";
import { getShowByDate } from "~/services/show.server";
import { isShowFavorited, toggleFavorite } from "~/services/favorite.server";
import { getOptionalUser, requireAuth } from "~/utils/auth.server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/shows.$showDate";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { showDate } = params;

  try {
    const show = await getShowByDate(showDate);

    if (!show) {
      throw new Response("Show not found", { status: 404 });
    }

    const userId = await getOptionalUser(request);
    const isFavorited = userId
      ? await isShowFavorited(userId, show.id)
      : null;

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
        venue: show.venue,
      },
      sets: Array.from(tracksBySet.entries()).map(([setName, tracks]) => ({
        name: setName,
        tracks: tracks.map((t) => ({
          id: t.id,
          position: t.position,
          duration: t.duration,
          song: t.song,
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
    const show = await getShowByDate(showDate);

    if (!show) {
      throw new Response("Show not found", { status: 404 });
    }

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
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to shows
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {formatDate(show.date)}
          </h1>
          <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span>
                {show.venue.name} &middot; {show.venue.city}, {show.venue.state}
                {show.venue.country !== "USA" && `, ${show.venue.country}`}
              </span>
            </div>
            {show.tourName && (
              <div className="flex items-center gap-2">
                <Calendar className="size-4 shrink-0" />
                <span>{show.tourName}</span>
              </div>
            )}
            {show.duration && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                <span>{formatDuration(show.duration)}</span>
              </div>
            )}
          </div>
        </div>

        <Form method="post">
          <input type="hidden" name="intent" value="favorite" />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={
                isFavorited
                  ? "size-5 fill-red-500 text-red-500"
                  : "size-5 text-muted-foreground"
              }
            />
          </Button>
        </Form>
      </div>

      {sets.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
          <p className="text-muted-foreground">
            Setlist is not yet available for this show.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sets.map((set) => (
            <div key={set.name}>
              <h2 className="mb-3 text-lg font-semibold">{set.name}</h2>
              <div className="rounded-lg border border-border bg-card">
                {set.tracks.map((track, i) => (
                  <div key={track.id}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-right text-xs text-muted-foreground">
                          {track.position}
                        </span>
                        <span className="font-medium">
                          {track.song.title}
                        </span>
                        {!track.song.original && track.song.artist && (
                          <Badge variant="secondary" className="text-xs">
                            {track.song.artist}
                          </Badge>
                        )}
                      </div>
                      {track.duration && (
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(track.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
