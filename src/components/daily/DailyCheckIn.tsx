"use client";

import { useState } from "react";
import CheckInStep from "./CheckInStep";
import MealStep from "./MealStep";
import type { CheckIn, MealLog, Session } from "@/lib/types";

/* Two slides, one sitting. Check-in first because it takes three taps and
   builds momentum; meals second because it is the one that earns the insight.
   Either can be abandoned — whatever was saved before the exit is kept. */
export default function DailyCheckIn({
  session, onSaveCheckIn, onSaveMeals, onClose,
}: {
  session: Session;
  onSaveCheckIn: (c: Omit<CheckIn, "ts">) => void;
  onSaveMeals: (m: Omit<MealLog, "id" | "ts">[]) => void;
  onClose: () => void;
}) {
  const [slide, setSlide] = useState<1 | 2>(1);
  const day = session.day;
  const existingCheckIn = (session.memory.checkIns ?? []).find((c) => c.day === day) ?? null;
  const existingMeals = (session.memory.meals ?? []).filter((m) => m.day === day);

  if (slide === 1) {
    return (
      <CheckInStep
        day={day}
        existing={existingCheckIn}
        onClose={onClose}
        onSave={(c) => {
          onSaveCheckIn(c);
          setSlide(2);
        }}
      />
    );
  }

  return (
    <MealStep
      day={day}
      existing={existingMeals}
      onBack={() => setSlide(1)}
      onClose={onClose}
      onSave={(meals) => {
        onSaveMeals(meals);
        onClose();
      }}
    />
  );
}
