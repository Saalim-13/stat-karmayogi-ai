"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { completePriyaIntervention, DEMO_BANNER, loadPriyaDemo, PRIYA_JOURNEY } from "@/lib/demo";
import { recordJourneyPoint, setJourneys } from "@/lib/journey";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { title: "Assess", text: "Diagnostic places Sampling at 48% against an 85% role requirement." },
  { title: "Understand", text: "The twin records a 37-point gap. This is competency, not course completion." },
  { title: "Identify gap", text: "Sampling is the highest-priority deficit for a Statistical Officer." },
  { title: "Prioritise", text: "Role importance HIGH · exam relevance HIGH · recent accuracy 48%." },
  { title: "Personalise", text: "20-minute Tamil/bilingual session + 5 practice items + adaptive quiz." },
  { title: "Teach", text: "After learning, Sampling moves 48% → 61%." },
  { title: "Practice", text: "Guided items lift the state to 70%." },
  { title: "Assess", text: "Adaptive quiz records 78%." },
  { title: "Detect misconception", text: "Stratified sampling is being confused with cluster sampling." },
  { title: "Revise", text: "Comparison + example + targeted item." },
  { title: "Retest", text: "Retention check records 84%." },
  { title: "Verify mastery", text: "Near the 85% gate. Mastery is the retest, not the first quiz." },
  { title: "Update Digital Twin", text: "Journey: 48 → 61 → 70 → 78 → 84." },
  { title: "Next action", text: "Shift to Regression (42% vs 75%) while Sampling consolidates." },
];

export default function LoopPage() {
  const { setLanguage } = useI18n();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  function advance() {
    const next = Math.min(STEPS.length - 1, step + 1);
    setStep(next);
    const values = PRIYA_JOURNEY["D-SAM"];
    if (next === 5) recordJourneyPoint("D-SAM", values[1]);
    if (next === 6) recordJourneyPoint("D-SAM", values[2]);
    if (next === 7) recordJourneyPoint("D-SAM", values[3]);
    if (next === 10) recordJourneyPoint("D-SAM", values[4]);
    if (next === STEPS.length - 1) {
      completePriyaIntervention();
      setJourneys(PRIYA_JOURNEY);
      setDone(true);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#102f4f] p-7 text-white">
        <Badge className="bg-white/15 text-white">Closed-loop intelligence</Badge>
        <h1 className="mt-3 text-3xl">Assess → close the gap → prove it</h1>
        <p className="mt-2 max-w-2xl text-white/75">This walkthrough uses labelled DEMO DATA for Priya. Each step writes a competency point into the Digital Twin.</p>
      </section>
      <p className="rounded-xl border border-[#e07a2f]/40 bg-[#fff6ee] px-4 py-2 text-xs text-[#c45c14]">{DEMO_BANNER}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => { loadPriyaDemo(setLanguage); setStep(0); setDone(false); }}>Load Priya</Button>
        <Button onClick={advance} disabled={done}>Complete this step</Button>
        {done ? <Link href="/impact"><Button>Show what changed</Button></Link> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {STEPS.map((item, index) => (
          <Card key={`${item.title}-${index}`} className={index === step ? "border-[#e07a2f]" : index < step ? "opacity-80" : "opacity-50"}>
            <div className="text-xs font-semibold text-[#c45c14]">STEP {index + 1}</div>
            <h2 className="mt-1 text-lg">{item.title}</h2>
            <p className="mt-2 text-sm text-[#3d4f63]">{item.text}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-xl">AI learning journey</h2>
        <ol className="mt-3 space-y-2 text-sm text-[#3d4f63]">
          <li>10:00 Assessment completed</li>
          <li>10:01 Sampling gap detected (37 points)</li>
          <li>10:02 Tamil / bilingual mode selected</li>
          <li>10:03 20-minute intervention created</li>
          <li>10:24 Adaptive quiz completed</li>
          <li>10:25 Misconception detected (stratified vs cluster)</li>
          <li>10:35 Retest completed</li>
          <li>10:36 Digital Twin updated 48% → 84%</li>
        </ol>
      </Card>
    </div>
  );
}
