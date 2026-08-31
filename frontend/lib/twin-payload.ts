import { getProfile, getTopics } from "@/lib/learner";
import { getAssessment, getProgress } from "@/lib/progress";
import { getJourneys } from "@/lib/journey";
import type { RoleId } from "@/lib/competency";
import { ROLE_PROFILES } from "@/lib/competency";

const ROLE_MAP: Record<string, RoleId> = {
  "Statistical Officer": "statistical-officer",
  "Survey Officer": "survey-officer",
  "Data Analyst": "data-analyst",
  "Data Entry / Processing": "data-processing",
  "Research role": "research",
  "Training / HR role": "training-hr",
};

export function diagnosticsFromLocal(): Record<string, number> {
  const assessment = getAssessment();
  const out: Record<string, number> = {};
  assessment?.competencies.forEach((item) => {
    out[item.competency_id] = item.percent;
  });
  return out;
}

export function practiceFromLocal(): Record<string, number> {
  const progress = getProgress();
  const out: Record<string, number> = {};
  Object.entries(progress.competency_answers).forEach(([id, value]) => {
    if (value.answered) out[id] = Math.round((value.correct / value.answered) * 100);
  });
  return out;
}

export function twinPayload() {
  const profile = getProfile();
  const role = profile?.role ?? "Statistical Officer";
  const mapped = ROLE_MAP[role] ?? "statistical-officer";
  return {
    name: profile?.name ?? "Learner",
    role,
    language: profile?.language ?? "en",
    daily_minutes: profile?.daily_minutes ?? 20,
    diagnostics: diagnosticsFromLocal(),
    practice: practiceFromLocal(),
    journeys: getJourneys(),
    custom_targets: ROLE_PROFILES[mapped]?.targets,
  };
}
