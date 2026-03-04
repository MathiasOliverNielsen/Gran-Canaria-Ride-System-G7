"use client";

interface PointsHeaderProps {
  points: number;
  distance: number;
  time: string;
}

export default function PointsHeaderClient({
  points,
  distance,
  time,
}: PointsHeaderProps) {
  const percent = Math.min(distance, 100);

  const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <header className="points-header">
      <nav className="header-nav">
        <img src="/images/Frame 264.svg" alt="MoveWise logo" className="logo" />
        <button className="menu-button"><img src="/images/Vector.svg" alt="menu" /></button>
      </nav>

      <h1 className="page-title">NAME’S POINT PROGRESS</h1>

      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">DISTANCE:</span>
          <span className="stat-value">{distance} KM</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">TIME:</span>
          <span className="stat-value">{time}</span>
        </div>

        <div className="stat-item points-item">
          <span className="stat-label">YOUR POINTS</span>
          <span className="stat-value points-number">{points}</span>
        </div>
      </div>

      <div className="progress-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${percent}%` }}
          />
          {/* Dots at each milestone position */}
          {[0, 25, 50, 75, 100].map((mark) => (
            <div
              key={mark}
              className="progress-dot"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>

        <div className="progress-labels">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="progress-mark">
              {mark}
              <span>KM</span>
            </div>
          ))}
        </div>
      </div>

      {/* KM → POINT BOXES */}
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