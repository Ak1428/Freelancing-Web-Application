import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo@12345';

const hashPassword = async (password) => bcrypt.hash(password, 10);

const formatDate = (daysFromNow) => new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

const ensureUser = async ({ email, name, role }) => {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      passwordHash,
      emailVerified: true,
    },
    create: {
      email,
      name,
      passwordHash,
      role,
      emailVerified: true,
    },
  });
};

const ensureFreelancerProfile = async ({ userId, category, skills, bio, hourlyRate, rating, reviewCount, completedJobs, totalEarnings, responseTime, portfolioUrl }) => {
  await prisma.freelancerProfile.upsert({
    where: { userId },
    update: {
      category,
      skills: JSON.stringify(skills),
      bio,
      hourlyRate,
      rating,
      reviewCount,
      completedJobs,
      totalEarnings,
      responseTime,
      portfolioUrl,
      isSuspicious: false,
    },
    create: {
      userId,
      category,
      skills: JSON.stringify(skills),
      bio,
      hourlyRate,
      rating,
      reviewCount,
      completedJobs,
      totalEarnings,
      responseTime,
      portfolioUrl,
      isSuspicious: false,
    },
  });
};

const ensurePortfolioProject = async ({ freelancerId, title, description, technologies, projectUrl, duration, budget, clientFeedback, verificationStatus = 'VERIFIED' }) => {
  const existing = await prisma.portfolioProject.findFirst({
    where: { freelancerId, title },
  });

  if (existing) {
    await prisma.portfolioProject.update({
      where: { id: existing.id },
      data: {
        description,
        technologies: JSON.stringify(technologies),
        projectUrl,
        duration,
        budget,
        clientFeedback,
        verificationStatus,
        isAiGenerated: false,
        aiDetectionScore: 0,
      },
    });
    return existing;
  }

  return prisma.portfolioProject.create({
    data: {
      freelancerId,
      title,
      description,
      technologies: JSON.stringify(technologies),
      projectUrl,
      duration,
      budget,
      clientFeedback,
      verificationStatus,
      isAiGenerated: false,
      aiDetectionScore: 0,
    },
  });
};

const ensureJob = async ({ clientId, title, description, budget, requiredSkills, category, status = 'OPEN' }) => {
  const existing = await prisma.job.findFirst({ where: { title } });

  if (existing) {
    await prisma.job.update({
      where: { id: existing.id },
      data: {
        clientId,
        description,
        budget,
        requiredSkills: JSON.stringify(requiredSkills),
        category,
        status,
        deadline: formatDate(18),
      },
    });
    return existing;
  }

  return prisma.job.create({
    data: {
      clientId,
      title,
      description,
      budget,
      deadline: formatDate(18),
      requiredSkills: JSON.stringify(requiredSkills),
      category,
      status,
    },
  });
};

const ensureClientPreference = async ({ clientId, preferredCategories, skillWeightage, performanceWeightage, responsivenessWeightage, minimumRating, minimumCompletedJobs }) => {
  await prisma.clientMatchingPreference.upsert({
    where: { clientId },
    update: {
      preferredCategories: JSON.stringify(preferredCategories),
      skillWeightage,
      performanceWeightage,
      responsivenessWeightage,
      minimumRating,
      minimumCompletedJobs,
      excludeFlags: true,
    },
    create: {
      clientId,
      preferredCategories: JSON.stringify(preferredCategories),
      skillWeightage,
      performanceWeightage,
      responsivenessWeightage,
      minimumRating,
      minimumCompletedJobs,
      excludeFlags: true,
    },
  });
};

const ensureApplication = async ({ jobId, freelancerId, coverLetter, proposedRate, status }) => {
  const existing = await prisma.application.findFirst({
    where: { jobId, freelancerId },
  });

  if (existing) {
    await prisma.application.update({
      where: { id: existing.id },
      data: { coverLetter, proposedRate, status },
    });
    return existing;
  }

  return prisma.application.create({
    data: {
      jobId,
      freelancerId,
      coverLetter,
      proposedRate,
      status,
    },
  });
};

