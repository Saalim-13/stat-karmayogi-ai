import { saveProfile, saveTopics, type LearnerProfile, type SyllabusTopic } from "@/lib/learner";
import { saveAssessment } from "@/lib/progress";
import { setJourneys } from "@/lib/journey";
import { type LanguageCode } from "@/lib/i18n";
import type { AssessmentResult } from "@/lib/types";

export const DEMO_BANNER = "DEMO DATA · simulated competency journey for SIH presentation. Not official government statistics.";

export const PRIYA_BEFORE = { "D-SAM": 48, "D-QUA": 67, "F-DA": 42, "D-NSS": 72, "B-INT": 80, "F-DIG": 62 };
export const PRIYA_AFTER = { "D-SAM": 82, "D-QUA": 79, "F-DA": 68, "D-NSS": 80, "B-INT": 88, "F-DIG": 70 };
export const PRIYA_REQUIRED = { "D-SAM": 85, "D-QUA": 80, "F-DA": 75, "D-NSS": 85, "B-INT": 90, "F-DIG": 70 };
export const PRIYA_JOURNEY = { "D-SAM": [48, 61, 70, 78, 84] };

const defaultDate = new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10);

export function priyaProfile(): LearnerProfile {
  return {
    name: "Priya",
    role: "Statistical Officer",
    exam: "NSSTA capacity-building cycle",
    target_score: 85,
    exam_date: defaultDate,
    daily_minutes: 20,
    level: "Intermediate",
    confident: "Survey documentation",
    difficult: "Sampling, Regression",
    preferred_time: "Evening",
    preference: "Examples first",
    goal: "Score above 75%",
    language: "ta",
    learning_mode: "Bilingual",
  };
}

export function priyaTopics(): SyllabusTopic[] {
  return [
    { id: "sampling", subject: "Statistics", unit: "Sampling", title: "Stratified Sampling", importance: "High", status: "Weak", mastery: 48, quiz_score: 48, reviews: 0 },
    { id: "regression", subject: "Statistics", unit: "Regression", title: "Linear Regression & Correlation", importance: "High", status: "Weak", mastery: 42, reviews: 0 },
    { id: "quality", subject: "Official Statistics", unit: "Data quality", title: "GSBPM and Quality Assurance", importance: "High", status: "Learning", mastery: 67, quiz_score: 67, reviews: 0 },
    { id: "plfs", subject: "Official Statistics", unit: "Labour statistics", title: "PLFS, LFPR and CWS", importance: "High", status: "Practising", mastery: 72, quiz_score: 72, reviews: 1 },
    { id: "integrity", subject: "Official Statistics", unit: "Governance", title: "Confidentiality and Data Integrity", importance: "High", status: "Review", mastery: 80, quiz_score: 80, reviews: 1 },
    { id: "probability", subject: "Statistics", unit: "Probability", title: "Conditional Probability & Bayes Theorem", importance: "Medium", status: "Learning", mastery: 54, reviews: 0 },
  ];
}

export function priyaAssessment(): AssessmentResult {
  return {
    score: 51,
    correct: 5,
    total: 9,
    completed_at: new Date().toISOString(),
    competencies: [
      { competency_id: "D-SAM", correct: 0, total: 1, percent: 48, gap: 37, priority: "critical" },
      { competency_id: "D-QUA", correct: 1, total: 1, percent: 67, gap: 13, priority: "moderate" },
      { competency_id: "F-DA", correct: 0, total: 1, percent: 42, gap: 33, priority: "high" },
      { competency_id: "D-NSS", correct: 1, total: 1, percent: 72, gap: 13, priority: "moderate" },
      { competency_id: "B-INT", correct: 1, total: 1, percent: 80, gap: 10, priority: "moderate" },
      { competency_id: "F-DIG", correct: 1, total: 1, percent: 62, gap: 8, priority: "moderate" },
    ],
  };
}

export function loadPriyaDemo(setLanguage?: (code: LanguageCode) => void) {
  saveProfile(priyaProfile());
  saveTopics(priyaTopics());
  saveAssessment(priyaAssessment());
  setJourneys({ "D-SAM": [48], "D-QUA": [67], "F-DA": [42], "D-NSS": [72] });
  setLanguage?.("ta");
}

export function completePriyaIntervention() {
  setJourneys(PRIYA_JOURNEY);
  saveTopics(
    priyaTopics().map((topic) =>
      topic.id === "sampling" ? { ...topic, mastery: 82, status: "Mastered", quiz_score: 82 } : topic,
    ),
  );
}
