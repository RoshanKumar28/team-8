"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "./questions";
import { newSession, type ExtractedReport, type Profile, type Session } from "./types";

const STORAGE = "luteal.session";

/* A saved session from an older build is missing newer fields, and blindly
   pushing onto them takes the whole app down on load. Fill the gaps instead. */
function migrate(raw: Partial<Session>): Session {
  const base = newSession();
  const m: Partial<Session["memory"]> = raw.memory ?? {};
  return {
    ...base,
    ...raw,
    memory: {
      ...base.memory,
      ...m,
      profile: {
        ...base.memory.profile,
        ...(m.profile ?? {}),
        concerns: m.profile?.concerns ?? (m.profile?.primaryConcern ? [m.profile.primaryConcern] : []),
      },
      criteria: { ...base.memory.criteria, ...(m.criteria ?? {}) },
      labs: m.labs ?? [],
      reports: m.reports ?? [],
      leadingIndicators: m.leadingIndicators ?? [],
      checks: m.checks ?? [],
      checkIns: m.checkIns ?? [],
      meals: m.meals ?? [],
      periodDates: m.periodDates ?? [],
      commitments: m.commitments ?? [],
      explanations: m.explanations ?? [],
      sessionLog: m.sessionLog ?? [],
      skipped: m.skipped ?? [],
    },
    transcript: raw.transcript ?? [],
  };
}

export type Stage = "welcome" | "report" | "review" | "questions" | "ready" | "coach";

export function useOnboarding() {
  const [session, setSession] = useState<Session | null>(null);
  const [stage, setStage] = useState<Stage>("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [lastReport, setLastReport] = useState<ExtractedReport | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(STORAGE);
    if (saved) {
      try {
        const s = migrate(JSON.parse(saved));
        setSession(s);
        setStage(s.onboarded ? "coach" : "welcome");
        return;
      } catch {}
    }
    setSession(newSession());
  }, []);

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE, JSON.stringify(session));
  }, [session]);

  const patch = useCallback((fn: (s: Session) => void) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next: Session = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
  }, []);

  // Questions the report already answered are dropped from the queue entirely.
  const queue = useMemo(() => {
    if (!session) return QUESTIONS;
    return QUESTIONS.filter((q) => {
      const v = session.memory.profile[q.id];
      return Array.isArray(v) ? v.length === 0 : !v;
    });
  }, [session]);

  const applyReport = useCallback((r: ExtractedReport) => {
    setLastReport(r);
    patch((s) => {
      s.memory.labs.push(...r.labs);
      s.memory.reports.push({ name: r.sourceName, kind: r.kind, takenOn: r.takenOn });
      Object.assign(s.memory.profile, r.prefill);
      Object.assign(s.memory.criteria, r.criteriaSignals);
    });
    setStage("review");
  }, [patch]);

  const answer = useCallback((id: keyof Profile, v: string | string[]) => {
    patch((s) => {
      (s.memory.profile as Record<string, unknown>)[id] = v;
    });
    setQIndex((i) => i + 1);
  }, [patch]);

  const skip = useCallback((id: keyof Profile) => {
    patch((s) => {
      if (!s.memory.skipped.includes(id)) s.memory.skipped.push(id);
    });
    setQIndex((i) => i + 1);
  }, [patch]);

  const finish = useCallback(() => {
    patch((s) => { s.onboarded = true; });
    setStage("coach");
  }, [patch]);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE);
    setSession(newSession());
    setLastReport(null);
    setQIndex(0);
    setStage("welcome");
  }, []);

  useEffect(() => {
    if (stage === "questions" && qIndex >= queue.length) setStage("ready");
  }, [stage, qIndex, queue.length]);

  const progress = useMemo(() => {
    const map: Record<Stage, number> = {
      welcome: 0, report: 8, review: 22, questions: 0, ready: 100, coach: 100,
    };
    if (stage === "questions") {
      return 30 + Math.round((qIndex / Math.max(1, queue.length)) * 55);
    }
    return map[stage];
  }, [stage, qIndex, queue.length]);

  return {
    session, stage, setStage, qIndex, setQIndex, queue, progress,
    lastReport, applyReport, answer, skip, finish, reset, patch,
  };
}
