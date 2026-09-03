import type { Metadata } from "next";
import { LoginClient } from "./_components/login-client";

export const metadata: Metadata = {
  title: "Log Masuk — MyJerebu Portal Kualiti Udara Malaysia",
  description: "Log masuk ke Portal Pengurusan dan Pemantauan Kualiti Udara & Jerebu Malaysia.",
};

export default function LoginPage() {
  return <LoginClient />;
}
