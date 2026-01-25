"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Mail, ArrowRight, Check, Loader2 } from "lucide-react";

export function HeroNewsletterPill() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!email && status === "idle") {
          setIsExpanded(false);
        }
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded, email, status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  // Success state
  if (status === "success") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
        <Check className="h-4 w-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-400">Subscribed</span>
      </div>
    );
  }

  // Collapsed pill
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer"
      >
        <Mail className="h-4 w-4 text-white/60 group-hover:text-white/80 transition-colors" />
        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
          Get Updates
        </span>
      </button>
    );
  }

  // Expanded form
  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full border border-white/30 bg-black/60 backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <Mail className="h-4 w-4 text-white/50 shrink-0" />
        <input
          ref={inputRef}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className="w-40 sm:w-48 bg-transparent text-white text-sm placeholder:text-white/40 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email}
          className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shrink-0"
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
        <p className="absolute top-full mt-2 left-0 w-full text-xs text-red-400 text-center">
          Something went wrong
        </p>
      )}
    </div>
  );
}
