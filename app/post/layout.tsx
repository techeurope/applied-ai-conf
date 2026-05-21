import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Share you're attending | Applied AI Conf Berlin",
  description:
    "Generate a social post cover for Applied AI Conf Berlin on May 28, 2026. Tell the world you'll be there.",
  openGraph: {
    title: "Share you're attending | Applied AI Conf Berlin",
    description:
      "Generate a social post cover for Applied AI Conf Berlin on May 28, 2026.",
  },
};

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#05070f]">
      <Navigation />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
