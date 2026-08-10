import { redirect } from "next/navigation";
import type { Route } from "next";

export default function ArtisanPage() {
  redirect("/artesana/dashboard" as Route);
}
