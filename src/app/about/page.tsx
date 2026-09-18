import type { Metadata } from "next";
import { AboutPageClient } from "@/components/AboutPageClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bilingual full-stack developer with a background in pharmacy management, photography, and short films.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
