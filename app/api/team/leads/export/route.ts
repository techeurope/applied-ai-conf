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

  const { searchParams } = new URL(request.url);
  const requestedTeamId = searchParams.get("teamId");

  // Own team → partner export. A different teamId (or no own team at all) →
  // admin export, which the admin.teamLeads query gates on admin auth (throws
  // otherwise). Both queries return the same enriched shape.
  const isOwnTeam =
    !!team && (!requestedTeamId || requestedTeamId === team.team._id);
  let leads;
  let slug: string;
  if (isOwnTeam) {
    leads = await client.query(api.partners.myTeamLeads, {});
    slug = team!.team.slug;
  } else if (requestedTeamId) {
    try {
      leads = await client.query(api.admin.teamLeads, {
        teamId: requestedTeamId as Id<"teams">,
      });
    } catch {
      return Response.json({ error: "Not authorized" }, { status: 403 });
    }
    slug = searchParams.get("slug") || requestedTeamId;
  } else {
    return Response.json(
      { error: "Not part of a partner team" },
      { status: 403 },
    );
  }

  const header = [
    "scanned_at",
    "name",
    "email",
    "role",
    "company",
    "linkedin",
    "lead_status",
    "qualification",
    "scanned_by",
    "team_notes",
    "note_count",
    "notes_legacy",
    "tags",
  ];
  // Each note as "Author (YYYY-MM-DD HH:mm): text", one per line, so the
  // spreadsheet shows who wrote what and when within a single cell.
  const fmtNotes = (
    notes: { author: string; text: string; createdAt: number }[],
  ) =>
    notes
      .map(
        (n) =>
          `${n.author} (${new Date(n.createdAt)
            .toISOString()
            .slice(0, 16)
            .replace("T", " ")}): ${n.text}`,
      )
      .join("\n");
  const rows = leads.map(({ contact, lead, scanners, notes, noteCount }) => [
    new Date(contact.lastScanAt).toISOString(),
    lead?.name ?? "",
    lead?.email ?? "",
    lead?.role ?? "",
    lead?.company ?? "",
    lead?.linkedinUrl ?? "",
    contact.leadStatus ?? "",
    contact.leadDescription ?? "",
    scanners.map((s) => s.name).join(", "),
    fmtNotes(notes),
    String(noteCount),
    contact.notes ?? "",
    (contact.tags ?? []).join(", "),
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");

  const filename = `${slug}-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
