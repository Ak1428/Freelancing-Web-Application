import Link from 'next/link';
import { Container, Card, Badge, Button } from '@/components/ui';
import JobApplicationButton from '@/components/JobApplicationButton';

type Props = {
  params: Promise<{
    jobId: string;
  }>;
};

async function getJob(jobId: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/${jobId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Failed to fetch job: ${res.status}`);
      return null;
    }

    const data = await res.json();
    console.log('Job fetched:', { success: data.success, jobId: data.job?.id });
    return data.job || null;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { jobId } = await params;
  const job = await getJob(jobId);

  if (!job) {
    return (
      <Container className="py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">❌ Job not found</h1>
          <p className="text-neutral-600 mb-6">The job you are looking for does not exist or has been removed.</p>
          <Link href="/jobs">
            <Button variant="primary" size="lg" fullWidth>
              Back to Jobs
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

  const requiredSkills = Array.isArray(job.requiredSkills)
    ? job.requiredSkills
    : JSON.parse(job.requiredSkills || '[]');

  return (
    <Container className="py-12">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-3">{job.title}</h1>
            <p className="text-lg text-neutral-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Job Metadata */}
          <div className="grid md:grid-cols-2 gap-6 py-8 border-y border-neutral-200 my-8">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Client</p>
              <p className="text-lg font-semibold text-neutral-900">{job.client?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Budget</p>
              <p className="text-3xl font-bold text-primary-600">${job.budget}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Status</p>
              <Badge variant="primary">{job.status}</Badge>
            </div>
            {job.deadline && (
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Deadline</p>
                <p className="text-lg font-semibold text-neutral-900">
                  📅 {new Date(job.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-3">
              {requiredSkills.map((skill: string) => (
                <Badge key={skill} variant="primary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <JobApplicationButton jobId={job.id} jobTitle={job.title} />
            <Link href="/jobs">
              <Button variant="secondary" size="lg" fullWidth>
                Back to Jobs
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Container>
  );
}
