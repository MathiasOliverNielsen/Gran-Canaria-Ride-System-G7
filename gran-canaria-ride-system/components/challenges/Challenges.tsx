"use client";

import { useState, useEffect } from "react";
import { Challenge, UserChallenge } from "@/types/challenge";
import styles from "./SharedChallenges.module.scss";

interface ChallengesProps {
  userPoints?: number;
}

export default function Challenges({ userPoints = 0 }: ChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<UserChallenge | null>(null);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  // Fetch available challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch("/api/challenges");
        if (response.ok) {
          const challengesData = await response.json();
          setChallenges(challengesData);
        }
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      }
    };

    const fetchActiveChallenges = async () => {
      try {
        const response = await fetch("/api/challenges/active");
        if (response.ok) {
          const data = await response.json();
          setActiveChallenges(data.challenges || []);
        }
      } catch (error) {
        console.error("Failed to fetch active challenges:", error);
      }
    };

    Promise.all([fetchChallenges(), fetchActiveChallenges()]).finally(() => setLoading(false));
  }, []);

  const handleAcceptChallenge = async (challengeId: string) => {
    setAccepting(challengeId);
    try {
      const response = await fetch("/api/challenges/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId: parseInt(challengeId) }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChallenges((prev) => [...prev, data.userChallenge]);
        setShowAcceptedModal(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to accept challenge");
      }
    } catch (error) {
      console.error("Failed to accept challenge:", error);
      alert("Failed to accept challenge");
    } finally {
      setAccepting(null);
    }
  };

  const handleViewChallenge = (userChallenge: UserChallenge) => {
    setSelectedChallenge(userChallenge);
  };

  const handleUpdateProgress = async (challengeId: number, progress: number) => {
    try {
      const response = await fetch("/api/challenges/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId, progress }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update the local state
        setActiveChallenges((prev) => prev.map((uc) => (uc.challengeId === challengeId ? { ...uc, ...data.userChallenge } : uc)));

        if (data.completed) {
          alert(`Challenge completed! You earned ${data.userChallenge.challenge.rewardPoints} points!`);
          // Refresh active challenges to remove completed ones
          const refreshResponse = await fetch("/api/challenges/active");
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setActiveChallenges(refreshData.challenges || []);
          }
        }

        setSelectedChallenge(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update progress");
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      alert("Failed to update progress");
    }
  };

  const handleRemoveChallenge = async (challengeId: number) => {
    if (!confirm("Are you sure you want to quit this challenge? Your progress will be lost.")) {
      return;
    }

    setRemoving(true);
    try {
      const response = await fetch("/api/challenges/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId }),
      });

      if (response.ok) {
        // Remove from local state
        setActiveChallenges((prev) => prev.filter((uc) => uc.challengeId !== challengeId));
        setSelectedChallenge(null);
        alert("Challenge removed successfully");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove challenge");
      }
    } catch (error) {
      console.error("Failed to remove challenge:", error);
      alert("Failed to remove challenge");
    } finally {
      setRemoving(false);
    }
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const isActive = activeChallenges.some((uc) => uc.challengeId === parseInt(challenge.id));

    if (isActive) return null;

    return (
      <button key={challenge.id} className={styles.challengeCard} onClick={() => handleAcceptChallenge(challenge.id)} disabled={accepting === challenge.id}>
        <span className={styles.challengeTitle}>{challenge.title}</span>
        <span className={styles.challengeAddBtn}>{accepting === challenge.id ? "..." : "+"}</span>
      </button>
    );
  };

  const renderActiveChallengeCard = (userChallenge: UserChallenge) => {
    const progressPercent = (userChallenge.progress / userChallenge.challenge!.goal) * 100;
    const timeRemaining = getTimeRemaining(userChallenge.expiresAt);

    return (
      <button
        key={userChallenge.id}
        className={`${styles.challengeCard} ${styles.activeChallengeCard}`}
        onClick={() => handleViewChallenge(userChallenge)}
        style={{ background: "var(--white)", color: "var(--challenge-text)" }}
      >
        <div>
          <div className={styles.challengeTitle} style={{ color: "var(--challenge-text)" }}>
            {userChallenge.challenge!.title}
          </div>
          <div className={styles.progressText}>
            {userChallenge.progress}/{userChallenge.challenge!.goal} {userChallenge.challenge!.goalUnit}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>
        </div>
      </button>
    );
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "0:00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className={styles.challengesContainer}>
        <div className={styles.challengesHeader}>
          <h1>Challenges</h1>
        </div>
        <div>Loading challenges...</div>
      </div>
    );
  }

  const availableChallenges = challenges.filter((challenge) => !activeChallenges.some((uc) => uc.challengeId === parseInt(challenge.id)));

  return (
    <div className={styles.challengesContainer}>
      <div className={styles.challengesHeader}>
        <h1>Challenges</h1>
      </div>

      {availableChallenges.length > 0 && (
        <div className={styles.challengesSection}>
          <h2>Challenges</h2>
          <div className={styles.challengesList}>{availableChallenges.map(renderChallengeCard)}</div>
        </div>
      )}

      <div className={styles.activeChallengeSection}>
        <h2>Active challenge:</h2>
        <div className={styles.challengesList}>
          {activeChallenges.length > 0 ? activeChallenges.map(renderActiveChallengeCard) : <div className={styles.activeChallengeCard}>No active challenges</div>}
        </div>
      </div>

      {/* Challenge Info Modal */}
      {selectedChallenge && (
        <div className={styles.challengeModalOverlay} onClick={() => setSelectedChallenge(null)}>
          <div className={styles.challengeModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.challengeInfoModal}>
              <h2 className={styles.modalTitle}>Challenge Info</h2>
              <div className={styles.challengeStats}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Progress:</span>
                  <span className={styles.statValue}>
                    {selectedChallenge.progress}/{selectedChallenge.challenge!.goal} {selectedChallenge.challenge!.goalUnit.toUpperCase()}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Time:</span>
                  <span className={styles.statValue}>{getTimeRemaining(selectedChallenge.expiresAt)}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Reward:</span>
                  <span className={styles.statValue}>{selectedChallenge.challenge!.rewardPoints} POINTS</span>
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <button
                  className={styles.button}
                  onClick={() => handleUpdateProgress(selectedChallenge.challengeId, Math.min(selectedChallenge.progress + 1, selectedChallenge.challenge!.goal))}
                  style={{ marginBottom: "0.5rem", width: "100%" }}
                  disabled={selectedChallenge.progress >= selectedChallenge.challenge!.goal}
                >
                  {selectedChallenge.progress >= selectedChallenge.challenge!.goal ? "Challenge Complete" : `Add Progress (+1 ${selectedChallenge.challenge!.goalUnit})`}
                </button>
                <button
                  className={styles.button}
                  onClick={() => handleRemoveChallenge(selectedChallenge.challengeId)}
                  style={{ marginBottom: "0.5rem", width: "100%", background: "#dc3545", color: "white" }}
                  disabled={removing}
                >
                  {removing ? "Removing..." : "Quit Challenge"}
                </button>
              </div>
              <button className={styles.button} onClick={() => setSelectedChallenge(null)} style={{ width: "100%" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Accepted Modal */}
      {showAcceptedModal && (
        <div className={styles.challengeModalOverlay} onClick={() => setShowAcceptedModal(false)}>
          <div className={styles.challengeModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.challengeAcceptedModal}>
              <h2 className={styles.modalTitle}>Challenge Accepted</h2>
              <button className={styles.button} onClick={() => setShowAcceptedModal(false)} style={{ width: "100%" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
