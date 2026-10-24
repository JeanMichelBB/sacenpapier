import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type UpstreamK3sData = {
  nodes: { name: string; status: string; role: string; [key: string]: unknown }[];
  pods: { total: number; running: number; pending: number; failed: number };
};

export async function GET() {
  try {
    const res = await fetchWithTimeout("https://homelabapi.sacenpapier.org/api/k3s", {
      cache: "no-store",
    });
    const data: UpstreamK3sData = await res.json();
    const payload = {
      nodes: data.nodes.map(({ name, status, role }) => ({ name, status, role })),
      pods: data.pods,
    };
    return Response.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
