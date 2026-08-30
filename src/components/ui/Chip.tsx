"use client";

export default function Chip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
        selected
          ? "card-soft bg-brand text-brandink"
          : "bg-raised text-muted hover:bg-brandsoft hover:text-brand"
      }`}
    >
      {label}
    </button>
  );
}
