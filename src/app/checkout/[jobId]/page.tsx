'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Container, Card, Button } from '@/components/ui';

export default function CheckoutPage({ params }: { params: Promise<{ jobId?: string }> }) {
  const { jobId = 'demo-123' } = use(params);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const totalAmount = jobId === 'demo-123' ? 1575 : Math.max(1299, 1200 + (jobId?.length || 0) * 12);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock API call to process payment
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <Container className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Payment Successful!</h1>
          <p className="text-neutral-600 mb-6">Funds have been securely placed in escrow.</p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg" fullWidth>
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Secure Checkout</h1>
            <p className="text-neutral-600">Fund your milestone safely</p>
          </div>

          {/* Order Summary */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Project Allocation</span>
              <span className="font-medium text-neutral-900">${(totalAmount * 0.95).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Platform Fee (5%)</span>
              <span className="font-medium text-neutral-900">${(totalAmount * 0.05).toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-3 flex justify-between">
              <span className="font-semibold text-neutral-900">Total to Pay</span>
              <span className="text-2xl font-bold text-primary-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Name on Card
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Card Number
              </label>
              <input
                type="text"
                required
                placeholder="•••• •••• •••• ••••"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  required
                  placeholder="12/26"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  required
                  placeholder="•••"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)} Securely`}
            </Button>
          </form>

          <p className="text-center text-xs text-neutral-500 mt-4">
            🔒 Your payment is secured by industry standard encryption
          </p>
        </Card>
      </div>
    </Container>
  );
}
