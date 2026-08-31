export type Bloom = "Remember" | "Understand" | "Apply" | "Analyse";

export type Mcq = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  bloom: Bloom;
  competency_id?: string | null;
  source_excerpt: string;
  topic?: string | null;
  difficulty?: string | null;
  learning_objective?: string | null;
  source_reference?: string | null;
};

export type Quiz = {
  id: string;
  title: string;
  source_name: string;
  questions: Mcq[];
  competency_ids: string[];
  engine: string;
};

export type Course = {
  id: string;
  title: string;
  provider: string;
  duration_hours: number;
  level: string;
  competency_ids: string[];
  description: string;
  igot_url: string;
  credits: number;
};

export type Recommendation = {
  course: Course;
  score: number;
  why: string;
};

export type Gap = {
  competency_id: string;
  gap: number;
  priority: "critical" | "high" | "moderate" | "met";
};

export type AssessmentQuestion = { id: string; competency_id: string; domain: string; question: string; options: string[]; correct_index: number };
export type CompetencyResult = { competency_id: string; correct: number; total: number; percent: number; gap: number; priority: Gap["priority"] };
export type AssessmentResult = { score: number; correct: number; total: number; completed_at: string; competencies: CompetencyResult[] };
export type LearningProgress = { quizzes_attempted: number; questions_answered: number; correct_answers: number; competency_answers: Record<string, { answered: number; correct: number }>; recorded_question_ids: string[]; recorded_quiz_ids: string[] };
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type RevisionItem = { id: string; question: string; options: string[]; correct_index: number; competency_id: string | null; explanation: string; created_at: string; reviews_completed: number; completed: boolean };
export type ScenarioQuestion = { id: string; competency_id: string; domain: string; question: string; options: string[]; correct_index: number; explanation: string };
export type AssistantReply = { answer: string; competency_id: string | null; next_action: string; ai_available: boolean };

export const DEMO_GAPS: Gap[] = [
  { competency_id: "D-NSS", gap: 2, priority: "critical" },
  { competency_id: "D-SAM", gap: 2, priority: "high" },
  { competency_id: "F-DIG", gap: 1, priority: "moderate" },
  { competency_id: "B-INT", gap: 1, priority: "moderate" },
];

