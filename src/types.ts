export type TargetLanguage = 'roman_urdu' | 'urdu' | 'english';

export type SourceType = 'youtube' | 'file' | 'transcript' | 'recording' | 'drive';

export interface TechnicalConcept {
  term: string;
  explanation: string;
}

export interface Chapter {
  timestamp: string;
  title: string;
  summary: string;
}

export interface QuizQuestion {
  question: string;
  answer: string;
}

export interface TranscriptSegment {
  timestamp: string;
  speaker?: string;
  text: string;
}

export interface StudyNoteBlock {
  topic: string;
  timestamp?: string;
  content: string;
  keyBulletPoints?: string[];
}

export interface SummaryData {
  title: string;
  overview: string;
  keyTakeaways: string[];
  fullTranscript?: TranscriptSegment[];
  rawTranscriptText?: string;
  studyNotes?: StudyNoteBlock[];
  technicalConcepts?: TechnicalConcept[];
  chapters?: Chapter[];
  actionableRules?: string[];
  conclusion: string;
  quizQuestions?: QuizQuestion[];
  wordCount?: number;
}

export interface SummaryMeta {
  type: SourceType;
  targetLanguage: TargetLanguage;
  summaryStyle?: string;
  fileName: string;
  analyzedAt: string;
  duration?: string;
  sourceUrl?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  targetLanguage: TargetLanguage;
  sourceType: SourceType;
  fileName: string;
  analyzedAt: string;
  data: SummaryData;
}

export interface PresetItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  sourceType: string;
  targetLanguage: TargetLanguage;
  description: string;
  data?: SummaryData;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
