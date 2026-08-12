import os from "os";

export function GET() {
  return Response.json({ pod: os.hostname() }, {
    headers: { "Cache-Control": "no-store", "Connection": "close" },
  });
}
