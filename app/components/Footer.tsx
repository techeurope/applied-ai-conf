import Link from 'next/link';
import { FOOTER_LINKS } from '@/data/footer';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row justify-between items-center gap-6">
        <div className="text-sm text-gray-500">
          © 2026 <span className="font-mono">Applied AI Conf</span> by <a href="https://techeurope.io" target="_blank" rel="noopener noreferrer" className="font-mono text-gray-400 hover:text-gray-300 transition-colors">{'{'}Tech: Europe{'}'}</a>
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
