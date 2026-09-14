'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './TopNav.module.css';

export default function TopNav() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('freelanceTheme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${savedTheme}`);
    } else {
      document.body.classList.add('theme-dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${nextTheme}`);
    window.localStorage.setItem('freelanceTheme', nextTheme);
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link href="/" className={styles.title}>InstaFreelance</Link>
        <span className={styles.tag}>Fast. Beautiful. Connected.</span>
      </div>
      <nav className={styles.nav}>
        {session?.user ? (
          <>
            <Link href="/jobs" className={styles.link}>Jobs</Link>
            <Link href="/freelancers" className={styles.link}>Freelancers</Link>
            {(session.user as any).role === 'CLIENT' && (
              <Link href="/client/post-job" className={styles.link}>Post Job</Link>
            )}
            <Link href="/checkout/demo-123" className={styles.link}>Checkout Demo</Link>
            <Link href="/messages" className={styles.link}>Messages</Link>
            <Link href="/dashboard" className={styles.link}>Dashboard</Link>
          </>
        ) : (
          <>
            <Link href="/checkout/demo-123" className={styles.link}>Checkout Demo</Link>
            <Link href="/login" className={styles.link}>Login</Link>
            <Link href="/register" className={styles.link}>Sign Up</Link>
          </>
        )}
      </nav>
      {session?.user ? (
        <div className={styles.profileWidget}>
          <Link href={(session.user as any).role === 'CLIENT' ? '/client/profile' : '/freelancer/profile'} className={styles.profileLink}>
            <span className={styles.profileName}>{session.user.name ?? 'Profile'}</span>
            <span className={styles.profileRole}>({(session.user as any).role ?? 'User'})</span>
          </Link>
          <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/' })}>
            Logout
          </button>
        </div>
      ) : null}
      <button onClick={toggleTheme} className={styles.toggle} aria-label="Toggle theme">
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
    </header>
  );
}
