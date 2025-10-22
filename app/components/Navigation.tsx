import Link from 'next/link';
import { CONFERENCE_INFO } from '@/data/conference';
import { NAVIGATION_ACTIONS, NAVIGATION_LINKS } from '@/data/navigation';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

              return (
                <Link key={action.label} href={action.href} className={baseClasses}>
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
