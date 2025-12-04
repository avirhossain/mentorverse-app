export type Mentor = {
  id: string;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  avatarUrl: string;
  sessionCost: number;
  availableTimeslots: string[];
  imageHint: string;
};

export type Session = {
  id: string;
  title: string;
  description: string;
  mentorId?: string;
  mentorName?: string;
  cost: number;
  imageUrl: string;
  imageHint: string;
};
