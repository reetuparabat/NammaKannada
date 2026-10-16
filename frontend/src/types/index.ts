// API Response Types for NammaKannada

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  scenario_count: number;
}

export interface Scenario {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string;
  learning_objectives: string | null;
  estimated_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  display_order: number;
  phrase_count: number;
}

export interface Phrase {
  id: number;
  scenario_id: number;
  kannada_text: string;
  english_meaning: string;
  transliteration: string;
  context: string | null;
  example: string | null;
  formality_note: string | null;
  status: string;
  display_order: number;
}

export interface PhraseSearchResult {
  id: number;
  scenario_id: number;
  kannada_text: string;
  english_meaning: string;
  transliteration: string;
  context: string | null;
  scenario_title: string | null;
  category_name: string | null;
}

export interface ConversationOption {
  id: number;
  option_text: string;
  option_kannada: string | null;
  option_transliteration: string | null;
  next_step_id: number | null;
  display_order: number;
}

export interface ConversationStep {
  id: number;
  speaker: string;
  message: string;
  message_kannada: string | null;
  message_transliteration: string | null;
  step_type: 'prompt' | 'choice' | 'end';
  display_order: number;
  options: ConversationOption[];
}

export interface Conversation {
  id: number;
  scenario_id: number;
  title: string;
  description: string | null;
  start_step_id: number | null;
  steps: ConversationStep[];
}

export interface QuizOption {
  id: number;
  option_text: string;
  option_kannada: string | null;
  display_order: number;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  question_kannada: string | null;
  question_type: string;
  display_order: number;
  options: QuizOption[];
}

export interface Quiz {
  scenario_id: number;
  questions: QuizQuestion[];
  total_questions: number;
}

export interface QuizAnswerResult {
  question_id: number;
  selected_option_id: number;
  is_correct: boolean;
  correct_option_id: number;
  explanation: string | null;
  question_text: string;
}

export interface QuizResult {
  scenario_id: number;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  answers: QuizAnswerResult[];
}

// Local storage types
export interface SavedPhrase {
  phraseId: number;
  kannadaText: string;
  englishMeaning: string;
  transliteration: string;
  context: string | null;
  scenarioTitle: string | null;
  categoryName: string | null;
  savedAt: string;
}

export interface ScenarioProgress {
  scenarioId: number;
  scenarioTitle: string;
  categoryName: string;
  completedConversation: boolean;
  completedQuiz: boolean;
  quizScore: number | null;
  quizTotal: number | null;
  lastAccessedAt: string;
}

export interface OfflineContent {
  version: string;
  generated_at: string;
  categories: OfflineCategory[];
}

export interface OfflineCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  scenarios: OfflineScenario[];
}

export interface OfflineScenario {
  id: number;
  title: string;
  slug: string;
  phrases: OfflinePhrase[];
}

export interface OfflinePhrase {
  id: number;
  kannada_text: string;
  english_meaning: string;
  transliteration: string;
  context: string | null;
}
