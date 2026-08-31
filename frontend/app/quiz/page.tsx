"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { recordQuizAnswer, saveIncorrectQuestion } from "@/lib/progress";
import { api } from "@/lib/utils";
import { SAMPLE_NOTES, SCENARIO_QUESTIONS, type AssistantReply, type Difficulty, type Quiz } from "@/lib/types";
import { recordTopicQuizEvidence } from "@/lib/learner";
import { rememberStudy } from "@/lib/memory";

const LEVELS: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];
const BLOOM_BY_LEVEL = { Beginner: ["Remember", "Understand"], Intermediate: ["Understand", "Apply"], Advanced: ["Apply", "Analyse"] } as const;

export default function QuizPage() {
  const [text, setText] = useState(SAMPLE_NOTES);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [difficulty, setDifficulty] = useState<Difficulty>("Beginner");
  const [mode, setMode] = useState<"material" | "scenario">("material");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiHelp, setAiHelp] = useState<Record<string, string>>({});
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  async function generate() {
    setBusy(true); setError(null); setPicks({});
    try {
      if (mode === "scenario") {
        setQuiz({ id: `scenario-${difficulty}`, title: `${difficulty} scenario practice`, source_name: "official-statistics-scenarios", engine: "scenario-bank", competency_ids: SCENARIO_QUESTIONS.map((q) => q.competency_id), questions: SCENARIO_QUESTIONS.map((q) => ({ ...q, bloom: difficulty === "Beginner" ? "Understand" : difficulty === "Intermediate" ? "Apply" : "Analyse", source_excerpt: q.domain })) });
      } else {
        setQuiz(await api<Quiz>("/api/mcq/generate", { method: "POST", body: JSON.stringify({ text, source_name: "hackathon-notes.txt", ingest: true, bloom_mix: BLOOM_BY_LEVEL[difficulty] }) }));
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to generate quiz"); }
    finally { setBusy(false); }
  }
  const answered = quiz ? quiz.questions.filter((q) => picks[q.id] !== undefined).length : 0;
  const correct = quiz?.questions.filter((q) => picks[q.id] === q.correct_index).length ?? 0;
  const complete = Boolean(quiz && answered === quiz.questions.length);
  const accuracy = quiz?.questions.length ? Math.round(correct / quiz.questions.length * 100) : 0;
  const guidance = accuracy >= 80 ? difficulty === "Advanced" ? "Excellent—keep practising advanced scenario questions." : `You are ready for ${LEVELS[LEVELS.indexOf(difficulty) + 1]}.` : accuracy < 50 ? difficulty === "Beginner" ? "Review your revision queue, then try another beginner quiz." : `Review weak topics, then retry at ${LEVELS[LEVELS.indexOf(difficulty) - 1]}.` : `Continue at ${difficulty} level and reinforce your weak topics.`;
  function choose(question: Quiz["questions"][number], index: number) {
    if (!quiz || picks[question.id] !== undefined) return;
    const isCorrect = index === question.correct_index;
    setPicks((current) => ({ ...current, [question.id]: index }));
    recordQuizAnswer(quiz.id, question.id, question.competency_id, isCorrect);
    recordTopicQuizEvidence(question.competency_id, isCorrect);
    rememberStudy(question.topic ?? question.competency_id ?? "Statistical practice", isCorrect);
    if (!isCorrect) saveIncorrectQuestion({ id: question.id, question: question.question, options: question.options, correct_index: question.correct_index, competency_id: question.competency_id ?? null, explanation: question.explanation });
  }
  async function explainWithAi(question: Quiz["questions"][number]) {
    if (picks[question.id] === undefined) return;
    setAiBusy(question.id);
    try {
      const reply = await api<AssistantReply>("/api/assistant/explain-answer", { method: "POST", body: JSON.stringify({ question: question.question, correct_answer: question.options[question.correct_index], selected_answer: question.options[picks[question.id]], competency_id: question.competency_id ?? null }) });
      setAiHelp((current) => ({ ...current, [question.id]: reply.answer }));
    } catch { setAiHelp((current) => ({ ...current, [question.id]: "AI explanation is unavailable. The offline explanation above is still available." })); }
    finally { setAiBusy(null); }
  }
  return <div className="space-y-6"><div><h1 className="text-3xl">QuizForge</h1><p className="mt-1 max-w-2xl text-[#3d4f63]">Choose a level, then create a source-based quiz or practise realistic official-statistics scenarios.</p></div><Card className="space-y-4"><div><p className="text-sm font-semibold">Practice mode</p><div className="mt-2 flex flex-wrap gap-2">{(["material", "scenario"] as const).map((item) => <Button key={item} variant={mode === item ? "primary" : "secondary"} onClick={() => setMode(item)}>{item === "material" ? "My learning material" : "Practice scenarios"}</Button>)}</div></div><div><p className="text-sm font-semibold">Starting difficulty</p><div className="mt-2 flex flex-wrap gap-2">{LEVELS.map((level) => <Button key={level} variant={difficulty === level ? "primary" : "secondary"} onClick={() => setDifficulty(level)}>{level}</Button>)}</div></div>{mode === "material" ? <Textarea value={text} onChange={(event) => setText(event.target.value)} /> : <p className="rounded-xl bg-[#16375c]/5 p-3 text-sm text-[#3d4f63]">Eight practical scenarios covering labour surveys, sampling, CPI, confidentiality, CAPI, quality, SDMX, and analytics.</p>}<Button onClick={generate} disabled={busy || (mode === "material" && text.length < 40)}>{busy ? "Generating…" : mode === "scenario" ? "Start scenario practice" : "Generate Bloom MCQs"}</Button>{error ? <p className="text-sm text-[#b42318]">{error}</p> : null}</Card>{quiz ? <div className="space-y-4"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl">{quiz.title}</h2><Badge>{quiz.engine}</Badge><Badge className="bg-[#e07a2f]/15 text-[#c45c14]">{difficulty}</Badge>{answered ? <Badge className="bg-[#1f6b4a]/15 text-[#1f6b4a]">{correct}/{answered} correct</Badge> : null}</div>{quiz.questions.map((question, questionIndex) => { const pick = picks[question.id]; return <Card key={question.id}><div className="mb-2 flex flex-wrap gap-2"><Badge>Q{questionIndex + 1}</Badge><Badge className="bg-[#e07a2f]/15 text-[#c45c14]">{question.bloom}</Badge>{question.competency_id ? <Badge>{question.competency_id}</Badge> : null}</div><p className="whitespace-pre-wrap font-medium">{question.question}</p>{question.source_excerpt ? <div className="mt-3 rounded-xl bg-[#f4efe4] p-3 text-sm text-[#3d4f63]"><span className="font-semibold text-[#16375c]">Source excerpt: </span>{question.source_excerpt}</div> : null}<div className="mt-3 grid gap-2">{question.options.map((option, index) => { const reveal = pick !== undefined; const right = index === question.correct_index; return <button key={option} type="button" onClick={() => choose(question, index)} className={`rounded-xl border px-3 py-2 text-left text-sm ${reveal && right ? "border-[#1f6b4a] bg-[#1f6b4a]/10" : reveal && pick === index ? "border-[#b42318] bg-[#b42318]/10" : "border-[#d9d0c0] hover:bg-[#f4efe4]"}`}>{option}</button>; })}</div>{pick !== undefined ? <div className="mt-3 space-y-2"><p className="text-sm text-[#3d4f63]">{question.explanation}</p><Button variant="secondary" onClick={() => explainWithAi(question)} disabled={aiBusy === question.id}>{aiBusy === question.id ? "Explaining…" : "AI explanation"}</Button>{aiHelp[question.id] ? <p className="rounded-xl bg-[#16375c]/5 p-3 text-sm text-[#3d4f63] whitespace-pre-wrap">{aiHelp[question.id]}</p> : null}</div> : null}</Card>; })}{complete ? <Card className="border-[#1f6b4a] bg-[#f4fbf7]"><Badge className="bg-[#1f6b4a]/15 text-[#1f6b4a]">Adaptive recommendation</Badge><h3 className="mt-2 text-xl">{accuracy}% accuracy</h3><p className="mt-1 text-[#3d4f63]">{guidance}</p></Card> : null}</div> : null}</div>;
}
