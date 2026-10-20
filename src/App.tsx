import React, { useState, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  MessageSquare,
  BarChart3,
  Award,
  Bell,
  Sparkles,
  Trophy,
  Flame,
} from 'lucide-react';
import { LanguageCode, Lesson, UserStats, PlacementResult, CEFRLevel } from './types';
import { ALL_LESSONS, LANGUAGES } from './data/curriculum';
import {
  loadUserStats,
  saveUserStats,
  addXP,
  markLessonCompleted,
  toggleSavedWord,
  savePlacementResult,
  triggerSimulatedReminder,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
import { CourseCurriculum } from './components/CourseCurriculum';
import { LessonViewer } from './components/LessonViewer';
import { ConversationStudio } from './components/ConversationStudio';
import { ProgressDashboard } from './components/ProgressDashboard';
import { PlacementTestModal } from './components/PlacementTestModal';
import { DailyReminderModal } from './components/DailyReminderModal';
import { DailyChallengesModal } from './components/DailyChallengesModal';

export default function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('german');
  const [currentView, setCurrentView] = useState<'home' | 'curriculum' | 'conversation' | 'dashboard' | 'lesson'>('home');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Mobile Device Frame mode for desktop testing
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState(false);

  // Modals state
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [placementModalLang, setPlacementModalLang] = useState<LanguageCode>('german');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDailyChallengesModalOpen, setIsDailyChallengesModalOpen] = useState(false);

  // Sync stats with storage
  useEffect(() => {
    const loaded = loadUserStats();
    setStats(loaded);
  }, []);

  // Open a specific lesson
  const handleOpenLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Placement Test modal
  const handleOpenPlacementTest = (lang?: LanguageCode) => {
    setPlacementModalLang(lang || selectedLanguage);
    setIsPlacementModalOpen(true);
  };

  // Lesson completion handler
  const handleCompleteLesson = (lessonId: string) => {
    const updated = markLessonCompleted(lessonId);
    setStats({ ...updated });
  };

  // Toggle saving a vocabulary word
  const handleToggleSaveWord = (wordId: string) => {
    const { stats: updated } = toggleSavedWord(wordId);
    setStats({ ...updated });
  };

  // Save Placement Test Result
  const handleSavePlacementResult = (language: LanguageCode, result: PlacementResult) => {
    const updated = savePlacementResult(language, result);
    setStats({ ...updated });
  };

  // Jump from placement result straight to recommended level lesson
  const handleStartRecommendedLesson = (language: LanguageCode, level: CEFRLevel) => {
    setSelectedLanguage(language);
    const langLessons = ALL_LESSONS[language] || [];
    const matched = langLessons.find((l) => l.level === level) || langLessons[0];
    if (matched) {
      handleOpenLesson(matched);
    } else {
      setCurrentView('curriculum');
    }
  };

  const handleAwardXP = (amount: number) => {
    const updated = addXP(amount);
    setStats({ ...updated });
  };

  const challenges = stats.dailyChallenges || [];
  const claimableCount = challenges.filter((c) => c.isCompleted && !c.isClaimed).length;

  return (
    <div
      className={`min-h-screen bg-slate-100/80 text-slate-800 antialiased selection:bg-amber-200 selection:text-blue-950 flex flex-col items-center w-full max-w-full overflow-x-clip ${
        isMobileDeviceFrame ? 'py-4 sm:py-8' : ''
      }`}
    >
      {/* Container wrapper: either full width responsive or smartphone device shell */}
      <div
        className={`w-full max-w-full flex-1 flex flex-col bg-[#F8FAFC] transition-all duration-300 relative overflow-x-clip ${
          isMobileDeviceFrame
            ? 'max-w-[425px] min-h-[840px] max-h-[90vh] rounded-[44px] shadow-2xl border-8 border-slate-800 overflow-y-auto ring-1 ring-slate-900/10'
            : 'max-w-full'
        } pb-20 ${isMobileDeviceFrame ? 'pb-20' : 'lg:pb-0'}`}
      >
        {/* Smartphone Speaker Notch (only shown when device frame is enabled) */}
        {isMobileDeviceFrame && (
          <div className="w-full bg-slate-900 h-6 flex items-center justify-center relative shrink-0">
            <div className="w-18 h-3.5 bg-black rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-2"></div>
              <div className="w-6 h-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Responsive Header */}
        <Navbar
          currentView={currentView === 'lesson' ? 'curriculum' : currentView}
          setCurrentView={(view) => {
            if (view === 'challenges') {
              setIsDailyChallengesModalOpen(true);
            } else {
              setActiveLesson(null);
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          stats={stats}
          isMobileDeviceFrame={isMobileDeviceFrame}
          setIsMobileDeviceFrame={setIsMobileDeviceFrame}
          onOpenPlacementTest={() => handleOpenPlacementTest()}
          onOpenReminderModal={() => setIsReminderModalOpen(true)}
          onOpenDailyChallenges={() => setIsDailyChallengesModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentView === 'home' && (
            <HomeOverview
              stats={stats}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenLesson={handleOpenLesson}
              onOpenPlacementTest={handleOpenPlacementTest}
              onOpenReminderModal={() => setIsReminderModalOpen(true)}
              onOpenDailyChallenges={() => setIsDailyChallengesModalOpen(true)}
              onUpdateStats={(newStats) => setStats({ ...newStats })}
            />
          )}

          {currentView === 'curriculum' && (
            <CourseCurriculum
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              completedLessonIds={stats.completedLessonIds}
              onOpenLesson={handleOpenLesson}
              onOpenPlacementTest={handleOpenPlacementTest}
            />
          )}

          {currentView === 'conversation' && (
            <ConversationStudio
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              onAwardXP={handleAwardXP}
            />
          )}

          {currentView === 'dashboard' && (
            <ProgressDashboard
              stats={stats}
              onOpenPlacementTest={handleOpenPlacementTest}
              onOpenReminderModal={() => setIsReminderModalOpen(true)}
              onOpenDailyChallenges={() => setIsDailyChallengesModalOpen(true)}
              onToggleSaveWord={handleToggleSaveWord}
              onSelectLesson={(lessonId, langId) => {
                const lesson = ALL_LESSONS[langId]?.find((l) => l.id === lessonId);
                if (lesson) {
                  setSelectedLanguage(langId);
                  handleOpenLesson(lesson);
                }
              }}
            />
          )}

          {currentView === 'lesson' && activeLesson && (
            <LessonViewer
              lesson={activeLesson}
              languageId={selectedLanguage}
              isCompleted={stats.completedLessonIds.includes(activeLesson.id)}
              savedWordIds={stats.savedWordIds}
              onToggleSaveWord={handleToggleSaveWord}
              onCompleteLesson={handleCompleteLesson}
              onBackToCourseList={() => {
                setActiveLesson(null);
                setCurrentView('curriculum');
              }}
            />
          )}
        </main>

        {/* Desktop Footer (hidden if in mobile frame or mobile screen) */}
        {!isMobileDeviceFrame && (
          <footer className="hidden lg:block bg-white border-t border-slate-200 mt-16 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-black text-blue-950 font-['Plus_Jakarta_Sans',sans-serif]">
                  SkyLearn
                </span>
                <span>·</span>
                <span>تطبيق تعليم اللغات الروسية والألمانية والإيطالية</span>
              </div>
              <div>
                <span>جميع الحقوق محفوظة © 2026 SkyLearn</span>
              </div>
            </div>
          </footer>
        )}

        {/* Mobile-Friendly Fixed Bottom Navigation Bar (Visible on mobile viewports OR when mobile device frame is on) */}
        <nav
          className={`${
            isMobileDeviceFrame ? 'absolute' : 'fixed lg:hidden'
          } bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around h-16 shadow-lg`}
        >
          <button
            onClick={() => {
              setActiveLesson(null);
              setCurrentView('home');
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
              currentView === 'home' ? 'text-blue-900 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => {
              setActiveLesson(null);
              setCurrentView('curriculum');
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
              currentView === 'curriculum' || currentView === 'lesson'
                ? 'text-blue-900 scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>الدروس</span>
          </button>

          {/* Daily Challenges Center Action */}
          <button
            onClick={() => setIsDailyChallengesModalOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-black transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center relative text-amber-600 hover:text-amber-700 active:scale-95"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 text-blue-950 flex items-center justify-center shadow-xs">
              <Trophy className="w-4 h-4 fill-current" />
            </div>
            <span>التحديات</span>
            {claimableCount > 0 && (
              <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-rose-600 border border-white animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveLesson(null);
              setCurrentView('conversation');
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
              currentView === 'conversation'
                ? 'text-blue-900 scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>المحادثة</span>
          </button>

          <button
            onClick={() => {
              setActiveLesson(null);
              setCurrentView('dashboard');
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer min-h-[44px] min-w-[48px] justify-center ${
              currentView === 'dashboard' ? 'text-blue-900 scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>تقدمي</span>
          </button>
        </nav>
      </div>

      {/* Placement Test Modal */}
      <PlacementTestModal
        isOpen={isPlacementModalOpen}
        onClose={() => setIsPlacementModalOpen(false)}
        initialLanguage={placementModalLang}
        onSaveResult={handleSavePlacementResult}
        onStartRecommendedLesson={handleStartRecommendedLesson}
      />

      {/* Daily Reminder Modal */}
      <DailyReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        stats={stats}
        onUpdateStats={(newStats) => setStats({ ...newStats })}
      />

      {/* Daily Challenges Modal */}
      <DailyChallengesModal
        isOpen={isDailyChallengesModalOpen}
        onClose={() => setIsDailyChallengesModalOpen(false)}
        stats={stats}
        onUpdateStats={(newStats) => setStats({ ...newStats })}
      />
    </div>
  );
}
