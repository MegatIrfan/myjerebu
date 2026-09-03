import type { Metadata } from "next";
import { ReportsClient } from "./_components/reports-client";

export const metadata: Metadata = {
  title: "Laporan Jerebu Tahunan & Arkib Sejarah — MyJerebu",
  description: "Arkib laporan rasmi kualiti udara, analisis episod jerebu bermusim dan dokumen teknikal alam sekitar Malaysia.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
