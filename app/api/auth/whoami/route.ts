import { withAuth } from "@workos-inc/authkit-nextjs";

export async function GET() {
  const { user, sessionId, accessToken } = await withAuth();
  return Response.json({
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    emailVerified: user?.emailVerified,
    sessionId,
    hasAccessToken: !!accessToken,
    accessTokenPrefix: accessToken?.slice(0, 30),
  });
}
