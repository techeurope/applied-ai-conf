"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const marketingNavItems = [
  { href: "/marketing", label: "Overview" },
  { href: "/marketing/speakers", label: "Speaker Assets" },
  { href: "/marketing/twitter-banner", label: "Twitter Banner" },
  { href: "/marketing/logos", label: "Logos" },
  { href: "/marketing/favicon", label: "Favicon" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Tabs */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-1">
            {marketingNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/marketing" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-mono rounded-md transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content with padding for fixed nav */}
      <main className="pt-14">{children}</main>
    </div>
  );
}




