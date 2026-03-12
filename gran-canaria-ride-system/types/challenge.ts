export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  goal: number;
  goalUnit: string;
  rewardPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userChallenges?: UserChallenge[];
}

export interface UserChallenge {
  id: string;
  userId: number;
  challengeId: number;
  status: "active" | "completed" | "expired";
  progress: number;
  startedAt: string;
  completedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  challenge?: Challenge;
}

export interface ChallengeFormData {
  title: string;
  description: string;
  type: "daily" | "weekly";
  goal: number;
  goalUnit: string;
  rewardPoints: number;
}
