import { createCookieSessionStorage, redirect } from "react-router";
import { prisma } from "~/lib/db.server";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function requireAuth(request: Request): Promise<string> {
  const session = await getUserSession(request);
  const userId = session.get("userId") as string | undefined;
  if (!userId) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
  return userId;
}

export async function getOptionalUser(
  request: Request
): Promise<string | null> {
  const session = await getUserSession(request);
  return (session.get("userId") as string | undefined) ?? null;
}

export async function findOrCreateUser(username: string) {
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username },
  });
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
