import { redirect } from "react-router";

// Add comment to test pipeline
export function loader() {
  return redirect("/shows");
}
