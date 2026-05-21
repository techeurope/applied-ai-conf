"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { ImageUp, Camera, QrCode, Pencil } from "lucide-react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { QrScanner } from "./QrScanner";
import { UserQR } from "./UserQR";

function parseConnectUrl(text: string): string | null {
  try {
    const url = new URL(text);
    const match = url.pathname.match(/^\/connect\/u\/([A-Za-z0-9_-]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function ScannerHome() {
  const router = useRouter();
  const recordScan = useMutation(api.scans.record);
  const me = useQuery(api.users.me);
  const [mode, setMode] = useState<"show" | "camera" | "upload">("show");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(
    async (text: string) => {
      if (status === "saving") return;
      const token = parseConnectUrl(text);
      if (!token) {
        setStatus("error");
        setErrorMessage("That QR isn't a Connect code.");
        return;
      }
      setStatus("saving");
      try {
        const clientId = `${crypto.randomUUID()}-${token}`;
        const result = await recordScan({
          scannedUserId: token as Id<"users">,
          clientId,
        });
        if ("scanEventId" in result) {
          router.push(`/connect/contacts`);
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Could not save scan");
      }
    },
    [recordScan, router, status],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setStatus("saving");
      setErrorMessage(null);
      try {
        const objectUrl = URL.createObjectURL(file);
        try {
          const reader = new BrowserMultiFormatReader();
          const result = await reader.decodeFromImageUrl(objectUrl);
          await handleScan(result.getText());
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error && err.message.toLowerCase().includes("not found")
            ? "No QR code found in that image."
            : err instanceof Error
              ? err.message
              : "Could not read QR from image",
        );
      }
    },
    [handleScan],
  );

  return (
    <div className="space-y-5 pt-1">
      <div className="inline-flex p-1 rounded-full border border-white/10 bg-white/[0.02]">
        <ModeButton active={mode === "show"} onClick={() => setMode("show")} icon={QrCode}>
          My QR
        </ModeButton>
        <ModeButton active={mode === "camera"} onClick={() => setMode("camera")} icon={Camera}>
          Camera
        </ModeButton>
        <ModeButton active={mode === "upload"} onClick={() => setMode("upload")} icon={ImageUp}>
          Upload
        </ModeButton>
      </div>

      {mode === "show" && me && (
        <div className="space-y-3">
          <UserQR token={me.publicToken ?? me._id} />
          <div className="text-center space-y-1">
            <p className="font-mono text-sm text-white">{me.name || "Unnamed"}</p>
            <p className="text-xs text-white/60">
              {[me.role, me.company].filter(Boolean).join(" · ") || (
                <Link href="/connect/settings" className="underline">
                  Add a role and company in Settings
                </Link>
              )}
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 text-center">
            Show this to people you meet.
          </p>
          <div className="text-center pt-1">
            <Link
              href="/connect/settings"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors"
            >
              <Pencil className="size-3.5" strokeWidth={1.75} />
              Edit profile
            </Link>
          </div>
        </div>
      )}

      {mode === "camera" && <QrScanner onScan={handleScan} paused={status === "saving"} />}

      {mode === "upload" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "saving"}
            className="w-full aspect-square rounded-2xl border-2 border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            <ImageUp className="size-8 text-white/40" strokeWidth={1.5} />
            <div className="font-mono text-xs text-white/70">Choose photo</div>
            <div className="text-xs text-white/40 max-w-[20ch] text-center leading-relaxed">
              A picture of a badge or a screenshot of a QR works.
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {status === "saving" && (
        <p className="font-mono text-xs text-white/60 text-center animate-pulse">Saving…</p>
      )}
      {status === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          <div className="font-mono mb-2">{errorMessage}</div>
          <button
            type="button"
            className="font-mono text-xs underline underline-offset-2 hover:text-red-100"
            onClick={() => {
              setStatus("idle");
              setErrorMessage(null);
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Camera;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-[0.18em] transition-colors flex items-center gap-1.5 ${
        active ? "bg-white text-black" : "text-white/60 hover:text-white"
      }`}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {children}
    </button>
  );
}
