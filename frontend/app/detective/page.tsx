"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/utils";

type Row = Record<string, string>;
type Case = { rows: Row[]; codes: string[]; instructions: string };
type Result = { score: number; found: string[]; missed: string[]; extra: string[]; why_it_matters: string; planted: { code: string; row: string; detail: string }[] };
const labels: Record<string, string> = { duplicate_id: "Duplicate household ID", invalid_age: "Invalid age", inconsistent_state: "Inconsistent state format", invalid_category: "Invalid category", missing_value: "Missing value", invalid_format: "Invalid format", outlier: "Outlier" };

export default function DetectivePage() {
  const [data, setData] = useState<Case | null>(null); const [picked, setPicked] = useState<string[]>([]); const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { api<Case>("/api/intelligence/detective").then(setData).catch(() => setError("The detective needs the local backend running on port 8000.")); }, []);
  function toggle(code: string) { setPicked((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]); }
  async function evaluate() { try { setResult(await api<Result>("/api/intelligence/detective/evaluate", { method: "POST", body: JSON.stringify({ found_codes: picked }) })); } catch { setError("The case could not be evaluated. Try again once the backend is available."); } }
  return <div className="space-y-6"><section><Badge>Data Quality Detective · DEMO DATA</Badge><h1 className="mt-2 text-3xl">Find what could compromise a survey extract</h1><p className="mt-2 max-w-2xl text-[#3d4f63]">Inspect the synthetic microdata below, identify every issue you see, then compare your investigation to the quality checklist.</p></section>{error ? <Card className="border-[#b42318] text-sm text-[#b42318]">{error}</Card> : null}{data ? <><Card><p className="text-sm text-[#3d4f63]">{data.instructions}</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr>{Object.keys(data.rows[0]).map((key) => <th key={key} className="border-b border-[#d9d0c0] p-2">{key}</th>)}</tr></thead><tbody>{data.rows.map((row, i) => <tr key={`${row.id}-${i}`}>{Object.entries(row).map(([key, value]) => <td key={key} className="border-b border-[#e7e0d4] p-2">{value || <span className="text-[#b42318]">(blank)</span>}</td>)}</tr>)}</tbody></table></div></Card><Card><h2 className="text-xl">Your investigation</h2><div className="mt-4 grid gap-2 md:grid-cols-2">{data.codes.map((code) => <label key={code} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d9d0c0] p-3 text-sm"><input type="checkbox" checked={picked.includes(code)} onChange={() => toggle(code)} /><span>{labels[code] ?? code}</span></label>)}</div><Button className="mt-4" onClick={evaluate}>Evaluate my findings</Button></Card></> : null}{result ? <Card><Badge className="bg-[#16375c]/10 text-[#16375c]">{result.score}% of planted issues found</Badge><p className="mt-3 text-sm text-[#3d4f63]">{result.why_it_matters}</p><div className="mt-4 space-y-2">{result.planted.map((issue) => <div key={issue.code} className={`rounded-xl p-3 text-sm ${result.found.includes(issue.code) ? "bg-[#1f6b4a]/10" : "bg-[#e07a2f]/15"}`}><strong>{result.found.includes(issue.code) ? "Found" : "Missed"} · {labels[issue.code] ?? issue.code}</strong><span className="ml-2 text-[#3d4f63]">{issue.row}: {issue.detail}</span></div>)}</div></Card> : null}</div>;
}
