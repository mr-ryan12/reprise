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
} from "react-router";
import { Heart, LogOut } from "lucide-react";
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

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <PlayerProvider>
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/shows" className="text-lg font-bold tracking-tight">
            Reprise
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/favorites">
                    <Heart className="size-4" />
                    Favorites
                  </Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                  {user.username}
                </span>
                <Form method="post" action="/api/logout">
                  <Button variant="ghost" size="icon-sm" aria-label="Log out">
                    <LogOut className="size-4" />
                  </Button>
                </Form>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
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
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
