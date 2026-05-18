import type { Metadata, Viewport } from "next";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ConnectShell } from "./components/ConnectShell";

export const metadata: Metadata = {
  title: "Connect | Applied AI Conf",
  description:
    "Scan, capture, and keep the people you meet at Applied AI Conf. Works offline.",
  robots: { index: false, follow: false },
  manifest: "/connect/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Connect",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await withAuth();
  const { accessToken: _stripped, ...initialAuth } = auth;
  void _stripped;
  return (
    <AuthKitProvider initialAuth={initialAuth}>
      <ConvexClientProvider>
        <ConnectShell>{children}</ConnectShell>
      </ConvexClientProvider>
    </AuthKitProvider>
  );
}
