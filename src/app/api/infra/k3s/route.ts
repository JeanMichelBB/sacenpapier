export async function GET() {
  const res = await fetch("https://homelabapi.sacenpapier.org/api/k3s", {
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
