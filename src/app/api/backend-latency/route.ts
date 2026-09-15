const ENDPOINTS = [
  "https://xapi.sacenpapier.org/api/health",
  "https://poproomapi.sacenpapier.org/api/health",
  "https://botwhyapi.sacenpapier.org/api/health",
  "https://apercuapi.sacenpapier.org/api/health",
];

export async function GET() {
  const timings = await Promise.all(
    ENDPOINTS.map(async (url) => {
      const start = performance.now();
      try {
        const res = await fetch(url, { cache: "no-store" });
        const ms = performance.now() - start;
        return res.ok ? ms : null;
      } catch {
        return null;
      }
    })
  );

  const ok = timings.filter((t): t is number => t !== null);
  const avgMs = ok.length > 0 ? Math.round(ok.reduce((a, b) => a + b, 0) / ok.length) : null;

  return Response.json({ avgMs, sampled: ok.length, total: ENDPOINTS.length }, { headers: { "Cache-Control": "no-store" } });
}
