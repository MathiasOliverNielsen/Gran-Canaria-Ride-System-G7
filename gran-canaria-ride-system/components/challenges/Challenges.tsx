"use client";

import { useState, useEffect } from "react";
import { Challenge, UserChallenge } from "@/types/challenge";
import { Button, Modal } from "@/components/ui";
import PlusIcon from "@/components/ui/PlusIcon";
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
        } else {
          console.error("Failed to fetch challenges, status:", response.status);
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
        } else {
          console.error("Failed to fetch active challenges, status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch active challenges:", error);
      }
    };

    Promise.all([fetchChallenges(), fetchActiveChallenges()]).finally(() => setLoading(false));
  }, []);

  const handleAcceptChallenge = async (challengeId: number) => {
    setAccepting(challengeId.toString());
    try {
      const response = await fetch("/api/challenges/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId }),
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
      alert("Failed to accept challenge: " + (error instanceof Error ? error.message : String(error)));
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
    const isActive = activeChallenges.some((uc) => uc.challengeId === challenge.id);

    if (isActive) return null;

    return (
      <div key={challenge.id} className={styles.challengeCard}>
        <span className={styles.challengeTitle}>{challenge.title}</span>
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            handleAcceptChallenge(challenge.id);
          }}
          disabled={accepting === challenge.id.toString()}
          loading={accepting === challenge.id.toString()}
          icon={<PlusIcon size={18} color="white" />}
          iconOnly
        />
      </div>
    );
  };

  const renderActiveChallengeCard = (userChallenge: UserChallenge) => {
    const progressPercent = (userChallenge.progress / userChallenge.challenge!.goal) * 100;
    const timeRemaining = getTimeRemaining(userChallenge.expiresAt);

    return (
      <div
        key={userChallenge.id}
        className={`${styles.challengeCard} ${styles.activeChallengeCard}`}
        onClick={() => handleViewChallenge(userChallenge)}
        style={{ background: "var(--white)", color: "var(--challenge-text)", cursor: "pointer" }}
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
      </div>
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

  const availableChallenges = challenges.filter((challenge) => !activeChallenges.some((uc) => uc.challengeId === challenge.id));

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
      <Modal isOpen={selectedChallenge !== null} onClose={() => setSelectedChallenge(null)} title="Challenge Info" size="md">
        {selectedChallenge && (
          <div className={styles.challengeInfoModal}>
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
            <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Button variant="danger" fullWidth onClick={() => handleRemoveChallenge(selectedChallenge.challengeId)} disabled={removing} loading={removing}>
                Quit Challenge
              </Button>
            </div>
            <Button variant="secondary" fullWidth onClick={() => setSelectedChallenge(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Challenge Accepted Modal */}
      <Modal isOpen={showAcceptedModal} onClose={() => setShowAcceptedModal(false)} title="Challenge Accepted" size="sm">
        <div className={styles.challengeAcceptedModal}>
          <p>Great! You've accepted the challenge. Good luck!</p>
          <Button variant="primary" fullWidth onClick={() => setShowAcceptedModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
