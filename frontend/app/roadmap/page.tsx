"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AssessmentResult, Recommendation } from "@/lib/types";
import { getAssessment } from "@/lib/progress";
import { api } from "@/lib/utils";

export default function RoadmapPage() {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const saved = getAssessment(); setAssessment(saved); if (!saved) return; const gaps = saved.competencies.filter((item) => item.priority !== "met").map(({ competency_id, gap, priority }) => ({ competency_id, gap, priority })); if (gaps.length) api<{ recommendations: Recommendation[] }>("/api/igot/recommend", { method: "POST", body: JSON.stringify({ gaps, limit: 8 }) }).then((data) => setRecommendations(data.recommendations)).catch((err: Error) => setError(err.message)); }, []);
  if (!assessment) return <Card className="mx-auto max-w-2xl text-center"><Badge>Learning roadmap</Badge><h1 className="mt-3 text-3xl">Start with your diagnostic assessment</h1><p className="mt-3 text-[#3d4f63]">Complete the short assessment so Stat-Karmayogi AI can identify priority competencies and recommend a practical learning path.</p><Link className="mt-5 inline-block" href="/assessment"><Button>Take assessment</Button></Link></Card>;
  const priorities = ["critical", "high", "moderate"] as const;
  return <div className="space-y-6"><section><Badge>Personalised plan</Badge><h1 className="mt-2 text-3xl">Your learning roadmap</h1><p className="mt-2 text-[#3d4f63]">Built from your {assessment.score}% diagnostic result.</p></section><Card className="overflow-x-auto"><div className="flex min-w-[680px] items-center justify-between gap-4 text-center text-sm"><Step title="Current profile" text={`${assessment.score}% readiness`} /><Arrow /><Step title="Priority gaps" text={`${assessment.competencies.filter((item) => item.priority !== "met").length} to strengthen`} /><Arrow /><Step title="Recommended learning" text="iGOT-led course plan" /><Arrow /><Step title="Practice & improve" text="Return to QuizForge" /></div></Card>{error ? <Card><p className="text-[#b42318]">Course recommendations need the backend running at localhost:8000. ({error})</p></Card> : null}{priorities.map((priority) => { const gaps = assessment.competencies.filter((item) => item.priority === priority); if (!gaps.length) return null; const related = recommendations.filter((item) => item.course.competency_ids.some((id) => gaps.some((gap) => gap.competency_id === id))); return <section key={priority}><h2 className="capitalize text-xl">{priority} priority</h2><div className="mt-3 grid gap-4 lg:grid-cols-2">{related.length ? related.map((item) => <Card key={item.course.id}><div className="flex flex-wrap gap-2"><Badge>{item.course.provider}</Badge><Badge className="bg-[#e07a2f]/15 text-[#c45c14]">{item.course.level}</Badge></div><h3 className="mt-3 text-lg">{item.course.title}</h3><p className="mt-1 text-sm text-[#3d4f63]">{item.why}</p><p className="mt-3 text-sm"><strong>{item.course.duration_hours} hours</strong> · {item.course.credits} learning credits</p><a className="mt-3 inline-block text-sm font-semibold text-[#16375c] underline" href={item.course.igot_url} target="_blank" rel="noreferrer">Open course catalogue</a></Card>) : <Card><p className="text-sm text-[#3d4f63]">This competency is prioritised. Start with a targeted QuizForge practice session while course matches load.</p></Card>}</div></section>; })}<Link href="/quiz"><Button>Practice with QuizForge</Button></Link></div>;
}

function Step({ title, text }: { title: string; text: string }) { return <div className="w-32"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#16375c] text-white">✓</div><strong className="mt-2 block">{title}</strong><span className="mt-1 block text-[#3d4f63]">{text}</span></div>; }
function Arrow() { return <span className="text-2xl text-[#e07a2f]">→</span>; }
