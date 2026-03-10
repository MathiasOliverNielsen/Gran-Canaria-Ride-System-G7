export interface Reward {
  id: string;
  title: string;
  requiredPoints: number;
  image?: string;
  redeemed?: boolean;
}