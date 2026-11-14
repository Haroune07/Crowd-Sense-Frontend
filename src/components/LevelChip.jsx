import { levelOf } from '../lib/levels.js';

// Small colored label for a heat level: "● Danger".
export default function LevelChip({ value }) {
  const l = levelOf(value);
  return (
    <span className="chip" style={{ background: l.soft, color: l.text }}>
      <span className="dot" style={{ width: 8, height: 8, background: l.color }} />
      {l.label}
    </span>
  );
}
