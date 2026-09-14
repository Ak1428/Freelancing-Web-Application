'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Card, Button } from '@/components/ui';

export default function FreelancerProfile() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [switching, setSwitching] = useState(false);
  const [switchMessage, setSwitchMessage] = useState('');
  const [formData, setFormData] = useState({
    category: 'TECHNICAL',
    skills: '',
    portfolioUrl: '',
    bio: '',
    hourlyRate: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Freelancer Profile</h1>
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
      const targetRole = (session.user as any).role === 'FREELANCER' ? 'CLIENT' : 'FREELANCER';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/freelancer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          skills: formData.skills,
          portfolioUrl: formData.portfolioUrl,
          bio: formData.bio,
          hourlyRate: formData.hourlyRate,
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Failed to save profile');
      }

      const data = await res.json();
      setMessageType('success');
      setMessage(data.message || '✅ Profile updated successfully!');
    } catch (error) {
      setMessageType('error');
      setMessage(`❌ Error saving profile: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">💼 Your Freelancer Profile</h1>
            <p className="text-neutral-600 mt-2">Showcase your skills to clients worldwide</p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                messageType === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Switch Role */}
          <div className="mb-8 pb-6 border-b border-neutral-200">
            <Button
              onClick={handleSwitchRole}
              disabled={switching}
              variant="outline"
              fullWidth
            >
              {switching ? '⏳ Switching...' : `🔄 Switch to ${(session.user as any).role === 'FREELANCER' ? 'CLIENT' : 'FREELANCER'}`}
            </Button>
            {switchMessage && (
              <p className={`mt-3 text-center text-sm ${switchMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {switchMessage}
              </p>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-900 mb-2">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="TECHNICAL">💻 Technical (Developer, Designer, etc)</option>
                <option value="NON_TECHNICAL">🎨 Non-Technical (Writer, Artist, etc)</option>
              </select>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-neutral-900 mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                id="skills"
                placeholder="React, Next.js, UI/UX"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-neutral-900 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                id="hourlyRate"
                placeholder="50"
                min="0"
                step="5"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="portfolioUrl" className="block text-sm font-medium text-neutral-900 mb-2">
                Portfolio URL
              </label>
              <input
                type="url"
                id="portfolioUrl"
                placeholder="https://yourportfolio.com"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-neutral-900 mb-2">
                Professional Bio
              </label>
              <textarea
                id="bio"
                placeholder="Describe your experience and what you offer..."
                rows={5}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Saving...' : '💾 Save Profile'}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}
