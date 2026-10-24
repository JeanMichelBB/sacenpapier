import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type UpstreamNode = {
  name: string;
  role: string;
  online: boolean;
  [key: string]: unknown;
};

export async function GET() {
  try {
    const res = await fetchWithTimeout("https://homelabapi.sacenpapier.org/api/nodes", {
      cache: "no-store",
    });
    const data: UpstreamNode[] = await res.json();
    const nodes = data.map(({ name, role, online }) => ({ name, role, online }));
    return Response.json(nodes, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
