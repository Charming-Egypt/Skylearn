import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Volume2,
  CheckCircle2,
  Bookmark,
  Sparkles,
  HelpCircle,
  PlayCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { Lesson, LanguageCode } from '../types';
import { speakText, sounds } from '../utils/speech';
import { ExerciseEngine } from './ExerciseEngine';

interface LessonViewerProps {
  lesson: Lesson;
  languageId: LanguageCode;
  isCompleted: boolean;
  savedWordIds: string[];
  onToggleSaveWord: (wordId: string) => void;
  onCompleteLesson: (lessonId: string) => void;
  onBackToCourseList: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  languageId,
  isCompleted,
  savedWordIds,
  onToggleSaveWord,
  onCompleteLesson,
  onBackToCourseList,
}) => {
  const [activeTab, setActiveTab] = useState<'grammar' | 'vocab' | 'exercises'>('grammar');
  const [playingAudioText, setPlayingAudioText] = useState<string | null>(null);

  const handlePlayAudio = (text: string) => {
    setPlayingAudioText(text);
    speakText(text, languageId).then(() => {
      setPlayingAudioText(null);
    });
  };

  const handleFinishExercises = (score: number) => {
    onCompleteLesson(lesson.id);
    setActiveTab('grammar');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 overflow-x-hidden">
      {/* Lesson Navigation Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBackToCourseList}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-900 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لقائمة الدروس</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-900 font-extrabold text-xs rounded-lg">
            المستوى {lesson.level}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>مكتمل</span>
            </span>
          )}
        </div>
      </div>

      {/* Lesson Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-200 mb-2">
            <Layers className="w-4 h-4" />
            <span>الوحدة {lesson.unitNumber} • الدرس {lesson.lessonNumber}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.durationMinutes} دقيقة</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans',sans-serif] mb-1">
            {lesson.title}
          </h1>
          <h2 className="text-base sm:text-lg font-bold text-amber-300 mb-3">
            {lesson.titleArabic}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
            {lesson.description}
          </p>

          {/* Quick Audio Play Button for Lesson Title */}
          <button
            onClick={() => handlePlayAudio(lesson.title)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/20 shadow-xs"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>استمع لنطق عنوان الدرس</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'grammar'
              ? 'bg-white text-blue-950 shadow-xs scale-101'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الشرح والقواعد ({lesson.grammarRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'vocab'
              ? 'bg-white text-blue-950 shadow-xs scale-101'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>المفردات والنطق ({lesson.vocabulary.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'exercises'
              ? 'bg-blue-900 text-white shadow-xs scale-101'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>التمارين التفاعلية ({lesson.exercises.length})</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* TAB 1: GRAMMAR & EXPLANATIONS */}
      {/* ========================================= */}
      {activeTab === 'grammar' && (
        <div className="space-y-6">
          {lesson.grammarRules.map((rule, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{rule.title}</h3>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{rule.explanation}</p>

              {/* Examples Grid */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  أمثلة ونماذج تطبيقية:
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {rule.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-right"
                    >
                      <div className="flex-1">
                        <div className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                          {ex.target}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{ex.translation}</div>
                      </div>

                      <button
                        onClick={() => handlePlayAudio(ex.target)}
                        className="p-2 bg-white border border-slate-200 hover:bg-blue-50 text-blue-800 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {rule.tips && (
                <div className="p-3.5 bg-amber-50 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{rule.tips}</p>
                </div>
              )}
            </div>
          ))}

          {/* Action to Jump to Exercises */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-blue-950">هل استوعبت القواعد؟</h4>
              <p className="text-xs text-slate-600">اختبر فهمك عبر التمارين التفاعلية ونظام النطق الصوتي.</p>
            </div>
            <button
              onClick={() => setActiveTab('exercises')}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              ابدأ التمارين التفاعلية
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 2: VOCABULARY */}
      {/* ========================================= */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.vocabulary.map((vocab) => {
              const isSaved = savedWordIds.includes(vocab.id);
              return (
                <div
                  key={vocab.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        {vocab.word}
                      </div>
                      {vocab.transcription && (
                        <div className="text-xs font-bold text-amber-700">
                          نطق: [{vocab.transcription}]
                        </div>
                      )}
                      <div className="text-sm font-bold text-blue-900 mt-1">{vocab.translation}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePlayAudio(vocab.word)}
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-blue-50 text-blue-800 rounded-xl transition-colors cursor-pointer"
                        title="استمع للنطق"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleSaveWord(vocab.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                          isSaved
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title={isSaved ? 'محفوظة في بنك الكلمات' : 'حفظ الكلمة'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Example Sentence */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-right space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                        {vocab.exampleSentence}
                      </span>
                      <button
                        onClick={() => handlePlayAudio(vocab.exampleSentence)}
                        className="text-slate-400 hover:text-blue-700"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-slate-500">{vocab.exampleTranslation}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 3: EXERCISES */}
      {/* ========================================= */}
      {activeTab === 'exercises' && (
        <ExerciseEngine
          exercises={lesson.exercises}
          languageId={languageId}
          onCompleteAll={handleFinishExercises}
          onExit={() => setActiveTab('grammar')}
        />
      )}

      {/* Complete Lesson CTA */}
      {!isCompleted && activeTab !== 'exercises' && (
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => onCompleteLesson(lesson.id)}
            className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-950" />
            <span>تحديد الدرس كمكتمل (+50 XP)</span>
          </button>
        </div>
      )}
    </div>
  );
};
