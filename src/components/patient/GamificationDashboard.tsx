import React, { useState } from 'react';
import {
  Flame,
  Award,
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Trophy,
  Volume2,
  Heart,
  Calendar,
  Lock,
  Zap,
  ChevronRight,
  TrendingUp,
  Info,
  Clock,
  PlusCircle,
  HelpCircle,
  Target
} from 'lucide-react';
import { speakMessage } from '../../services/audio';
import { translations } from '../../translations';
import type { GamificationProfile, MaternalBadge } from '../../types';

interface GamificationDashboardProps {
  profile: GamificationProfile;
  language: string;
  onOpenLogModal?: () => void;
  onBadgeSelect?: (badge: MaternalBadge) => void;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  profile,
  language,
  onOpenLogModal,
  onBadgeSelect,
}) => {
  const t = translations[language] || translations.en;
  const [selectedBadge, setSelectedBadge] = useState<MaternalBadge | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const { streak, points, badges, level } = profile;
  const unlockedBadges = badges.filter((b) => b.unlockedAt);
  const lockedBadges = badges.filter((b) => !b.unlockedAt);

  const filteredBadges =
    badgeFilter === 'unlocked'
      ? unlockedBadges
      : badgeFilter === 'locked'
      ? lockedBadges
      : badges;

  // Level Progression calculation
  const nextLevelProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(((points - level.minPoints) / (level.maxPoints - level.minPoints)) * 100)
    )
  );

  // Next streak milestone target
  const nextMilestone =
    streak.currentStreak < 3
      ? { target: 3, name: '3-Day Vital Guardian', daysLeft: 3 - streak.currentStreak }
      : streak.currentStreak < 7
      ? { target: 7, name: '7-Day Safe Motherhood Shield', daysLeft: 7 - streak.currentStreak }
      : streak.currentStreak < 14
      ? { target: 14, name: '14-Day Maternal Champion', daysLeft: 14 - streak.currentStreak }
      : { target: 30, name: 'Monthly Guardian Legend', daysLeft: 30 - streak.currentStreak };

  const handleHearStreak = () => {
    speakMessage(
      `${t.streakTitle}: ${streak.currentStreak} ${t.daysStreak}. ${t.streakReinforcement} You have earned ${unlockedBadges.length} safe motherhood badges and ${points} care points.`,
      language
    );
  };

  const handleBadgeClick = (badge: MaternalBadge) => {
    setSelectedBadge(badge);
    if (onBadgeSelect) onBadgeSelect(badge);
    speakMessage(
      `${badge.title}. ${badge.description}. ${badge.unlockedAt ? 'Status: Unlocked and earned!' : `In progress: ${badge.currentProgress} of ${badge.requiredProgress}`}`,
      language
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-6">
      
      {/* Dashboard Top Header & Audio Affirmation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
              <Trophy className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              {t.streakTitle || 'Daily Care Streak & Badges'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consistent maternal vital logging protects you and baby while unlocking positive reinforcement rewards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleHearStreak}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold border border-amber-200/60 transition-colors"
            title="Listen to voice guide"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>{t.voiceGuide || 'Listen to Guide'}</span>
          </button>

          {onOpenLogModal && (
            <button
              onClick={onOpenLogModal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Vitals</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Streak & Gamification Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Active Streak Counter */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/10 blur-lg pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Flame className="w-7 h-7 text-amber-200 fill-amber-300 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100 block">
                  Current Streak
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {streak.currentStreak}
                  </span>
                  <span className="text-sm font-bold font-display text-white">
                    {t.daysStreak || 'Days'}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-amber-100 border border-white/20">
              Best: {streak.longestStreak}d
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 relative z-10 text-xs text-amber-100 flex items-center justify-between">
            <span className="font-medium">
              Next Goal: {nextMilestone.name}
            </span>
            <span className="font-bold font-mono bg-white/20 px-1.5 py-0.5 rounded">
              {nextMilestone.daysLeft}d left
            </span>
          </div>
        </div>

        {/* Card 2: Earned Badges Counter */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-indigo-500/10 blur-lg pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center border border-indigo-400/30">
                <Award className="w-7 h-7 text-indigo-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 block">
                  Earned Badges
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {unlockedBadges.length}
                  </span>
                  <span className="text-sm font-semibold text-indigo-200">
                    / {badges.length} Unlocked
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              +{unlockedBadges.reduce((sum, b) => sum + b.pointsAwarded, 0)} pts
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 relative z-10 text-xs text-indigo-200 flex items-center justify-between">
            <span>Locked Badges Available:</span>
            <span className="font-bold font-mono text-white">{lockedBadges.length} remaining</span>
          </div>
        </div>

        {/* Card 3: Care Points & Motherhood Level */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.levelTitle || 'Maternal Level'}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Level {level.levelNumber}</span>
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                {level.title}
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-600 font-semibold mt-0.5">
              {points} total care points
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Next Level Progress</span>
              <span className="font-mono font-bold text-slate-700">{nextLevelProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${nextLevelProgress}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* 7-Day Weekly Vital Logging Consistency Tracker */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Weekly Logging Consistency
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Mon – Sun schedule
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {streak.weeklyHistory.map((day, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                day.logged
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                  : day.isToday
                  ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/30'
                  : 'bg-white border-slate-200 text-slate-400 opacity-80'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {day.dayName}
              </span>

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  day.logged
                    ? 'bg-emerald-500 text-white'
                    : day.isToday
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {day.logged ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : day.isToday ? (
                  <PlusCircle className="w-4 h-4 text-white" />
                ) : (
                  <span>·</span>
                )}
              </div>

              <span className="text-[9px] font-semibold">
                {day.logged ? 'Logged' : day.isToday ? 'Today' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Earned & Available Badges Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.badgesEarned || 'Safe Motherhood Badges'}
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {unlockedBadges.length} earned
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold self-stretch sm:self-auto">
            <button
              onClick={() => setBadgeFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-colors ${
                badgeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({badges.length})
            </button>
            <button
              onClick={() => setBadgeFilter('unlocked')}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-colors ${
                badgeFilter === 'unlocked'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Earned ({unlockedBadges.length})
            </button>
            <button
              onClick={() => setBadgeFilter('locked')}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-colors ${
                badgeFilter === 'locked'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Locked ({lockedBadges.length})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredBadges.map((badge) => {
            const isUnlocked = Boolean(badge.unlockedAt);
            const progressPct = Math.min(
              100,
              Math.round((badge.currentProgress / badge.requiredProgress) * 100)
            );

            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-50/50 via-white to-orange-50/40 border-amber-300 hover:border-amber-400 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 opacity-85'
                }`}
              >
                {/* Unlocked celebratory corner badge */}
                {isUnlocked && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300/80 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Earned</span>
                  </div>
                )}

                {!isUnlocked && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded-full">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>In Progress</span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-2xs ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-amber-400 to-rose-400 border border-amber-200'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{badge.icon}</span>
                  </div>

                  <div className="flex-1 pr-14 sm:pr-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar or unlock timestamp */}
                <div className="mt-3.5 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                  {isUnlocked ? (
                    <>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Awarded: +{badge.pointsAwarded} pts
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 font-bold">
                        {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'Active'}
                      </span>
                    </>
                  ) : (
                    <div className="w-full space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Progress: {badge.currentProgress}/{badge.requiredProgress}</span>
                        <span className="font-bold text-amber-700">+{badge.pointsAwarded} pts</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Badge Detail Modal / Info Drawer */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-3xl shadow-md border-2 border-white">
                <span>{selectedBadge.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {selectedBadge.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Badge Status:</span>
                <span className="font-bold text-emerald-700">
                  {selectedBadge.unlockedAt ? '✓ Unlocked & Active' : 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Points Value:</span>
                <span className="font-bold font-mono text-amber-700">
                  +{selectedBadge.pointsAwarded} pts
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Requirements:</span>
                <span className="font-mono text-slate-700">
                  {selectedBadge.currentProgress} / {selectedBadge.requiredProgress} daily actions
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  speakMessage(
                    `${selectedBadge.title}. ${selectedBadge.description}. Worth ${selectedBadge.pointsAwarded} points.`,
                    language
                  )
                }
                className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>Hear Voice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
