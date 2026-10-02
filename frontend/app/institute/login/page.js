// app/institute/login/page.js
// The separate institute login was removed. Everyone logs in at /login.
// Kept as a redirect so old links, bookmarks and search results still work.
import { redirect } from "next/navigation";

export const metadata = { robots: { index: false, follow: true } };

export default function InstituteLoginRedirect() {
  redirect("/login");
}