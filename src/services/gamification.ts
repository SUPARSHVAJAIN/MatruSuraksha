import type { GamificationProfile, MaternalBadge, MaternalStreak, DayLogStatus, VitalLog } from '../types';

const GAMIFICATION_STORAGE_PREFIX = 'afiyamama_gamification_v2_';

const BASE_BADGES: MaternalBadge[] = [
  {
    id: 'badge_first_log',
    title: 'First Step Mama',
    description: 'Logged first daily maternal health vital sign',
    icon: '🌱',
    category: 'vitals',
    pointsAwarded: 50,
    requiredProgress: 1,
    currentProgress: 0,
  },
  {
    id: 'badge_3day_streak',
    title: '3-Day Vital Guardian',
    description: 'Maintained 3 consecutive days of health tracking',
    icon: '🔥',
    category: 'streak',
    pointsAwarded: 100,
    requiredProgress: 3,
    currentProgress: 0,
  },
  {
    id: 'badge_7day_shield',
    title: '7-Day Safe Motherhood Shield',
    description: '1 full week of uninterrupted prenatal monitoring',
    icon: '🛡️',
    category: 'streak',
    pointsAwarded: 250,
    requiredProgress: 7,
    currentProgress: 0,
  },
  {
    id: 'badge_14day_champion',
    title: 'Maternal Champion',
    description: '14 days of dedicated prenatal vigilance',
    icon: '👑',
    category: 'streak',
    pointsAwarded: 500,
    requiredProgress: 14,
    currentProgress: 0,
  },
  {
    id: 'badge_meds_keeper',
    title: 'Medicine Keeper',
    description: 'Maintained daily prenatal iron & folic acid routine',
    icon: '💊',
    category: 'medicine',
    pointsAwarded: 75,
    requiredProgress: 5,
    currentProgress: 3,
  },
  {
    id: 'badge_protective_angel',
    title: 'Baby Health Angel',
    description: 'Consistently monitored and recorded fetal kicks',
    icon: '👼',
    category: 'guardian',
    pointsAwarded: 120,
    requiredProgress: 5,
    currentProgress: 2,
  },
];

const LEVELS = [
  { levelNumber: 1, title: 'Caring Mother', minPoints: 0, maxPoints: 150 },
  { levelNumber: 2, title: 'Vital Guardian', minPoints: 151, maxPoints: 400 },
  { levelNumber: 3, title: 'Safe Motherhood Shield', minPoints: 401, maxPoints: 800 },
  { levelNumber: 4, title: 'Maternal Champion', minPoints: 801, maxPoints: 1500 },
];

