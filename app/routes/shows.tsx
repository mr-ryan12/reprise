import { Link, useLoaderData } from "react-router";
import { Calendar, MapPin } from "lucide-react";
import { getShows } from "~/services/show.server";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/shows";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));

  const result = await getShows(page);

  return {
    shows: result.shows.map((show) => ({
      id: show.id,
      date: show.date.toISOString().split("T")[0],
      tourName: show.tourName,
      venue: show.venue,
    })),
    totalPages: result.totalPages,
    currentPage: result.currentPage,
  };
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

export default function Shows() {
  const { shows, totalPages, currentPage } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Shows</h1>

      <div className="flex flex-col gap-2">
        {shows.map((show) => (
          <Link
            key={show.id}
            to={`/shows/${show.date}`}
            className="group flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2 font-medium">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <span>{formatDate(show.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground sm:text-right">
              <MapPin className="size-4 shrink-0 sm:hidden" />
              <span>
                {show.venue.name} &middot; {show.venue.city}, {show.venue.state}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
            <Link
              to={`/shows?page=${currentPage - 1}`}
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              Previous
            </Link>
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={currentPage >= totalPages}
          >
            <Link
              to={`/shows?page=${currentPage + 1}`}
              aria-disabled={currentPage >= totalPages}
              className={
                currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            >
              Next
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}
