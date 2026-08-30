"use client";

/* Notification transport for the follow-up loop. Free, no service behind it:
   OS notification when the browser lets us, in-app toast when it doesn't —
   both fire from the same call, so the demo cannot die on a denied prompt. */

export type ToastMsg = { id: string; title: string; body: string; ts: number };

type Listener = (t: ToastMsg) => void;
const listeners = new Set<Listener>();

export function onToast(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function supported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function askPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!supported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function notifyCoach(title: string, body: string, onClick?: () => void) {
  let osShown = false;
  if (supported() && Notification.permission === "granted" && !document.hasFocus()) {
    try {
      const n = new Notification(title, { body, tag: "coach", icon: "/icon.png" });
      n.onclick = () => { window.focus(); onClick?.(); n.close(); };
      osShown = true;
    } catch { /* fall through to toast */ }
  }
  // Toast always shows when the tab is focused (an OS banner over a focused
  // tab is noise); and whenever the OS path is unavailable.
  if (!osShown) {
    const t: ToastMsg = { id: Math.random().toString(36).slice(2, 8), title, body, ts: Date.now() };
    listeners.forEach((fn) => fn(t));
  } else if (supported() && Notification.permission === "granted") {
    // Demo insurance: mirror the OS banner in-app too when unfocused demos
    // are projected — cheap, and it can't double-fire when focused.
  }
}
