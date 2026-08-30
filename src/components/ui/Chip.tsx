"use client";

export default function Chip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
        selected
          ? "card-soft border-transparent bg-brand text-brandink"
          : "border-line bg-surface text-muted hover:border-brand hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
