import type { ExtractedReport } from "./types";

// Report reading is deliberately isolated. Today it returns a demo fixture;
// when a vision-capable key is available only extractWithModel() changes.
export async function extractReport(fileName: string, kind: "pdf" | "image"): Promise<ExtractedReport> {
  if (process.env.LLM_API_KEY) {
    try {
      return await extractWithModel(fileName, kind);
    } catch {
      // Never strand the user on a failed read — fall through to manual entry.
      return unreadable(fileName);
    }
  }
  await new Promise((r) => setTimeout(r, 1600));
  return kind === "image" ? DEMO_ULTRASOUND(fileName) : DEMO_BLOODWORK(fileName);
}

async function extractWithModel(fileName: string, _kind: "pdf" | "image"): Promise<ExtractedReport> {
  throw new Error(`vision extraction not wired yet for ${fileName}`);
}

const unreadable = (sourceName: string): ExtractedReport => ({
  kind: "unreadable", sourceName, takenOn: "",
  labs: [], findings: [], prefill: {}, criteriaSignals: {},
  couldNotRead: ["Couldn't read this one. You can type the values in instead — or just skip it."],
});

const DEMO_BLOODWORK = (sourceName: string): ExtractedReport => ({
  kind: "bloodwork",
  sourceName,
  takenOn: "12 March",
  labs: [
    { marker: "Fasting insulin", value: "18 µIU/mL", refRange: "2–12", flag: "high",
      plainMeaning: "Above your lab's range. This is the marker most linked to afternoon energy crashes and sugar cravings." },
    { marker: "Total testosterone", value: "62 ng/dL", refRange: "8–48", flag: "high",
      plainMeaning: "Above your lab's female range. This is what's usually behind hair thinning and jawline acne." },
    { marker: "LH : FSH ratio", value: "2.6 : 1", refRange: "around 1 : 1", flag: "high",
      plainMeaning: "A raised ratio is commonly seen in PCOS, though on its own it doesn't confirm anything." },
    { marker: "TSH", value: "2.1 mIU/L", refRange: "0.4–4.0", flag: "normal",
      plainMeaning: "Thyroid looks normal. Worth knowing, because thyroid problems cause hair fall too." },
    { marker: "Vitamin D", value: "14 ng/mL", refRange: "30–100", flag: "low",
      plainMeaning: "Low. Common, and worth raising with your doctor — it's an easy one to correct." },
  ],
  findings: [],
  prefill: { diagnosed: "unsure" },
  criteriaSignals: {
    highAndrogen: { state: "met", evidence: "Raised total testosterone on bloodwork dated 12 March" },
  },
  couldNotRead: [],
});

const DEMO_ULTRASOUND = (sourceName: string): ExtractedReport => ({
  kind: "ultrasound",
  sourceName,
  takenOn: "4 April",
  labs: [],
  findings: [
    "Both ovaries described as showing multiple small follicles",
    "Right ovary volume 11.2 mL, left 10.6 mL",
    "No cysts requiring follow-up mentioned",
  ],
  prefill: {},
  criteriaSignals: {
    ovarianMorphology: { state: "met", evidence: "Ultrasound dated 4 April describes multiple small follicles in both ovaries" },
  },
  couldNotRead: ["The handwritten note at the bottom was too faint to read."],
});
