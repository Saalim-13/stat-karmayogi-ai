import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const LAYERS = [
  "USER",
  "PERSONALIZATION ENGINE",
  "COMPETENCY DIGITAL TWIN",
  "AI LEARNING ORCHESTRATOR",
  "KNOWLEDGE GRAPH",
  "DOCUMENT INTELLIGENCE",
  "ADAPTIVE ASSESSMENT",
  "MISCONCEPTION ENGINE",
  "REVISION ENGINE",
  "ANALYTICS",
  "ORGANIZATIONAL INTELLIGENCE",
  "iGOT INTEGRATION (MOCK)",
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <section>
        <Badge>Technical architecture</Badge>
        <h1 className="mt-2 text-3xl">How the platform thinks</h1>
        <p className="mt-2 max-w-2xl text-[#3d4f63]">Business logic lives in FastAPI services. The browser holds demo learner evidence. Official iGOT APIs are not invented.</p>
      </section>
      <div className="mx-auto max-w-md space-y-2">
        {LAYERS.map((layer, i) => (
          <div key={layer} className="text-center">
            <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${i === 2 ? "bg-[#e07a2f] text-white" : "bg-[#16375c] text-white"}`}>{layer}</div>
            {i < LAYERS.length - 1 ? <div className="py-1 text-[#e07a2f]">↓</div> : null}
          </div>
        ))}
      </div>
      <Card>
        <p className="text-sm text-[#3d4f63]">Services: CompetencyEngine, DigitalTwin, LearningOrchestrator, MisconceptionEngine, ImpactEngine, KnowledgeGraph, DocumentIntelligence, MockiGOTProvider, AuditService. Quizzes remain source-grounded Bloom rules when no LLM key is present.</p>
      </Card>
    </div>
  );
}
