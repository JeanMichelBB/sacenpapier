const ENDPOINTS = [
  { name: "x", url: "https://xapi.sacenpapier.org/api/health" },
  { name: "PopRoom", url: "https://poproomapi.sacenpapier.org/api/health" },
  { name: "BotWhy", url: "https://botwhyapi.sacenpapier.org/api/health" },
  { name: "Aperçu", url: "https://apercuapi.sacenpapier.org/api/health" },
];

export async function GET() {
  const apps = await Promise.all(
    ENDPOINTS.map(async ({ name, url }) => {
      const start = performance.now();
      try {
        const res = await fetch(url, { cache: "no-store" });
        const ms = Math.round(performance.now() - start);
        return { name, ms, ok: res.ok };
      } catch {
        return { name, ms: null, ok: false };
      }
    })
  );

  return Response.json({ apps }, { headers: { "Cache-Control": "no-store" } });
}
