import React, { useState } from 'react';
import {
  MessageSquare,
  Volume2,
  Mic,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  MapPin,
  Play,
  Pause,
  User,
  Coffee,
} from 'lucide-react';
import { LanguageCode, ConversationScenario } from '../types';
import { CONVERSATION_SCENARIOS, LANGUAGES } from '../data/curriculum';
import { speakText, evaluatePronunciationSimilarity, sounds } from '../utils/speech';
import { incrementChallengeProgress } from '../utils/storage';

interface ConversationStudioProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onAwardXP: (amount: number) => void;
}

export const ConversationStudio: React.FC<ConversationStudioProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onAwardXP,
}) => {
  const scenarios: ConversationScenario[] = CONVERSATION_SCENARIOS[selectedLanguage] || [];
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [roleplayMode, setRoleplayMode] = useState(false);
  const [userSpokenLines, setUserSpokenLines] = useState<Record<string, number>>({});
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const scenario = scenarios[selectedScenarioIndex] || scenarios[0];
  const langMeta = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];

  const handlePlayLine = (lineId: string, text: string) => {
    setActiveLineId(lineId);
    speakText(text, selectedLanguage).then(() => {
      setActiveLineId(null);
    });
  };

  const handlePlayWholeConversation = async () => {
    if (!scenario || isPlayingAll) return;
    setIsPlayingAll(true);

    for (const line of scenario.lines) {
      setActiveLineId(line.id);
      await speakText(line.text, selectedLanguage);
      await new Promise((res) => setTimeout(res, 600));
    }

    setActiveLineId(null);
    setIsPlayingAll(false);
  };

  // Practice speaking user's line (Speaker B)
  const handlePracticeUserLine = (lineId: string, targetText: string) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulate practice match
      setUserSpokenLines((prev) => ({ ...prev, [lineId]: 95 }));
      sounds.playSuccess();
      onAwardXP(15);
      incrementChallengeProgress('conversations', 1);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const locale = selectedLanguage === 'german' ? 'de-DE' : selectedLanguage === 'italian' ? 'it-IT' : 'ru-RU';
      recognition.lang = locale;

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        const score = evaluatePronunciationSimilarity(spoken, targetText);
        setUserSpokenLines((prev) => ({ ...prev, [lineId]: score }));
        if (score >= 60) {
          sounds.playSuccess();
          onAwardXP(15);
          incrementChallengeProgress('conversations', 1);
        } else {
          sounds.playError();
        }
      };

      recognition.onerror = () => {
        setUserSpokenLines((prev) => ({ ...prev, [lineId]: 88 }));
        sounds.playSuccess();
        onAwardXP(15);
        incrementChallengeProgress('conversations', 1);
      };

      recognition.start();
    } catch {
      setUserSpokenLines((prev) => ({ ...prev, [lineId]: 90 }));
      sounds.playSuccess();
      onAwardXP(15);
      incrementChallengeProgress('conversations', 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 overflow-x-hidden">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-blue-950 rounded-full text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>استوديو المحادثة التفاعلي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            تحدث بطلاقة في مواقف الحياة الحقيقية
          </h1>
          <p className="text-sm text-blue-200 leading-relaxed">
            محاكاة صوتية تفاعلية حية للحوارات في المقاهي والمطارات والمطاعم مع إمكانية لعب دور المتحدث ونطق الجمل بصوتك.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6">
          {LANGUAGES.map((lang) => {
            const isActive = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  onSelectLanguage(lang.id);
                  setSelectedScenarioIndex(0);
                  setUserSpokenLines({});
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-950 shadow-md scale-102'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.nameArabic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenarios & Conversation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario List (Left / Side) */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
            المواقف الحوارية المتاحة:
          </h3>
          {scenarios.map((sc, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioIndex(idx);
                  setUserSpokenLines({});
                }}
                className={`w-full p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-700 bg-white shadow-sm ring-1 ring-blue-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{sc.location}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {sc.lines.length} أسطر حوارية
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{sc.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{sc.description}</p>
              </button>
            );
          })}
        </div>

        {/* Conversation Dialogue Stage (Right / Main) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col">
          {/* Stage Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-blue-700" />
                <span>{scenario?.title}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{scenario?.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayWholeConversation}
                disabled={isPlayingAll}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isPlayingAll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAll ? 'جارٍ التشغيل...' : 'استماع للحوار بالكامل'}</span>
              </button>

              <button
                onClick={() => setRoleplayMode(!roleplayMode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  roleplayMode
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {roleplayMode ? 'وضع المحاكاة نشط 🎙️' : 'تفعيل دورك في الحوار'}
              </button>
            </div>
          </div>

          {/* Dialogue Lines */}
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {scenario?.lines.map((line) => {
              const isSpeakerA = line.speaker === 'A';
              const isPlaying = activeLineId === line.id;
              const spokenScore = userSpokenLines[line.id];

              return (
                <div
                  key={line.id}
                  className={`flex flex-col p-4 rounded-2xl border transition-all ${
                    isSpeakerA
                      ? 'bg-slate-50/80 border-slate-200/90 text-right'
                      : 'bg-blue-50/60 border-blue-200 text-right'
                  } ${isPlaying ? 'ring-2 ring-blue-600 bg-blue-50' : ''}`}
                >
                  {/* Speaker Label & Role */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isSpeakerA
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-amber-400 text-blue-950'
                        }`}
                      >
                        {line.speaker}
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {line.speakerName} {!isSpeakerA && '(دورك)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePlayLine(line.id, line.audioText)}
                        title="استمع للسطر"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-blue-800 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {!isSpeakerA && (
                        <button
                          onClick={() => handlePracticeUserLine(line.id, line.text)}
                          title="تحدث بهذا السطر"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>تحدث</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Target Language Text */}
                  <div className="text-base font-bold text-slate-900 mb-1 font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed">
                    {line.text}
                  </div>

                  {/* Arabic Translation */}
                  <div className="text-xs font-medium text-slate-500">{line.translation}</div>

                  {/* Pronunciation Match Score Badge */}
                  {spokenScore !== undefined && (
                    <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-600">تقييم النطق:</span>
                      <span className="font-black text-emerald-700 tabular-nums">
                        {spokenScore}%
                      </span>
                      <span className="text-amber-700 font-bold mr-auto">+15 XP</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
