'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function TopNav() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = (window.localStorage.getItem(
      'freelanceTheme'
    ) as 'light' | 'dark' | null) || 'light';
    setTheme(savedTheme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${savedTheme}`);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${nextTheme}`);
    window.localStorage.setItem('freelanceTheme', nextTheme);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                TalentFlow
              </span>
            </Link>
            <span className="hidden sm:inline text-xs text-neutral-500 font-medium">
              Fast • Beautiful • Connected
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {session?.user ? (
              <>
                <Link
                  href="/jobs"
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Jobs
                </Link>
                <Link
                  href="/freelancers"
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Freelancers
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Messages
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  Profile
                </Link>
              </>
            ) : null}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-neutral-600">
                  {session.user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 pt-2 border-t border-neutral-200">
            {session?.user ? (
              <div className="space-y-2">
                <Link
                  href="/jobs"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100"
                >
                  Jobs
                </Link>
                <Link
                  href="/freelancers"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100"
                >
                  Freelancers
                </Link>
                <Link
                  href="/messages"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100"
                >
                  Messages
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100"
                >
                  Profile
                </Link>
              </div>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}
