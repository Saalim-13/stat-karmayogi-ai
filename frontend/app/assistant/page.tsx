"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AssistantReply } from "@/lib/types";
import { api } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { learnerMemory } from "@/lib/memory";

const SUGGESTIONS = ["Explain LFPR in simple words", "Explain sampling weights with an example", "What is GSBPM?", "Why is unit-level data confidential?", "Give me a 5-minute revision plan for PLFS"];

export default function AssistantPage() {
  const { language } = useI18n();
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function ask(text = message) {
    if (text.trim().length < 3) return;
    setBusy(true); setError(null); setMessage(text);
    try {
      const memory = learnerMemory();
      setReply(await api<AssistantReply>("/api/assistant/chat", { method: "POST", body: JSON.stringify({ message: text, language, learner_name: memory.name, role: memory.role, weak_topic: memory.weak_topic, current_competency: memory.mastery, goal: `Reach ${memory.target}% competency` }) }));
    }
    catch (err) { setError(err instanceof Error ? err.message : "The assistant is unavailable. Check the backend, then try again."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6"><section><Badge>AI learning support</Badge><h1 className="mt-2 text-3xl">Ask your learning assistant</h1><p className="mt-2 max-w-2xl text-[#3d4f63]">Get simple explanations and practical examples for official-statistics concepts. When optional AI mode is off, helpful offline guidance remains available.</p></section><Card><p className="text-sm font-semibold">Try a question</p><div className="mt-3 flex flex-wrap gap-2">{SUGGESTIONS.map((suggestion) => <Button key={suggestion} variant="secondary" onClick={() => ask(suggestion)}>{suggestion}</Button>)}</div><div className="mt-4 flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && ask()} className="min-w-0 flex-1 rounded-xl border border-[#d9d0c0] bg-white px-3 py-2.5 text-sm" placeholder="Ask about PLFS, sampling, CPI, GSBPM…" /><Button disabled={busy || message.trim().length < 3} onClick={() => ask()}>{busy ? "Thinking…" : "Ask"}</Button></div>{error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}</Card>{reply ? <Card className="border-[#16375c]"><div className="flex flex-wrap gap-2"><Badge>{reply.ai_available ? "AI-enhanced response" : "Offline learning guide"}</Badge>{reply.competency_id ? <Badge className="bg-[#e07a2f]/15 text-[#c45c14]">{reply.competency_id}</Badge> : null}</div><div className="mt-4 whitespace-pre-wrap leading-relaxed text-[#102033]">{reply.answer}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#16375c]/5 p-3"><span className="text-sm text-[#3d4f63]">Next action: <strong>{reply.next_action}</strong></span><Link href={reply.next_action === "Practise scenarios" ? "/quiz" : "/revision"}><Button variant="secondary">Continue learning</Button></Link></div></Card> : <Card className="text-center text-[#3d4f63]">Choose a suggested prompt or ask your own question to begin.</Card>}</div>;
}
