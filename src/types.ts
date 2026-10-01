export interface CandidateData {
  resumeText: string;
  storyBankText: string;
  analysisSummary?: string;
  keyStrengths?: string[];
  weaknesses?: string[];
  missingPoints?: string[];
}

export interface JobPostingData {
  inputType: 'text' | 'link' | 'image';
  rawInput: string;
  companyName: string;
  jobTitle: string;
  industry: string;
  parsedSummary?: string;
}

export interface InterviewQuestionItem {
  id: number;
  question: string;
  source: string;
  period: string;
  status: '확인됨' | '추정';
  category?: string;
}

export interface QuestionCategoryGroup {
  categoryName: string;
  questionCount: number;
  questionIds: number[];
  importanceForCandidate: '매우 높음' | '높음' | '보통';
  analysisReason: string;
}

export interface DeepDiveData {
  question: string;
  evaluationIntent: string;
  strategy: {
    structure: string;
    mustInclude: string;
    mustAvoid: string;
  };
  experienceConnection: string;
  supplementaryQuestions?: string[];
  rawText?: string;
}

export interface AnswerVersion {
  versionId: 1 | 2 | 3 | 4 | 5;
  title: string;
  subTitle: string;
  spokenText: string;
  charCount: number;
  estimatedSeconds: number;
  recommendedSituation: string;
}

export interface TailQuestionItem {
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
  question: string;
  intentReason: string;
}

export interface TailQuestionsData {
  refinedAnswer: string;
  tailQuestions: TailQuestionItem[];
  rawText?: string;
}

export type ConsultingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
