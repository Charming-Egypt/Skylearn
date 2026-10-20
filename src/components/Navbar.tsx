import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Bell,
  Award,
  BookOpen,
  MessageSquare,
  Compass,
  BarChart3,
  Trophy,
  Smartphone,
  Monitor,
  ChevronDown,
} from 'lucide-react';
import { LanguageCode, UserStats } from '../types';
import { LANGUAGES } from '../data/curriculum';

interface NavbarProps {
  currentView: 'home' | 'curriculum' | 'conversation' | 'dashboard' | 'challenges';
  setCurrentView: (view: 'home' | 'curriculum' | 'conversation' | 'dashboard' | 'challenges') => void;
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (lang: LanguageCode) => void;
  stats: UserStats;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (enabled: boolean) => void;
  onOpenPlacementTest: () => void;
  onOpenReminderModal: () => void;
  onOpenDailyChallenges: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  selectedLanguage,
  setSelectedLanguage,
  stats,
  isMobileDeviceFrame,
  setIsMobileDeviceFrame,
  onOpenPlacementTest,
  onOpenReminderModal,
  onOpenDailyChallenges,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeLangMeta = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

  // Detect scroll to toggle sticky elevation box-shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Handle internal container scrolling if in device frame mode
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    const containerHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target) {
        setIsScrolled(target.scrollTop > 8);
      }
    };
    scrollContainers.forEach((el) => el.addEventListener('scroll', containerHandler, { passive: true }));

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      scrollContainers.forEach((el) => el.removeEventListener('scroll', containerHandler));
    };
  }, [isMobileDeviceFrame]);

  // Count uncompleted or claimable daily challenges
  const challenges = stats.dailyChallenges || [];
  const claimableCount = challenges.filter((c) => c.isCompleted && !c.isClaimed).length;
  const incompletedCount = challenges.filter((c) => !c.isCompleted).length;

  return (
    <header
      className={`navbar-container sticky top-0 z-40 w-full max-w-full flex flex-col justify-center transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] border-b border-slate-200/90'
          : 'bg-white/90 backdrop-blur-sm shadow-none border-b border-slate-100'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Brand & Current Language Dropdown (Flexbox with flex-shrink-0) */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-1.5 sm:gap-2 text-right cursor-pointer group flex-shrink-0"
          >
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
              <span className="font-black text-xs sm:text-lg tracking-tight">SL</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm sm:text-xl font-black tracking-tight text-blue-950 font-['Plus_Jakarta_Sans',sans-serif] flex-shrink-0">
                SkyLearn
              </span>
              <span className="hidden sm:inline-block text-[10px] sm:text-xs bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0">
                لغات
              </span>
            </div>
          </button>

          {/* Quick Language Selector */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-slate-800 transition-colors cursor-pointer flex-shrink-0"
            >
              <span className="text-sm sm:text-base">{activeLangMeta.flag}</span>
              <span className="hidden sm:inline text-xs">{activeLangMeta.nameArabic}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute top-full mt-1.5 right-0 z-50 w-40 sm:w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 space-y-1 text-right">
                {LANGUAGES.map((lang) => {
                  const isCurrent = selectedLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-900 font-black'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">{lang.flag}</span>
                        <span>{lang.nameArabic}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">{lang.nameNative}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop only) */}
        {!isMobileDeviceFrame && (
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold flex-shrink-0">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${
                currentView === 'home'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-700" />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => setCurrentView('curriculum')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${
                currentView === 'curriculum'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>الدروس</span>
            </button>

            <button
              onClick={onOpenDailyChallenges}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${
                currentView === 'challenges'
                  ? 'bg-amber-50 text-amber-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>التحديات اليومية</span>
              {claimableCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('conversation')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${
                currentView === 'conversation'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-700" />
              <span>المحادثة</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-700" />
              <span>تقدمي</span>
            </button>
          </nav>
        )}

        {/* Zone 3: Gamification Stats & Actions (Clean, auto-scaling on mobile viewports) */}
        <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
          {/* Daily Challenges Button (Shown on sm+ screens, mobile has it in bottom nav) */}
          <button
            onClick={onOpenDailyChallenges}
            title="التحديات والمهام اليومية"
            className="hidden sm:flex relative items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 text-blue-950 rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer flex-shrink-0"
          >
            <Trophy className="w-3.5 h-3.5 fill-current text-blue-950" />
            <span>التحديات</span>
            {claimableCount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-rose-600 border border-white animate-pulse"></span>
            ) : incompletedCount > 0 ? (
              <span className="text-[10px] font-black tabular-nums bg-blue-950/20 px-1 rounded-sm">
                {challenges.length - incompletedCount}/{challenges.length}
              </span>
            ) : null}
          </button>

          {/* Placement Test (Desktop shortcut) */}
          <button
            onClick={onOpenPlacementTest}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-950 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>تحديد المستوى</span>
          </button>

          {/* Streak Indicator */}
          <div
            title={`سلسلة أيام متتالية: ${stats.streakDays} أيام`}
            className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg sm:rounded-xl text-amber-900 font-extrabold text-[11px] sm:text-xs flex-shrink-0"
          >
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500" />
            <span className="tabular-nums text-[11px] sm:text-sm font-black">{stats.streakDays}</span>
          </div>

          {/* XP Badge */}
          <div
            title={`نقاط الخبرة: ${stats.xp} XP`}
            className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 bg-blue-50 border border-blue-200/80 rounded-lg sm:rounded-xl text-blue-900 font-extrabold text-[11px] sm:text-xs flex-shrink-0"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            <span className="tabular-nums text-[11px] sm:text-sm font-black">{stats.xp}</span>
          </div>

          {/* Smart Reminder Bell (hidden on very small mobile to prevent any overflow) */}
          <button
            onClick={onOpenReminderModal}
            title="إعدادات التذكير الذكي"
            className="hidden sm:flex relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {stats.reminderSettings.enabled && (
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          {/* Desktop Frame Switcher Toggle */}
          <button
            onClick={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
            title={isMobileDeviceFrame ? 'التبديل إلى العرض الكامل' : 'معاينة وضع شاشة الهاتف المحمول'}
            className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 flex-shrink-0"
          >
            {isMobileDeviceFrame ? (
              <Monitor className="w-4 h-4 text-blue-700" />
            ) : (
              <Smartphone className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
