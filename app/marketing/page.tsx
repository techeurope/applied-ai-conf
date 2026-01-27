import Link from "next/link";
import { Check, X, Image, Users, Twitter, Palette, Sparkles } from "lucide-react";

interface AssetCard {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}

const assets: AssetCard[] = [
  {
    title: "Speaker Assets",
    href: "/marketing/speakers",
    description: "Generate speaker marketing cards with name, title, company logo, and transparent speaker image",
    icon: Users,
    available: true,
  },
  {
    title: "Twitter Banner",
    href: "/marketing/twitter-banner",
    description: "Create event banners for Twitter/X with customizable backgrounds and text",
    icon: Twitter,
    available: true,
  },
  {
    title: "Logos",
    href: "/marketing/logos",
    description: "Generate logo variations and assets",
    icon: Palette,
    available: true,
  },
  {
    title: "Favicon",
    href: "/marketing/favicon",
    description: "Generate favicon assets for the website",
    icon: Sparkles,
    available: true,
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="font-mono text-4xl font-bold mb-3">Marketing Assets</h1>
          <p className="text-gray-400 text-lg">
            Generate marketing assets for Applied AI Conf
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const Icon = asset.icon;
            const CardContent = (
              <div
                className={`relative p-6 rounded-lg border transition-all ${
                  asset.available
                    ? "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 cursor-pointer"
                    : "border-white/10 bg-white/2 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {asset.available ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <X className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <h3 className="font-mono text-xl font-bold mb-2">{asset.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {asset.description}
                </p>
              </div>
            );

            return asset.available ? (
              <Link key={asset.href} href={asset.href}>
                {CardContent}
              </Link>
            ) : (
              <div key={asset.href}>{CardContent}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
