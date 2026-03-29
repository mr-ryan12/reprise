import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "react-router";
import { AlertCircle, Heart, LogOut } from "lucide-react";
import { prisma } from "~/lib/db.server";
import { getOptionalUser } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { PlayerProvider } from "~/components/player-provider";
import { usePlayer } from "~/lib/player-context";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await getOptionalUser(request);
    if (!userId) return { user: null };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    return { user };
  } catch (error) {
    console.error("Failed to load user session:", error);
    return { user: null };
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function NavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={isActive ? "bg-accent text-accent-foreground" : ""}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <PlayerProvider>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
          <Link
            to="/shows"
            className="text-lg font-bold tracking-tight transition-colors hover:text-foreground/80"
          >
            Reprise
          </Link>
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/shows">Shows</NavLink>
                <NavLink to="/favorites">
                  <Heart className="size-3.5" />
                  Favorites
                </NavLink>
                <span className="ml-2 hidden text-sm text-muted-foreground sm:inline">
                  {user.username}
                </span>
                <Form method="post" action="/api/logout">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Log out"
                    className="ml-1"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </Form>
              </>
            ) : (
              <>
                <NavLink to="/shows">Shows</NavLink>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>
      <PlayerPaddedContent />
    </PlayerProvider>
  );
}

function PlayerPaddedContent() {
  const { currentTrack, isMinimized } = usePlayer();
  const padding = !currentTrack ? 0 : isMinimized ? "3.5rem" : "8rem";
  return (
    <div
      className="transition-[padding-bottom] duration-300 ease-in-out"
      style={{ paddingBottom: padding }}
    >
      <Outlet />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page not found" : "Something went wrong";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-lg border border-border bg-card px-6 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-muted-foreground/60" />
        <h1 className="text-lg font-semibold">{message}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{details}</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link to="/shows">Go to shows</Link>
        </Button>
      </div>
      {stack && (
        <pre className="mt-8 w-full overflow-x-auto rounded-lg bg-muted p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
