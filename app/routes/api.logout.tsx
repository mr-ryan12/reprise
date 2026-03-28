import { redirect } from "react-router";

export async function action() {
  return redirect("/login");
}
