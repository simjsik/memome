import { redirect } from "next/navigation";

export default async function defaultPage() {
  redirect("/home/main");
}
