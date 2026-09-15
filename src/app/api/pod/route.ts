import os from "os";

export function GET() {
  return Response.json(
    { pod: os.hostname(), node: process.env.NODE_NAME ?? null },
    { headers: { "Cache-Control": "no-store", "Connection": "close" } }
  );
}
