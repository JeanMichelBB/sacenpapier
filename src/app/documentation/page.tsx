import type { Metadata } from "next";
import { DocumentationPageClient } from "@/components/DocumentationPageClient";

export const metadata: Metadata = {
  title: "Documentation",
  description: "A full reference for the homelab — every device, what's deployed, and the connective layer that ties it together.",
};

export default function DocumentationPage() {
  return <DocumentationPageClient />;
}
