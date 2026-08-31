import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const FAQ = [
  ["Why AI?", "To orchestrate the next intervention from a living competency state—not to replace official manuals or invent estimates."],
  ["Why not a normal LMS?", "An LMS records completions. This twin records required vs current competency, misconceptions, retention and gap closure."],
  ["How is competency measured?", "Diagnostic percent blended with practice accuracy, compared with a configurable role target. Gap = required − current."],
  ["How does personalisation work?", "The orchestrator ranks gap, role importance, deadline urgency and recent evidence, then emits one next-best action."],
  ["How is this different from ChatGPT?", "Recommendations are deterministic services over learner evidence. Optional LLM text is bounded; quizzes require a source excerpt."],
  ["How do you prevent hallucinations?", "MCQs are generated from source sentences. Missing facts are not filled. Official numbers are never invented."],
  ["How do you validate generated questions?", "Each item carries excerpt, Bloom level, competency, learning objective and source reference. No excerpt, no question."],
  ["How does multilingual learning work?", "UI i18n plus a terminology glossary that keeps technical terms in English while explanations localise."],
  ["How does iGOT integration work?", "MockiGOTProvider implements the adapter. Live sync is disabled and labelled DEMO / MOCK until official APIs are authorised."],
  ["How does the platform scale?", "Individual twin → authorised aggregates for team/department. Same competency model, different privacy grain."],
  ["How is learner privacy protected?", "This demo stores evidence in the browser. Production would authenticate users and separate individual records from aggregates."],
  ["How is organisational data protected?", "The organisation view uses synthetic aggregates. No individual names appear on the heatmap."],
  ["How do you measure impact?", "Pre, post, retention, practice accuracy and gap-closure points. No fake rupee ROI."],
  ["What if the AI is wrong?", "Every recommendation has a WHY panel. Learners and admins can reject the next action; retests override forecasts."],
  ["How can departments deploy this?", "Start with role targets, diagnostic, twin, and the mock iGOT catalogue. Replace MockiGOTProvider when credentials exist."],
];

export default function FaqPage() {
  return (
    <div className="space-y-6">
      <section>
        <Badge>Judge FAQ</Badge>
        <h1 className="mt-2 text-3xl">Concise answers for the jury</h1>
      </section>
      <div className="space-y-3">
        {FAQ.map(([q, a]) => (
          <Card key={q}><strong>{q}</strong><p className="mt-2 text-sm text-[#3d4f63]">{a}</p></Card>
        ))}
      </div>
    </div>
  );
}
