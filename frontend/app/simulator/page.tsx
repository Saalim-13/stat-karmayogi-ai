"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/utils";

type Scene = { id: string; title: string; context: string; prompt: string; options: string[]; competency_id: string };
type Result = { correct: boolean; competency_id: string; explanation: string; rubric: { reasoning: string; method: string; data_quality: string; interpretation: string } };

export default function SimulatorPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api<{ scenes: Scene[] }>("/api/intelligence/simulator").then((data) => setScenes(data.scenes)).catch(() => setError("The simulator needs the local backend running on port 8000.")); }, []);
  async function submit(scene: Scene) {
    const choice = selected[scene.id];
    if (choice === undefined) return;
    setError(null);
    try { setResult(await api<Result>("/api/intelligence/simulator/evaluate", { method: "POST", body: JSON.stringify({ scene_id: scene.id, choice }) })); }
    catch { setError("The response could not be evaluated. Check the local backend and try again."); }
  }
  return <div className="space-y-6">
    <section><Badge>Government statistics simulator · Demo</Badge><h1 className="mt-2 text-3xl">Show practical judgement, not only MCQs</h1><p className="mt-2 max-w-2xl text-[#3d4f63]">Choose the defensible action in a realistic statistics-work scenario. These are teaching scenarios, not official case files.</p></section>
    {error ? <Card className="border-[#b42318] text-sm text-[#b42318]">{error}</Card> : null}
    {scenes.map((scene) => <Card key={scene.id}><div className="flex flex-wrap gap-2"><Badge>{scene.competency_id}</Badge><Badge className="bg-[#e07a2f]/15 text-[#c45c14]">Practical performance</Badge></div><h2 className="mt-3 text-xl">{scene.title}</h2><p className="mt-2 text-sm text-[#3d4f63]">{scene.context}</p><p className="mt-4 font-semibold">{scene.prompt}</p><div className="mt-3 grid gap-2">{scene.options.map((option, index) => <button key={option} type="button" onClick={() => setSelected((current) => ({ ...current, [scene.id]: index }))} className={`rounded-xl border px-3 py-3 text-left text-sm ${selected[scene.id] === index ? "border-[#16375c] bg-[#16375c]/10" : "border-[#d9d0c0] hover:bg-[#f4efe4]"}`}>{option}</button>)}</div><Button className="mt-4" disabled={selected[scene.id] === undefined} onClick={() => submit(scene)}>Evaluate reasoning</Button></Card>)}
    {result ? <Card className={result.correct ? "border-[#1f6b4a]" : "border-[#e07a2f]"}><Badge className={result.correct ? "bg-[#1f6b4a]/15 text-[#1f6b4a]" : "bg-[#e07a2f]/15 text-[#c45c14]"}>{result.correct ? "Sound judgement" : "Targeted coaching"}</Badge><h2 className="mt-3 text-xl">{result.explanation}</h2><div className="mt-4 grid gap-3 text-sm md:grid-cols-2"><p><strong>Reasoning:</strong> {result.rubric.reasoning}</p><p><strong>Method:</strong> {result.rubric.method}</p><p><strong>Data quality:</strong> {result.rubric.data_quality}</p><p><strong>Interpretation:</strong> {result.rubric.interpretation}</p></div></Card> : null}
  </div>;
}
