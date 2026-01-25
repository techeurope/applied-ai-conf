"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { NAVIGATION_ACTIONS, NAVIGATION_LINKS, LUMA_EVENT_ID } from '@/data/navigation';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    // On subpages, always show logo
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    // On homepage, show logo when scrolled
    const handleScroll = () => {
      const showLogo = window.scrollY > 160;
      setIsScrolled(showLogo);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-end px-4">
      <div className="glass flex items-center gap-4 rounded-full px-5 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10 shadow-lg shadow-black/20 backdrop-blur-xl">
        {isScrolled && (
          <>
            <Link
              href="/"
              className="text-sm font-mono font-bold tracking-wide text-white transition-colors hover:text-gray-300"
            >
              Applied AI Conf
            </Link>
            <div className="h-4 w-[1px] bg-white/10"></div>
          </>
        )}

        {NAVIGATION_LINKS.length > 0 && (
          <>
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
            <div className="h-4 w-[1px] bg-white/10"></div>
          </>
        )}

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
                  {...(isTicket && {
                    'data-luma-action': 'checkout',
                    'data-luma-event-id': LUMA_EVENT_ID,
                  })}
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
