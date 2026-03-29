import { useCallback, useEffect, useRef } from "react";
import {
  Form,
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSubmit,
} from "react-router";
import { Loader2, Search, SearchX, X } from "lucide-react";
import { getShows, searchShows } from "~/services/show.server";
import { getUserFavoriteShowIds } from "~/services/favorite.server";
import { getOptionalUser } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ShowCard } from "~/components/show-card";
import type { Route } from "./+types/shows";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));

  try {
    const [result, userId] = await Promise.all([
      query ? searchShows(query, page) : getShows(page),
      getOptionalUser(request),
    ]);

    const favoriteShowIds = userId
      ? await getUserFavoriteShowIds(userId)
      : new Set<string>();

    return {
      shows: result.shows.map((show) => ({
        id: show.id,
        date: show.date.toISOString().split("T")[0],
        tourName: show.tourName,
        venue: show.venue,
        albumCoverUrl: show.albumCoverUrl,
        isFavorited: favoriteShowIds.has(show.id),
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
        className="mb-6 flex items-center gap-2"
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

      {query && shows.length > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          {shows.length === 25 ? "25+" : shows.length} show
          {shows.length !== 1 ? "s" : ""} found for &ldquo;{query}&rdquo;
        </p>
      )}

      {shows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
          <SearchX className="mx-auto mb-3 size-8 text-muted-foreground/60" />
          <p className="font-medium text-foreground">
            {query ? "No shows found" : "No shows available"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query
              ? `Try a different search term or check the spelling of "${query}".`
              : "Check back later for show listings."}
          </p>
          {query && (
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link to="/shows">Clear search</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {shows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              isFavorited={show.isFavorited}
              linkTo={`/shows/${show.date}`}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-3"
          aria-label="Pagination"
        >
          <Button
            variant="outline"
            size="default"
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
          <span className="min-w-[5rem] text-center text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="default"
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

export function meta() {
  return [{ title: "Shows | Reprise" }];
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.data || "Something went wrong loading shows."
    : "An unexpected error occurred.";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <SearchX className="mx-auto mb-3 size-8 text-muted-foreground/60" />
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link to="/shows">Try again</Link>
        </Button>
      </div>
    </div>
  );
}
