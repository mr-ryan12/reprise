import { Form, redirect, useActionData, useSearchParams } from "react-router";
import {
  createUserSession,
  findOrCreateUser,
  getOptionalUser,
} from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await getOptionalUser(request);
    if (userId) return redirect("/shows");
    return null;
  } catch (error) {
    console.error("Failed to check session:", error);
    throw new Response("Failed to load login page", { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const username = String(formData.get("username") ?? "").trim();
    const redirectTo = String(formData.get("redirectTo") ?? "/shows");

    if (!username) {
      return { error: "Username is required" };
    }

    const user = await findOrCreateUser(username);
    return createUserSession(user.id, redirectTo);
  } catch (error) {
    console.error("Failed to login:", error);
    throw new Response("Failed to login", { status: 500 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/shows";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center px-4">
      <div className="w-full">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          Welcome to Reprise
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter a username to get started. No password needed.
        </p>

        <Form method="post" className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              autoComplete="username"
              autoFocus
              required
            />
            {actionData?.error && (
              <p className="mt-1.5 text-sm text-destructive">
                {actionData.error}
              </p>
            )}
          </div>
          <Button type="submit">Log in</Button>
        </Form>
      </div>
    </div>
  );
}
