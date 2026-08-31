import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const STEPS = [
  ["TODAY", "Course completion"],
  ["NEXT", "Competency measurement"],
  ["NEXT", "Personalised AI learning"],
  ["NEXT", "Predictive competency"],
  ["NEXT", "Organisational competency intelligence"],
  ["FUTURE", "Continuous workforce capability development"],
];

export default function FuturePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#102f4f] p-8 text-white">
        <Badge className="bg-white/15 text-white">Future of capacity building</Badge>
        <h1 className="mt-3 text-4xl">Training becomes adaptive, measurable and evidence-driven</h1>
        <p className="mt-3 max-w-2xl text-white/75">This is a realistic product evolution, not science fiction. Each stage is already sketched in this demonstration architecture.</p>
      </section>
      <div className="space-y-3">
        {STEPS.map(([phase, label]) => (
          <Card key={label} className="flex items-center gap-4">
            <Badge>{phase}</Badge>
            <strong>{label}</strong>
          </Card>
        ))}
      </div>
    </div>
  );
}