async function main() {
  const admin = await ensureUser({
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  });

  const clientUsers = [
    { email: 'techstart.demo@example.com', name: 'TechStart Solutions', role: 'CLIENT' },
    { email: 'ecommerce.demo@example.com', name: 'ECommerce Hub', role: 'CLIENT' },
    { email: 'datacorp.demo@example.com', name: 'DataCorp Analytics', role: 'CLIENT' },
    { email: 'designstudio.demo@example.com', name: 'DesignStudio', role: 'CLIENT' },
    { email: 'fintech.demo@example.com', name: 'FinTech Innovations', role: 'CLIENT' },
  ];

  const createdClients = [];
  for (const client of clientUsers) {
    const user = await ensureUser(client);
    createdClients.push(user);
  }

  const freelancerDefinitions = [
    {
      email: 'arun.demo@example.com',
      name: 'Arun Kumar',
      role: 'FREELANCER',
      category: 'TECHNICAL',
      skills: ['Java', 'Spring Boot', 'REST API', 'MySQL', 'Git'],
      bio: 'Java backend developer experienced in building REST APIs and database-driven web applications using Spring Boot and MySQL.',
      hourlyRate: 32,
      rating: 4.8,
      reviewCount: 14,
      completedJobs: 11,
      totalEarnings: 7200,
      responseTime: 3,
      portfolioUrl: 'https://github.com/arunkumar',
      portfolioProjects: [
        {
          title: 'E-commerce Backend',
          description: 'Built a scalable backend for an online retail platform with catalog, cart, payment integration, and order APIs in Java and Spring Boot.',
          technologies: ['Java', 'Spring Boot', 'MySQL', 'REST API'],
          projectUrl: 'https://github.com/arunkumar/ecommerce-backend',
          duration: '3 months',
          budget: 2500,
          clientFeedback: 'Strong backend architecture and reliable delivery.',
        },
        {
          title: 'Employee Management System',
          description: 'Developed a full employee management solution with role-based access, attendance tracking, and payroll reporting.',
          technologies: ['Java', 'Spring Boot', 'REST API', 'MySQL'],
          projectUrl: 'https://github.com/arunkumar/employee-management',
          duration: '2 months',
          budget: 1800,
          clientFeedback: 'Delivery was on time and code quality was excellent.',
        },
      ],
    },
    {
      email: 'priya.demo@example.com',
      name: 'Priya Sharma',
      role: 'FREELANCER',
      category: 'TECHNICAL',
      skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js'],
      bio: 'Frontend developer specializing in responsive React applications, reusable components and modern JavaScript/TypeScript development.',
      hourlyRate: 35,
      rating: 4.9,
      reviewCount: 17,
      completedJobs: 12,
      totalEarnings: 8900,
      responseTime: 2,
      portfolioUrl: 'https://portfolio.priyasharma.dev',
      portfolioProjects: [
        {
          title: 'E-commerce Website',
          description: 'Created a responsive storefront with product discovery, shopping cart, checkout flow, and admin analytics for a retail brand.',
          technologies: ['React', 'TypeScript', 'Node.js', 'CSS'],
          projectUrl: 'https://github.com/priya/ecommerce-frontend',
          duration: '4 months',
          budget: 3200,
          clientFeedback: 'The app looked premium and converted better after launch.',
        },
        {
          title: 'Admin Dashboard',
          description: 'Designed and built an analytics dashboard for operations teams with charts, role-based filters and KPI summaries.',
          technologies: ['React', 'JavaScript', 'HTML', 'CSS'],
          projectUrl: 'https://github.com/priya/admin-dashboard',
          duration: '6 weeks',
          budget: 2100,
          clientFeedback: 'Very fast turnaround and a clean UI.',
        },
      ],
    },
    {
      email: 'rahul.demo@example.com',
      name: 'Rahul Verma',
      role: 'FREELANCER',
      category: 'TECHNICAL',
      skills: ['Python', 'Django', 'FastAPI', 'REST API', 'PostgreSQL'],
      bio: 'Python developer experienced in backend development, REST APIs and database-driven applications.',
      hourlyRate: 30,
      rating: 4.7,
      reviewCount: 13,
      completedJobs: 9,
      totalEarnings: 6100,
      responseTime: 5,
      portfolioUrl: 'https://rahulverma.dev',
      portfolioProjects: [
        {
          title: 'Job Portal',
          description: 'Built a full-featured job portal with recruiter dashboards, application tracking, and search functionality.',
          technologies: ['Python', 'Django', 'PostgreSQL', 'REST API'],
          projectUrl: 'https://github.com/rahul/job-portal',
          duration: '3 months',
          budget: 2700,
          clientFeedback: 'High-quality backend and good attention to detail.',
        },
        {
          title: 'Inventory Management System',
          description: 'Designed inventory, procurement, and reporting workflows to help a manufacturing team manage stock more effectively.',
          technologies: ['Python', 'FastAPI', 'PostgreSQL'],
          projectUrl: 'https://github.com/rahul/inventory-system',
          duration: '2 months',
          budget: 1900,
          clientFeedback: 'Reliable and easy to extend for future tasks.',
        },
      ],
    },
    {
      email: 'sneha.demo@example.com',
      name: 'Sneha Reddy',
      role: 'FREELANCER',
      category: 'TECHNICAL',
      skills: ['SQL', 'Excel', 'Power BI', 'Python', 'Data Visualization'],
      bio: 'Data analyst experienced in SQL analysis, Power BI dashboards, Excel reporting and Python-based data analysis.',
      hourlyRate: 28,
      rating: 4.9,
      reviewCount: 16,
      completedJobs: 10,
      totalEarnings: 6700,
      responseTime: 4,
      portfolioUrl: 'https://snehareddy-data.dev',
      portfolioProjects: [
        {
          title: 'Sales Dashboard',
          description: 'Built a sales analytics dashboard with regional performance, conversion trends, and forecast views for leadership reporting.',
          technologies: ['Power BI', 'SQL', 'Excel', 'Python'],
          projectUrl: 'https://github.com/sneha/sales-dashboard',
          duration: '5 weeks',
          budget: 2300,
          clientFeedback: 'The dashboard made executive reporting much easier.',
        },
        {
          title: 'Customer Analytics Dashboard',
          description: 'Analyzed customer acquisition and retention patterns to support marketing and product decisions.',
          technologies: ['SQL', 'Power BI', 'Python'],
          projectUrl: 'https://github.com/sneha/customer-analytics',
          duration: '2 months',
          budget: 2100,
          clientFeedback: 'Very thoughtful analysis and useful visual storytelling.',
        },
      ],
    },
    {
      email: 'karthik.demo@example.com',
      name: 'Karthik Raj',
      role: 'FREELANCER',
      category: 'DESIGN',
      skills: ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping'],
      bio: 'UI/UX designer focused on creating user-friendly interfaces, wireframes, prototypes and digital product experiences.',
      hourlyRate: 40,
      rating: 4.8,
      reviewCount: 18,
      completedJobs: 14,
      totalEarnings: 9200,
      responseTime: 1,
      portfolioUrl: 'https://behance.net/karthikraj',
      portfolioProjects: [
        {
          title: 'Mobile Banking App',
          description: 'Designed a secure mobile banking experience with user journeys, onboarding flows, and financial dashboard interactions.',
          technologies: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
          projectUrl: 'https://behance.net/gallery/mobile-banking-app',
          duration: '2 months',
          budget: 3500,
          clientFeedback: 'The product felt intuitive and polished from day one.',
        },
        {
          title: 'Food Delivery App',
          description: 'Created a complete app flow for food discovery, order placement, and restaurant discovery optimized for mobile users.',
          technologies: ['Figma', 'Wireframing', 'UI Design', 'UX Research'],
          projectUrl: 'https://behance.net/gallery/food-delivery-app',
          duration: '6 weeks',
          budget: 2900,
          clientFeedback: 'Excellent UX thinking and strong design consistency.',
        },
      ],
    },
  ];

  const createdFreelancers = [];
  for (const freelancer of freelancerDefinitions) {
    const user = await ensureUser({
      email: freelancer.email,
      name: freelancer.name,
      role: freelancer.role,
    });

    await ensureFreelancerProfile({
      userId: user.id,
      category: freelancer.category,
      skills: freelancer.skills,
      bio: freelancer.bio,
      hourlyRate: freelancer.hourlyRate,
      rating: freelancer.rating,
      reviewCount: freelancer.reviewCount,
      completedJobs: freelancer.completedJobs,
      totalEarnings: freelancer.totalEarnings,
      responseTime: freelancer.responseTime,
      portfolioUrl: freelancer.portfolioUrl,
    });

    for (const project of freelancer.portfolioProjects) {
      await ensurePortfolioProject({
        freelancerId: user.id,
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        projectUrl: project.projectUrl,
        duration: project.duration,
        budget: project.budget,
        clientFeedback: project.clientFeedback,
      });
    }

    createdFreelancers.push({ user, profile: freelancer });
  }

  const jobs = [
    {
      clientEmail: 'techstart.demo@example.com',
      title: 'Java Spring Boot Backend Developer',
      description: 'Build and maintain backend REST APIs for a business application using Java and Spring Boot.',
      budget: 2200,
      category: 'BACKEND_DEVELOPMENT',
      requiredSkills: ['Java', 'Spring Boot', 'REST API', 'MySQL', 'Git'],
      status: 'OPEN',
    },
    {
      clientEmail: 'ecommerce.demo@example.com',
      title: 'React Frontend Developer',
      description: 'Develop a responsive e-commerce frontend using React and modern JavaScript/TypeScript.',
      budget: 1800,
      category: 'FRONTEND_DEVELOPMENT',
      requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
      status: 'OPEN',
    },
    {
      clientEmail: 'fintech.demo@example.com',
      title: 'Python API Developer',
      description: 'Develop secure and scalable backend APIs for a financial application using Python.',
      budget: 2400,
      category: 'BACKEND_DEVELOPMENT',
      requiredSkills: ['Python', 'FastAPI', 'Django', 'REST API', 'PostgreSQL'],
      status: 'OPEN',
    },
    {
      clientEmail: 'datacorp.demo@example.com',
      title: 'Sales Dashboard Developer',
      description: 'Create an interactive sales analytics dashboard with KPIs, charts and business insights.',
      budget: 2000,
      category: 'DATA_ANALYTICS',
      requiredSkills: ['Power BI', 'SQL', 'Excel', 'Python', 'Data Visualization'],
      status: 'OPEN',
    },
    {
      clientEmail: 'designstudio.demo@example.com',
      title: 'Mobile App UI/UX Designer',
      description: 'Design a modern mobile application interface and create wireframes and interactive prototypes.',
      budget: 1600,
      category: 'UI_UX',
      requiredSkills: ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping'],
      status: 'OPEN',
    },
    {
      clientEmail: 'ecommerce.demo@example.com',
      title: 'E-commerce Website Developer',
      description: 'Build a responsive e-commerce website with product listings, user interactions and an admin interface.',
      budget: 2600,
      category: 'WEB_DEVELOPMENT',
      requiredSkills: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS'],
      status: 'OPEN',
    },
    {
      clientEmail: 'datacorp.demo@example.com',
      title: 'Data Analytics Project',
      description: 'Analyze customer and sales data and develop dashboards that help identify business trends.',
      budget: 2100,
      category: 'DATA_ANALYTICS',
      requiredSkills: ['SQL', 'Power BI', 'Excel', 'Python', 'Data Analysis'],
      status: 'OPEN',
    },
    {
      clientEmail: 'fintech.demo@example.com',
      title: 'Financial Management Application',
      description: 'Develop a financial management application with a Java Spring Boot backend and React frontend.',
      budget: 3000,
      category: 'FINTECH',
      requiredSkills: ['Java', 'Spring Boot', 'React', 'MySQL', 'REST API'],
      status: 'OPEN',
    },
  ];

  const createdJobs = [];
  for (const job of jobs) {
    const client = createdClients.find((user) => user.email === job.clientEmail);
    if (!client) continue;

    const createdJob = await ensureJob({
      clientId: client.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      requiredSkills: job.requiredSkills,
      category: job.category,
      status: job.status,
    });
    createdJobs.push(createdJob);
  }

  for (const client of createdClients) {
    const preferredCategories = ['TECHNICAL', 'DESIGN'];
    const clientJobStyle = {
      'techstart.demo@example.com': { preferredCategories: ['TECHNICAL'], skillWeightage: 0.6, performanceWeightage: 0.25, responsivenessWeightage: 0.15, minimumRating: 4.1, minimumCompletedJobs: 2 },
      'ecommerce.demo@example.com': { preferredCategories: ['TECHNICAL'], skillWeightage: 0.55, performanceWeightage: 0.3, responsivenessWeightage: 0.15, minimumRating: 4.2, minimumCompletedJobs: 3 },
      'datacorp.demo@example.com': { preferredCategories: ['TECHNICAL'], skillWeightage: 0.5, performanceWeightage: 0.25, responsivenessWeightage: 0.25, minimumRating: 4.3, minimumCompletedJobs: 2 },
      'designstudio.demo@example.com': { preferredCategories: ['DESIGN'], skillWeightage: 0.45, performanceWeightage: 0.2, responsivenessWeightage: 0.35, minimumRating: 4.4, minimumCompletedJobs: 3 },
      'fintech.demo@example.com': { preferredCategories: ['TECHNICAL'], skillWeightage: 0.6, performanceWeightage: 0.25, responsivenessWeightage: 0.15, minimumRating: 4.1, minimumCompletedJobs: 4 },
    };

    const prefs = clientJobStyle[client.email] || {
      preferredCategories,
      skillWeightage: 0.5,
      performanceWeightage: 0.3,
      responsivenessWeightage: 0.2,
      minimumRating: 4.0,
      minimumCompletedJobs: 2,
    };

    await ensureClientPreference({
      clientId: client.id,
      preferredCategories: prefs.preferredCategories,
      skillWeightage: prefs.skillWeightage,
      performanceWeightage: prefs.performanceWeightage,
      responsivenessWeightage: prefs.responsivenessWeightage,
      minimumRating: prefs.minimumRating,
      minimumCompletedJobs: prefs.minimumCompletedJobs,
    });
  }

  const applicationDefinitions = [
    { jobTitle: 'Java Spring Boot Backend Developer', freelancerEmail: 'arun.demo@example.com', coverLetter: 'I have built Java-based backends and database-heavy services for business applications, and I can deliver this project efficiently.', proposedRate: 36, status: 'ACCEPTED' },
    { jobTitle: 'Java Spring Boot Backend Developer', freelancerEmail: 'rahul.demo@example.com', coverLetter: 'I can build the API layer and database integration for the system using Python and FastAPI, and I can adapt quickly to the Java stack.', proposedRate: 34, status: 'PENDING' },
    { jobTitle: 'React Frontend Developer', freelancerEmail: 'priya.demo@example.com', coverLetter: 'I specialize in React frontends and can build a responsive, conversion-focused storefront experience.', proposedRate: 42, status: 'ACCEPTED' },
    { jobTitle: 'React Frontend Developer', freelancerEmail: 'karthik.demo@example.com', coverLetter: 'I can create a polished, user-centered interface and prototype the UX before implementation.', proposedRate: 38, status: 'PENDING' },
    { jobTitle: 'Python API Developer', freelancerEmail: 'rahul.demo@example.com', coverLetter: 'I have strong experience with Python APIs and relational data modeling for secure business platforms.', proposedRate: 33, status: 'ACCEPTED' },
    { jobTitle: 'Python API Developer', freelancerEmail: 'arun.demo@example.com', coverLetter: 'I can support the backend and API structure while also helping with Java integration if needed.', proposedRate: 35, status: 'PENDING' },
    { jobTitle: 'Sales Dashboard Developer', freelancerEmail: 'sneha.demo@example.com', coverLetter: 'I can deliver a clean KPI dashboard with clear business insights and data storytelling skills.', proposedRate: 31, status: 'ACCEPTED' },
    { jobTitle: 'Sales Dashboard Developer', freelancerEmail: 'priya.demo@example.com', coverLetter: 'I can create high-quality charts and a frontend for business reporting dashboards.', proposedRate: 29, status: 'PENDING' },
    { jobTitle: 'Mobile App UI/UX Designer', freelancerEmail: 'karthik.demo@example.com', coverLetter: 'I have led mobile app design projects and can create wireframes, flows, and clickable prototypes.', proposedRate: 45, status: 'ACCEPTED' },
    { jobTitle: 'Mobile App UI/UX Designer', freelancerEmail: 'priya.demo@example.com', coverLetter: 'I can bring a strong visual design perspective and structured workflow for the app experience.', proposedRate: 41, status: 'PENDING' },
    { jobTitle: 'E-commerce Website Developer', freelancerEmail: 'priya.demo@example.com', coverLetter: 'I can build an attractive and responsive storefront with product pages, cart logic, and front-end polish.', proposedRate: 40, status: 'ACCEPTED' },
    { jobTitle: 'E-commerce Website Developer', freelancerEmail: 'arun.demo@example.com', coverLetter: 'I can contribute to full-stack delivery and backend logic for the storefront and dashboards.', proposedRate: 37, status: 'PENDING' },
    { jobTitle: 'Data Analytics Project', freelancerEmail: 'sneha.demo@example.com', coverLetter: 'I specialize in turning raw data into actionable insights through dashboards and clear analytical storytelling.', proposedRate: 32, status: 'ACCEPTED' },
    { jobTitle: 'Data Analytics Project', freelancerEmail: 'rahul.demo@example.com', coverLetter: 'I can support analytics workflows, data processing and dashboard reporting with Python tools.', proposedRate: 30, status: 'PENDING' },
    { jobTitle: 'Financial Management Application', freelancerEmail: 'arun.demo@example.com', coverLetter: 'I can build the Spring Boot backend and help maintain a strong API and database structure for the finance app.', proposedRate: 38, status: 'ACCEPTED' },
    { jobTitle: 'Financial Management Application', freelancerEmail: 'priya.demo@example.com', coverLetter: 'I can contribute to the React frontend and user workflows for a finance dashboard and management experience.', proposedRate: 36, status: 'PENDING' },
  ];

  for (const app of applicationDefinitions) {
    const job = createdJobs.find((createdJob) => createdJob.title === app.jobTitle);
    const freelancer = createdFreelancers.find((freelancerEntry) => freelancerEntry.user.email === app.freelancerEmail);

    if (!job || !freelancer) continue;

    await ensureApplication({
      jobId: job.id,
      freelancerId: freelancer.user.id,
      coverLetter: app.coverLetter,
      proposedRate: app.proposedRate,
      status: app.status,
    });
  }

  await prisma.notification.upsert({
    where: { id: `${admin.id}-seed-data` },
    update: {},
    create: {
      id: `${admin.id}-seed-data`,
      userId: admin.id,
      type: 'WELCOME',
      title: 'Demo dataset ready',
      message: '5 clients, 5 freelancers, 8 jobs, and realistic applications are loaded for demo use.',
      link: '/dashboard',
    },
  });

  const jobCount = await prisma.job.count();
  const freelancerCount = await prisma.user.count({ where: { role: 'FREELANCER' } });
  const clientCount = await prisma.user.count({ where: { role: 'CLIENT' } });
  const applicationCount = await prisma.application.count();
  const portfolioCount = await prisma.portfolioProject.count();

  console.log('Seed data loaded successfully.');
  console.log(`Freelancers: ${freelancerCount}`);
  console.log(`Clients: ${clientCount}`);
  console.log(`Jobs: ${jobCount}`);
  console.log(`Applications: ${applicationCount}`);
  console.log(`Portfolio projects: ${portfolioCount}`);
  console.log('\nDemo accounts:');
  console.log('- admin@example.com / Demo@12345');
  console.log('- techstart.demo@example.com / Demo@12345');
  console.log('- ecommerce.demo@example.com / Demo@12345');
  console.log('- datacorp.demo@example.com / Demo@12345');
  console.log('- designstudio.demo@example.com / Demo@12345');
  console.log('- fintech.demo@example.com / Demo@12345');
  console.log('- arun.demo@example.com / Demo@12345');
  console.log('- priya.demo@example.com / Demo@12345');
  console.log('- rahul.demo@example.com / Demo@12345');
  console.log('- sneha.demo@example.com / Demo@12345');
  console.log('- karthik.demo@example.com / Demo@12345');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
