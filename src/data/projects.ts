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
      en: "A Twitter-like social platform — tweets, retweets, likes, follows, direct messages and notifications.",
      fr: "Une plateforme sociale inspirée de Twitter — tweets, retweets, mentions J'aime, abonnements, messages directs et notifications.",
    },
    url: "https://x.sacenpapier.org",
    tags: ["React", "TypeScript", "FastAPI", "MySQL", "Docker"],
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
      en: "A sarcastic, intentionally unhelpful AI chatbot — pick from 8 models via OpenRouter, pay-as-you-go credits via Stripe, Google OAuth login.",
      fr: "Un chatbot IA sarcastique et volontairement peu serviable — 8 modèles au choix via OpenRouter, crédits payants via Stripe, connexion Google OAuth.",
    },
    url: "https://botwhy.sacenpapier.org",
    tags: ["React", "FastAPI", "OpenRouter", "Stripe", "OAuth"],
    status: "live",
  },
  {
    name: "Aperçu",
    slug: "apercu",
    description: {
      en: "Full-stack event management platform — organizers publish events, speakers and blog posts under admin approval.",
      fr: "Plateforme full-stack de gestion d'événements. Les organisateurs publient événements, conférenciers et articles sous approbation admin, avec support EN/FR.",
    },
    url: "https://apercu.sacenpapier.org",
    tags: ["React", "FastAPI", "MySQL", "JWT", "Docker", "CI/CD"],
    status: "live",
  },
];
