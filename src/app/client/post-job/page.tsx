'use client';

import { useState } from 'react';
import { Container, Card, Button } from '@/components/ui';

export default function PostJob() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    requiredSkills: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: formData.budget,
          deadline: formData.deadline || null,
          requiredSkills: formData.requiredSkills,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to post job');
      }

      const data = await res.json();
      setMessageType('success');
      setMessage(`✅ Job posted successfully! ${data.notifiedCount || 0} matching freelancers notified.`);
      setFormData({ title: '', description: '', budget: '', deadline: '', requiredSkills: '' });
    } catch (error) {
      setMessageType('error');
      setMessage(`❌ Error posting job: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Post a New Job</h1>
            <p className="text-neutral-600">Find the perfect freelancer for your project globally</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-900 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                placeholder="e.g. Build an E-commerce App"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="requiredSkills" className="block text-sm font-medium text-neutral-900 mb-2">
                Required Skills (comma separated) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="requiredSkills"
                required
                placeholder="React, Next.js, Stripe"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-neutral-900 mb-2">
                  Budget ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="budget"
                  required
                  placeholder="1000"
                  min="0"
                  step="100"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-neutral-900 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-900 mb-2">
                Project Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                placeholder="Describe the project details, expectations, and deliverables..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {loading ? 'Posting Job...' : '📝 Post Job'}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}