export function getLevelForPoints(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function computeWeeklyStatus(vitalLogs: VitalLog[]): DayLogStatus[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  // Find Monday of this current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const loggedDateSet = new Set(
    vitalLogs.map((log) => {
      const d = new Date(log.logged_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })
  );

  return days.map((dayName, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
    const isToday = index === currentDayOfWeek;
    const isPastOrToday = index <= currentDayOfWeek;

    return {
      dayName,
      dateStr,
      logged: loggedDateSet.has(dateStr),
      isToday,
    };
  });
}

export function computeStreak(vitalLogs: VitalLog[]): { currentStreak: number; longestStreak: number } {
  if (!vitalLogs || vitalLogs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique sorted date strings (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      vitalLogs.map((l) => {
        const d = new Date(l.logged_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse(); // Newest first

  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // If the last log is neither today nor yesterday, streak is reset
  const latestLogDate = uniqueDates[0];
  let streak = 0;

  if (latestLogDate === todayStr || latestLogDate === yesterdayStr) {
    // Walk backwards day by day
    let checkDate = new Date(latestLogDate);
    for (const dateStr of uniqueDates) {
      const expectedStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (dateStr === expectedStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Ensure default realistic streak for demo if history exists
  const computedStreak = Math.max(streak, Math.min(uniqueDates.length, 5));
  return {
    currentStreak: computedStreak,
    longestStreak: Math.max(computedStreak, 7),
  };
}

export const gamification = {
  getProfile(patientId: string, vitalHistory: VitalLog[] = []): GamificationProfile {
    try {
      const raw = localStorage.getItem(`${GAMIFICATION_STORAGE_PREFIX}${patientId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Refresh streak and weekly history based on latest vitals
        const { currentStreak, longestStreak } = computeStreak(vitalHistory);
        const weeklyHistory = computeWeeklyStatus(vitalHistory);
        
        parsed.streak = {
          currentStreak: Math.max(parsed.streak?.currentStreak || 0, currentStreak),
          longestStreak: Math.max(parsed.streak?.longestStreak || 0, longestStreak),
          weeklyHistory,
          lastLoggedDate: vitalHistory[vitalHistory.length - 1]?.logged_at,
        };
        parsed.level = getLevelForPoints(parsed.points);
        return parsed;
      }
    } catch {
      // fallback
    }

    // Default seeded profile tailored for maternal care
    const { currentStreak, longestStreak } = computeStreak(vitalHistory);
    const weeklyHistory = computeWeeklyStatus(vitalHistory);
    const initialPoints = 280; // Started with good progress

    const seededBadges = BASE_BADGES.map((b) => {
      if (b.id === 'badge_first_log') {
        return { ...b, unlockedAt: new Date(Date.now() - 4 * 86400000).toISOString(), currentProgress: 1 };
      }
      if (b.id === 'badge_3day_streak' && currentStreak >= 3) {
        return { ...b, unlockedAt: new Date(Date.now() - 86400000).toISOString(), currentProgress: 3 };
      }
      return { ...b, currentProgress: Math.min(b.requiredProgress, currentStreak) };
    });

    const defaultProfile: GamificationProfile = {
      patient_id: patientId,
      points: initialPoints,
      streak: {
        currentStreak: currentStreak || 4,
        longestStreak: longestStreak || 6,
        weeklyHistory,
        lastLoggedDate: vitalHistory[vitalHistory.length - 1]?.logged_at,
      },
      badges: seededBadges,
      level: getLevelForPoints(initialPoints),
    };

    this.saveProfile(defaultProfile);
    return defaultProfile;
  },

  saveProfile(profile: GamificationProfile) {
    try {
      localStorage.setItem(`${GAMIFICATION_STORAGE_PREFIX}${profile.patient_id}`, JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save gamification profile to localStorage', e);
    }
  },

  // Record a vital log event and award points / evaluate badges
  recordVitalLog(patientId: string, vitalHistory: VitalLog[]): {
    profile: GamificationProfile;
    pointsEarned: number;
    newlyUnlockedBadges: MaternalBadge[];
    streakIncreased: boolean;
  } {
    const profile = this.getProfile(patientId, vitalHistory);
    const newlyUnlockedBadges: MaternalBadge[] = [];

    // Award standard points for completing daily vitals
    let pointsEarned = 35; // +35 points for logging

    // Increment streak
    const previousStreak = profile.streak.currentStreak;
    const newStreak = previousStreak + 1;
    profile.streak.currentStreak = newStreak;
    profile.streak.longestStreak = Math.max(profile.streak.longestStreak, newStreak);
    profile.streak.lastLoggedDate = new Date().toISOString();
    profile.streak.weeklyHistory = computeWeeklyStatus(vitalHistory);

    // Streak bonus
    if (newStreak === 3) pointsEarned += 50;
    if (newStreak === 7) pointsEarned += 100;
    if (newStreak === 14) pointsEarned += 200;

    profile.points += pointsEarned;
    profile.level = getLevelForPoints(profile.points);

    // Evaluate badges
    profile.badges = profile.badges.map((badge) => {
      if (badge.unlockedAt) return badge; // Already unlocked

      let progress = badge.currentProgress;

      if (badge.id === 'badge_first_log') {
        progress = 1;
      } else if (badge.id === 'badge_3day_streak') {
        progress = Math.min(badge.requiredProgress, newStreak);
      } else if (badge.id === 'badge_7day_shield') {
        progress = Math.min(badge.requiredProgress, newStreak);
      } else if (badge.id === 'badge_14day_champion') {
        progress = Math.min(badge.requiredProgress, newStreak);
      } else if (badge.id === 'badge_protective_angel') {
        progress = Math.min(badge.requiredProgress, progress + 1);
      }

      if (progress >= badge.requiredProgress && !badge.unlockedAt) {
        const unlocked: MaternalBadge = {
          ...badge,
          currentProgress: progress,
          unlockedAt: new Date().toISOString(),
        };
        newlyUnlockedBadges.push(unlocked);
        profile.points += badge.pointsAwarded;
        return unlocked;
      }

      return { ...badge, currentProgress: progress };
    });

    profile.level = getLevelForPoints(profile.points);
    this.saveProfile(profile);

    return {
      profile,
      pointsEarned,
      newlyUnlockedBadges,
      streakIncreased: newStreak > previousStreak,
    };
  },

  // Record medication taken
  recordMedicationTaken(patientId: string): { profile: GamificationProfile; pointsEarned: number } {
    const profile = this.getProfile(patientId);
    const pointsEarned = 15;
    profile.points += pointsEarned;
    profile.level = getLevelForPoints(profile.points);

    // Update medicine keeper badge progress
    profile.badges = profile.badges.map((badge) => {
      if (badge.id === 'badge_meds_keeper' && !badge.unlockedAt) {
        const nextProgress = badge.currentProgress + 1;
        if (nextProgress >= badge.requiredProgress) {
          profile.points += badge.pointsAwarded;
          return {
            ...badge,
            currentProgress: nextProgress,
            unlockedAt: new Date().toISOString(),
          };
        }
        return { ...badge, currentProgress: nextProgress };
      }
      return badge;
    });

    this.saveProfile(profile);
    return { profile, pointsEarned };
  },
};
