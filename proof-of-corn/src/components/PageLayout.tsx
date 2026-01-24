'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import FredMiniWidget from './FredMiniWidget';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/story', label: 'Story' },
    { href: '/fred', label: 'Fred' },
    { href: '/vision', label: 'Vision' },
    { href: '/community', label: 'Community' },
    { href: '/log', label: 'Log' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-3 sticky top-0 bg-[#fafafa]/95 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
              Proof of Corn
            </Link>
            <nav className="hidden sm:flex gap-4 text-xs md:text-sm text-zinc-500">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={pathname === href ? 'text-zinc-900' : 'hover:text-zinc-900 transition-colors'}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-xs text-zinc-400">LIVE</span>
            <FredMiniWidget />
          </div>
        </div>
      </header>

      {/* Page Title */}
      {title && (
        <section className="px-6 py-12 border-b border-zinc-200">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-zinc-600 mt-2">{subtitle}</p>
            )}
          </div>
        </section>
      )}

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200 mt-12">
        <div className="max-w-4xl mx-auto text-sm text-zinc-500">
          <p className="mb-3">
            A project by{' '}
            <a href="https://x.com/seth" className="text-zinc-700 hover:underline" target="_blank" rel="noopener noreferrer">
              @seth
            </a>
            , inspired by{' '}
            <a href="https://x.com/fredwilson" className="text-zinc-700 hover:underline" target="_blank" rel="noopener noreferrer">
              @fredwilson
            </a>
            , orchestrated by Claude Code
          </p>
          <p>
            <a href="mailto:fred@proofofcorn.com" className="text-amber-600 hover:underline">
              fred@proofofcorn.com
            </a>
            {' · '}
            <a href="https://github.com/brightseth/proof-of-corn" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {' · '}
            <a href="https://news.ycombinator.com/item?id=46735511" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Hacker News
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
