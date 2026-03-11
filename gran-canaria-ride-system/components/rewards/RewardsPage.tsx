"use client";

import { FormEvent } from "react";
import { Reward } from "@/types/reward";
import RewardCard from "./RewardCard";
import PointsHeaderClient from "./PointsHeaderClient";
import "../../styles/rewards.scss";

interface RewardsPageProps {
  userPoints: number;
  distance: number;
  time: string;
  rewards: Reward[];
  selectedReward: Reward | null;
  isRedeemingId: string | null;
  isCreating: boolean;
  formTitle: string;
  formDescription: string;
  formCost: string;
  statusMessage: string;
  onFormTitleChange: (value: string) => void;
  onFormDescriptionChange: (value: string) => void;
  onFormCostChange: (value: string) => void;
  onCreateReward: (event: FormEvent<HTMLFormElement>) => void;
  onViewDetails: (rewardId: string) => void;
  onRedeem: (rewardId: string) => void;
  onCloseDetails: () => void;
  isCreateModalOpen: boolean;
  onOpenCreateModal: () => void;
  onCloseCreateModal: () => void;
  isManageMode: boolean;
  onToggleManageMode: () => void;
  onEditReward: (rewardId: string) => void;
  onDeleteReward: (rewardId: string) => void;
  deletingRewardId: string | null;
  isEditModalOpen: boolean;
  editTitle: string;
  editDescription: string;
  editCost: string;
  isSavingEdit: boolean;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEditCostChange: (value: string) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onCloseEditModal: () => void;
  confirmModalKind: "save" | "delete" | null;
  isConfirmingAction: boolean;
  onConfirmYes: () => void;
  onConfirmNo: () => void;
}

export default function RewardsPage({
  userPoints,
  distance,
  time,
  rewards,
  selectedReward,
  isRedeemingId,
  isCreating,
  formTitle,
  formDescription,
  formCost,
  statusMessage,
  onFormTitleChange,
  onFormDescriptionChange,
  onFormCostChange,
  onCreateReward,
  onViewDetails,
  onRedeem,
  onCloseDetails,
  isCreateModalOpen,
  onOpenCreateModal,
  onCloseCreateModal,
  isManageMode,
  onToggleManageMode,
  onEditReward,
  onDeleteReward,
  deletingRewardId,
  isEditModalOpen,
  editTitle,
  editDescription,
  editCost,
  isSavingEdit,
  onEditTitleChange,
  onEditDescriptionChange,
  onEditCostChange,
  onSaveEdit,
  onCloseEditModal,
  confirmModalKind,
  isConfirmingAction,
  onConfirmYes,
  onConfirmNo,
}: RewardsPageProps) {
  return (
    <div className="rewards-page">
      <PointsHeaderClient points={userPoints} distance={distance} time={time} />

      {statusMessage ? <p className="reward-status">{statusMessage}</p> : null}

      {isCreateModalOpen ? (
        <div className="reward-modal-overlay" role="dialog" aria-modal="true">
          <form className="reward-create-form reward-modal" onSubmit={onCreateReward}>
            <h2>Create Reward</h2>
            <input
              type="text"
              placeholder="Title"
              value={formTitle}
              onChange={(event) => onFormTitleChange(event.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={formDescription}
              onChange={(event) => onFormDescriptionChange(event.target.value)}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Cost"
              value={formCost}
              onChange={(event) => onFormCostChange(event.target.value)}
              required
            />
            <div className="reward-modal-actions">
              <button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Add Reward"}
              </button>
              <button
                type="button"
                className="reward-close-button"
                onClick={onCloseCreateModal}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isEditModalOpen ? (
        <div className="reward-modal-overlay" role="dialog" aria-modal="true">
          <form className="reward-create-form reward-modal" onSubmit={onSaveEdit}>
            <h2>Edit Reward</h2>
            <input
              type="text"
              placeholder="Title"
              value={editTitle}
              onChange={(event) => onEditTitleChange(event.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={editDescription}
              onChange={(event) => onEditDescriptionChange(event.target.value)}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Cost"
              value={editCost}
              onChange={(event) => onEditCostChange(event.target.value)}
              required
            />
            <div className="reward-modal-actions">
              <button type="submit" disabled={isSavingEdit}>
                {isSavingEdit ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="reward-close-button"
                onClick={onCloseEditModal}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedReward ? (
        <div className="reward-modal-overlay" role="dialog" aria-modal="true">
          <section className="reward-details reward-modal">
            <h3>Reward Details</h3>
            <p>
              <strong>{selectedReward.title}</strong>
            </p>
            <p>{selectedReward.description}</p>
            <p>Cost: {selectedReward.requiredPoints} points</p>
            <button
              type="button"
              className="reward-close-button"
              onClick={onCloseDetails}
            >
              Close
            </button>
          </section>
        </div>
      ) : null}

      {confirmModalKind ? (
        <div className="reward-modal-overlay" role="dialog" aria-modal="true">
          <section className="reward-details reward-modal">
            <h3>{confirmModalKind === "delete" ? "Confirm Delete" : "Confirm Save"}</h3>
            <p>
              {confirmModalKind === "delete"
                ? "Are you sure you want to delete this reward?"
                : "Are you sure you want to save these changes?"}
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="reward-close-button"
                onClick={onConfirmNo}
                disabled={isConfirmingAction}
              >
                No
              </button>
              <button
                type="button"
                className="create-reward-trigger"
                onClick={onConfirmYes}
                disabled={isConfirmingAction}
              >
                {isConfirmingAction ? "Working..." : "Yes"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="rewards-section">
        <h2>Rewards</h2>

        <div className="rewards-list">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={userPoints}
              onViewDetails={onViewDetails}
              onRedeem={onRedeem}
              onEdit={onEditReward}
              onDelete={onDeleteReward}
              isManageMode={isManageMode}
              isRedeeming={isRedeemingId === reward.id}
              isDeleting={deletingRewardId === reward.id}
            />
          ))}
        </div>

        <div className="create-reward-trigger-wrap">
          <button
            type="button"
            className="create-reward-trigger"
            onClick={onOpenCreateModal}
          >
            Create Reward
          </button>
          <button
            type="button"
            className="create-reward-trigger"
            onClick={onToggleManageMode}
          >
            {isManageMode ? "Done" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}
