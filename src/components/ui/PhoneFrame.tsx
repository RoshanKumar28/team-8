"use client";

/* Phone shell on desktop, bare app on an actual phone. */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="lg:hidden">
        <div className="flex h-dvh flex-col overflow-hidden">{children}</div>
      </div>
      <div className="hidden min-h-dvh place-items-center py-8 lg:grid">
        <div className="h-[720px] w-[352px] rounded-[52px] border-[11px] border-ink bg-ink shadow-2xl">
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[41px] bg-surface">
            <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-ink" />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
