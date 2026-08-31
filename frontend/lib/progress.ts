import type { AssessmentResult, CompetencyResult, LearningProgress, RevisionItem } from "@/lib/types";

const ASSESSMENT_KEY = "stat-karmayogi-assessment";
const PROGRESS_KEY = "stat-karmayogi-progress";
const REVISION_KEY = "stat-karmayogi-revisions";
const EMPTY_PROGRESS: LearningProgress = { quizzes_attempted: 0, questions_answered: 0, correct_answers: 0, competency_answers: {}, recorded_question_ids: [], recorded_quiz_ids: [] };

export function getAssessment(): AssessmentResult | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ASSESSMENT_KEY);
  return value ? JSON.parse(value) as AssessmentResult : null;
}
export function saveAssessment(result: AssessmentResult) { window.localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(result)); }
export function getProgress(): LearningProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  const value = window.localStorage.getItem(PROGRESS_KEY);
  return value ? { ...EMPTY_PROGRESS, ...JSON.parse(value) as LearningProgress } : EMPTY_PROGRESS;
}
export function recordQuizAnswer(quizId: string, questionId: string, competencyId: string | null | undefined, correct: boolean) {
  const progress = getProgress();
  if (progress.recorded_question_ids.includes(questionId)) return;
  const value = competencyId ? progress.competency_answers[competencyId] ?? { answered: 0, correct: 0 } : null;
  const next: LearningProgress = { ...progress, quizzes_attempted: progress.recorded_quiz_ids.includes(quizId) ? progress.quizzes_attempted : progress.quizzes_attempted + 1, questions_answered: progress.questions_answered + 1, correct_answers: progress.correct_answers + Number(correct), competency_answers: competencyId && value ? { ...progress.competency_answers, [competencyId]: { answered: value.answered + 1, correct: value.correct + Number(correct) } } : progress.competency_answers, recorded_question_ids: [...progress.recorded_question_ids, questionId], recorded_quiz_ids: progress.recorded_quiz_ids.includes(quizId) ? progress.recorded_quiz_ids : [...progress.recorded_quiz_ids, quizId] };
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
}

export function getRevisionItems(): RevisionItem[] {
  if (typeof window === "undefined") return [];
  const value = window.localStorage.getItem(REVISION_KEY);
  return value ? JSON.parse(value) as RevisionItem[] : [];
}

export function saveIncorrectQuestion(item: Omit<RevisionItem, "created_at" | "reviews_completed" | "completed">) {
  const existing = getRevisionItems();
  if (existing.some((saved) => saved.id === item.id)) return;
  const next = [{ ...item, created_at: new Date().toISOString(), reviews_completed: 0, completed: false }, ...existing];
  window.localStorage.setItem(REVISION_KEY, JSON.stringify(next));
}

export function markRevisionReviewed(id: string) {
  const next = getRevisionItems().map((item) => item.id === id ? { ...item, reviews_completed: item.reviews_completed + 1, completed: item.reviews_completed + 1 >= 3 } : item);
  window.localStorage.setItem(REVISION_KEY, JSON.stringify(next));
}

export function activeRevisionCount() { return getRevisionItems().filter((item) => !item.completed).length; }

export function revisionDue(item: RevisionItem) {
  if (item.completed) return "Completed";
  const offsets = [1, 3, 7];
  const due = new Date(item.created_at);
  due.setDate(due.getDate() + offsets[item.reviews_completed]);
  return due <= new Date() ? "Due now" : `Upcoming · ${due.toLocaleDateString()}`;
}
export function buildAssessmentResult(answers: Record<string, number>, questions: { id: string; competency_id: string; correct_index: number }[]): AssessmentResult {
  const grouped = new Map<string, { correct: number; total: number }>();
  questions.forEach((question) => { const item = grouped.get(question.competency_id) ?? { correct: 0, total: 0 }; item.total += 1; item.correct += Number(answers[question.id] === question.correct_index); grouped.set(question.competency_id, item); });
  const competencies: CompetencyResult[] = [...grouped].map(([competency_id, value]) => { const percent = Math.round(value.correct / value.total * 100); const priority = percent === 100 ? "met" : percent >= 60 ? "moderate" : percent > 0 ? "high" : "critical"; return { competency_id, ...value, percent, gap: Math.max(0, 2 - value.correct / value.total * 2), priority }; });
  const correct = competencies.reduce((sum, item) => sum + item.correct, 0);
  return { score: Math.round(correct / questions.length * 100), correct, total: questions.length, completed_at: new Date().toISOString(), competencies };
}
