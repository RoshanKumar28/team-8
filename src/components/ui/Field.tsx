"use client";

export function TextField({
  label, value, onChange, placeholder, hint, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; multiline?: boolean;
}) {
  const shared =
    "w-full rounded-[var(--r-md)] bg-raised px-3.5 py-3 text-sm text-ink outline-none ring-1 ring-transparent transition placeholder:text-faint focus:ring-brand";
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} className={`${shared} resize-none`} />
      ) : (
        <input value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </label>
  );
}
