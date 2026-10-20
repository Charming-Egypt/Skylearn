export type LanguageCode = 'german' | 'italian' | 'russian';

export type CEFRLevel = 'A1' | 'A2' | 'B1';

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  transcription?: string; // e.g. phonetic in Arabic or IPA
  exampleSentence: string;
  exampleTranslation: string;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: {
    target: string;
    translation: string;
    highlight?: string;
  }[];
  tips?: string;
}

export type ExerciseType = 'multiple-choice' | 'sentence-builder' | 'fill-blank' | 'pronounce';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptTranslation?: string;
  hint?: string;
  audioText?: string;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SentenceBuilderExercise extends BaseExercise {
  type: 'sentence-builder';
  scrambledWords: string[];
  correctSentence: string;
  targetTranslation: string;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fill-blank';
  sentenceWithBlank: string; // e.g. "Ich ____ Student."
  correctWord: string;
  acceptableAnswers?: string[];
  translation: string;
}

export interface PronounceExercise extends BaseExercise {
  type: 'pronounce';
  phraseToPronounce: string;
  phoneticGuide: string;
  translation: string;
}

export type Exercise = 
  | MultipleChoiceExercise 
  | SentenceBuilderExercise 
  | FillBlankExercise 
  | PronounceExercise;

export interface DialogueLine {
  id: string;
  speaker: 'A' | 'B';
  speakerName: string;
  text: string;
  translation: string;
  audioText: string;
}

export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  location: string;
  lines: DialogueLine[];
  userRole?: 'A' | 'B';
}

export interface Lesson {
  id: string;
  languageId: LanguageCode;
  level: CEFRLevel;
  unitNumber: number;
  lessonNumber: number;
  title: string;
  titleArabic: string;
  description: string;
  durationMinutes: number;
  grammarRules: GrammarRule[];
  vocabulary: VocabularyItem[];
  exercises: Exercise[];
  conversations?: ConversationScenario[];
}

export interface PlacementQuestion {
  id: string;
  languageId: LanguageCode;
  levelTarget: CEFRLevel;
  question: string;
  translation?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: 'grammar' | 'vocabulary' | 'reading' | 'listening';
}

export interface PlacementResult {
  languageId: LanguageCode;
  score: number;
  totalQuestions: number;
  assignedLevel: CEFRLevel;
  levelSubtype: string; // e.g. "A1.1 متمكن"
  completedAt: string;
  categoryScores: {
    grammar: number;
    vocabulary: number;
    listening: number;
    reading: number;
  };
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: 'lessons' | 'exercises' | 'conversations' | 'vocab';
  target: number;
  current: number;
  xpReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  iconName: string;
}

export interface UserStats {
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedLessonIds: string[];
  savedWordIds: string[];
  placementResults: Record<LanguageCode, PlacementResult | null>;
  dailyGoalMinutes: number;
  reminderSettings: {
    enabled: boolean;
    reminderTime: string; // e.g. "18:00"
    notificationsAllowed: boolean;
  };
  dailyChallenges: DailyChallenge[];
  grandChallengeClaimedDate?: string;
}

