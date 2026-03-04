"use client";

import { Reward } from "@/types/reward";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

export default function RewardCard({
  reward,
  userPoints,
}: RewardCardProps) {

  const canRedeem = userPoints >= reward.requiredPoints;

  return (
    <div className={`reward-card ${canRedeem ? "active" : ""}`}>
      <div className="reward-info">
        <span className="reward-title">{reward.title}</span>
      </div>

    </div>
  );
}