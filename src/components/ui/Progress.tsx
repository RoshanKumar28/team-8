export default function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {label && <p className="mt-1.5 text-[11px] text-faint">{label}</p>}
    </div>
  );
}
