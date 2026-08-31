"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { DEMO_BANNER, PRIYA_AFTER, PRIYA_BEFORE, PRIYA_REQUIRED } from "@/lib/demo";

type Report = {
  rows: Array<{ competency_id: string; before: number; after: number; points: number }>;
  gap_before: number;
  gap_after: number;
  gap_closed: number;
  gap_closure_pct: number;
  training_impact: { score: number | null; note: string };
  learning_value: { minutes_invested: number; competency_points: number; misconceptions_resolved: number; gap_reduction: number; topics_mastered: number };
  evidence: { pre: number | null; post: number | null; retention: number | null };
  demo: boolean;
};

const LABELS: Record<string, string> = { "D-SAM": "Sampling", "D-QUA": "Data Quality", "F-DA": "Regression", "D-NSS": "Survey Methodology", "B-INT": "Integrity", "F-DIG": "Digital skills" };

export default function ImpactPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setReport(await api("/api/twin/impact", {
        method: "POST",
        body: JSON.stringify({
          before: PRIYA_BEFORE,
          after: PRIYA_AFTER,
          required: PRIYA_REQUIRED,
          pre: 51,
          post: 81,
          retention: 77,
          practice_accuracy: 78,
          application: 70,
          minutes_invested: 20,
          topics_mastered: 1,
          questions_improved: 6,
          misconceptions_resolved: 2,
          demo: true,
        }),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impact API unavailable");
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#102f4f] p-7 text-white">
        <Badge className="bg-white/15 text-white">What changed?</Badge>
        <h1 className="mt-3 text-3xl">Training produced measurable competency improvement</h1>
        <p className="mt-2 max-w-2xl text-white/75">Before → AI intervention → after. Numbers below are calculated from the labelled Priya demonstration vectors, not invented official statistics.</p>
      </section>
      <p className="rounded-xl border border-[#e07a2f]/40 bg-[#fff6ee] px-4 py-2 text-xs text-[#c45c14]">{DEMO_BANNER}</p>
      {error ? <Card className="text-sm text-[#b42318]">{error}</Card> : null}
      {report ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><div className="text-xs uppercase text-[#3d4f63]">Gap before</div><div className="font-serif text-4xl">{report.gap_before}</div><div className="mt-2 h-3 rounded-full bg-[#e7e0d4]"><div className="h-full rounded-full bg-[#b42318]" style={{ width: "100%" }} /></div></Card>
            <Card><div className="text-xs uppercase text-[#3d4f63]">Gap after</div><div className="font-serif text-4xl">{report.gap_after}</div><div className="mt-2 h-3 rounded-full bg-[#e7e0d4]"><div className="h-full rounded-full bg-[#1f6b4a]" style={{ width: `${Math.max(8, (report.gap_after / report.gap_before) * 100)}%` }} /></div></Card>
            <Card><div className="text-xs uppercase text-[#3d4f63]">Gap closure</div><div className="font-serif text-4xl">{report.gap_closure_pct}%</div><p className="text-sm text-[#3d4f63]">{report.gap_closed} points closed</p></Card>
          </div>
          <Card>
            <h2 className="text-xl">Before → after competency</h2>
            <div className="mt-4 space-y-4">
              {report.rows.map((row) => (
                <div key={row.competency_id}>
                  <div className="flex justify-between text-sm"><strong>{LABELS[row.competency_id] ?? row.competency_id}</strong><span>{row.before}% → {row.after}% · {row.points >= 0 ? "+" : ""}{row.points} points</span></div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="h-2 rounded-full bg-[#e7e0d4]"><div className="h-full rounded-full bg-[#b42318]/70" style={{ width: `${row.before}%` }} /></div>
                    <div className="h-2 rounded-full bg-[#e7e0d4]"><div className="h-full rounded-full bg-[#1f6b4a]" style={{ width: `${row.after}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><Badge>Evidence of learning</Badge><p className="mt-3 text-sm">Pre {report.evidence.pre}% → Post {report.evidence.post}% → Retention {report.evidence.retention}%</p></Card>
            <Card><Badge>Training impact score</Badge><p className="mt-3 font-serif text-3xl">{report.training_impact.score ?? "—"}</p><p className="text-xs text-[#3d4f63]">{report.training_impact.note}</p></Card>
            <Card><Badge>Learning value</Badge><p className="mt-3 text-sm">{report.learning_value.minutes_invested} minutes invested · +{report.learning_value.competency_points} competency points · {report.learning_value.misconceptions_resolved} misconceptions addressed · {report.learning_value.topics_mastered} critical competency moved toward mastery. No monetary ROI is claimed.</p></Card>
          </div>
          <Card className="border-[#1f6b4a] bg-[#f4fbf7]">
            <h2 className="text-2xl">Your competency gap reduced by {report.gap_closed} points</h2>
            <p className="mt-2 text-sm text-[#3d4f63]">Intervention: personalised learning + practice + adaptive assessment + misconception correction.</p>
            <Button className="mt-4" onClick={() => void load()}>Recalculate</Button>
          </Card>
        </>
      ) : null}
    </div>
  );
}
