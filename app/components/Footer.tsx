import Link from 'next/link';
import { FOOTER_LINKS } from '@/data/footer';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-6 justify-center">
            {FOOTER_LINKS.map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                className="text-sm text-gray-200 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="text-sm text-gray-300">
            © 2026 Applied AI Conf by {'{'}Tech: Europe{'}'}. All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
