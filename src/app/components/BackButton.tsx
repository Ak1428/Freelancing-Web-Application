'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './BackButton.module.css';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide back button on first page (home)
  if (pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className={styles.backButton}
      aria-label="Go back"
    >
      ← Back
    </button>
  );
}
