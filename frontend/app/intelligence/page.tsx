"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LearningIntelligencePanel } from "@/components/learning-intelligence-panel";
import { CourseAuditor } from "@/components/course-auditor";
import { buildCompetencyInsights, overallCompetency, ROLE_PROFILES, type RoleId } from "@/lib/competency";
import { getAssessment, getProgress } from "@/lib/progress";
import type { AssessmentResult, LearningProgress } from "@/lib/types";

const tone = { Critical: "bg-[#b42318]/10 text-[#b42318]", High: "bg-[#e07a2f]/15 text-[#c45c14]", Medium: "bg-[#16375c]/10 text-[#16375c]", "On track": "bg-[#1f6b4a]/15 text-[#1f6b4a]" };

export default function IntelligencePage() {
  const [role, setRole] = useState<RoleId>("statistical-officer");
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [progress, setProgress] = useState<LearningProgress>({ quizzes_attempted: 0, questions_answered: 0, correct_answers: 0, competency_answers: {}, recorded_question_ids: [], recorded_quiz_ids: [] });
  const [minutes, setMinutes] = useState(45);
  const [weeks, setWeeks] = useState(6);
  useEffect(() => { setAssessment(getAssessment()); setProgress(getProgress()); }, []);
  const insights = useMemo(() => buildCompetencyInsights(role, assessment, progress), [role, assessment, progress]);
  const score = overallCompetency(insights);
  const critical = insights.filter((item) => item.priority === "Critical").length;
  const priority = insights.filter((item) => item.gap > 0).slice(0, 3);
  const gain = Math.min(24, Math.round(priority.reduce((sum, item) => sum + item.gap, 0) / 7));
  const weeklyHours = Math.round(minutes * 7 / 60 * 10) / 10;

  return <div className="space-y-6">
    <section className="rounded-2xl bg-gradient-to-br from-[#102f4f] to-[#1f6b4a] p-7 text-white"><Badge className="bg-white/15 text-white">Competency intelligence</Badge><div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-3xl">Know the gap. Prove the improvement.</h1><p className="mt-2 max-w-2xl text-white/75">A role-aware evidence view that combines diagnostic and practice performance. Demo data stays in this browser.</p></div><div className="rounded-xl bg-white/10 px-5 py-3"><div className="text-xs uppercase tracking-wide text-white/65">Current competency</div><div className="font-serif text-4xl">{score}%</div></div></div></section>
    <Card><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl">Role competency framework</h2><p className="mt-1 text-sm text-[#3d4f63]">{ROLE_PROFILES[role].description}</p></div><label className="text-sm font-semibold">Role <select value={role} onChange={(event) => setRole(event.target.value as RoleId)} className="ml-2 rounded-lg border border-[#d9d0c0] bg-white px-3 py-2 font-normal"><option value="statistical-officer">Statistical Officer</option><option value="data-analyst">Data Analyst</option><option value="survey-officer">Survey Officer</option></select></label></div></Card>
    <div className="grid gap-4 md:grid-cols-3"><Metric label="Critical gaps" value={String(critical)} note="Require focused action" /><Metric label="Practice evidence" value={`${progress.questions_answered}`} note="Questions answered" /><Metric label="Projected uplift" value={`+${gain} pts`} note={`With ${weeklyHours} hrs/week`} /></div>
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]"><Card><div className="flex items-center justify-between"><div><h2 className="text-xl">Competency heatmap</h2><p className="mt-1 text-sm text-[#3d4f63]">Current score compared with the required level for this role.</p></div><Badge>Live demo model</Badge></div><div className="mt-5 space-y-4">{insights.map((item) => <div key={item.id}><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><strong>{item.label}</strong><span>{item.current}% / {item.required}% <Badge className={tone[item.priority]}>{item.priority}</Badge></span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e7e0d4]"><div className="h-full rounded-full bg-[#16375c]" style={{ width: `${item.current}%` }} /></div><p className="mt-1 text-xs text-[#3d4f63]">Gap {item.gap} points · {item.evidence}</p></div>)}</div></Card>
      <Card><Badge className="bg-[#e07a2f]/15 text-[#c45c14]">AI priority engine</Badge><h2 className="mt-3 text-xl">What to learn next</h2><div className="mt-4 space-y-3">{priority.map((item, index) => <div key={item.id} className="rounded-xl border border-[#d9d0c0] p-3"><div className="flex justify-between gap-2"><strong>{index + 1}. {item.label}</strong><Badge className={tone[item.priority]}>{item.priority}</Badge></div><p className="mt-2 text-sm text-[#3d4f63]">Your competency is {item.current}%, against a {item.required}% role target. Close {item.gap} points first.</p></div>)}</div><Link href="/roadmap" className="mt-5 inline-block"><Button>Generate learning path</Button></Link></Card></div>
    <Card><div className="flex flex-wrap items-end justify-between gap-4"><div><Badge>Training impact simulator</Badge><h2 className="mt-2 text-xl">Plan a measurable improvement cycle</h2><p className="mt-1 text-sm text-[#3d4f63]">Adjust the commitment to make the learning-path promise explicit for the demo.</p></div><div className="flex flex-wrap gap-3 text-sm"><label>Daily minutes <input type="number" min="15" max="180" value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 15)} className="ml-2 w-20 rounded-lg border border-[#d9d0c0] p-2" /></label><label>Weeks <input type="number" min="2" max="24" value={weeks} onChange={(e) => setWeeks(Number(e.target.value) || 2)} className="ml-2 w-16 rounded-lg border border-[#d9d0c0] p-2" /></label></div></div><div className="mt-5 grid gap-3 md:grid-cols-3"><Impact label="Before" value={`${score}%`} note="Current competency evidence" /><Impact label="Intervention" value={`${weeklyHours} h/wk`} note={`${weeks}-week targeted path + quizzes`} /><Impact label="Target after" value={`${Math.min(95, score + gain)}%`} note={`Estimated +${gain} points; validate by reassessment`} /></div><p className="mt-4 text-xs text-[#3d4f63]">Projection is an explainable demo estimate, not a claimed outcome. The reassessment is the evidence of actual impact.</p></Card>
    <LearningIntelligencePanel />
    <CourseAuditor />
  </div>;
}
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <Card><div className="text-xs font-semibold uppercase tracking-wide text-[#3d4f63]">{label}</div><div className="mt-1 font-serif text-3xl">{value}</div><p className="mt-1 text-sm text-[#3d4f63]">{note}</p></Card>; }
function Impact({ label, value, note }: { label: string; value: string; note: string }) { return <div className="rounded-xl bg-[#16375c]/5 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-[#3d4f63]">{label}</div><div className="mt-1 font-serif text-3xl text-[#16375c]">{value}</div><div className="mt-1 text-sm text-[#3d4f63]">{note}</div></div>; }
