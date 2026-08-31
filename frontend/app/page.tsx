"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Recommendation } from "@/lib/types";
import { DEMO_GAPS } from "@/lib/types";
import { api } from "@/lib/utils";
import { activeRevisionCount, getAssessment, getProgress } from "@/lib/progress";
import type { AssessmentResult, LearningProgress } from "@/lib/types";
import { daysUntil, getProfile, getTopics, nextAction, readiness, type LearnerProfile, type SyllabusTopic } from "@/lib/learner";
import { useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const { t } = useI18n();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"Offline Mode" | "AI-Enhanced Mode">("Offline Mode");
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [revisionCount, setRevisionCount] = useState(0);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);

  useEffect(() => {
    setAssessment(getAssessment());
    setProgress(getProgress());
    setRevisionCount(activeRevisionCount());
    setProfile(getProfile());
    setTopics(getTopics());
    api<{ recommendations: Recommendation[] }>("/api/igot/recommend", {
      method: "POST",
      body: JSON.stringify({ gaps: DEMO_GAPS, limit: 4 }),
    })
      .then((data) => setRecs(data.recommendations))
      .catch((err: Error) => setError(err.message));
    api<{ ai_assistant: boolean }>("/api/health")
      .then((status) => setMode(status.ai_assistant ? "AI-Enhanced Mode" : "Offline Mode"))
      .catch(() => setMode("Offline Mode"));
  }, []);

  const accuracy = progress && progress.questions_answered ? Math.round(progress.correct_answers / progress.questions_answered * 100) : 0;
  const assessmentGaps = assessment?.competencies.filter((item) => item.priority !== "met") ?? [];
  const action = topics.length ? nextAction(topics) : null;
  const readinessScore = topics.length ? readiness(topics) : assessment?.score ?? 0;
  const daysLeft = profile ? daysUntil(profile.exam_date) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-[#0c2744] to-[#16375c] p-8 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm tracking-wide text-[#f0c48a]">Mission Karmayogi × Official Statistics</div>
          <Badge className={mode === "AI-Enhanced Mode" ? "bg-[#f0c48a] text-[#0c2744]" : "bg-white/15 text-white"}>{mode}</Badge>
        </div>
          <h1 className="mt-1 text-4xl">{profile ? `${t("welcome")}, ${profile.name}.` : "Build statistical capability with evidence."}</h1>
          <p className="mt-3 max-w-2xl text-white/75">
          {profile ? `${profile.exam} · ${daysLeft} days until your exam · target score ${profile.target_score}%.` : "Start with a short profile so your study coach can tailor the next step."} Nothing here claims live iGOT credit sync.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={profile ? "/syllabus" : "/onboarding"}><Button>{profile ? t("studyNow") : "Create my exam profile"}</Button></Link>
          <Link href="/intelligence"><Button variant="secondary">View competency intelligence</Button></Link>
          <Link href="/quiz"><Button variant="secondary">Generate quiz from material</Button></Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="stat">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#3d4f63]">Demo readiness</div>
          <div className="mt-1 font-serif text-3xl">{profile || assessment ? `${readinessScore}%` : "—"}</div>
          <div className="mt-3 h-2 rounded-full bg-[#d9d0c0]">
            <div className="h-2 rounded-full bg-[#1f6b4a]" style={{ width: `${readinessScore}%` }} />
          </div>
        </Card>
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#3d4f63]">Critical gaps</div>
          <div className="mt-1 font-serif text-3xl">{assessment ? assessmentGaps.length : "—"}</div>
          <p className="text-sm text-[#3d4f63]">{assessment ? "Competencies identified for focused learning." : "Complete a diagnostic assessment to identify gaps."}</p>
        </Card>
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#3d4f63]">Quiz accuracy</div>
          <div className="mt-1 font-serif text-3xl">{progress?.questions_answered ? `${accuracy}%` : "—"}</div>
          <p className="text-sm text-[#3d4f63]">{progress?.questions_answered ? `${progress.quizzes_attempted} quiz session${progress.quizzes_attempted === 1 ? "" : "s"} recorded locally.` : "Answer QuizForge questions to track progress."}</p>
        </Card>
      </div>

      {profile ? <Card><div className="flex flex-wrap items-start justify-between gap-4"><div><Badge>My learning mission</Badge><h2 className="mt-2 text-xl">{profile.role ?? "Statistical Officer"} · {profile.exam}</h2><p className="mt-1 text-sm text-[#3d4f63]">Target {profile.target_score}% · {daysLeft} days left · {topics.filter((topic) => topic.status === "Mastered").length}/{topics.length} topics mastered · {profile.daily_minutes} minutes/day</p></div><div className="flex items-center gap-1 text-xs font-semibold text-[#3d4f63]"><span className="rounded bg-[#1f6b4a] px-2 py-1 text-white">ASSESS</span><span>→</span><span className="rounded bg-[#16375c] px-2 py-1 text-white">IDENTIFY</span><span>→</span><span className="rounded bg-[#e07a2f] px-2 py-1 text-white">LEARN</span><span>→</span><span className="rounded bg-[#d9d0c0] px-2 py-1">PRACTICE</span><span>→</span><span className="rounded bg-[#d9d0c0] px-2 py-1">MASTER</span></div></div></Card> : null}

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3"><div><Badge className="bg-[#e07a2f]/15 text-[#c45c14]">Study coach recommendation</Badge><h2 className="mt-2 text-xl">{action ? `Study ${action.title} for 20 minutes` : "Your next action"}</h2><p className="mt-1 text-sm text-[#3d4f63]">{action ? `Reason: ${action.mastery}% mastery, ${action.importance.toLowerCase()} exam priority. Learn first, then take a short practice quiz.` : "Complete your profile and diagnostic assessment to get a single recommended action."}</p></div><Link href={action ? `/study?topic=${action.id}` : "/onboarding"}><Button variant="secondary">{action ? "Start this topic" : "Get started"}</Button></Link></div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl">Revision queue</h2><p className="mt-1 text-sm text-[#3d4f63]">{revisionCount ? `${revisionCount} weaker question${revisionCount === 1 ? "" : "s"} saved for spaced revision.` : "No revision items yet—incorrect quiz answers appear here."}</p></div><Link href="/revision"><Button variant="secondary">Open revision</Button></Link></div>
      </Card>

      <Card>
        <h2 className="text-xl">iGOT recommendations</h2>
        {error ? (
          <p className="mt-3 text-sm text-[#b42318]">
            Backend not reachable at localhost:8000. Start FastAPI, then refresh. ({error})
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {recs.map((r) => (
              <div key={r.course.id} className="rounded-xl border border-[#d9d0c0] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{r.course.title}</div>
                  <Badge>{r.course.provider}</Badge>
                  <Badge className="bg-[#e07a2f]/15 text-[#c45c14]">{r.course.level}</Badge>
                </div>
                <p className="mt-1 text-sm text-[#3d4f63]">{r.why}</p>
                <a className="mt-2 inline-block text-sm text-[#16375c] underline" href={r.course.igot_url} target="_blank" rel="noreferrer">
                  Open catalogue
                </a>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
