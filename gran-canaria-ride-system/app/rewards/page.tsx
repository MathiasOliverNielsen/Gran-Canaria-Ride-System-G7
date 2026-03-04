"use client";

import RewardsPage from "@/components/rewards/RewardsPage";
import { Reward } from "@/types/reward";

export default function Home() {
  // Mocked data (replace with API later)
  const userPoints = 0; // start at 0
  const distance = 0; // km
  const time = "00:00";

  const rewards: Reward[] = [
    { id: "1", title: "", requiredPoints: 10 },
    { id: "2", title: "", requiredPoints: 20 },
    { id: "3", title: "", requiredPoints: 30 },
  ];

  return (
    <RewardsPage
      userPoints={userPoints}
      distance={distance}
      time={time}
      rewards={rewards.map((r) => ({
        ...r,
        title: `${r.requiredPoints} KM Trophy`,
      }))}
    />
  );
}