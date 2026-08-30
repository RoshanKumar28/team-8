"use client";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  full?: boolean;
};

const styles = {
  primary: "bg-brand text-brandink hover:opacity-90",
  secondary: "bg-surface text-ink border border-line hover:bg-raised",
  ghost: "bg-transparent text-muted hover:text-ink",
};

export default function Button({ variant = "primary", full, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`rounded-[var(--r-md)] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
    />
  );
}
