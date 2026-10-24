export type Skill = {
  /** Button label shown to visitors. */
  label: string;
  /** Post tags (case-insensitive) that count as this skill. An update
   * matches a skill if any of its own tags appears in this list. */
  match: string[];
};

/**
 * Curated skill filters for the Updates page — lets a recruiter click
 * "Kubernetes" or "Security" and see only the updates that demonstrate it,
 * instead of reading tag chips on every post. Deliberately narrower than
 * the raw tag list: several tags fold into one skill (ArgoCD/FluxCD/
 * Kustomize -> GitOps) and project-name tags (x, BotWhy, PopRoom, Apercu)
 * aren't skills, so they're left out.
 *
 * Grouped into ~10 categories (per plan-oct-23.md §2) instead of one chip
 * per tool, so the filter row reads as a skill list rather than a tag
 * cloud. A few tags could reasonably sit in more than one bucket (Traefik:
 * Kubernetes vs Networking; TLS: Security vs Networking) — these are
 * judgment calls, rebalance freely.
 */
export const skills: Skill[] = [
  { label: "Kubernetes", match: ["k3s", "Kubernetes"] },
  { label: "GitOps", match: ["GitOps", "ArgoCD", "FluxCD", "Kustomize"] },
  { label: "CI/CD", match: ["CI/CD", "GitHub Actions", "Docker"] },
  {
    label: "Observability",
    match: ["Observability", "Prometheus", "OpenTelemetry", "Tracing", "Monitoring", "Alertmanager", "Uptime Kuma", "Tempo", "Reliability"],
  },
  {
    label: "Security",
    match: ["Security", "CVE", "Dependencies", "NetworkPolicy", "SSH", "RBAC", "Trivy", "JWT", "OAuth", "Auth", "TLS", "Doppler", "Secrets"],
  },
  { label: "Networking", match: ["Networking", "OPNsense", "Traefik"] },
  { label: "Storage", match: ["Longhorn", "TrueNAS"] },
  { label: "Infrastructure as Code", match: ["Terraform", "Ansible"] },
  { label: "Databases", match: ["MySQL", "shared-mysql", "SQLAlchemy", "SQLite"] },
  {
    label: "App Development",
    match: [
      "React", "TypeScript", "Vite", "CSS", "Mobile", "i18n", "Canvas", "WebSockets", "Procedural",
      "Payments", "Stripe", "Local LLM", "Ollama", "Hermes Agent", "FastAPI", "OpenRouter", "vLLM",
    ],
  },
];