export const SAMPLE_NOTES = `The Periodic Labour Force Survey (PLFS) is the principal source of labour-force statistics for India. LFPR is the labour force participation rate. Current weekly status (CWS) is distinct from usual principal status. GSBPM is the Generic Statistical Business Process Model used to document production steps. CPI is the consumer price index used for inflation monitoring. Unit-level records remain confidential under the Collection of Statistics Act. CAPI devices support field canvassing with in-built consistency checks. Sampling weights convert sample counts into population estimates for NSS and PLFS rounds. SDMX is used to exchange statistical metadata across agencies.`;

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { id: "labour-1", competency_id: "D-NSS", domain: "Labour / PLFS", question: "What does LFPR measure?", options: ["Share of the population in the labour force", "Share of workers in manufacturing", "Change in consumer prices", "Government revenue"], correct_index: 0 },
  { id: "labour-2", competency_id: "D-NSS", domain: "Labour / PLFS", question: "Which source is central to labour-force statistics in India?", options: ["PLFS", "WPI", "Economic Survey only", "GST returns only"], correct_index: 0 },
  { id: "sampling-1", competency_id: "D-SAM", domain: "Sampling", question: "Why are sampling weights used in surveys?", options: ["To convert sample findings into population estimates", "To remove all fieldwork", "To publish respondent names", "To replace questionnaires"], correct_index: 0 },
  { id: "prices-1", competency_id: "D-PRI", domain: "Prices", question: "CPI is most commonly used to monitor what?", options: ["Consumer price inflation", "Industrial production", "Labour participation", "Fiscal deficit"], correct_index: 0 },
  { id: "quality-1", competency_id: "D-QUA", domain: "Quality / GSBPM", question: "What does GSBPM help statistical organisations do?", options: ["Document and improve production processes", "Calculate tax liabilities", "Replace all data standards", "Identify citizens"], correct_index: 0 },
  { id: "integrity-1", competency_id: "B-INT", domain: "Data confidentiality", question: "How should unit-level survey records be handled?", options: ["Protected and used only under approved rules", "Shared publicly with names", "Sent through personal messaging apps", "Deleted before validation"], correct_index: 0 },
  { id: "field-1", competency_id: "D-FLD", domain: "Field operations", question: "A key benefit of CAPI field collection is that it can provide:", options: ["In-built consistency checks", "Automatic census coverage", "No need for training", "Public disclosure of records"], correct_index: 0 },
  { id: "digital-1", competency_id: "F-DIG", domain: "Digital skills", question: "SDMX supports agencies by enabling exchange of:", options: ["Statistical data and metadata", "Personal passwords", "Only printed reports", "Tax payments"], correct_index: 0 },
  { id: "analytics-1", competency_id: "F-DA", domain: "Analytics", question: "Which practice supports evidence-based governance?", options: ["Using validated data and transparent analysis", "Choosing results before analysis", "Ignoring quality checks", "Sharing confidential microdata"], correct_index: 0 },
];

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  { id: "scenario-plfs", competency_id: "D-NSS", domain: "PLFS / labour", question: "A field investigator records a respondent as both unemployed and working full-time in the same reference week. What should happen before submission?", options: ["Review the response with the respondent and resolve the inconsistency", "Submit both values without checking", "Delete the household from the sample", "Publish the record immediately"], correct_index: 0, explanation: "Labour-status responses should be verified using the survey definitions before submission." },
  { id: "scenario-sampling", competency_id: "D-SAM", domain: "Sampling", question: "A team wants to replace a selected household because it is difficult to reach. What is the correct action?", options: ["Follow the approved substitution and callback protocol", "Replace it with the nearest household", "Remove it without recording the reason", "Ask another respondent to answer for it"], correct_index: 0, explanation: "Unplanned substitutions can bias a sample; approved field procedures must be followed." },
  { id: "scenario-cpi", competency_id: "D-PRI", domain: "CPI / prices", question: "A price collector finds a product unavailable at an outlet. What should they do?", options: ["Use the approved item-replacement procedure and document it", "Guess last month's price", "Use a price from any unrelated product", "Skip the whole market"], correct_index: 0, explanation: "Consistent approved replacement rules protect price-index quality." },
  { id: "scenario-confidentiality", competency_id: "B-INT", domain: "Confidentiality", question: "A colleague asks you to send unit-level survey records to a personal email for convenience. What should you do?", options: ["Use only approved secure channels and decline the personal-email request", "Send the file if the colleague promises privacy", "Share a screenshot instead", "Upload it to a public drive"], correct_index: 0, explanation: "Unit-level records require protection and approved handling channels." },
  { id: "scenario-capi", competency_id: "D-FLD", domain: "Field operations", question: "A CAPI form flags an impossible age value. What is the best next step?", options: ["Verify the answer with the respondent and correct it if needed", "Disable the validation check", "Leave it because the device accepted it", "Change it to a random value"], correct_index: 0, explanation: "CAPI checks are prompts for verification, not errors to ignore." },
  { id: "scenario-gsbpm", competency_id: "D-QUA", domain: "GSBPM / quality", question: "A team wants to identify where errors enter its survey production process. How can GSBPM help?", options: ["Map each production step and review quality controls", "Focus only on publication", "Remove documentation", "Use a single final check only"], correct_index: 0, explanation: "GSBPM makes the end-to-end production process visible for quality improvement." },
  { id: "scenario-sdmx", competency_id: "F-DIG", domain: "SDMX", question: "Two agencies are exchanging statistical indicators with different field names. What should they use to improve interoperability?", options: ["Shared SDMX metadata and agreed data structures", "Screenshots of spreadsheets", "Unlabelled files", "Personal messaging apps"], correct_index: 0, explanation: "SDMX supports consistent exchange of statistical data and metadata." },
  { id: "scenario-analytics", competency_id: "F-DA", domain: "Analytics", question: "Before presenting a trend to decision-makers, what should an analyst do?", options: ["Validate the data, method, and limitations", "Choose the most dramatic chart", "Remove inconvenient observations without explanation", "Use unverified source figures"], correct_index: 0, explanation: "Evidence-based analysis requires validation and transparent limitations." },
];
