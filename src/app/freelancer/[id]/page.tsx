'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Container, Card, Badge, Button } from '@/components/ui';

interface FreelancerData {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  category: string;
  skills: string[];
  portfolioUrl?: string;
  bio?: string;
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  totalEarnings: number;
  responseTime: number;
  riskScore: number;
  isSuspicious: boolean;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string | null;
  projectUrl: string | null;
  completionDate: string;
  budget: number;
  duration: string;
  clientFeedback: string;
  isAiGenerated: boolean;
  aiDetectionScore: number;
  verificationStatus: string;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  reviewer: {
    name: string;
    email: string;
  };
  createdAt: string;
  isAnonymous: boolean;
}

export default function DetailedFreelancerProfile() {
  const params = useParams();
  const freelancerId = params.id as string;

  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch freelancer profile
        const profileRes = await fetch(`/api/freelancer/profile-detail?userId=${freelancerId}`);
        if (!profileRes.ok) {
          const errorData = await profileRes.json();
          throw new Error(errorData.error || 'Failed to load freelancer profile');
        }
        const profileData = await profileRes.json();
        setFreelancer(profileData);

        // Fetch portfolio projects
        const portfolioRes = await fetch(`/api/portfolio?freelancerId=${freelancerId}`);
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolio(portfolioData.projects || []);
        }

        // Fetch reviews
        const reviewsRes = await fetch(`/api/reviews?userId=${freelancerId}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to load freelancer profile');
      } finally {
        setLoading(false);
      }
    };

    if (freelancerId) {
      fetchData();
    }
  }, [freelancerId]);

  if (loading) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-neutral-600">Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (error || !freelancer) {
    return (
      <Container className="py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <p className="text-red-600">{error || 'Freelancer not found'}</p>
          <Link href="/freelancers">
            <Button variant="primary" className="mt-4">
              Back to Freelancers
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

  const riskLevel =
    freelancer.riskScore < 20 ? 'low' :
    freelancer.riskScore < 50 ? 'medium' : 'high';

  return (
    <Container className="py-12">
      <div className="space-y-8">
        {/* Header Section */}
        <Card className="p-8 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                    {freelancer.user.name}
                  </h1>
                  <p className="text-neutral-600 mb-3">{freelancer.user.email}</p>
                  <Badge
                    variant={freelancer.category === 'TECHNICAL' ? 'primary' : 'accent'}
                    className="mb-3"
                  >
                    {freelancer.category === 'TECHNICAL' ? '💻 Technical' : '🎨 Non-Technical'}
                  </Badge>
                </div>
              </div>

              {/* Risk Indicator */}
              {freelancer.isSuspicious && (
                <div className={`p-4 rounded-lg mb-4 border-2 ${
                  riskLevel === 'high' ? 'bg-red-50 border-red-300' :
                  riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                  'bg-blue-50 border-blue-300'
                }`}>
                  <p className={`text-sm font-semibold ${
                    riskLevel === 'high' ? 'text-red-700' :
                    riskLevel === 'medium' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    ⚠️ Risk Level: {riskLevel.toUpperCase()} (Score: {freelancer.riskScore}%)
                  </p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">${freelancer.hourlyRate}/hr</p>
                <p className="text-sm text-neutral-600">Hourly Rate</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{freelancer.completedJobs}</p>
                <p className="text-sm text-neutral-600">Completed Jobs</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-2xl font-bold text-amber-500">
                    {freelancer.rating.toFixed(1)}
                  </p>
                  <span className="text-lg">⭐</span>
                </div>
                <p className="text-sm text-neutral-600">({freelancer.reviewCount} reviews)</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">${freelancer.totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-neutral-600">Total Earnings</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bio Section */}
        {freelancer.bio && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">About</h2>
            <p className="text-neutral-700 leading-relaxed">{freelancer.bio}</p>
          </Card>
        )}

        {/* Skills Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {freelancer.skills.map((skill) => (
              <Badge key={skill} variant="primary">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Details Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-2">Response Time</p>
              <p className="text-lg text-neutral-900">{freelancer.responseTime} hours average</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-2">Member Since</p>
              <p className="text-lg text-neutral-900">
                {new Date(freelancer.user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Portfolio Section */}
        {portfolio.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Portfolio Projects</h2>
            <div className="space-y-6">
              {portfolio.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                >
                  {/* AI Detection Badge */}
                  {project.isAiGenerated && (
                    <div className="mb-3 inline-block">
                      <Badge variant="danger">
                        🤖 Potential AI-Generated
                      </Badge>
                    </div>
                  )}

                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {project.title}
                  </h3>

                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <p className="text-neutral-700 mb-4">{project.description}</p>

                  {/* Technologies */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-600 mb-2">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="accent" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    {project.budget && (
                      <div>
                        <p className="text-neutral-600">Budget</p>
                        <p className="font-semibold text-neutral-900">${project.budget}</p>
                      </div>
                    )}
                    {project.duration && (
                      <div>
                        <p className="text-neutral-600">Duration</p>
                        <p className="font-semibold text-neutral-900">{project.duration}</p>
                      </div>
                    )}
                    {project.completionDate && (
                      <div>
                        <p className="text-neutral-600">Completed</p>
                        <p className="font-semibold text-neutral-900">
                          {new Date(project.completionDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-neutral-600">Status</p>
                      <Badge variant={project.verificationStatus === 'VERIFIED' ? 'primary' : 'accent'}>
                        {project.verificationStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Client Feedback */}
                  {project.clientFeedback && (
                    <div className="p-3 bg-neutral-50 rounded-lg mb-4 border-l-4 border-primary-600">
                      <p className="text-sm font-medium text-neutral-600 mb-1">Client Feedback</p>
                      <p className="text-neutral-700 italic">&quot;{project.clientFeedback}&quot;</p>
                    </div>
                  )}

                  {/* Links */}
                  {project.projectUrl && (
                    <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        View Project →
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {review.isAnonymous ? 'Anonymous' : review.reviewer.name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-lg">⭐</span>
                      ))}
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-neutral-900 mb-2">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-neutral-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="p-8 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Interested in working together?</h3>
              <p className="opacity-90">Send a message or invite this freelancer to your projects</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/messages?user=${freelancer.user.id}`}>
                <Button variant="secondary" size="lg">
                  💬 Send Message
                </Button>
              </Link>
              <Link href={`/client/post-job?suggestFreelancer=${freelancer.user.id}`}>
                <Button variant="primary" size="lg">
                  ✉️ Invite to Job
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}
