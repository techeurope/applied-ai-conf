import Link from "next/link";
import { FOOTER_LINKS } from "@/data/footer";
import { Linkedin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-6">
        <div className="text-sm text-gray-500">
          © 2026 <span className="font-mono">Applied AI Conf</span> by{" "}
          <a
            href="https://techeurope.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-gray-400 hover:text-gray-300 transition-colors"
          >
            {"{"}Tech: Europe{"}"}
          </a>
        </div>

        <div className="flex items-center gap-6">
          {/* Links */}
          <div className="flex gap-6 mr-4 border-r border-white/10 pr-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/techeurope_"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white border border-white/5"
              aria-label="Follow on X (Twitter)"
            >
              <div className="relative h-3.5 w-3.5">
                <Image src="/x.svg" alt="X" fill className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
            <a
              href="https://www.linkedin.com/company/tech-europe-community/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white border border-white/5"
              aria-label="Follow on LinkedIn"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
