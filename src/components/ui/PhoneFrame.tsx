"use client";

/* Rounded app canvas floating on a white page (desktop); bare app on a phone. */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="lg:hidden">
        <div className="flex h-dvh flex-col overflow-hidden bg-surface">{children}</div>
      </div>
      <div className="stage-bg hidden min-h-dvh place-items-center py-10 lg:grid">
        <div className="card-pop relative flex h-[724px] w-[356px] flex-col overflow-hidden rounded-[40px] border border-line bg-surface">
          {children}
        </div>
      </div>
    </>
  );
}
