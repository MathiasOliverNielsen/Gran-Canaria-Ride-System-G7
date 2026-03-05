"use client";

import { Reward } from "@/types/reward";
import RewardCard from "./RewardCard";
import PointsHeaderClient from "./PointsHeaderClient";
import "../../styles/rewards.scss";

interface RewardsPageProps {
  userPoints: number;
  distance: number;
  time: string;
  rewards: Reward[];
}

export default function RewardsPage({ userPoints, distance, time, rewards }: RewardsPageProps) {
  return (
    <div className="rewards-page">
      <PointsHeaderClient points={userPoints} distance={distance} time={time} />

      <div className="rewards-section">
        <h2>Rewards</h2>

        <div className="rewards-list">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={userPoints} />
          ))}
        </div>
      </div>
    </div>
  );
}
