import React from 'react';
import {
  Compass,
  Award,
  BookOpen,
  MessageSquare,
  Sparkles,
  Flame,
  ArrowLeft,
  Volume2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Gift,
  Zap,
  Bookmark,
  ChevronLeft,
} from 'lucide-react';
import { LanguageCode, Lesson, UserStats } from '../types';
import { LANGUAGES, ALL_LESSONS } from '../data/curriculum';
import { claimChallengeReward } from '../utils/storage';
import { sounds } from '../utils/speech';

interface HomeOverviewProps {
  stats: UserStats;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onNavigate: (view: 'curriculum' | 'conversation' | 'dashboard') => void;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenPlacementTest: (language?: LanguageCode) => void;
  onOpenReminderModal: () => void;
  onOpenDailyChallenges: () => void;
  onUpdateStats: (newStats: UserStats) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  stats,
  selectedLanguage,
  onSelectLanguage,
  onNavigate,
  onOpenLesson,
  onOpenPlacementTest,
  onOpenReminderModal,
  onOpenDailyChallenges,
  onUpdateStats,
}) => {
  // Find next uncompleted lesson in current language
  const currentLessons = ALL_LESSONS[selectedLanguage] || [];
  const nextLesson =
    currentLessons.find((l) => !stats.completedLessonIds.includes(l.id)) || currentLessons[0];
  const langMeta = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

  const challenges = stats.dailyChallenges || [];
  const completedChallenges = challenges.filter((c) => c.isCompleted).length;

  const handleClaimChallenge = (e: React.MouseEvent, chId: string) => {
    e.stopPropagation();
    sounds.playCompletion();
    const { stats: updated } = claimChallengeReward(chId);
    onUpdateStats({ ...updated });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Hero Banner - Mobile App Friendly */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-blue-950 rounded-full text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تطبيق تعليم اللغات الأوروبية</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black leading-snug tracking-tight">
            تعلم الألمانية، الإيطالية، والروسية بنطق حقيقي وتمارين حية
          </h1>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            منهج تفاعلي متكامل مشروح باللغة العربية مع تمارين نطق بالميكروفون، ومحاكاة محادثات حقيقية، وتحديات يومية ذكية.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onOpenPlacementTest()}
              className="w-full sm:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-blue-950" />
              <span>اختبار قياس المستوى السريع</span>
            </button>

            <button
              onClick={() => onNavigate('curriculum')}
              className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-200" />
              <span>استعراض الدروس</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAILY CHALLENGES WIDGET - Boost Motivation */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 rounded-3xl border border-amber-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>تحديات اليوم النشطة</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  +{challenges.reduce((sum, c) => sum + c.xpReward, 0)} XP
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                أكمل التحديات لكسب نقاط XP مضاعفة وحماية شعلتك!
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDailyChallenges}
            className="flex items-center gap-1 text-xs font-black text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <span>كل التحديات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Challenge Mini Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {challenges.slice(0, 4).map((ch) => {
            const isCompleted = ch.isCompleted;
            const isClaimed = ch.isClaimed;

            return (
              <div
                key={ch.id}
                onClick={onOpenDailyChallenges}
                className="bg-white/90 p-3.5 rounded-2xl border border-amber-100 shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:border-amber-300 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {ch.category === 'lessons' && <BookOpen className="w-4 h-4" />}
                    {ch.category === 'exercises' && <Zap className="w-4 h-4" />}
                    {ch.category === 'conversations' && <MessageSquare className="w-4 h-4" />}
                    {ch.category === 'vocab' && <Bookmark className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{ch.title}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="tabular-nums font-bold text-slate-600">
                        {ch.current}/{ch.target}
                      </span>
                      <span>·</span>
                      <span className="text-amber-700 font-extrabold">+{ch.xpReward} XP</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isCompleted && !isClaimed ? (
                    <button
                      onClick={(e) => handleClaimChallenge(e, ch.id)}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-[11px] rounded-lg shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <Gift className="w-3 h-3" />
                      <span>استلم</span>
                    </button>
                  ) : isClaimed ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>تم</span>
                    </span>
                  ) : (
                    <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (ch.current / ch.target) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Learning Widget (Resume Card) */}
      {nextLesson && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center text-2xl shrink-0">
              {langMeta.flag}
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-0.5">
                <span>متابعة {langMeta.nameArabic}</span>
                <span>·</span>
                <span className="text-blue-800">مستوى {nextLesson.level}</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {nextLesson.title}
              </h3>
              <p className="text-xs text-amber-700 font-bold">{nextLesson.titleArabic}</p>
            </div>
          </div>

          <button
            onClick={() => onOpenLesson(nextLesson)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <span>متابعة الدرس</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Languages Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900">اللغات المتاحة</h2>
          <span className="text-xs text-slate-500 font-medium">مستويات A1 إلى B1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => {
            const lessons = ALL_LESSONS[lang.id] || [];
            const completedCount = lessons.filter((l) => stats.completedLessonIds.includes(l.id)).length;
            const progressPct = Math.round((completedCount / lessons.length) * 100);
            const isSelected = selectedLanguage === lang.id;

            return (
              <div
                key={lang.id}
                className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-3xl">{lang.flag}</span>
                    <span className="text-xs font-bold text-slate-400 font-['Plus_Jakarta_Sans',sans-serif]">
                      {lang.nameNative}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mb-1">{lang.nameArabic}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {lang.description}
                  </p>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>نسبة الإنجاز</span>
                      <span className="tabular-nums font-black text-blue-900">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-800 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectLanguage(lang.id);
                      onNavigate('curriculum');
                    }}
                    className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    استعراض المنهج
                  </button>
                  <button
                    onClick={() => onOpenPlacementTest(lang.id)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="اختبار قياس المستوى"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Badges - Tactile & Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">نطق صوتي تفاعلي حي</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">استمع للنطق الأصلي وتدرب بالميكروفون</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">محاكاة حوارية واقعية</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">سيناريوهات المقاهي والمطارات والفنادق</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">تحديات يومية وشعلة التزام</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">مكافآت XP مستمرة تحفزك للإتقان</p>
          </div>
        </div>
      </div>
    </div>
  );
};
