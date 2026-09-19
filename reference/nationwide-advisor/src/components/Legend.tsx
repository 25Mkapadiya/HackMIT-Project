export default function Legend() {
  return (
    <div className="legend">
      <span className="legend-item"><span className="dot dot-good"></span>Buildable now (75+)</span>
      <span className="legend-item"><span className="dot dot-caution"></span>Minor upgrade (50-74)</span>
      <span className="legend-item"><span className="dot dot-major"></span>Major upgrade (25-49)</span>
      <span className="legend-item"><span className="dot dot-bad"></span>Try a nearby site (&lt;25)</span>
      <span className="legend-item"><span className="dot dot-blocked"></span>Blocked</span>
      <span className="legend-item"><span className="dot dot-paused"></span>Local pause in effect</span>
      <span className="legend-item"><span className="ring"></span>Substation-adjacent</span>
    </div>
  );
}
