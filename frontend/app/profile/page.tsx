"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProfile, getTopics, readiness, type LearnerProfile, type SyllabusTopic } from "@/lib/learner";
import { getProgress } from "@/lib/progress";

export default function ProfilePage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [answers, setAnswers] = useState({ questions_answered: 0, correct_answers: 0 });
  useEffect(() => { setProfile(getProfile()); setTopics(getTopics()); const progress = getProgress(); setAnswers(progress); }, []);
  const dna = useMemo(() => {
    const accuracy = answers.questions_answered ? Math.round(answers.correct_answers / answers.questions_answered * 100) : 50;
    const mastered = topics.filter((topic) => topic.status === "Mastered").length;
    const reviewed = topics.filter((topic) => topic.reviews > 0).length;
    return [
      ["Concept understanding", readiness(topics), "Built from topic learning and mastery evidence."],
      ["Quiz performance", accuracy, answers.questions_answered ? `${answers.questions_answered} recorded quiz answers.` : "Take QuizForge practice to strengthen this signal."],
      ["Retention", topics.length ? Math.round(reviewed / topics.length * 100) : 0, "Based on scheduled revision completed."],
      ["Consistency", Math.min(100, reviewed * 25 + (answers.questions_answered ? 25 : 0)), "Based on practice and revision activity in this demo."],
    ];
  }, [answers, topics]);
  if (!profile) return <Card className="mx-auto max-w-2xl text-center"><Badge>My AI learning profile</Badge><h1 className="mt-3 text-3xl">Tell Stat Karmayogi AI about you first.</h1><p className="mt-3 text-[#3d4f63]">Your role, deadline and learning preference make recommendations personal.</p><Link href="/onboarding" className="mt-5 inline-block"><Button>Create profile</Button></Link></Card>;
  const strengths = topics.filter((topic) => topic.mastery >= 70).map((topic) => topic.title);
  const needsSupport = topics.filter((topic) => topic.mastery < 55).map((topic) => topic.title);
  return <div className="space-y-6"><section><Badge>My AI learning profile</Badge><h1 className="mt-2 text-3xl">What Stat Karmayogi AI knows about your learning</h1><p className="mt-2 text-[#3d4f63]">These signals are calculated from your saved profile, topic activity, quiz answers and revision evidence in this browser.</p></section><div className="grid gap-4 md:grid-cols-3"><Card><div className="text-xs font-semibold uppercase text-[#3d4f63]">Learner</div><div className="mt-1 font-serif text-2xl">{profile.name}</div><p className="mt-1 text-sm text-[#3d4f63]">{profile.role ?? "Statistical Officer"}</p></Card><Card><div className="text-xs font-semibold uppercase text-[#3d4f63]">Learning preference</div><div className="mt-1 font-serif text-2xl">{profile.preference}</div><p className="mt-1 text-sm text-[#3d4f63]">{profile.daily_minutes} minutes daily · {profile.preferred_time}</p></Card><Card><div className="text-xs font-semibold uppercase text-[#3d4f63]">Goal</div><div className="mt-1 font-serif text-2xl">{profile.target_score}%</div><p className="mt-1 text-sm text-[#3d4f63]">{profile.exam}</p></Card></div><Card><Badge className="bg-[#16375c]/10 text-[#16375c]">My learning DNA</Badge><h2 className="mt-2 text-xl">Evidence-based learning signals</h2><div className="mt-5 grid gap-5 md:grid-cols-2">{dna.map(([label, score, note]) => <div key={label as string}><div className="flex justify-between text-sm"><strong>{label}</strong><span>{score}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e7e0d4]"><div className="h-full rounded-full bg-[#16375c]" style={{ width: `${score}%` }} /></div><p className="mt-1 text-xs text-[#3d4f63]">{note}</p></div>)}</div></Card><div className="grid gap-4 md:grid-cols-2"><Card><h2 className="text-xl">Current strengths</h2><p className="mt-2 text-sm text-[#3d4f63]">{strengths.length ? strengths.join(" · ") : "Complete practice and revision to identify strengths."}</p></Card><Card><h2 className="text-xl">Support recommended</h2><p className="mt-2 text-sm text-[#3d4f63]">{needsSupport.length ? `${needsSupport.join(" · ")}. Start the weakest high-priority topic first.` : "No critical topic gaps are currently recorded."}</p></Card></div></div>;
}
