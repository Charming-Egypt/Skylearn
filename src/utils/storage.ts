import { DailyChallenge, LanguageCode, PlacementResult, UserStats } from '../types';

const STORAGE_KEY = 'skylearn_user_stats_v2';

export function getDefaultDailyChallenges(): DailyChallenge[] {
  return [
    {
      id: 'ch-lessons',
      title: 'إكمال درسين في اليوم',
      description: 'أكمل درسين من أي لغة لتحصل على دفعة خبرة قوية',
      category: 'lessons',
      target: 2,
      current: 1,
      xpReward: 40,
      isCompleted: false,
      isClaimed: false,
      iconName: 'BookOpen',
    },
    {
      id: 'ch-exercises',
      title: 'إتقان 5 تمارين تفاعلية',
      description: 'حل 5 تمارين بنجاح واختبر معلوماتك اللغوية',
      category: 'exercises',
      target: 5,
      current: 3,
      xpReward: 35,
      isCompleted: false,
      isClaimed: false,
      iconName: 'Zap',
    },
    {
      id: 'ch-conversations',
      title: 'التدرب على محادثتين صوتيتين',
      description: 'انطق وشارك في سيناريوهات المحادثة الحقيقية',
      category: 'conversations',
      target: 2,
      current: 1,
      xpReward: 30,
      isCompleted: false,
      isClaimed: false,
      iconName: 'MessageSquare',
    },
    {
      id: 'ch-vocab',
      title: 'حفظ كلمتين في بنك المفردات',
      description: 'أضف كلمتين جديدتين إلى قائمة مراجعتك الشخصية',
      category: 'vocab',
      target: 2,
      current: 2,
      xpReward: 25,
      isCompleted: true,
      isClaimed: false,
      iconName: 'Bookmark',
    },
  ];
}

const defaultStats: UserStats = {
  xp: 180,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessonIds: ['de-a1-1'],
  savedWordIds: ['de-a1-1-v1', 'it-a1-1-v1'],
  placementResults: {
    german: null,
    italian: null,
    russian: null,
  },
  dailyGoalMinutes: 15,
  reminderSettings: {
    enabled: true,
    reminderTime: '19:00',
    notificationsAllowed: false,
  },
  dailyChallenges: getDefaultDailyChallenges(),
};

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserStats(defaultStats);
      return defaultStats;
    }
    const parsed: UserStats = JSON.parse(raw);
    
    // Check and update streak based on date
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      const last = new Date(parsed.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 1) {
        // active consecutive day
        parsed.streakDays += 1;
      } else if (diffDays > 1) {
        // streak broken, reset to 1
        parsed.streakDays = 1;
      }
      parsed.lastActiveDate = today;
      // Reset daily challenges on new day
      parsed.dailyChallenges = getDefaultDailyChallenges().map((c) => ({
        ...c,
        current: 0,
        isCompleted: false,
        isClaimed: false,
      }));
      parsed.grandChallengeClaimedDate = undefined;
      saveUserStats(parsed);
    }

    if (!parsed.dailyChallenges || parsed.dailyChallenges.length === 0) {
      parsed.dailyChallenges = getDefaultDailyChallenges();
      saveUserStats(parsed);
    }
    
    return parsed;
  } catch {
    return defaultStats;
  }
}

export function saveUserStats(stats: UserStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}

export function addXP(amount: number): UserStats {
  const current = loadUserStats();
  current.xp += amount;
  saveUserStats(current);
  return current;
}

export function markLessonCompleted(lessonId: string): UserStats {
  const current = loadUserStats();
  if (!current.completedLessonIds.includes(lessonId)) {
    current.completedLessonIds.push(lessonId);
    current.xp += 50; // Award 50 XP for completed lesson
    // advance lesson challenge
    incrementChallengeInternal(current, 'lessons', 1);
    saveUserStats(current);
  }
  return current;
}

export function toggleSavedWord(wordId: string): { isSaved: boolean; stats: UserStats } {
  const current = loadUserStats();
  const index = current.savedWordIds.indexOf(wordId);
  let isSaved = false;
  if (index > -1) {
    current.savedWordIds.splice(index, 1);
    isSaved = false;
  } else {
    current.savedWordIds.push(wordId);
    isSaved = true;
    incrementChallengeInternal(current, 'vocab', 1);
  }
  saveUserStats(current);
  return { isSaved, stats: current };
}

function incrementChallengeInternal(
  stats: UserStats,
  category: 'lessons' | 'exercises' | 'conversations' | 'vocab',
  amount = 1
) {
  if (!stats.dailyChallenges) return;
  const targetChallenge = stats.dailyChallenges.find((c) => c.category === category);
  if (targetChallenge) {
    targetChallenge.current = Math.min(targetChallenge.target, targetChallenge.current + amount);
    if (targetChallenge.current >= targetChallenge.target) {
      targetChallenge.isCompleted = true;
    }
  }
}

export function incrementChallengeProgress(
  category: 'lessons' | 'exercises' | 'conversations' | 'vocab',
  amount = 1
): UserStats {
  const current = loadUserStats();
  incrementChallengeInternal(current, category, amount);
  saveUserStats(current);
  return current;
}

export function claimChallengeReward(challengeId: string): { rewardXP: number; stats: UserStats } {
  const current = loadUserStats();
  const ch = current.dailyChallenges.find((c) => c.id === challengeId);
  let rewardXP = 0;
  if (ch && ch.isCompleted && !ch.isClaimed) {
    ch.isClaimed = true;
    rewardXP = ch.xpReward;
    current.xp += rewardXP;
    saveUserStats(current);
  }
  return { rewardXP, stats: current };
}

export function claimGrandChallengeReward(): { rewardXP: number; stats: UserStats } {
  const current = loadUserStats();
  const today = new Date().toISOString().split('T')[0];
  const allCompleted = current.dailyChallenges.every((c) => c.isCompleted);
  let rewardXP = 0;
  if (allCompleted && current.grandChallengeClaimedDate !== today) {
    rewardXP = 100;
    current.xp += rewardXP;
    current.grandChallengeClaimedDate = today;
    saveUserStats(current);
  }
  return { rewardXP, stats: current };
}

export function savePlacementResult(languageId: LanguageCode, result: PlacementResult): UserStats {
  const current = loadUserStats();
  current.placementResults[languageId] = result;
  current.xp += 75; // Award 75 XP for completing placement test
  saveUserStats(current);
  return current;
}

export function updateReminderSettings(settings: Partial<UserStats['reminderSettings']>): UserStats {
  const current = loadUserStats();
  current.reminderSettings = {
    ...current.reminderSettings,
    ...settings,
  };
  saveUserStats(current);
  return current;
}

export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    const allowed = perm === 'granted';
    updateReminderSettings({ notificationsAllowed: allowed });
    return allowed;
  } catch {
    return false;
  }
}

export function triggerSimulatedReminder(languageName: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('SkyLearn 🎯 حان وقت درس اليوم!', {
      body: `حافظ على شعلة أيامك متقدة! أكمل تدريبك اليومي في اللغة ${languageName} الآن.`,
      icon: '/favicon.ico',
    });
  }
}
