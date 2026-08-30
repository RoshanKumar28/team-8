"use client";

import { useEffect, useState } from "react";
import { onToast, type ToastMsg } from "@/lib/notify";

/* OS-style notification banner, rendered in-app. Slides in top-center,
   auto-dismisses, tap-through to the chat. */
export default function CoachToast({ onOpen }: { onOpen: () => void }) {
  const [toast, setToast] = useState<ToastMsg | null>(null);

  useEffect(() => {
    const off = onToast((t) => setToast(t));
    return off;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <button
      onClick={() => { setToast(null); onOpen(); }}
      className="card-pop rise absolute left-1/2 top-3 z-50 w-[92%] -translate-x-1/2 rounded-[var(--r-md)] bg-surface/95 p-3 text-left backdrop-blur"
    >
      <div className="flex gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-bold text-brandink">
          ♥
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[12.5px] font-bold text-ink">{toast.title}</p>
            <span className="shrink-0 text-[10px] text-faint">now</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted">{toast.body}</p>
        </div>
      </div>
    </button>
  );
}
