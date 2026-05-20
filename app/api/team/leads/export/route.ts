import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

function csvEscape(value: string | undefined | null): string {
  if (value == null) return "";
  const needsQuote = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export async function GET(request: Request) {
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

  const team = await client.query(api.partners.myTeam, {});
  if (!team) {
    return Response.json({ error: "Not part of a partner team" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const requestedTeamId = searchParams.get("teamId");
  if (requestedTeamId && requestedTeamId !== team.team._id) {
    return Response.json({ error: "Team mismatch" }, { status: 403 });
  }

  const leads = await client.query(api.partners.myTeamLeads, {});
  const header = [
    "scanned_at",
    "name",
    "email",
    "role",
    "company",
    "linkedin",
    "notes",
    "tags",
  ];
  const rows = leads.map(({ contact, lead }) => [
    new Date(contact.lastScanAt).toISOString(),
    lead?.name ?? "",
    lead?.email ?? "",
    lead?.role ?? "",
    lead?.company ?? "",
    lead?.linkedinUrl ?? "",
    contact.notes ?? "",
    (contact.tags ?? []).join(", "),
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");

  const filename = `${team.team.slug}-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
