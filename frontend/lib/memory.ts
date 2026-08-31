import { getProfile, getTopics } from "@/lib/learner";
import { getProgress, getRevisionItems } from "@/lib/progress";

const SESSIONS_KEY = "stat-karmayogi-study-sessions";
export type StudySession = { at: string; topic: string; correct: boolean };

export function rememberStudy(topic: string, correct: boolean) {
  if (typeof window === "undefined") return;
  const current = getStudySessions();
  const next = [{ at: new Date().toISOString(), topic, correct }, ...current].slice(0, 30);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
}

export function getStudySessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SESSIONS_KEY);
  try { return raw ? JSON.parse(raw) as StudySession[] : []; } catch { return []; }
}

export function learnerMemory() {
  const profile = getProfile();
  const topics = getTopics();
  const revisions = getRevisionItems();
  const progress = getProgress();
  const sessions = getStudySessions();
  const weak = topics.filter((item) => item.mastery < 60).sort((a, b) => a.mastery - b.mastery);
  return {
    name: profile?.name ?? "Learner",
    role: profile?.role ?? "Statistical Officer",
    language: profile?.language ?? "en",
    preference: profile?.preference ?? "Examples first",
    target: profile?.target_score ?? 85,
    daily_minutes: profile?.daily_minutes ?? 20,
    weak_topic: weak[0]?.title ?? "Sampling",
    mastery: weak[0]?.mastery ?? 45,
    mistakes: revisions.filter((item) => !item.completed).length,
    accuracy: progress.questions_answered ? Math.round(progress.correct_answers / progress.questions_answered * 100) : null,
    last_session: sessions[0] ?? null,
  };
}
