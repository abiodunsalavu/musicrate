const SIZES = {
  sm: "min-w-7 h-7 px-1.5 rounded-lg text-xs",
  md: "min-w-10 h-10 px-2 rounded-xl text-base",
  lg: "min-w-16 h-16 px-3 rounded-2xl text-2xl",
};

export function scoreTone(score) {
  if (score >= 7.5) return "bg-score-high-bg text-score-high-fg";
  if (score >= 5) return "bg-score-mid-bg text-score-mid-fg";
  return "bg-score-low-bg text-score-low-fg";
}

export default function ScoreBadge({ score, size = "md", className = "" }) {
  if (score == null) return null;

  const display = Number.isInteger(score) ? score : score.toFixed(1);

  return (
    <span
      className={`inline-grid place-items-center font-display font-bold tabular-nums ${SIZES[size]} ${scoreTone(score)} ${className}`}
      aria-label={`${display} out of 10`}
    >
      {display}
    </span>
  );
}
