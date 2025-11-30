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
        <div className="glass rounded-2xl p-6 text-center border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-center gap-3 text-emerald-400">
            <Check className="h-6 w-6" />
            <span className="text-lg font-medium">You&apos;re on the list</span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            We&apos;ll keep you updated on all things Applied AI Conf.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === "loading"}
            className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all disabled:opacity-50 font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="group h-14 px-8 rounded-full bg-white text-black font-semibold transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Subscribe
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400 text-center">{errorMessage}</p>
      )}
    </div>
  );
}

