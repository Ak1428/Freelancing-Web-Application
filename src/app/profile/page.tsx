'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    const role = (session?.user as any)?.role;
    if (role === 'CLIENT') {
      router.replace('/client/profile');
    } else if (role === 'FREELANCER') {
      router.replace('/freelancer/profile');
    } else {
      router.replace('/');
    }
  }, [status, session, router]);

  return (
    <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>
      <h1>Redirecting...</h1>
      <p>Please wait while we take you to your profile.</p>
    </div>
  );
}
