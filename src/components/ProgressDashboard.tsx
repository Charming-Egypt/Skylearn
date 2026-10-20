import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  Award,
  BookOpen,
  Bookmark,
  Volume2,
  Bell,
  Search,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Trophy,
  ChevronLeft,
  Gift,
} from 'lucide-react';
import { UserStats, VocabularyItem, LanguageCode } from '../types';
import { LANGUAGES, ALL_LESSONS } from '../data/curriculum';
import { speakText } from '../utils/speech';

interface ProgressDashboardProps {
  stats: UserStats;
  onOpenPlacementTest: (language?: LanguageCode) => void;
  onOpenReminderModal: () => void;
  onToggleSaveWord: (wordId: string) => void;
  onSelectLesson: (lessonId: string, languageId: LanguageCode) => void;
  onOpenDailyChallenges?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  stats,
  onOpenPlacementTest,
  onOpenReminderModal,
  onToggleSaveWord,
  onSelectLesson,
  onOpenDailyChallenges,
}) => {
  const [vocabSearch, setVocabSearch] = useState('');

  // Collect all vocabulary items from all lessons
  const allVocabMap: Record<string, { item: VocabularyItem; langId: LanguageCode }> = {};
  Object.entries(ALL_LESSONS).forEach(([langKey, lessons]) => {
    lessons.forEach((l) => {
      l.vocabulary.forEach((v) => {
        allVocabMap[v.id] = { item: v, langId: langKey as LanguageCode };
      });
    });
  });

  const savedVocabList = stats.savedWordIds
    .map((id) => allVocabMap[id])
    .filter(Boolean)
    .filter(({ item }) =>
      vocabSearch
        ? item.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
          item.translation.includes(vocabSearch)
        : true
    );

  const handlePlayVocab = (word: string, langId: LanguageCode) => {
    speakText(word, langId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-blue-950 rounded-full text-xs font-black mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>لوحة متابعة الإنجاز والتقدم الذكية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">مرحباً بك في سجل إنجازاتك</h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              تتبع مستواك عبر اللغات الثلاث، والكلمات المحفوظة، وسلسلة التزامك اليومي.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto text-center">
            <div className="bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/10 min-w-0">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
              <div className="text-xl sm:text-2xl font-black tabular-nums">{stats.streakDays}</div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 truncate">أيام متتالية</div>
            </div>

            <div className="bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/10 min-w-0">
              <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black tabular-nums">{stats.xp}</div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 truncate">مجموع XP</div>
            </div>

            <div className="bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/10 min-w-0">
              <div className="flex items-center justify-center gap-1 text-blue-300 mb-1">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black tabular-nums">{stats.completedLessonIds.length}</div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 truncate">دروس مكتملة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Levels & Placement Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">مستواك في اللغات المتاحة (CEFR)</h2>
          <span className="text-xs text-slate-500 font-medium">وفق اختبارات تحديد المستوى والدروس</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => {
            const result = stats.placementResults[lang.id];
            const langLessons = ALL_LESSONS[lang.id];
            const completedInLang = langLessons.filter((l) => stats.completedLessonIds.includes(l.id)).length;
            const progressRatio = Math.round((completedInLang / langLessons.length) * 100);

            return (
              <div
                key={lang.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <h3 className="font-extrabold text-base text-slate-900">{lang.nameArabic}</h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 font-['Plus_Jakarta_Sans',sans-serif]">
                      {lang.nameNative}
                    </span>
                  </div>

                  {/* Level status */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                    <div className="text-xs text-slate-500 font-medium">المستوى الحالي:</div>
                    <div className="text-base font-black text-blue-950 mt-0.5">
                      {result ? result.levelSubtype : 'المستوى التأسيسي (A1)'}
                    </div>
                    {result && (
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">
                        نتيجة الاختبار: {result.score} / {result.totalQuestions}
                      </div>
                    )}
                  </div>

                  {/* Lessons Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>إنجاز الدروس</span>
                      <span className="tabular-nums">
                        {completedInLang} / {langLessons.length} ({progressRatio}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-800 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenPlacementTest(lang.id)}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {result ? 'إعادة تقييم المستوى' : 'خض اختبار تحديد المستوى'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Challenges Progress Section */}
      {stats.dailyChallenges && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-xs shrink-0">
                <Trophy className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>تحديات اليوم النشطة</span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {stats.dailyChallenges.filter((c) => c.isCompleted).length} من {stats.dailyChallenges.length} منجزة
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  أكمل مهام اليوم المتتالية لكسب حتى +230 XP إضافية كل يوم!
                </p>
              </div>
            </div>

            {onOpenDailyChallenges && (
              <button
                onClick={onOpenDailyChallenges}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
              >
                <span>فتح شاشة التحديات</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Daily Reminder Settings & Streak Shield Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              التذكير اليومي: {stats.reminderSettings.enabled ? `مفعل في الساعة ${stats.reminderSettings.reminderTime}` : 'غير مفعل'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              هدفك اليومي: {stats.dailyGoalMinutes} دقيقة يومياً لحماية سلسلة أيامك وزيادة سرعتك في الاستيعاب.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReminderModal}
          className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          تعديل إعدادات التذكير والهدف
        </button>
      </div>

      {/* Saved Vocabulary Bank */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              بنك الكلمات والمفردات المحفوظة ({stats.savedWordIds.length})
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="ابحث في الكلمات المحفوظة..."
              value={vocabSearch}
              onChange={(e) => setVocabSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {savedVocabList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {vocabSearch
              ? 'لم يتم العثور على كلمات مطابقة لبحثك.'
              : 'لم تحفظ أي كلمات بعد. اضغط على أيقونة الإشارة المرجعية بجانب أي كلمة في الدروس لحفظها هنا!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedVocabList.map(({ item, langId }) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between space-y-2 hover:bg-white transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-base font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      {item.word}
                    </span>
                    {item.transcription && (
                      <span className="text-[10px] text-amber-700 font-bold block">
                        [{item.transcription}]
                      </span>
                    )}
                    <div className="text-xs font-bold text-blue-900 mt-0.5">{item.translation}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePlayVocab(item.word, langId)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-800 hover:bg-blue-50 cursor-pointer"
                      title="استمع للنطق"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleSaveWord(item.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="إزالة من المحفوظات"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  {item.exampleSentence}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
