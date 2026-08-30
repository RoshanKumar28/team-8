export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--r-md)] border border-line bg-surface p-4 ${className}`}>
      {children}
    </div>
  );
}
