"use client";

import { useEffect, useState } from "react";
import RewardsPage from "@/components/rewards/RewardsPage";
import { Reward } from "@/types/reward";

export default function Home() {
  const userPoints = 0; // start at 0
  const distance = 0; // km
  const time = "00:00";
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch("/api/rewards");

        if (!response.ok) {
          throw new Error(`Failed to fetch rewards: ${response.status}`);
        }

        const data: Array<{ id: number; title: string; cost: number }> =
          await response.json();

        console.log("Rewards from API:", data);

        const mappedRewards: Reward[] = data.map((reward) => ({
          id: String(reward.id),
          title: reward.title,
          requiredPoints: reward.cost,
        }));

        setRewards(mappedRewards);
      } catch (error) {
        console.error("Failed to load rewards:", error);
      }
    };

    fetchRewards();
  }, []);

  return (
    <RewardsPage
      userPoints={userPoints}
      distance={distance}
      time={time}
      rewards={rewards}
    />
  );
}