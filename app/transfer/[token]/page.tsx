import type { Metadata } from "next";
import { TransferClient } from "./TransferClient";
import { PublicConvexProvider } from "./PublicConvexProvider";

export const metadata: Metadata = {
  title: "Approve ticket transfer — Applied AI Conf",
  robots: { index: false, follow: false },
};

export default async function TransferPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { token } = await params;
  const { action } = await searchParams;
  const initialAction =
    action === "approve" || action === "decline" ? action : null;
  return (
    <PublicConvexProvider>
      <TransferClient token={token} initialAction={initialAction} />
    </PublicConvexProvider>
  );
}
