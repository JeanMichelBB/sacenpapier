export type Project = {
  name: string;
  slug: string;
  description: { en: string; fr: string };
  url: string;
  tags: string[];
  status: "live" | "wip" | "archived";
};

export const projects: Project[] = [
  {
    name: "x",
    slug: "x",
    description: {
      en: "A Twitter-like social media platform with posts, follows, DMs and notifications.",
      fr: "Une plateforme sociale inspirée de Twitter avec publications, abonnements, DMs et notifications.",
    },
    url: "https://x.sacenpapier.org",
    tags: ["React", "FastAPI", "MySQL", "Docker"],
    status: "live",
  },
  {
    name: "PopRoom",
    slug: "poproom",
    description: {
      en: "Real-time multiplayer canvas where users control pixel-art stickmen and pop each other's balloons.",
      fr: "Canevas multijoueur en temps réel où les utilisateurs contrôlent des bonhommes allumettes et éclatent des ballons.",
    },
    url: "https://poproom.sacenpapier.org",
    tags: ["React", "FastAPI", "WebSockets", "Canvas"],
    status: "live",
  },
  {
    name: "BotWhy",
    slug: "botwhy",
    description: {
      en: "AI chat application powered by GPT-4o with Google OAuth authentication.",
      fr: "Application de chat IA propulsée par GPT-4o avec authentification Google OAuth.",
    },
    url: "https://botwhy.sacenpapier.org",
    tags: ["React", "FastAPI", "OpenAI", "OAuth"],
    status: "live",
  },
  {
    name: "Aperçu",
    slug: "apercu",
    description: {
      en: "A full-stack monorepo with EN/FR support, email submission and API key auth.",
      fr: "Un monorepo full-stack avec support EN/FR, envoi d'emails et authentification par clé API.",
    },
    url: "https://apercu.sacenpapier.org",
    tags: ["React", "FastAPI", "Docker", "CI/CD"],
    status: "live",
  },
];
