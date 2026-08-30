/* The ovy flower — five petals, lime heart. Lowercase lockup, flower left. */
export function OvyFlower({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="24" cy="13" rx="7.5" ry="11"
          fill="var(--c-brand)" transform={`rotate(${r} 24 24)`} opacity="0.92" />
      ))}
      <circle cx="24" cy="24" r="4.5" fill="var(--c-lime)" />
    </svg>
  );
}

export default function Logo({ size = 28, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <OvyFlower size={size} />
      {wordmark && (
        <span className="font-display font-semibold lowercase tracking-tight text-ink"
          style={{ fontSize: size * 0.78 }}>
          ovy
        </span>
      )}
    </span>
  );
}
