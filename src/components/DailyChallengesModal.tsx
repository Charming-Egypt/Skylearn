import React from 'react';
import {
  X,
  Trophy,
  Zap,
  BookOpen,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Gift,
  Clock,
  Sparkles,
  Flame,
} from 'lucide-react';
import { UserStats, DailyChallenge } from '../types';
import { claimChallengeReward, claimGrandChallengeReward } from '../utils/storage';
import { sounds } from '../utils/speech';

interface DailyChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const DailyChallengesModal: React.FC<DailyChallengesModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  if (!isOpen) return null;

  const challenges = stats.dailyChallenges || [];
  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const isAllCompleted = completedCount === challenges.length && challenges.length > 0;
  const isGrandClaimed = !!stats.grandChallengeClaimedDate;

  // Render matching icon
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5" />;
      case 'Bookmark':
        return <Bookmark className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const handleClaim = (chId: string) => {
    sounds.playCompletion();
    const { stats: updated } = claimChallengeReward(chId);
    onUpdateStats({ ...updated });
  };

  const handleClaimGrand = () => {
    sounds.playCompletion();
    const { stats: updated } = claimGrandChallengeReward();
    onUpdateStats({ ...updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-black shadow-md">
              <Trophy className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">التحديات اليومية الذكية</h2>
                <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded-full">
                  +230 XP إجمالي
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                أكمل التحديات يومياً لكسب نقاط خبرة مضاعفة وحماية شعلتك!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Grand Trophy Banner */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isAllCompleted
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-400'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isAllCompleted
                      ? 'bg-amber-400 text-blue-950 shadow-md animate-bounce'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Trophy className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>جائزة الإنجاز اليومي الكبرى</span>
                    <span className="text-xs font-bold text-amber-600">+100 XP</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    أكمل جميع تحديات اليوم الـ 4 لتفتح صندوق المكافأة الكبرى!
                  </p>
                </div>
              </div>

              {isAllCompleted && !isGrandClaimed && (
                <button
                  onClick={handleClaimGrand}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer shrink-0 transition-transform active:scale-95 flex items-center gap-1"
                >
                  <Gift className="w-4 h-4" />
                  <span>استلم +100 XP</span>
                </button>
              )}

              {isGrandClaimed && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم استلام الكأس!</span>
                </span>
              )}
            </div>

            {/* Total progress */}
            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>إجمالي التحديات المنجزة اليوم:</span>
              </span>
              <span className="tabular-nums text-amber-700 font-extrabold">
                {completedCount} من {challenges.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / (challenges.length || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Individual Challenges List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-700">قائمة مهام اليوم:</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>تتجدد المهام يومياً عند منتصف الليل</span>
              </span>
            </div>

            {challenges.map((ch) => {
              const progressPct = Math.round((ch.current / ch.target) * 100);

              return (
                <div
                  key={ch.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                    ch.isCompleted
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          ch.isCompleted
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {getIcon(ch.iconName)}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{ch.title}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">{ch.description}</p>
                      </div>
                    </div>

                    {/* Action or Reward Badge */}
                    <div className="shrink-0">
                      {ch.isCompleted && !ch.isClaimed ? (
                        <button
                          onClick={() => handleClaim(ch.id)}
                          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-blue-950 font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>استلم +{ch.xpReward} XP</span>
                        </button>
                      ) : ch.isClaimed ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم الاستلام</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          +{ch.xpReward} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                    <span>التقدم:</span>
                    <span className="tabular-nums">
                      {ch.current} / {ch.target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        ch.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Close */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              متابعة التعلم وإكمال المهام
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
