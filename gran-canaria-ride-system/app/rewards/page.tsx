"use client";

import { FormEvent, useEffect, useState } from "react";
import RewardsPage from "@/components/rewards/RewardsPage";
import { Reward } from "@/types/reward";

export default function Home() {
  type ConfirmModalState =
    | { kind: "save" }
    | { kind: "delete"; rewardId: string }
    | null;

  const [userPoints, setUserPoints] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const distance = 0; // km
  const time = "00:00";
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeemingId, setIsRedeemingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCost, setEditCost] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingRewardId, setDeletingRewardId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCost, setFormCost] = useState("");

  const fetchRewards = async () => {
    const response = await fetch("/api/rewards");

    if (!response.ok) {
      throw new Error(`Failed to fetch rewards: ${response.status}`);
    }

    const data: Array<{
      id: number;
      title: string;
      description: string;
      cost: number;
      createdAt: string;
    }> = await response.json();

    const mappedRewards: Reward[] = data.map((reward) => ({
      id: String(reward.id),
      title: reward.title,
      description: reward.description,
      requiredPoints: reward.cost,
      createdAt: reward.createdAt,
    }));

    setRewards(mappedRewards);
  };

  useEffect(() => {
    const loadCurrentUser = async () => {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        return;
      }

      const payload: {
        success: boolean;
        user?: { id: number; points: number };
      } = await response.json();

      if (payload.success && payload.user) {
        setCurrentUserId(payload.user.id);
        setUserPoints(payload.user.points);
      }
    };

    loadCurrentUser().catch((error) => {
      console.error("Failed to load current user:", error);
    });

    fetchRewards().catch((error) => {
      console.error("Failed to load rewards:", error);
      setStatusMessage("Failed to load rewards");
    });
  }, []);

  const handleViewDetails = async (rewardId: string) => {
    try {
      const response = await fetch(`/api/rewards/${rewardId}`);

      if (!response.ok) {
        throw new Error(`Failed to load reward details: ${response.status}`);
      }

      const reward: {
        id: number;
        title: string;
        description: string;
        cost: number;
        createdAt: string;
      } = await response.json();

      setSelectedReward({
        id: String(reward.id),
        title: reward.title,
        description: reward.description,
        requiredPoints: reward.cost,
        createdAt: reward.createdAt,
      });
      setStatusMessage("");
    } catch (error) {
      console.error("Failed to load reward details:", error);
      setStatusMessage("Could not load reward details");
    }
  };

  const handleCreateReward = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsCreating(true);
      setStatusMessage("");

      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          cost: Number(formCost),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to create reward");
      }

      setFormTitle("");
      setFormDescription("");
      setFormCost("");
      setIsCreateModalOpen(false);
      await fetchRewards();
      setStatusMessage("Reward created");
    } catch (error) {
      console.error("Create reward error:", error);
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to create reward"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      setIsRedeemingId(rewardId);
      setStatusMessage("");

      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          rewardId: Number(rewardId),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to redeem reward");
      }

      if (typeof payload.user?.points === "number") {
        setUserPoints(payload.user.points);
      }

      setSelectedReward((currentReward) =>
        currentReward?.id === rewardId ? null : currentReward
      );
      await fetchRewards();
      setStatusMessage("Reward redeemed and removed from available rewards");
    } catch (error) {
      console.error("Redeem reward error:", error);
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to redeem reward"
      );
    } finally {
      setIsRedeemingId(null);
    }
  };

  const handleEditReward = (rewardId: string) => {
    const reward = rewards.find((item) => item.id === rewardId);

    if (!reward) {
      setStatusMessage("Reward not found");
      return;
    }

    setEditingRewardId(reward.id);
    setEditTitle(reward.title);
    setEditDescription(reward.description);
    setEditCost(String(reward.requiredPoints));
    setIsEditModalOpen(true);
  };

  const saveRewardEdit = async () => {
    if (!editingRewardId) return;

    try {
      setIsSavingEdit(true);
      setStatusMessage("");

      const response = await fetch(`/api/rewards/${editingRewardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          cost: Number(editCost),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update reward");
      }

      await fetchRewards();
      setIsEditModalOpen(false);
      setEditingRewardId(null);
      setStatusMessage("Reward updated");
    } catch (error) {
      console.error("Edit reward error:", error);
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to update reward"
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteReward = async (rewardId: string) => {
    try {
      setDeletingRewardId(rewardId);
      setStatusMessage("");

      const response = await fetch(`/api/rewards/${rewardId}`, {
        method: "DELETE",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete reward");
      }

      setSelectedReward((currentReward) =>
        currentReward?.id === rewardId ? null : currentReward
      );
      await fetchRewards();
      setStatusMessage("Reward deleted");
    } catch (error) {
      console.error("Delete reward error:", error);
      setStatusMessage(
        error instanceof Error ? error.message : "Failed to delete reward"
      );
    } finally {
      setDeletingRewardId(null);
    }
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingRewardId) {
      return;
    }

    setConfirmModal({ kind: "save" });
  };

  const handleDeleteReward = (rewardId: string) => {
    setConfirmModal({ kind: "delete", rewardId });
  };

  const handleConfirmYes = async () => {
    if (!confirmModal) return;

    try {
      setIsConfirmingAction(true);

      if (confirmModal.kind === "save") {
        await saveRewardEdit();
      }

      if (confirmModal.kind === "delete") {
        await deleteReward(confirmModal.rewardId);
      }
    } finally {
      setIsConfirmingAction(false);
      setConfirmModal(null);
    }
  };

  return (
    <RewardsPage
      userPoints={userPoints}
      distance={distance}
      time={time}
      rewards={rewards}
      selectedReward={selectedReward}
      isRedeemingId={isRedeemingId}
      isCreating={isCreating}
      formTitle={formTitle}
      formDescription={formDescription}
      formCost={formCost}
      statusMessage={statusMessage}
      onFormTitleChange={setFormTitle}
      onFormDescriptionChange={setFormDescription}
      onFormCostChange={setFormCost}
      onCreateReward={handleCreateReward}
      onViewDetails={handleViewDetails}
      onRedeem={handleRedeem}
      onCloseDetails={() => setSelectedReward(null)}
      isCreateModalOpen={isCreateModalOpen}
      onOpenCreateModal={() => setIsCreateModalOpen(true)}
      onCloseCreateModal={() => setIsCreateModalOpen(false)}
      isManageMode={isManageMode}
      onToggleManageMode={() => setIsManageMode((current) => !current)}
      onEditReward={handleEditReward}
      onDeleteReward={handleDeleteReward}
      deletingRewardId={deletingRewardId}
      isEditModalOpen={isEditModalOpen}
      editTitle={editTitle}
      editDescription={editDescription}
      editCost={editCost}
      isSavingEdit={isSavingEdit}
      onEditTitleChange={setEditTitle}
      onEditDescriptionChange={setEditDescription}
      onEditCostChange={setEditCost}
      onSaveEdit={handleSaveEdit}
      onCloseEditModal={() => {
        setIsEditModalOpen(false);
        setEditingRewardId(null);
      }}
      confirmModalKind={confirmModal?.kind ?? null}
      isConfirmingAction={isConfirmingAction}
      onConfirmYes={handleConfirmYes}
      onConfirmNo={() => setConfirmModal(null)}
    />
  );
}