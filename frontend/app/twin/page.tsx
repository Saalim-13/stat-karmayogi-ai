"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { twinPayload } from "@/lib/twin-payload";
import { getProfile } from "@/lib/learner";
import { DEMO_BANNER, loadPriyaDemo } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";

type TwinState = {
  learner: string;
  role: string;
  language: string;
  overall_current: number;
  overall_required: number;
  overall_gap: number;
  competencies: Array<{
    competency_id: string;
    label: string;
    required: number;
    current: number;
    gap: number;
    priority: string;
    journey: number[];
    mastery: string;
  }>;
  disclaimer: string;
};

type Action = {
  headline: string;
  why: { competency: string; current: number; required: number; gap: number; role_importance: string; recent_accuracy: number; exam_relevance: string; retention_risk: string; priority: string };
  recommended: { language: string; minutes: number; learning_session: string; practice_questions: number; plan: Record<string, number | string> };
  therefore: string;
};

export default function TwinPage() {
  const { setLanguage } = useI18n();
  const [twin, setTwin] = useState<TwinState | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [forecast, setForecast] = useState<{ estimated_without_intervention: number; estimated_with_recommended_intervention: number; disclaimer: string; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  async function refresh() {
    setError(null);
    try {
      const payload = twinPayload();
      const next = await api<{ action: Action; twin: TwinState }>("/api/twin/next-action", { method: "POST", body: JSON.stringify(payload) });
      setTwin(next.twin);
      setAction(next.action);
      const focus = next.twin.competencies[0];
      if (focus) {
        setForecast(await api("/api/twin/forecast", { method: "POST", body: JSON.stringify({ current: focus.current, target: focus.required, velocity_points_per_session: 4, sessions_available: 6, with_intervention: true }) }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Twin service unavailable");
    }
  }

  useEffect(() => {
    setReady(true);
    setHasProfile(Boolean(getProfile()));
    void refresh();
  }, []);

  if (!ready) return null;
  if (!hasProfile) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <Badge>Competency Digital Twin</Badge>
        <h1 className="mt-3 text-3xl">The twin needs a learner.</h1>
        <p className="mt-3 text-[#3d4f63]">Create a profile, or load the labelled Priya demonstration.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/onboarding"><Button>Create profile</Button></Link>
          <Button variant="secondary" onClick={() => { loadPriyaDemo(setLanguage); setHasProfile(true); void refresh(); }}>Load Priya demo</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#102f4f] p-7 text-white">
        <Badge className="bg-white/15 text-white">Competency Digital Twin</Badge>
        <h1 className="mt-3 text-3xl">{twin?.learner} · {twin?.role}</h1>
        <p className="mt-2 max-w-3xl text-white/75">This is not a progress bar for courses. It is the learner&apos;s current competency state: role requirement minus measured ability, updated as they study, practise, err, revise and retest.</p>
        <p className="mt-4 text-xl font-semibold">Don&apos;t just train the workforce. Measure, personalise and improve its competency.</p>
      </section>
      {error ? <Card className="text-sm text-[#b42318]">Start FastAPI on port 8000. ({error})</Card> : null}
      <p className="rounded-xl border border-[#e07a2f]/40 bg-[#fff6ee] px-4 py-2 text-xs text-[#c45c14]">{DEMO_BANNER}</p>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Current state" value={`${twin?.overall_current ?? "—"}%`} note="Blended diagnostic + practice" />
        <Metric label="Required" value={`${twin?.overall_required ?? "—"}%`} note="Configurable role target" />
        <Metric label="Overall gap" value={`${twin?.overall_gap ?? "—"} pts`} note="Required − current" />
        <Metric label="Critical items" value={String(twin?.competencies.filter((c) => c.priority === "Critical").length ?? 0)} note="Gap ≥ 35 points" />
      </div>
      <Card>
        <Badge className="bg-[#e07a2f]/15 text-[#c45c14]">Your next best action</Badge>
        {action ? (
          <div className="mt-3 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="text-2xl">{action.headline}</h2>
              <p className="mt-2 text-sm text-[#3d4f63]">{action.therefore}</p>
              <p className="mt-3 text-sm">Recommended: {action.recommended.learning_session} + {action.recommended.practice_questions} practice questions + adaptive quiz.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/loop"><Button>Start now</Button></Link>
                <Link href="/plan"><Button variant="secondary">Time-aware plan</Button></Link>
              </div>
            </div>
            <div className="rounded-xl bg-[#16375c]/5 p-4 text-sm">
              <strong>WHY {action.why.competency.toUpperCase()}?</strong>
              <ul className="mt-2 space-y-1 text-[#3d4f63]">
                <li>Current competency: {action.why.current}%</li>
                <li>Required: {action.why.required}%</li>
                <li>Gap: {action.why.gap} points</li>
                <li>Role importance: {action.why.role_importance}</li>
                <li>Recent accuracy: {action.why.recent_accuracy}%</li>
                <li>Retention risk: {action.why.retention_risk}</li>
              </ul>
            </div>
          </div>
        ) : null}
      </Card>
      <Card>
        <h2 className="text-xl">Current competency state</h2>
        <p className="mt-1 text-sm text-[#3d4f63]">Gap = required competency − current competency. Journey updates when learning evidence is recorded.</p>
        <div className="mt-5 space-y-4">
          {twin?.competencies.map((row) => (
            <div key={row.competency_id} className="rounded-xl border border-[#d9d0c0] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <strong>{row.label}</strong>
                  <p className="text-sm text-[#3d4f63]">Required {row.required}% · Current {row.current}% · Gap {row.gap} points</p>
                </div>
                <Badge className={row.priority === "Critical" ? "bg-[#b42318]/10 text-[#b42318]" : row.priority === "High" ? "bg-[#e07a2f]/15 text-[#c45c14]" : "bg-[#1f6b4a]/15 text-[#1f6b4a]"}>{row.mastery} · {row.priority}</Badge>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <Bar label="Required" value={row.required} colour="bg-[#16375c]" />
                <Bar label="Current" value={row.current} colour={row.gap >= 20 ? "bg-[#b42318]" : "bg-[#1f6b4a]"} />
              </div>
              <p className="mt-3 text-sm text-[#3d4f63]">Competency journey: {row.journey.join("% → ")}%</p>
            </div>
          ))}
        </div>
      </Card>
      {forecast ? (
        <Card>
          <Badge>{forecast.label}</Badge>
          <h2 className="mt-2 text-xl">If this priority competency is left vs intervened</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#d9d0c0] p-4">Without intervention: {forecast.estimated_without_intervention}%</div>
            <div className="rounded-xl border border-[#1f6b4a] bg-[#f4fbf7] p-4">With recommended intervention: {forecast.estimated_with_recommended_intervention}%</div>
          </div>
          <p className="mt-3 text-xs text-[#3d4f63]">{forecast.disclaimer}</p>
        </Card>
      ) : null}
      <p className="text-xs text-[#3d4f63]">{twin?.disclaimer}</p>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <Card><div className="text-xs font-semibold uppercase text-[#3d4f63]">{label}</div><div className="mt-1 font-serif text-3xl">{value}</div><p className="mt-1 text-sm text-[#3d4f63]">{note}</p></Card>;
}
function Bar({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-[#3d4f63]"><span>{label}</span><span>{value}%</span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e7e0d4]"><div className={`h-full ${colour}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}
