export type TagLayer = "frontend" | "backend" | "infra";

const TAG_LAYERS: Record<string, TagLayer> = {
  React: "frontend",
  TypeScript: "frontend",
  Canvas: "frontend",
  FastAPI: "backend",
  MySQL: "backend",
  WebSockets: "backend",
  OpenRouter: "backend",
  Stripe: "backend",
  OAuth: "backend",
  JWT: "backend",
  Docker: "infra",
  "CI/CD": "infra",
};

export const TAG_LAYER_DOT: Record<TagLayer, string> = {
  frontend: "bg-sky-400",
  backend: "bg-violet-400",
  infra: "bg-amber-400",
};

export function getTagLayer(tag: string): TagLayer | undefined {
  return TAG_LAYERS[tag];
}
