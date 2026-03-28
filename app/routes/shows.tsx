import { useCallback, useEffect, useRef } from "react";
import { Form, Link, useLoaderData, useNavigation, useSubmit } from "react-router";
import { Calendar, Loader2, MapPin, Search, X } from "lucide-react";
import { getShows, searchShows } from "~/services/show.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/shows";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));

  try {
    const result = query
      ? await searchShows(query, page)
      : await getShows(page);

    return {
      shows: result.shows.map((show) => ({
        id: show.id,
        date: show.date.toISOString().split("T")[0],
        tourName: show.tourName,
        venue: show.venue,
      })),
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      query,
    };
  } catch (error) {
    console.error("Failed to load shows:", error);
    throw new Response("Failed to load shows", { status: 500 });
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

function paginationHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("page", String(page));
  return `/shows?${params.toString()}`;
}

export default function Shows() {
  const { shows, totalPages, currentPage, query } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isSearching =
    navigation.state === "loading" &&
    new URLSearchParams(navigation.location?.search).has("q");

  const handleChange = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (formRef.current) {
        submit(formRef.current, { replace: true });
      }
    }, 300);
  }, [submit]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Shows</h1>

      <Form
        ref={formRef}
        method="get"
        action="/shows"
        className="mb-6 flex gap-2"
      >
        <div className="relative flex-1">
          {isSearching ? (
            <Loader2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            type="search"
            name="q"
            placeholder="Search by date, venue, or city..."
            defaultValue={query}
            onChange={handleChange}
            className="pl-9"
          />
        </div>
        {query && (
          <Button variant="ghost" size="icon" asChild>
            <Link to="/shows" aria-label="Clear search">
              <X className="size-4" />
            </Link>
          </Button>
        )}
      </Form>

      {shows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
          <p className="text-muted-foreground">
            {query
              ? `No shows found for "${query}"`
              : "No shows available."}
          </p>
        </div>
      ) : (
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
                  {show.venue.name} &middot; {show.venue.city},{" "}
                  {show.venue.state}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={currentPage <= 1}
          >
            <Link
              to={paginationHref(currentPage - 1, query)}
              aria-disabled={currentPage <= 1}
              className={
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }
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
              to={paginationHref(currentPage + 1, query)}
              aria-disabled={currentPage >= totalPages}
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
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
