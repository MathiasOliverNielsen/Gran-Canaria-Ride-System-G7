export interface Reward {
  id: string;
  title: string;
  description: string;
  requiredPoints: number;
  createdAt?: string;
  image?: string;
  redeemed?: boolean;
}