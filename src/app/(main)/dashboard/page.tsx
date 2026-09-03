import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard/air-quality");
  return null;
}
