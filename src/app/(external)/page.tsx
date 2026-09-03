import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard/air-quality");
  return null;
}
