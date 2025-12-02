"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { NAVIGATION_ACTIONS, NAVIGATION_LINKS } from '@/data/navigation';

export default function Navigation() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    // On subpages, always show navigation
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    // On homepage, show nav when scrolled past 400px
    const handleScroll = () => {
      const show = window.scrollY > 400;
      setIsVisible(show);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  return (
    <nav 
      className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 ease-in-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className="glass flex items-center gap-6 rounded-full px-6 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10 shadow-lg shadow-black/20 backdrop-blur-xl">
        {/* Left side: Conference Name */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm font-mono font-bold tracking-wide text-white transition-colors hover:text-gray-300">
            Applied AI Conf
          </Link>
          <span className="text-sm text-white/70">by</span>
          <a
            href="https://techeurope.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-white hover:text-gray-300 transition-colors"
          >
            {"{"}Tech: Europe{"}"}
          </a>
        </div>

        {NAVIGATION_LINKS.length > 0 && (
          <>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-6">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="h-4 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-4">
          {NAVIGATION_ACTIONS.map((action) => {
            const isExternal = action.href.startsWith('http');
            const isTicket = action.label.toLowerCase().includes('ticket');
            const classes = action.variant === 'primary'
              ? "flex items-center gap-2.5 text-sm font-medium text-white hover:text-gray-300 transition-colors"
              : "text-sm text-gray-400 hover:text-white transition-colors";

            if (isExternal) {
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes}
                >
                  {isTicket && <Ticket className="h-4 w-4" />}
                  {action.label}
                </a>
              );
            }

            return (
              <Link key={action.label} href={action.href} className={classes}>
                {isTicket && <Ticket className="h-4 w-4" />}
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
