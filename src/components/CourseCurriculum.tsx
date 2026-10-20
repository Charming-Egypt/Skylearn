import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  Volume2,
  Sparkles,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { LanguageCode, CEFRLevel, Lesson } from '../types';
import { ALL_LESSONS, LANGUAGES } from '../data/curriculum';
import { speakText } from '../utils/speech';

interface CourseCurriculumProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  completedLessonIds: string[];
  onOpenLesson: (lesson: Lesson) => void;
  onOpenPlacementTest: (language: LanguageCode) => void;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  selectedLanguage,
  onSelectLanguage,
  completedLessonIds,
  onOpenLesson,
  onOpenPlacementTest,
}) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');

  const lessons = ALL_LESSONS[selectedLanguage] || [];
  const langMeta = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

  const filteredLessons = lessons.filter((l) => {
    if (levelFilter === 'ALL') return true;
    return l.level === levelFilter;
  });

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text, selectedLanguage);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Course Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-5 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{langMeta.flag}</span>
            <h1 className="text-xl sm:text-3xl font-black">
              كورس اللغة {langMeta.nameArabic} الشامل
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
            {langMeta.description} يشمل منهج المستويات من A1 حتى B1 مع النطق والقواعد والتمارين.
          </p>
        </div>

        {/* Action Button: Placement Test */}
        <button
          onClick={() => onOpenPlacementTest(selectedLanguage)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
        >
          <Award className="w-4 h-4 text-blue-950" />
          <span>اختبار قياس مستواك في {langMeta.nameArabic}</span>
        </button>
      </div>

      {/* Language Selector Strip */}
      <div className="w-full max-w-full flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
        {LANGUAGES.map((lang) => {
          const isActive = selectedLanguage === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => onSelectLanguage(lang.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-900 text-white shadow-xs scale-101'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.nameArabic}</span>
              <span className="text-xs opacity-75 font-['Plus_Jakarta_Sans',sans-serif]">({lang.nameNative})</span>
            </button>
          );
        })}
      </div>

      {/* Level Filter Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['ALL', 'A1', 'A2', 'B1'] as const).map((lvl) => {
            const isActive = levelFilter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'ALL' ? 'جميع المستويات' : `مستوى ${lvl}`}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 font-semibold">
          عدد الدروس: {filteredLessons.length} دروس حقيقية
        </span>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((lesson) => {
          const isCompleted = completedLessonIds.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              onClick={() => onOpenLesson(lesson)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 text-xs font-black rounded-lg border border-blue-200">
                      {lesson.level}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      الوحدة {lesson.unitNumber} · الدرس {lesson.lessonNumber}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مكتمل</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lesson.durationMinutes} د</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] group-hover:text-blue-900 transition-colors">
                      {lesson.title}
                    </h3>
                    <button
                      onClick={(e) => handlePlayAudio(e, lesson.title)}
                      className="p-1 text-slate-400 hover:text-blue-700"
                      title="استمع للنطق"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-amber-700 mt-0.5">{lesson.titleArabic}</h4>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {lesson.description}
                </p>
              </div>

              {/* Lesson Footer Features */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-400 font-medium text-[11px]">
                  <span>{lesson.grammarRules.length} قواعد</span>
                  <span>·</span>
                  <span>{lesson.vocabulary.length} مفردات</span>
                  <span>·</span>
                  <span>{lesson.exercises.length} تمارين</span>
                </div>

                <div className="flex items-center gap-1 font-bold text-blue-900 group-hover:translate-x-1 transition-transform">
                  <span>{isCompleted ? 'مراجعة' : 'ابدأ الآن'}</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
