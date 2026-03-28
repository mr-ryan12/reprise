import { redirect } from "react-router";

export async function action() {
  try {
    return redirect("/login");
  } catch (error) {
    console.error("Failed to logout:", error);
    throw new Response("Failed to logout", { status: 500 });
  }
}
