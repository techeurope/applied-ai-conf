import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

export async function GET() {
  const { user, accessToken } = await withAuth();
  if (!user || !accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return Response.json({ error: "Convex not configured" }, { status: 500 });
  }
  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(accessToken);
  const data = await client.query(api.me.exportMyData, {});
  const filename = `applied-ai-conf-data-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
