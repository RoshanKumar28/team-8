export default function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-raised">
        <div
          className="shimmer-bar h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: "linear-gradient(90deg, var(--c-brand), var(--c-accent))",
          }}
        />
      </div>
      {label && <p className="mt-1.5 text-[11px] text-faint">{label}</p>}
    </div>
  );
}
