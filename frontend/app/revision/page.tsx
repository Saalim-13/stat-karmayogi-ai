"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRevisionItems, markRevisionReviewed, revisionDue } from "@/lib/progress";
import type { RevisionItem } from "@/lib/types";

export default function RevisionPage() {
  const [items, setItems] = useState<RevisionItem[]>([]);
  useEffect(() => setItems(getRevisionItems()), []);
  function review(id: string) { markRevisionReviewed(id); setItems(getRevisionItems()); }
  const groups = new Map<string, RevisionItem[]>();
  items.forEach((item) => { const key = item.competency_id ?? "General"; groups.set(key, [...(groups.get(key) ?? []), item]); });
  if (!items.length) return <Card className="mx-auto max-w-2xl text-center"><Badge>Revision queue</Badge><h1 className="mt-3 text-3xl">No revision items yet</h1><p className="mt-3 text-[#3d4f63]">Questions answered incorrectly in QuizForge are saved here for spaced revision after 1, 3, and 7 days.</p><Link className="mt-5 inline-block" href="/quiz"><Button>Practise QuizForge</Button></Link></Card>;
  return <div className="space-y-6"><section><Badge>Spaced repetition</Badge><h1 className="mt-2 text-3xl">Revision queue</h1><p className="mt-2 text-[#3d4f63]">Return to weaker concepts at the right time to make learning last.</p></section>{[...groups].map(([competency, group]) => <section key={competency}><h2 className="text-xl">{competency}</h2><div className="mt-3 space-y-3">{group.map((item) => { const status = revisionDue(item); return <Card key={item.id} className={item.completed ? "opacity-70" : status === "Due now" ? "border-[#e07a2f]" : ""}><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge className={status === "Due now" ? "bg-[#e07a2f]/15 text-[#c45c14]" : item.completed ? "bg-[#1f6b4a]/15 text-[#1f6b4a]" : ""}>{status}</Badge><p className="mt-3 font-medium">{item.question}</p><p className="mt-2 text-sm text-[#3d4f63]">Correct answer: {item.options[item.correct_index]}</p><p className="mt-1 text-sm text-[#3d4f63]">{item.explanation}</p><p className="mt-2 text-xs text-[#3d4f63]">Reviews completed: {item.reviews_completed}/3</p></div>{!item.completed ? <Button variant="secondary" onClick={() => review(item.id)}>Mark as revised</Button> : null}</div></Card>; })}</div></section>)}</div>;
}
