import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useRouteError,
} from "react-router";
import { AlertCircle, Heart } from "lucide-react";
import { getUserFavorites } from "~/services/favorite.server";
import { requireAuth } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { ShowCard } from "~/components/show-card";
import type { Route } from "./+types/favorites";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await requireAuth(request);
    const favorites = await getUserFavorites(userId);

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
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Failed to load favorites:", error);
    throw new Response("Failed to load favorites", { status: 500 });
  }
}

export default function Favorites() {
  const { favorites } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Favorites</h1>

      {favorites.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
          <Heart className="mx-auto mb-3 size-8 text-muted-foreground/60" />
          <p className="font-medium text-foreground">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse shows and tap the heart to save your favorites.
          </p>
          <Button variant="outline" size="sm" asChild className="mt-4">
            <Link to="/shows">Browse shows</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {favorites.map((fav) => (
            <ShowCard
              key={fav.id}
              show={fav.show}
              isFavorited
              linkTo={`/shows/${fav.show.date}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function meta() {
  return [{ title: "Favorites | Reprise" }];
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
