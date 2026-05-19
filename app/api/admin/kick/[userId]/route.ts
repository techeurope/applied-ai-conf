import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

const WORKOS_API_BASE = "https://api.workos.com";

async function workosFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.WORKOS_API_KEY;
  if (!apiKey) throw new Error("WORKOS_API_KEY not set");
  return fetch(`${WORKOS_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function revokeAllSessionsForWorkosUser(workosUserId: string) {
  let revoked = 0;
  // List active sessions for the user. WorkOS paginates with `before`/`after`.
  let after: string | null = null;
  do {
    const url = new URL(`${WORKOS_API_BASE}/user_management/sessions`);
    url.searchParams.set("user_id", workosUserId);
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.WORKOS_API_KEY}` },
    });
    if (!res.ok) throw new Error(`WorkOS list sessions failed: ${res.status}`);
    const body = (await res.json()) as {
      data: Array<{ id: string; status: string }>;
      list_metadata?: { after?: string | null };
    };
    for (const session of body.data) {
      if (session.status === "active") {
        const revokeRes = await workosFetch(
          `/user_management/sessions/${session.id}/revoke`,
          { method: "POST" },
        );
        if (revokeRes.ok) revoked += 1;
      }
    }
    after = body.list_metadata?.after ?? null;
  } while (after);
  return revoked;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { user: workosUser, accessToken } = await withAuth();
  if (!workosUser || !accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return Response.json({ error: "Convex not configured" }, { status: 500 });
  }

  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(accessToken);

  let reason: string | undefined;
  try {
    const body = (await request.json()) as { reason?: string };
    reason = body?.reason;
  } catch {
    /* no body is fine */
  }

  // Deactivate in Convex first. This throws if the caller isn't admin, or if
  // they're trying to deactivate themselves / another admin.
  await client.mutation(api.admin.deactivateUser, {
    userId: userId as Id<"users">,
    reason,
  });

  // Look up the target user to find their WorkOS id, then revoke sessions.
  const target = await client.query(api.admin.getUser, {
    userId: userId as Id<"users">,
  });
  if (!target) {
    return Response.json({ error: "User not found after deactivate" }, { status: 500 });
  }

  let revokedSessions = 0;
  try {
    revokedSessions = await revokeAllSessionsForWorkosUser(target.workosUserId);
  } catch (err) {
    return Response.json(
      {
        ok: false,
        deactivated: true,
        revokeError: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, revokedSessions });
}
