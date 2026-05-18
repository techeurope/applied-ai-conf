import { withAuth } from "@workos-inc/authkit-nextjs";

export async function GET() {
  const { accessToken } = await withAuth();
  if (!accessToken) return Response.json({ error: "no access token" });
  const parts = accessToken.split(".");
  if (parts.length !== 3) return Response.json({ error: "not a JWT" });
  const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
  return Response.json(JSON.parse(payloadJson));
}
