import os from "os";

export async function GET() {
  return Response.json(
    { hostname: os.hostname(), node: process.env.NODE_NAME ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
