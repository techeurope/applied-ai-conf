"use client";

import { useState, FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

interface NewsletterFormProps {
  className?: string;
}

export function NewsletterForm({ className = "" }: NewsletterFormProps) {
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
          className="w-full h-12 pl-6 pr-12 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all disabled:opacity-50 font-sans text-sm backdrop-blur-sm"
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
