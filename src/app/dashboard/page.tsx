'use client';

import Link from 'next/link';
import { Container, Card, Button } from '@/components/ui';

export default function DashboardPage() {
  return (
    <Container className="py-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">📊 Dashboard</h1>
          <p className="text-lg text-neutral-600">
            Welcome back. From here you can access jobs, messages, or manage your profile.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">📌</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Browse Jobs</h3>
            <p className="text-neutral-600 mb-6 text-sm">
              Explore available projects from clients around the world
            </p>
            <Link href="/jobs">
              <Button variant="primary" fullWidth>
                View Jobs
              </Button>
            </Link>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Messages</h3>
            <p className="text-neutral-600 mb-6 text-sm">
              Stay connected with clients and fellow freelancers
            </p>
            <Link href="/messages">
              <Button variant="primary" fullWidth>
                Check Messages
              </Button>
            </Link>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">My Profile</h3>
            <p className="text-neutral-600 mb-6 text-sm">
              Update your skills, portfolio, and professional information
            </p>
            <Link href="/freelancer/profile">
              <Button variant="primary" fullWidth>
                Edit Profile
              </Button>
            </Link>
          </Card>
        </div>

        {/* Additional Cards */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-4 p-4 rounded-lg bg-neutral-50">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Getting Started</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Complete your profile to increase visibility to clients
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-neutral-50">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Build Your Reputation</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Take on projects and get reviews from satisfied clients
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-neutral-50">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Earn Money</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Get paid securely for your work with our escrow system
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-neutral-50">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Grow Your Business</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Scale up with more projects and better opportunities
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
