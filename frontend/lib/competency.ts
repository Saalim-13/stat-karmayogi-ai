import type { AssessmentResult, LearningProgress } from "@/lib/types";

export type RoleId = "statistical-officer" | "data-analyst" | "survey-officer" | "data-processing" | "research" | "training-hr";

export const ROLE_PROFILES: Record<RoleId, { label: string; description: string; targets: Record<string, number> }> = {
  "statistical-officer": {
    label: "Statistical Officer",
    description: "Produces, validates and interprets official statistics.",
    targets: { "D-NSS": 85, "D-SAM": 85, "D-QUA": 80, "F-DA": 75, "B-INT": 90, "F-DIG": 70 },
  },
  "data-processing": {
    label: "Data Entry / Processing",
    description: "Supports accurate capture, validation and processing of survey data.",
    targets: { "D-FLD": 80, "D-QUA": 80, "F-DIG": 75, "B-INT": 90, "D-SAM": 60 },
  },
  "research": {
    label: "Research role",
    description: "Interprets official statistics and documents methods transparently.",
    targets: { "F-DA": 85, "D-NSS": 75, "D-SAM": 75, "D-QUA": 80, "B-INT": 90 },
  },
  "training-hr": {
    label: "Training / HR role",
    description: "Designs capacity-building using competency evidence, not only completions.",
    targets: { "F-DA": 70, "D-QUA": 70, "B-INT": 85, "F-DIG": 70 },
  },
  "data-analyst": {
    label: "Data Analyst",
    description: "Transforms validated statistical data into reliable insight.",
    targets: { "F-DA": 85, "F-DIG": 80, "D-QUA": 75, "D-SAM": 70, "B-INT": 90, "D-NSS": 65 },
  },
  "survey-officer": {
    label: "Survey Officer",
    description: "Manages high-quality collection and survey-method implementation.",
    targets: { "D-SAM": 85, "D-NSS": 80, "D-FLD": 85, "D-QUA": 75, "B-INT": 90, "F-DIG": 65 },
  },
};

export type CompetencyInsight = {
  id: string;
  label: string;
  current: number;
  required: number;
  gap: number;
  priority: "Critical" | "High" | "Medium" | "On track";
  evidence: string;
};

const LABELS: Record<string, string> = {
  "D-NSS": "Official statistics / PLFS", "D-SAM": "Sampling methodology", "D-QUA": "Data quality / GSBPM",
  "F-DA": "Data analysis", "B-INT": "Data governance & integrity", "F-DIG": "Digital skills", "D-FLD": "Field operations",
};

export function buildCompetencyInsights(role: RoleId, assessment: AssessmentResult | null, progress: LearningProgress): CompetencyInsight[] {
  const baseline = new Map(assessment?.competencies.map((item) => [item.competency_id, item.percent]) ?? []);
  return Object.entries(ROLE_PROFILES[role].targets).map(([id, required]) => {
    const quiz = progress.competency_answers[id];
    const quizScore = quiz?.answered ? Math.round((quiz.correct / quiz.answered) * 100) : null;
    const diagnostic = baseline.get(id);
    const current = diagnostic !== undefined && quizScore !== null ? Math.round(diagnostic * 0.6 + quizScore * 0.4) : quizScore ?? diagnostic ?? 45;
    const gap = Math.max(0, required - current);
    const priority: CompetencyInsight["priority"] = gap >= 35 ? "Critical" : gap >= 20 ? "High" : gap > 0 ? "Medium" : "On track";
    const evidence = quizScore !== null ? `${quiz.correct}/${quiz.answered} recent practice answers` : diagnostic !== undefined ? "Diagnostic assessment result" : "Role baseline — complete an assessment";
    return { id, label: LABELS[id] ?? id, current, required, gap, priority, evidence };
  }).sort((a, b) => b.gap - a.gap);
}

export function overallCompetency(insights: CompetencyInsight[]) {
  return Math.round(insights.reduce((sum, item) => sum + item.current, 0) / insights.length);
}
