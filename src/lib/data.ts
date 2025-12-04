import type { Mentor, Session } from '@/lib/types';

export const mentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    title: 'Lead Data Scientist @ TechCorp',
    bio: 'With over 15 years of experience in machine learning and AI, Evelyn is passionate about mentoring the next generation of data scientists. She specializes in natural language processing and deep learning.',
    expertise: ['AI/ML', 'NLP', 'Python', 'Career Growth'],
    avatarUrl: 'https://picsum.photos/seed/mentor1/400/400',
    imageHint: 'professional woman',
    sessionCost: 150,
    availableTimeslots: ['2024-09-10T10:00:00', '2024-09-10T14:00:00', '2024-09-12T11:00:00'],
  },
  {
    id: '2',
    name: 'Marcus Chen',
    title: 'Principal UX Designer @ Innovate Inc.',
    bio: 'Marcus has a decade of experience crafting intuitive and beautiful user experiences for web and mobile applications. He loves helping new designers find their voice and build a strong portfolio.',
    expertise: ['UX/UI Design', 'Figma', 'User Research', 'Portfolio Review'],
    avatarUrl: 'https://picsum.photos/seed/mentor2/400/400',
    imageHint: 'friendly man',
    sessionCost: 120,
    availableTimeslots: ['2024-09-11T09:00:00', '2024-09-11T13:00:00'],
  },
  {
    id: '3',
    name: 'Jasmine Patel',
    title: 'Senior Product Manager @ SolutionZ',
    bio: 'Jasmine excels at leading cross-functional teams to deliver impactful products. She can guide you through product strategy, roadmap planning, and stakeholder management.',
    expertise: ['Product Management', 'Agile', 'Roadmapping', 'Leadership'],
    avatarUrl: 'https://picsum.photos/seed/mentor3/400/400',
    imageHint: 'person glasses',
    sessionCost: 180,
    availableTimeslots: ['2024-09-13T16:00:00'],
  },
  {
    id: '4',
    name: 'Leo Ramirez',
    title: 'Cloud Solutions Architect @ SkyHigh',
    bio: 'Leo is an expert in designing and implementing scalable cloud infrastructures on AWS and Azure. He can help with system design interviews, certification prep, and architectural best practices.',
    expertise: ['Cloud Computing', 'AWS', 'System Design', 'DevOps'],
    avatarUrl: 'https://picsum.photos/seed/mentor4/400/400',
    imageHint: 'creative office',
    sessionCost: 200,
    availableTimeslots: ['2024-09-16T10:00:00', '2024-09-17T15:00:00'],
  },
];

export const sessions: Session[] = [
  {
    id: 's1',
    title: "Breaking into AI: A Beginner's Guide",
    description: 'This session is perfect for those new to the field of Artificial Intelligence. We will cover fundamental concepts, learning resources, and potential career paths. No prior experience required.',
    mentorId: '1',
    mentorName: 'Dr. Evelyn Reed',
    cost: 75,
    imageUrl: 'https://picsum.photos/seed/session1/600/400',
    imageHint: 'collaboration meeting',
  },
  {
    id: 's2',
    title: 'Mastering the Product Management Interview',
    description: 'A deep dive into the product management interview process. We will practice common frameworks, behavioral questions, and case studies to help you land your dream PM role.',
    mentorId: '3',
    mentorName: 'Jasmine Patel',
    cost: 100,
    imageUrl: 'https://picsum.photos/seed/session2/600/400',
    imageHint: 'whiteboard presentation',
  },
  {
    id: 's3',
    title: 'Advanced System Design for Cloud',
    description: 'For experienced engineers looking to level up their system design skills. This session covers patterns for building resilient, scalable, and cost-effective systems in the cloud.',
    mentorId: '4',
    mentorName: 'Leo Ramirez',
    cost: 150,
    imageUrl: 'https://picsum.photos/seed/session3/600/400',
    imageHint: 'code screen',
  },
];

export const menteeSessionHistory = `
- Attended 'Intro to UX Design' on 2024-05-10.
- Attended 'Figma Basics' on 2024-05-25.
- Booked a 1:1 session with a UX designer on 2024-06-15 to discuss portfolio improvements.
`;
