'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Card, Button } from '@/components/ui';

export default function ClientProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [switching, setSwitching] = useState(false);
  const [switchMessage, setSwitchMessage] = useState('');

  if (status === 'loading') {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (!session || !session.user) {
    return (
      <Container className="py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Client Profile</h1>
          <p className="text-neutral-600 mb-6">You need to log in to view your profile.</p>
          <Link href="/login">
            <Button variant="primary" size="lg" fullWidth>
              Go to Login
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

  const handleSwitchRole = async () => {
    setSwitching(true);
    setSwitchMessage('');

    try {
      const targetRole = (session.user as any).role === 'CLIENT' ? 'FREELANCER' : 'CLIENT';
      const res = await fetch('/api/user/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload?.message || 'Role update failed');
      }

      setSwitchMessage(`✅ Switched to ${targetRole}. Reloading...`);
      setTimeout(() => {
        router.refresh();
        router.push(targetRole === 'CLIENT' ? '/client/profile' : '/freelancer/profile');
      }, 700);
    } catch (err) {
      setSwitchMessage(`❌ Error switching role: ${(err as Error).message}`);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Container className="py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">
              👋 Welcome, {session.user.name || 'Client'}
            </h1>
            <p className="text-neutral-600 mt-2">Your client dashboard and profile details</p>
          </div>

          {/* Profile Info */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-8 space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-600">Email</span>
              <span className="font-medium text-neutral-900">{session.user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-neutral-200">
              <span className="text-neutral-600">Role</span>
              <span className="font-medium text-primary-600">{(session.user as any).role || 'Client'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-neutral-200">
              <span className="text-neutral-600">Status</span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-medium text-neutral-900">Active</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-3 gap-3 mb-8">
            <Link href="/client/post-job">
              <Button variant="primary" size="lg" fullWidth>
                📝 Post a Job
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary" size="lg" fullWidth>
                🔍 Browse Jobs
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="secondary" size="lg" fullWidth>
                💬 Messages
              </Button>
            </Link>
          </div>

          {/* Switch Role */}
          <Button 
            onClick={handleSwitchRole} 
            disabled={switching}
            variant="outline"
            fullWidth
            size="lg"
          >
            {switching ? '⏳ Switching...' : '🔄 Switch to Freelancer'}
          </Button>

          {switchMessage && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
              switchMessage.includes('✅') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {switchMessage}
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
