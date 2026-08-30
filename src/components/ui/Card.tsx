export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card-soft rounded-[var(--r-md)] bg-surface p-4 ${className}`}>
      {children}
    </div>
  );
}
