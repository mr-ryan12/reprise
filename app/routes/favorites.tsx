import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useRouteError,
} from "react-router";
import { Calendar, Heart, MapPin } from "lucide-react";
import { getUserFavorites } from "~/services/favorite.server";
import { requireAuth } from "~/utils/auth.server";
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

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Favorites() {
  const { favorites } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Favorites</h1>

      {favorites.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
          <Heart className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No favorites yet. Browse{" "}
            <Link to="/shows" className="underline hover:text-foreground">
              shows
            </Link>{" "}
            and tap the heart to save your favorites.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              to={`/shows/${fav.show.date}`}
              className="group flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="size-4 shrink-0 text-muted-foreground" />
                <span>{formatDate(fav.show.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:text-right">
                <MapPin className="size-4 shrink-0 sm:hidden" />
                <span>
                  {fav.show.venue.name} &middot; {fav.show.venue.city},{" "}
                  {fav.show.venue.state}
                </span>
              </div>
            </Link>
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
      <h1 className="mb-4 text-2xl font-bold">Error</h1>
      <p className="text-muted-foreground">{message}</p>
      <Link to="/shows" className="mt-4 inline-block text-sm underline">
        Back to shows
      </Link>
    </div>
  );
}
