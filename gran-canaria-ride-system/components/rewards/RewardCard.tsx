"use client";

import { Reward } from "@/types/reward";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onViewDetails: (rewardId: string) => void;
  onRedeem: (rewardId: string) => void;
  onEdit: (rewardId: string) => void;
  onDelete: (rewardId: string) => void;
  isManageMode: boolean;
  isRedeeming: boolean;
  isDeleting: boolean;
}

export default function RewardCard({
  reward,
  userPoints,
  onViewDetails,
  onRedeem,
  onEdit,
  onDelete,
  isManageMode,
  isRedeeming,
  isDeleting,
}: RewardCardProps) {
  const canRedeem = userPoints >= reward.requiredPoints;

  return (
    <div className={`reward-card ${canRedeem ? "active" : ""}`}>
      <div className="reward-info">
        <span className="reward-title">{reward.title}</span>
        <p className="reward-required">{reward.requiredPoints} points</p>
      </div>

      <div className="reward-actions">
        {isManageMode ? (
          <>
            <button
              type="button"
              className="redeem-button"
              onClick={() => onEdit(reward.id)}
            >
              Edit
            </button>

            <button
              type="button"
              className="redeem-button"
              disabled={isDeleting}
              onClick={() => onDelete(reward.id)}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="redeem-button"
              onClick={() => onViewDetails(reward.id)}
            >
              Details
            </button>

            <button
              type="button"
              className="redeem-button"
              disabled={!canRedeem || isRedeeming}
              onClick={() => onRedeem(reward.id)}
            >
              {isRedeeming ? "Redeeming..." : "Redeem"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}