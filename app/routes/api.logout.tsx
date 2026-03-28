import { logout } from "~/utils/auth.server";
import type { Route } from "./+types/api.logout";

export async function action({ request }: Route.ActionArgs) {
  try {
    return await logout(request);
  } catch (error) {
    console.error("Failed to logout:", error);
    throw new Response("Failed to logout", { status: 500 });
  }
}
