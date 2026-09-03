import type { Metadata } from "next";
import { AdvisoryClient } from "./_components/advisory-client";

export const metadata: Metadata = {
  title: "Panduan Kesihatan & Garis Panduan IPU Malaysia — MyJerebu",
  description: "Nasihat kesihatan rasmi Jabatan Alam Sekitar (JAS) dan Kementerian Kesihatan Malaysia (KKM) berdasarkan Indeks Pencemar Udara (IPU).",
};

export default function AdvisoryPage() {
  return <AdvisoryClient />;
}
