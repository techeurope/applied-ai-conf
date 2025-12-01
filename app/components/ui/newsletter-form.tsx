"use client";

import { useState, FormEvent } from "react";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface NewsletterFormProps {
  className?: string;
  variant?: "default" | "modal";
}

export function NewsletterForm({ className = "", variant = "default" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Subscription failed");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={`w-full ${className}`}>
        <div className="h-12 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-full px-6 border border-emerald-500/20">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">You&apos;re on the list!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full flex items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading"}
          className={`w-full h-12 pl-6 pr-12 rounded-full text-white placeholder:text-gray-500 focus:outline-none transition-all disabled:opacity-50 font-sans text-sm ${
            variant === "modal" 
              ? "bg-white/5 border border-white/10 focus:bg-white/10 focus:border-white/20" 
              : "bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10 backdrop-blur-sm"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="absolute right-1 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-0 disabled:pointer-events-none flex items-center justify-center"
          aria-label="Subscribe"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="absolute top-full mt-2 left-0 w-full text-xs text-red-400 text-center">{errorMessage}</p>
      )}
    </div>
  );
}

export function NewsletterModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 border border-white/10 bg-black/80 p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl backdrop-blur-xl ring-1 ring-white/5">
          
          {/* Header */}
          <div className="flex flex-col gap-3 text-center">
            <Dialog.Title className="text-2xl font-semibold tracking-tight text-white">
              Stay in the loop
            </Dialog.Title>
            <Dialog.Description className="text-base text-gray-400 leading-relaxed text-balance">
              Join our newsletter to get notified about speaker announcements, agenda updates, and ticket releases.
            </Dialog.Description>
          </div>

          {/* Form Container */}
          <div className="w-full">
            <NewsletterForm variant="modal" />
          </div>

          {/* Close Button */}
          <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 text-gray-400 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
