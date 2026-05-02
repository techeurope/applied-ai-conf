"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { Ticket, Menu, X } from 'lucide-react';
import { NAVIGATION_ACTIONS, NAVIGATION_LINKS, LUMA_EVENT_ID } from '@/data/navigation';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const renderAction = (action: typeof NAVIGATION_ACTIONS[number], isMobile = false) => {
    const isExternal = action.href.startsWith('http');
    const isTicket = action.label.toLowerCase().includes('ticket');
    const classes = isMobile
      ? action.variant === 'primary'
        ? "flex items-center justify-center gap-2.5 text-base font-medium text-white hover:text-gray-300 transition-colors py-3"
        : "flex items-center justify-center text-base text-gray-400 hover:text-white transition-colors py-3"
      : action.variant === 'primary'
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
            onClick: () => {
              setMobileMenuOpen(false);
              try {
                posthog.capture('ticket_click', { location: 'navigation' });
              } catch {
                // ignore analytics failures
              }
              try {
                // X ads conversion event (if pixel is present globally)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).twq?.('event', 'tw-p7886-rajk1', {});
              } catch {
                // ignore X tracking failures
              }
            },
          })}
        >
          {isTicket && <Ticket className="h-4 w-4" />}
          {action.label}
        </a>
      );
    }

    return (
      <Link
        key={action.label}
        href={action.href}
        className={classes}
        onClick={() => setMobileMenuOpen(false)}
      >
        {isTicket && <Ticket className="h-4 w-4" />}
        {action.label}
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-end px-4">
        {/* Desktop nav pill */}
        <div className="glass hidden sm:flex items-center gap-4 rounded-full px-5 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10 shadow-lg shadow-black/20 backdrop-blur-xl">
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
            {NAVIGATION_ACTIONS.map((action) => renderAction(action))}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Ticket button always visible on mobile */}
          {NAVIGATION_ACTIONS.filter(a => a.variant === 'primary').map((action) => (
            <div key={action.label} className="glass rounded-full px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl">
              {renderAction(action)}
            </div>
          ))}
          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="glass rounded-full p-2.5 shadow-lg shadow-black/20 backdrop-blur-xl text-white hover:text-gray-300 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 pt-24 px-6">
            {isScrolled && (
              <Link
                href="/"
                className="text-lg font-mono font-bold tracking-wide text-white transition-colors hover:text-gray-300 py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                Applied AI Conf
              </Link>
            )}
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base text-gray-400 hover:text-white transition-colors py-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {NAVIGATION_ACTIONS.filter(a => a.variant !== 'primary').map((action) => renderAction(action, true))}
          </div>
        </div>
      )}
    </>
  );
}
