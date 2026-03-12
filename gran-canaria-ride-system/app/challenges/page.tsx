"use client";

import { useEffect, useState } from "react";
import Challenges from "@/components/challenges/Challenges";

export default function ChallengesPage() {
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const payload = await response.json();
          if (payload.success && payload.user) {
            setUserPoints(payload.user.points);
          }
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadCurrentUser();
  }, []);

  return <Challenges userPoints={userPoints} />;
}
