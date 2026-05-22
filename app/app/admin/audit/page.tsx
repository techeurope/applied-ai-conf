"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function AdminAuditPage() {
  const items = useQuery(api.admin.auditFeed, { limit: 200 });

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/50">
        Every admin-side action lands here. Most recent first.
      </p>
      <ul className="divide-y divide-white/5 rounded-2xl ring-1 ring-white/5 overflow-hidden">
        {items?.map((item) => (
          <li key={item._id} className="px-4 py-3 space-y-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-sm">{item.action}</span>
              <span className="font-mono text-[10px] text-white/40">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-white/60">
              by <span className="font-mono">{item.actorName ?? item.actorEmail ?? item.actorUserId}</span>
              {item.targetUserId && (
                <>
                  {" · target "}
                  <Link
                    href={`/app/admin/attendees/${item.targetUserId}`}
                    className="font-mono underline"
                  >
                    {item.targetName ?? item.targetUserId}
                  </Link>
                </>
              )}
            </div>
            {item.metadata && (
              <code className="block text-[10px] text-white/40 break-all">{item.metadata}</code>
            )}
          </li>
        ))}
        {items && items.length === 0 && (
          <li className="px-4 py-6 text-sm text-white/50">No admin actions yet.</li>
        )}
      </ul>
    </div>
  );
}
