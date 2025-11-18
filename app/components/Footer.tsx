import Link from 'next/link';
import { FOOTER_LINKS } from '@/data/footer';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-6">
        <div className="text-sm text-gray-500">
          © 2026 Applied AI Conf by <span className="text-gray-400">{'{'}Tech: Europe{'}'}</span>
        </div>
        
        <div className="flex gap-8">
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
      </div>
    </footer>
  );
}
