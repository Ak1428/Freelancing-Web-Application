'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Props {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Global app error:', error);
  }, [error]);

  return (
    <main className={styles.container}>
      <div className={styles.glassCard}>
        <h1 className={styles.title}>Oops, something went wrong</h1>
        <p className={styles.subtitle}>An unexpected error occurred while loading the application.</p>
        <p style={{ color: '#fda4af' }}>{error.message}</p>
        <div className={styles.ctaGroup}>
          <button className={styles.primaryBtn} onClick={() => reset()}>Try Again</button>
          <Link href="/" className={styles.secondaryBtn}>Go Home</Link>
        </div>
      </div>
    </main>
  );
}
