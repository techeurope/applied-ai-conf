import Link from 'next/link';
import { CONFERENCE_INFO } from '@/data/conference';
import { NAVIGATION_ACTIONS, NAVIGATION_LINKS } from '@/data/navigation';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50 w-full" style={{ width: '100vw' }}>
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            {CONFERENCE_INFO.title}
          </Link>
          <div className="hidden md:flex gap-6">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-gray-200 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          {NAVIGATION_ACTIONS.map((action) => {
            const baseClasses =
              action.variant === 'primary'
                ? 'bg-white text-black px-4 py-2 rounded-full text-sm transition-colors hover:bg-gray-200'
                : 'text-sm text-gray-200 transition-colors hover:text-white';

            const isExternal = action.href.startsWith('http');

            if (isExternal) {
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={baseClasses}
                >
                  {action.label}
                </a>
              );
            }

            return (
              <Link key={action.label} href={action.href} className={baseClasses}>
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
