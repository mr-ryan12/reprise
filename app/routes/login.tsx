import { Form, redirect, useActionData, useSearchParams } from "react-router";
import { AlertCircle } from "lucide-react";
import {
  createUserSession,
  findOrCreateUser,
  getOptionalUser,
} from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { mergeMeta } from "~/lib/meta";
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
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Reprise</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a username to get started. No password needed.
          </p>
        </div>

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
              aria-invalid={actionData?.error ? true : undefined}
              className={actionData?.error ? "border-destructive" : ""}
            />
            <div className="min-h-6 mt-1.5">
              {actionData?.error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {actionData.error}
                </p>
              )}
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Log in
          </Button>
        </Form>
      </div>
    </div>
  );
}

export function meta({ matches }: Route.MetaArgs) {
  const parentMeta = matches.flatMap((match) => match?.meta ?? []);
  return mergeMeta(parentMeta, [
    { title: "Log In | Reprise" },
    { property: "og:title", content: "Log In | Reprise" },
  ]);
}
