'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import FredMiniWidget from './FredMiniWidget';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core navigation - 5 pages
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/fred', label: 'Fred' },
    { href: '/dashboard', label: 'Dashboard' },
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
            {/* Desktop nav */}
            <nav className="hidden sm:flex gap-4 text-xs md:text-sm text-zinc-500">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={pathname === href ? 'text-zinc-900 font-medium' : 'hover:text-zinc-900 transition-colors'}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-xs text-zinc-400">LIVE</span>
            <FredMiniWidget />
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1 text-zinc-500"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <nav className="sm:hidden mt-3 pt-3 border-t border-zinc-200 flex flex-col gap-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-1 ${pathname === href ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
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
