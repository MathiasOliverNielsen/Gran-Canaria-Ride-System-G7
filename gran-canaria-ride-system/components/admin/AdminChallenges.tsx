"use client";

import { useState, useEffect, FormEvent } from "react";
import { Challenge, ChallengeFormData } from "@/types/challenge";
import styles from "../challenges/SharedChallenges.module.scss";

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: "",
    description: "",
    type: "daily",
    goal: 1,
    goalUnit: "km",
    rewardPoints: 1,
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/challenges");
      if (response.ok) {
        const challengesData = await response.json();
        setChallenges(challengesData);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        await fetchChallenges();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create challenge");
      }
    } catch (error) {
      console.error("Failed to create challenge:", error);
      alert("Failed to create challenge");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateChallenge = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/challenges/${editingChallenge.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isActive: editingChallenge.isActive,
        }),
      });

      if (response.ok) {
        setEditingChallenge(null);
        resetForm();
        await fetchChallenges();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update challenge");
      }
    } catch (error) {
      console.error("Failed to update challenge:", error);
      alert("Failed to update challenge");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchChallenges();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete challenge");
      }
    } catch (error) {
      console.error("Failed to delete challenge:", error);
      alert("Failed to delete challenge");
    }
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      goal: challenge.goal,
      goalUnit: challenge.goalUnit,
      rewardPoints: challenge.rewardPoints,
    });
    setEditingChallenge(challenge);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "daily",
      goal: 1,
      goalUnit: "km",
      rewardPoints: 1,
    });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingChallenge(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Admin - Challenges</h1>
        <div>Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Admin - Challenges</h1>
        <button className={styles.button} onClick={() => setShowCreateModal(true)}>
          Create Challenge
        </button>
      </div>

      <div className={styles.challengesList}>
        {challenges.map((challenge) => (
          <div key={challenge.id} className={styles.adminCard}>
            <div className={styles.adminCardInfo}>
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "var(--challenge-secondary-text)" }}>
                <span>Type: {challenge.type}</span>
                <span>
                  Goal: {challenge.goal} {challenge.goalUnit}
                </span>
                <span>Reward: {challenge.rewardPoints} pts</span>
                <span>Status: {challenge.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
            <div className={styles.adminCardActions}>
              <button className={styles.editBtn} onClick={() => handleEditChallenge(challenge)}>
                Edit
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDeleteChallenge(challenge.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal - Reuse login form modal structure */}
      {(showCreateModal || editingChallenge) && (
        <div className={styles.container} onClick={handleCloseModal}>
          <div className={styles.formWrapper} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.title}>{editingChallenge ? "Edit Challenge" : "Create Challenge"}</h2>
            <form className={styles.form} onSubmit={editingChallenge ? handleUpdateChallenge : handleCreateChallenge}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Title</label>
                <input className={styles.input} type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.input}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  style={{ minHeight: "80px", resize: "vertical" }}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Type</label>
                <select className={styles.input} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "daily" | "weekly" })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Goal</label>
                  <input className={styles.input} type="number" min="1" value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })} required />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Unit</label>
                  <select className={styles.input} value={formData.goalUnit} onChange={(e) => setFormData({ ...formData, goalUnit: e.target.value })}>
                    <option value="km">Kilometers</option>
                    <option value="steps">Steps</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Reward Points</label>
                <input className={styles.input} type="number" min="1" value={formData.rewardPoints} onChange={(e) => setFormData({ ...formData, rewardPoints: parseInt(e.target.value) })} required />
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="button" className={styles.linkButton} onClick={handleCloseModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={styles.button} disabled={saving}>
                  {saving ? "Saving..." : editingChallenge ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
