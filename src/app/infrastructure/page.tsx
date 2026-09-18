import type { Metadata } from "next";
import { InfrastructurePageClient } from "@/components/InfrastructurePageClient";

export const metadata: Metadata = {
  title: "Infrastructure",
  description:
    "A live k3s cluster spanning a homelab and two cloud workers — physical network, Tailscale overlay, and real-time node status.",
};

export default function InfrastructurePage() {
  return <InfrastructurePageClient />;
}
