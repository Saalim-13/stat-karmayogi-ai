import { daysUntil, type LearnerProfile, type SyllabusTopic } from "@/lib/learner";
import type { LearningProgress } from "@/lib/types";

export type TwinSignal = { topic: SyllabusTopic; required: number; gap: number; importance: number; urgency: number; evidence: number; priority: number; forecast: string; intervention: string };

/** Transparent local demo orchestration. A production service can replace this module without changing the UI. */
export function buildDigitalTwin(profile: LearnerProfile, topics: SyllabusTopic[], progress: LearningProgress): TwinSignal[] {
  const days = daysUntil(profile.exam_date);
  const urgency = days <= 7 ? 100 : days <= 15 ? 85 : days <= 30 ? 70 : 55;
  const totalAnswers = Math.max(1, progress.questions_answered);
  return topics.map((topic) => {
    const required = topic.importance === "High" ? 80 : 70;
    const gap = Math.max(0, required - topic.mastery);
    const importance = topic.importance === "High" ? 95 : 65;
    const evidence = topic.quiz_score ?? (progress.questions_answered ? Math.round(progress.correct_answers / totalAnswers * 100) : 50);
    const priority = Math.round(gap * 0.48 + importance * 0.22 + urgency * 0.18 + (100 - evidence) * 0.12);
    const sessions = gap >= 35 ? 3 : gap >= 15 ? 2 : 1;
    const forecast = gap > 0 ? `Without intervention, this is estimated to remain ${gap} points below the role target by the deadline.` : "Currently on track for the required level; retain with a short revision.";
    const intervention = `${sessions} focused ${profile.daily_minutes >= 45 ? "30" : "20"}-minute session${sessions === 1 ? "" : "s"}, followed by adaptive practice and a retention check.`;
    return { topic, required, gap, importance, urgency, evidence, priority, forecast, intervention };
  }).sort((a, b) => b.priority - a.priority);
}

export function nextBestAction(profile: LearnerProfile, topics: SyllabusTopic[], progress: LearningProgress) {
  return buildDigitalTwin(profile, topics, progress)[0] ?? null;
}
