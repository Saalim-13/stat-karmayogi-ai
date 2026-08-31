"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTopics, topicStatus, updateTopic, type SyllabusTopic } from "@/lib/learner";

export default function StudyPage() {
  const [topic, setTopic] = useState<SyllabusTopic | null>(null);
  const [style, setStyle] = useState("Simple explanation");
  const [response, setResponse] = useState<string | null>(null);
  useEffect(() => { const id = new URLSearchParams(window.location.search).get("topic"); setTopic(getTopics().find((item) => item.id === id) ?? getTopics()[0]); }, []);
  if (!topic) return null;
  const currentTopic = topic;
  const text = lesson(currentTopic, style);
  function confidence(choice: "understand" | "again" | "confused") { const improvement = choice === "understand" ? 10 : choice === "again" ? 4 : 0; const mastery = Math.min(100, currentTopic.mastery + improvement); const next = { ...currentTopic, mastery, status: choice === "confused" ? "Weak" as const : topicStatus(mastery) }; updateTopic(currentTopic.id, next); setTopic(next); setResponse(choice === "understand" ? "Great—your learning evidence is recorded. Do a short quiz next to confirm it." : choice === "again" ? "Let’s use another explanation and an example. Take your time." : "That is useful feedback, not a failure. Start with the simpler explanation, then practise one small example."); }
  return <div className="space-y-6"><section className="flex flex-wrap items-end justify-between gap-3"><div><Badge>{topic.subject} · {topic.unit}</Badge><h1 className="mt-2 text-3xl">{topic.title}</h1><p className="mt-2 text-[#3d4f63]">Mastery {topic.mastery}% · status: {topic.status}</p></div><Link href="/syllabus"><Button variant="secondary">Back to syllabus</Button></Link></section><Card><div className="flex flex-wrap gap-2">{["Simple explanation", "Detailed explanation", "Example first", "Exam question"].map((item) => <Button key={item} variant={style === item ? "primary" : "secondary"} onClick={() => setStyle(item)}>{item}</Button>)}</div><div className="mt-5 whitespace-pre-wrap leading-relaxed text-[#102033]">{text}</div></Card><div className="grid gap-4 md:grid-cols-2"><Card><h2 className="text-xl">Common mistakes</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#3d4f63]"><li>Applying a formula before identifying the event or sampling design.</li><li>Ignoring the condition or assumption stated in the question.</li><li>Choosing an answer without checking whether it matches the context.</li></ul></Card><Card><h2 className="text-xl">Exam tip</h2><p className="mt-3 text-sm text-[#3d4f63]">Write down the known values, identify the exact concept, then eliminate options that describe a different measure or method.</p><Link href="/quiz" className="mt-4 inline-block"><Button>Test me in QuizForge</Button></Link></Card></div><Card><Badge>Understanding check</Badge><h2 className="mt-2 text-xl">Do you understand this topic?</h2><p className="mt-1 text-sm text-[#3d4f63]">Your answer chooses the next support step; it does not penalise you.</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => confidence("understand")}>😊 I understand</Button><Button variant="secondary" onClick={() => confidence("again")}>🤔 Another explanation</Button><Button variant="secondary" onClick={() => confidence("confused")}>😕 I’m confused</Button></div>{response ? <p className="mt-4 rounded-xl bg-[#16375c]/5 p-3 text-sm text-[#3d4f63]">{response}</p> : null}</Card></div>;
}
function lesson(topic: SyllabusTopic, style: string) {
  if (style === "Exam question") return `Practice prompt: A question presents a situation involving ${topic.title}. Identify the key condition, select the method or definition that applies, and explain why the other choices do not fit.\n\nUse QuizForge for marked practice and an explanation after every answer.`;
  if (style === "Example first") return `Example: Start with a small, concrete case. Ask what information is known, what must be estimated or decided, and which rule from ${topic.unit} applies. Then check whether the conclusion still makes sense in the exam context.\n\nThis is the same method you can use under timed conditions.`;
  if (style === "Detailed explanation") return `${topic.title} is an examinable part of ${topic.subject}. Break it into definition, assumptions, method, and interpretation. Each question usually tests one of these layers. First identify the wording that signals the concept; next apply the rule only within its stated conditions; finally interpret the result in plain language.\n\nWhy it matters: strong fundamentals prevent careless mix-ups in advanced and scenario-based questions.`;
  return `${topic.title}, simply: focus on one idea at a time. Learn what it means, when it is used, and one short example. Do not memorise a procedure without knowing what problem it solves.\n\nNext: practise one question, check the explanation, and return for revision after a gap.`;
}
