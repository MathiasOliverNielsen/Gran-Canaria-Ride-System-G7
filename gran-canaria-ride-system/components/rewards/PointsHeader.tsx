interface PointsHeaderProps {
  points: number;
}

export default function PointsHeader({ points }: PointsHeaderProps) {
  return (
    <div className="points-header">
      <div className="points-info">
        <span className="label">YOUR POINTS</span>
        <span className="points">{points}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(points, 100)}%` }}
        />
      </div>
    </div>
  );
}