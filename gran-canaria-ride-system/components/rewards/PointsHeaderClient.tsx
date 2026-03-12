"use client";

interface PointsHeaderProps {
  points: number;
  stepCount: number;
  stepGoal: number;
  isStepLoading: boolean;
  stepError: string | null;
}

export default function PointsHeaderClient({
  points,
  stepCount,
  stepGoal,
  isStepLoading,
  stepError,
}: PointsHeaderProps) {
  const percent =
    stepGoal > 0 ? Math.min(100, Math.floor((stepCount / stepGoal) * 100)) : 0;
  const distanceKm = (stepCount / 1300).toFixed(1);
  const minutes = Math.floor(stepCount / 100);
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  const timeDisplay = `${hours}:${mins}`;

  const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <header className="points-header">
      <nav className="header-nav">
        <img src="/images/Frame 264.svg" alt="MoveWise logo" className="logo" />
      </nav>

      <h1 className="page-title">NAME’S POINT PROGRESS</h1>

      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">DISTANCE:</span>
          <span className="stat-value">{distanceKm} KM</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">TIME:</span>
          <span className="stat-value">{timeDisplay}</span>
        </div>

        <div className="stat-item points-item">
          <span className="stat-label">YOUR POINTS</span>
          <span className="stat-value points-number">{points}</span>
        </div>
      </div>

      <div className="progress-wrapper">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
          {/* Dots at each milestone position */}
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="progress-dot" style={{ left: `${mark}%` }} />
          ))}
        </div>

        <div className="progress-labels">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="progress-mark">{mark}</div>
          ))}
        </div>
      </div>

      {stepError ? (
        <p className="reward-status">Step sync error: {stepError}</p>
      ) : isStepLoading ? (
        <p className="reward-status">Syncing Health Connect steps...</p>
      ) : (
        <p className="reward-status">Progress synced from Android Health Connect</p>
      )}

      {/* Milestone boxes */}
      <div className="milestone-boxes">
        {milestones.map((m) => (
          <div key={m} className="milestone-box">
            <div className="milestone-title">{m} POINTS</div>
            <div className="milestone-sub">0/{m} KM DONE</div>
            <div className="milestone-check" />
          </div>
        ))}
      </div>
    </header>
  );
}
