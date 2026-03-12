export const DAILY_STEP_GOAL = 10000;
export const STEPS_PER_REWARD_POINT = 100;

export function getStartOfUtcDay(date = new Date()): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export function getUtcDateFromInput(value?: string): Date | null {
  if (!value) {
    return getStartOfUtcDay();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return getStartOfUtcDay(parsed);
}

export function toStepProgress(steps: number, goal = DAILY_STEP_GOAL): number {
  if (goal <= 0) {
    return 0;
  }

  return Math.min(100, Math.floor((steps / goal) * 100));
}

export function estimateRewardPointsFromSteps(steps: number): number {
  return Math.floor(steps / STEPS_PER_REWARD_POINT);
}
