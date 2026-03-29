import { useMemo, useState } from "react";
import {
  isRouteErrorResponse,
  Link,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "react-router";
import { AlertCircle, Heart, Music, Pause, Play } from "lucide-react";
import {
  getUserFavorites,
  getUserTrackFavorites,
  toggleFavorite,
  toggleTrackFavorite,
} from "~/services/favorite.server";
import { requireAuth } from "~/utils/auth.server";
import { usePlayer, type PlayableTrack } from "~/lib/player-context";
import { Button } from "~/components/ui/button";
import { AlbumCover } from "~/components/album-cover";
import { mergeMeta } from "~/lib/meta";
import type { Route } from "./+types/favorites";

export async function action({ request }: Route.ActionArgs) {
  try {
    const userId = await requireAuth(request);
    const formData = await request.formData();
    const intent = String(formData.get("intent") ?? "");

    if (intent === "unfavorite-show") {
      const showId = String(formData.get("showId") ?? "");
      if (!showId) throw new Response("Show ID required", { status: 400 });
      await toggleFavorite(userId, showId);
      return { ok: true };
    }

    if (intent === "unfavorite-track") {
      const trackId = String(formData.get("trackId") ?? "");
      if (!trackId) throw new Response("Track ID required", { status: 400 });
      await toggleTrackFavorite(userId, trackId);
      return { ok: true };
    }

    throw new Response("Unknown intent", { status: 400 });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Failed to update favorite:", error);
    throw new Response("Failed to update favorite", { status: 500 });
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await requireAuth(request);
    const [favorites, trackFavorites] = await Promise.all([
      getUserFavorites(userId),
      getUserTrackFavorites(userId),
    ]);

    return {
      favorites: favorites.map((fav) => ({
        id: fav.id,
        createdAt: fav.createdAt.toISOString(),
        show: {
          id: fav.show.id,
          date: fav.show.date.toISOString().split("T")[0],
          tourName: fav.show.tourName,
          albumCoverUrl: fav.show.albumCoverUrl,
          venue: fav.show.venue,
        },
      })),
      trackFavorites: trackFavorites.map((fav) => ({
        id: fav.id,
        createdAt: fav.createdAt.toISOString(),
        track: {
          id: fav.track.id,
          position: fav.track.position,
          duration: fav.track.duration,
          mp3Url: fav.track.mp3Url,
          setName: fav.track.setName,
          song: fav.track.song,
          show: {
            date: fav.track.show.date.toISOString().split("T")[0],
            albumCoverUrl: fav.track.show.albumCoverUrl,
            venue: fav.track.show.venue,
          },
        },
      })),
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Failed to load favorites:", error);
    throw new Response("Failed to load favorites", { status: 500 });
  }
}

type Tab = "shows" | "tracks";

export default function Favorites() {
  const { favorites, trackFavorites } = useLoaderData<typeof loader>();
  const [tab, setTab] = useState<Tab>("shows");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Favorites</h1>

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted p-1">
        <button
          onClick={() => setTab("shows")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "shows"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Shows{favorites.length > 0 ? ` (${favorites.length})` : ""}
        </button>
        <button
          onClick={() => setTab("tracks")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "tracks"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Tracks{trackFavorites.length > 0 ? ` (${trackFavorites.length})` : ""}
        </button>
      </div>

      {tab === "shows" ? (
        <ShowFavorites favorites={favorites} />
      ) : (
        <TrackFavorites trackFavorites={trackFavorites} />
      )}
    </div>
  );
}

function ShowFavoriteCard({
  fav,
}: {
  fav: ReturnType<typeof useLoaderData<typeof loader>>["favorites"][number];
}) {
  const fetcher = useFetcher();
  const isRemoving = fetcher.state !== "idle";

  if (isRemoving) return null;

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent">
      <Link to={`/shows/${fav.show.date}`} className="flex min-w-0 flex-1 items-center gap-4">
        <AlbumCover
          src={fav.show.albumCoverUrl}
          alt={`${fav.show.date} album cover`}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-snug tracking-tight">
            {fav.show.date}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground/80">
            {fav.show.venue.name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {fav.show.venue.city}, {fav.show.venue.state}
            {fav.show.tourName && (
              <span className="ml-1.5 text-muted-foreground/60">
                &middot; {fav.show.tourName}
              </span>
            )}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() =>
          fetcher.submit(
            { intent: "unfavorite-show", showId: fav.show.id },
            { method: "post" },
          )
        }
        className="flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent"
        aria-label="Remove from favorites"
      >
        <Heart className="size-4 fill-red-500 text-red-500 transition-colors hover:fill-red-400 hover:text-red-400" />
      </button>
    </div>
  );
}

function ShowFavorites({
  favorites,
}: {
  favorites: ReturnType<typeof useLoaderData<typeof loader>>["favorites"];
}) {
  if (favorites.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <Heart className="mx-auto mb-3 size-8 text-muted-foreground/60" />
        <p className="font-medium text-foreground">No favorite shows yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse shows and tap the heart to save your favorites.
        </p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link to="/shows">Browse shows</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {favorites.map((fav) => (
        <ShowFavoriteCard key={fav.id} fav={fav} />
      ))}
    </div>
  );
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function TrackFavorites({
  trackFavorites,
}: {
  trackFavorites: ReturnType<
    typeof useLoaderData<typeof loader>
  >["trackFavorites"];
}) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayer();

  const queue = useMemo<PlayableTrack[]>(
    () =>
      trackFavorites
        .filter((fav) => fav.track.mp3Url)
        .map((fav) => ({
          id: fav.track.id,
          mp3Url: fav.track.mp3Url!,
          songTitle: fav.track.song.title,
          showDate: fav.track.show.date,
          venueName: fav.track.show.venue.name,
          setName: fav.track.setName,
          position: fav.track.position,
        })),
    [trackFavorites],
  );

  function handleTrackClick(trackId: string) {
    const isCurrentTrack = currentTrack?.id === trackId;
    if (isCurrentTrack && isPlaying) {
      pause();
    } else if (isCurrentTrack) {
      resume();
    } else {
      const track = queue.find((t) => t.id === trackId);
      if (track) play(track, queue);
    }
  }

  if (trackFavorites.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <Music className="mx-auto mb-3 size-8 text-muted-foreground/60" />
        <p className="font-medium text-foreground">No favorite tracks yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a show and tap the heart on any track to save it.
        </p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link to="/shows">Browse shows</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {trackFavorites.map((fav, i) => (
        <TrackFavoriteRow
          key={fav.id}
          fav={fav}
          index={i}
          isCurrentTrack={currentTrack?.id === fav.track.id}
          isPlaying={isPlaying}
          onPlay={() => handleTrackClick(fav.track.id)}
        />
      ))}
    </div>
  );
}

function TrackFavoriteRow({
  fav,
  index,
  isCurrentTrack,
  isPlaying,
  onPlay,
}: {
  fav: ReturnType<
    typeof useLoaderData<typeof loader>
  >["trackFavorites"][number];
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const fetcher = useFetcher();
  const isPlayable = Boolean(fav.track.mp3Url);
  const isRemoving = fetcher.state !== "idle";

  if (isRemoving) return null;

  return (
    <div>
      {index > 0 && <div className="mx-4 border-t border-border" />}
      <div
        role={isPlayable ? "button" : undefined}
        tabIndex={isPlayable ? 0 : undefined}
        onClick={() => isPlayable && onPlay()}
        onKeyDown={(e) => {
          if (isPlayable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onPlay();
          }
        }}
        className={`flex items-center gap-4 px-4 py-3 ${
          isPlayable
            ? "cursor-pointer transition-colors hover:bg-accent/50"
            : ""
        } ${isCurrentTrack ? "bg-accent/40" : ""}`}
      >
        <span className="flex w-6 shrink-0 items-center justify-center text-muted-foreground">
          {isCurrentTrack && isPlaying ? (
            <span className="equalizer flex items-end gap-0.5" aria-label="Playing">
              <span className="equalizer-bar h-2.5 w-0.75 rounded-sm bg-primary" />
              <span className="equalizer-bar h-3.5 w-0.75 rounded-sm bg-primary" />
              <span className="equalizer-bar h-2 w-0.75 rounded-sm bg-primary" />
            </span>
          ) : isCurrentTrack ? (
            <Pause className="size-4 text-primary" />
          ) : (
            <Play className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold leading-snug tracking-tight ${
              isCurrentTrack ? "text-primary" : ""
            }`}
          >
            {fav.track.song.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {fav.track.show.date} &middot; {fav.track.show.venue.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {fav.track.duration && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {formatDuration(fav.track.duration)}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetcher.submit(
                { intent: "unfavorite-track", trackId: fav.track.id },
                { method: "post" },
              );
            }}
            className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
            aria-label="Remove from favorites"
          >
            <Heart className="size-4 fill-red-500 text-red-500 transition-colors hover:fill-red-400 hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function meta({ matches }: Route.MetaArgs) {
  const parentMeta = matches.flatMap((match) => match?.meta ?? []);
  return mergeMeta(parentMeta, [
    { title: "Favorites | Reprise" },
    { property: "og:title", content: "Favorites | Reprise" },
  ]);
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.data || "Something went wrong loading favorites."
    : "An unexpected error occurred.";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-muted-foreground/60" />
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link to="/shows">Browse shows</Link>
        </Button>
      </div>
    </div>
  );
}
