import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const CHAIN = ["TRAINING CONTENT", "LEARNING", "COMPETENCY", "MEASUREMENT", "CAPACITY BUILDING"];
const SCALE = ["INDIVIDUAL", "TEAM", "DEPARTMENT", "ORGANIZATION", "SYSTEM"];

export default function IndiaPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#102f4f] p-8 text-white">
        <Badge className="bg-white/15 text-white">Why this matters for India</Badge>
        <h1 className="mt-3 text-4xl">Completion is not competency</h1>
        <p className="mt-3 max-w-3xl text-white/75">India has a large and diverse public statistical workforce. Training cannot be judged only by whether an officer finished a course. The operational question is whether they possess the competency the role requires—in sampling, data quality, survey methods, and responsible use of statistics.</p>
      </section>
      <Card>
        <h2 className="text-xl">The national problem this demo addresses</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#3d4f63]">
          <li>Officers work across languages, roles and levels of statistical training.</li>
          <li>A finished iGOT module does not by itself show that Sampling is at the required level.</li>
          <li>Misconceptions (for example stratified vs cluster sampling) persist unless they are detected and retested.</li>
          <li>Departments need aggregate competency maps without exposing every individual record.</li>
        </ul>
      </Card>
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        {CHAIN.map((item, i) => (
          <span key={item} className="flex items-center gap-2">
            <span className="rounded-lg bg-[#16375c] px-3 py-2 text-white">{item}</span>
            {i < CHAIN.length - 1 ? <span className="text-[#e07a2f]">↓</span> : null}
          </span>
        ))}
      </div>
      <Card>
        <h2 className="text-xl">From one officer to official-statistics capacity</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {SCALE.map((item, index) => (
            <div key={item} className="rounded-xl border border-[#d9d0c0] p-3">
              <div className="text-xs text-[#c45c14]">{index + 1}</div>
              <strong>{item}</strong>
              <p className="mt-2 text-xs text-[#3d4f63]">
                {["Learner twin", "Team capability", "Department competency", "Workforce capability", "Official statistics capacity"][index]}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
