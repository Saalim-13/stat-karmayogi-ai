export type LearningPreference = "Quick explanations" | "Detailed explanations" | "Examples first" | "Practice first" | "Visual learning" | "Revision focused";
export type TopicStatus = "Not started" | "Learning" | "Practising" | "Weak" | "Review" | "Mastered";
export type LearnerProfile = { name: string; role: string; exam: string; target_score: number; exam_date: string; daily_minutes: number; level: string; confident: string; difficult: string; preferred_time: string; preference: LearningPreference; goal: string; language?: string; learning_mode?: "English" | "Selected language" | "Bilingual" };
export type SyllabusTopic = { id: string; subject: string; unit: string; title: string; importance: "High" | "Medium"; status: TopicStatus; mastery: number; quiz_score?: number; reviews: number };

const PROFILE_KEY = "stat-karmayogi-learner-profile";
const SYLLABUS_KEY = "stat-karmayogi-syllabus";
export const preferences: LearningPreference[] = ["Quick explanations", "Detailed explanations", "Examples first", "Practice first", "Visual learning", "Revision focused"];
export const defaultTopics: SyllabusTopic[] = [
  { id: "probability", subject: "Statistics", unit: "Probability", title: "Conditional Probability & Bayes Theorem", importance: "High", status: "Weak", mastery: 42, quiz_score: 45, reviews: 0 },
  { id: "sampling", subject: "Statistics", unit: "Sampling", title: "Stratified Sampling", importance: "High", status: "Learning", mastery: 54, quiz_score: 50, reviews: 0 },
  { id: "regression", subject: "Statistics", unit: "Regression", title: "Linear Regression & Correlation", importance: "High", status: "Not started", mastery: 0, reviews: 0 },
  { id: "plfs", subject: "Official Statistics", unit: "Labour statistics", title: "PLFS, LFPR and CWS", importance: "Medium", status: "Practising", mastery: 68, quiz_score: 70, reviews: 1 },
  { id: "quality", subject: "Official Statistics", unit: "Data quality", title: "GSBPM and Quality Assurance", importance: "Medium", status: "Review", mastery: 74, quiz_score: 80, reviews: 1 },
  { id: "integrity", subject: "Official Statistics", unit: "Governance", title: "Confidentiality and Data Integrity", importance: "High", status: "Mastered", mastery: 88, quiz_score: 90, reviews: 2 },
];

export function getProfile(): LearnerProfile | null { if (typeof window === "undefined") return null; const raw = localStorage.getItem(PROFILE_KEY); return raw ? JSON.parse(raw) as LearnerProfile : null; }
export function saveProfile(profile: LearnerProfile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
export function getTopics(): SyllabusTopic[] { if (typeof window === "undefined") return defaultTopics; const raw = localStorage.getItem(SYLLABUS_KEY); return raw ? JSON.parse(raw) as SyllabusTopic[] : defaultTopics; }
export function saveTopics(topics: SyllabusTopic[]) { localStorage.setItem(SYLLABUS_KEY, JSON.stringify(topics)); }
export function updateTopic(id: string, update: Partial<SyllabusTopic>) { const next = getTopics().map((topic) => topic.id === id ? { ...topic, ...update } : topic); saveTopics(next); return next; }
export function daysUntil(date: string) { const value = new Date(`${date}T23:59:59`); return Math.max(0, Math.ceil((value.getTime() - Date.now()) / 86400000)); }
export function readiness(topics: SyllabusTopic[]) { return Math.round(topics.reduce((sum, topic) => sum + topic.mastery, 0) / topics.length); }
export function nextAction(topics: SyllabusTopic[]) { return [...topics].sort((a, b) => (b.importance === "High" ? 20 : 0) + (100 - b.mastery) - ((a.importance === "High" ? 20 : 0) + (100 - a.mastery)))[0]; }
export function topicStatus(mastery: number): TopicStatus { return mastery >= 80 ? "Mastered" : mastery >= 70 ? "Review" : mastery >= 55 ? "Practising" : mastery > 0 ? "Learning" : "Not started"; }
const competencyTopic: Record<string, string> = { "D-SAM": "sampling", "D-NSS": "plfs", "D-QUA": "quality", "B-INT": "integrity" };
export function recordTopicQuizEvidence(competencyId: string | null | undefined, correct: boolean) {
  const id = competencyId ? competencyTopic[competencyId] : undefined;
  if (!id) return;
  const topic = getTopics().find((item) => item.id === id);
  if (!topic) return;
  const mastery = Math.max(0, Math.min(100, topic.mastery + (correct ? 3 : -1)));
  updateTopic(id, { mastery, quiz_score: Math.round(((topic.quiz_score ?? topic.mastery) + (correct ? 100 : 0)) / 2), status: correct ? topicStatus(mastery) : mastery < 55 ? "Weak" : topicStatus(mastery) });
}
