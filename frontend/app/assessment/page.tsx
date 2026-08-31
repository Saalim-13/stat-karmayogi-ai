"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ASSESSMENT_QUESTIONS } from "@/lib/types";
import { buildAssessmentResult, saveAssessment } from "@/lib/progress";

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const result = submitted ? buildAssessmentResult(answers, ASSESSMENT_QUESTIONS) : null;
  const complete = Object.keys(answers).length === ASSESSMENT_QUESTIONS.length;

  function submit() {
    const next = buildAssessmentResult(answers, ASSESSMENT_QUESTIONS);
    saveAssessment(next);
    setSubmitted(true);
  }

  return <div className="space-y-6">
    <section><Badge>Diagnostic assessment</Badge><h1 className="mt-2 text-3xl">Discover your statistical learning priorities</h1><p className="mt-2 max-w-2xl text-[#3d4f63]">Nine questions across official-statistics domains. Your results stay in this browser and create a tailored roadmap.</p></section>
    {result ? <Card className="border-[#1f6b4a] bg-[#f4fbf7]"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#1f6b4a]">Assessment complete</p><h2 className="mt-1 text-3xl">{result.score}% readiness</h2><p className="mt-1 text-[#3d4f63]">{result.correct} of {result.total} answers correct.</p></div><Link href="/roadmap"><Button>View my learning roadmap</Button></Link></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{result.competencies.map((item) => <div key={item.competency_id} className="rounded-xl border border-[#d9d0c0] bg-white p-3"><div className="flex justify-between gap-2"><strong>{item.competency_id}</strong><Badge className={item.priority === "critical" ? "bg-[#b42318]/10 text-[#b42318]" : item.priority === "met" ? "bg-[#1f6b4a]/15 text-[#1f6b4a]" : "bg-[#e07a2f]/15 text-[#c45c14]"}>{item.priority}</Badge></div><p className="mt-1 text-sm text-[#3d4f63]">{item.percent}% correct</p></div>)}</div></Card> : null}
    <div className="space-y-4">{ASSESSMENT_QUESTIONS.map((question, index) => <Card key={question.id}><div className="mb-2 flex gap-2"><Badge>Q{index + 1}</Badge><Badge className="bg-[#e07a2f]/15 text-[#c45c14]">{question.domain}</Badge></div><p className="font-medium">{question.question}</p><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <button key={option} type="button" onClick={() => !submitted && setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className={`rounded-xl border px-3 py-2 text-left text-sm ${answers[question.id] === optionIndex ? "border-[#16375c] bg-[#16375c]/10" : "border-[#d9d0c0] hover:bg-[#f4efe4]"} ${submitted && optionIndex === question.correct_index ? "border-[#1f6b4a] bg-[#1f6b4a]/10" : ""}`}>{option}</button>)}</div></Card>)}</div>
    {!submitted ? <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-[#d9d0c0] bg-[#fffdf8]/95 p-4 shadow-lg backdrop-blur"><span className="text-sm text-[#3d4f63]">{Object.keys(answers).length}/{ASSESSMENT_QUESTIONS.length} answered</span><Button onClick={submit} disabled={!complete}>Submit assessment</Button></div> : null}
  </div>;
}
