import { redirect } from "next/navigation";

export default async function defaultPage() {
  redirect("/login");
}
