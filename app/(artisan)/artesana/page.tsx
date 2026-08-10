import { redirect } from "next/navigation";
import type { Route } from "next";

export default function ArtesanaAliasPage() {
  redirect("/artesana/dashboard" as Route);
}
