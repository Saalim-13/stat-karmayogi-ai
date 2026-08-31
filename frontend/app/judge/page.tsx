"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadPriyaDemo } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";

const STEPS = [
  { n: 1, title: "Create learner Priya", href: "/onboarding", action: "demo" as const },
  { n: 2, title: "Language: Tamil", href: "/twin", action: "demo" as const },
  { n: 3, title: "Role: Statistical Officer", href: "/twin", action: "none" as const },
  { n: 4, title: "Target 85%", href: "/twin", action: "none" as const },
  { n: 5, title: "Syllabus in the twin", href: "/syllabus", action: "none" as const },
  { n: 6, title: "Diagnostic assessment", href: "/assessment", action: "none" as const },
  { n: 7, title: "Competency Digital Twin", href: "/twin", action: "none" as const },
  { n: 8, title: "Critical gap: Sampling 48%", href: "/twin", action: "none" as const },
  { n: 9, title: "What should I study now?", href: "/twin", action: "none" as const },
  { n: 10, title: "20-minute Tamil session", href: "/loop", action: "none" as const },
  { n: 11, title: "Teach → practice → quiz", href: "/loop", action: "none" as const },
  { n: 12, title: "Misconception → revision → retest", href: "/loop", action: "none" as const },
  { n: 13, title: "48% → 82%", href: "/impact", action: "none" as const },
  { n: 14, title: "What changed?", href: "/impact", action: "none" as const },
  { n: 15, title: "Organisation heatmap", href: "/admin", action: "none" as const },
  { n: 16, title: "iGOT mock architecture", href: "/igot", action: "none" as const },
];

export default function JudgePage() {
  const { setLanguage } = useI18n();
  const [step, setStep] = useState(0);
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#102f4f] p-8 text-white">
        <Badge className="bg-white/15 text-white">SIH judge mode · 3–5 minutes</Badge>
        <h1 className="mt-3 text-4xl">STAT KARMAYOGI AI</h1>
        <p className="mt-2 text-lg text-white/80">AI-Powered Competency Intelligence & Capacity-Building Platform</p>
        <p className="mt-4 max-w-2xl text-sm text-white/70">Stat Karmayogi AI moves workforce training from course completion to measurable competency improvement.</p>
        <Button className="mt-5" onClick={() => { loadPriyaDemo(setLanguage); setStep(6); }}>Load Priya and open the Twin</Button>
      </section>
      <Card>
        <h2 className="text-xl">Guided demonstration</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {STEPS.map((item, index) => (
            <div key={item.n} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${index === step ? "border-[#e07a2f] bg-[#fff6ee]" : "border-[#d9d0c0]"}`}>
              <span className="text-sm"><strong>{item.n}.</strong> {item.title}</span>
              <Link href={item.href}><Button variant="secondary" onClick={() => { if (item.action === "demo") loadPriyaDemo(setLanguage); setStep(index); }}>Open</Button></Link>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-sm text-[#3d4f63]">The sentence to leave with: this is not merely an AI learning platform. It is an AI system that understands workforce competency and continuously works to close the gap.</p>
      </Card>
    </div>
  );
}
