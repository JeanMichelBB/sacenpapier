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
 * This list is meant to grow — see the "Add a skill button?" step in the
 * sacenpapier-content skill, which checks new updates against it.
 */
export const skills: Skill[] = [
  { label: "Kubernetes", match: ["k3s", "Kubernetes"] },
  { label: "GitOps", match: ["GitOps", "ArgoCD", "FluxCD", "Kustomize"] },
  { label: "Security", match: ["Security", "CVE", "Dependencies", "NetworkPolicy", "SSH"] },
  { label: "Auth", match: ["Auth"] },
  { label: "MySQL", match: ["MySQL", "shared-mysql"] },
  { label: "Secrets Management", match: ["Doppler", "Secrets"] },
  { label: "Observability", match: ["Observability", "Prometheus", "OpenTelemetry", "Tracing"] },
  { label: "Infrastructure as Code", match: ["Terraform", "Ansible"] },
  { label: "Canvas / Real-time", match: ["Canvas", "WebSockets", "Procedural"] },
  { label: "Payments", match: ["Stripe", "Payments"] },
  { label: "Local LLM", match: ["Local LLM", "Ollama", "Hermes Agent"] },
];
