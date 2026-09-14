import prisma from '@/lib/prisma';
import { Container, Card, Badge } from '@/components/ui';
import ScanProfilesButton from '@/components/ScanProfilesButton';
import AdminDashboardContent from './AdminDashboardContent';

// Force dynamic rendering to avoid static generation with database queries
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let flaggedProfiles: any[] = [];
  let error = null;

  try {
    flaggedProfiles = await prisma.freelancerProfile.findMany({
      where: { isSuspicious: true },
      include: { user: true },
    });
  } catch (err) {
    console.error('Error fetching flagged profiles:', err);
    error = 'Could not load flagged profiles. Please try again.';
  }

  return (
    <Container className="py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Trust & Safety Dashboard
          </h1>
          <p className="text-lg text-neutral-600">
            Review profiles flagged by the internal AI Security System
          </p>
        </div>

        {/* Content */}
        {error ? (
          <Card className="p-8 bg-red-50 border border-red-200">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-900">{error}</h3>
              <p className="text-red-700 mt-2">Please check the server logs for more details.</p>
            </div>
          </Card>
        ) : (
          <Card className="overflow-hidden p-6">
            <AdminDashboardContent initialProfiles={flaggedProfiles} />
          </Card>
        )}
      </div>
    </Container>
  );
}
