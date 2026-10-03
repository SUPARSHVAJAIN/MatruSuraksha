import React, { useState } from 'react';
import {
  Flame,
  Award,
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Trophy,
  Volume2,
  Heart,
  Calendar,
  Lock,
  Zap
} from 'lucide-react';
import { speakMessage } from '../../services/audio';
import { translations } from '../../translations';
import type { GamificationProfile, MaternalBadge } from '../../types';

interface MaternalGamificationProps {
  profile: GamificationProfile;
  language: string;
  onBadgeClick?: (badge: MaternalBadge) => void;
}

export const MaternalGamification: React.FC<MaternalGamificationProps> = ({
  profile,
  language,
}) => {
  const t = translations[language] || translations.en;
  const [selectedBadge, setSelectedBadge] = useState<MaternalBadge | null>(null);

  const { streak, points, badges, level } = profile;
  const unlockedBadges = badges.filter((b) => b.unlockedAt);
  const nextLevelProgress = Math.min(
    100,
    Math.round(((points - level.minPoints) / (level.maxPoints - level.minPoints)) * 100)
  );

  const handleHearReinforcement = () => {
    speakMessage(
      `${t.streakTitle}: ${streak.currentStreak} ${t.daysStreak}. ${t.streakReinforcement}`,
      language
    );
  };

  const handleHearBadge = (badge: MaternalBadge) => {
    setSelectedBadge(badge);
    speakMessage(
      `${badge.title}. ${badge.description}. ${badge.unlockedAt ? 'Unlocked!' : 'In progress'}`,
      language
    );
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Main Streak & Level Showcase Card */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          
          {/* Left: Streak Counter */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <span className="text-3xl animate-bounce">🔥</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white drop-shadow-xs">
                  {streak.currentStreak}
                </span>
                <span className="text-base font-bold font-display uppercase tracking-wide text-white">
                  {t.daysStreak}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium flex items-center gap-1.5 mt-0.5">
                <span>Longest: {streak.longestStreak} days</span>
                <span aria-hidden="true">·</span>
                <span>{unlockedBadges.length}/{badges.length} Badges</span>
              </p>
            </div>
          </div>

          {/* Right: Points & Level Badge */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-white/25 self-stretch sm:self-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] text-amber-100 uppercase font-bold tracking-wider block">
                {t.maternalPoints}
              </span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span className="text-lg font-bold font-mono text-white">{points}</span>
                <span className="text-xs text-amber-100">pts</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/20 mx-1" />

            <div className="text-right">
              <span className="text-[10px] text-amber-100 uppercase font-bold tracking-wider block">
                {t.levelTitle}
              </span>
              <span className="text-xs font-bold text-white block truncate max-w-[120px]">
                {level.title}
              </span>
            </div>
          </div>

        </div>

        {/* Level Progression Bar */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-[11px] mb-1 text-amber-100 font-medium">
            <span>Level {level.levelNumber} Progress</span>
            <span className="font-mono">{points} / {level.maxPoints} pts</span>
          </div>
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${nextLevelProgress}%` }}
            />
          </div>
        </div>

        {/* 7-Day Weekly Calendar Visualizer */}
        <div className="mt-4 bg-black/15 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/90 mb-2.5">
            <span className="font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>This Week's Tracking</span>
            </span>
            <button
              onClick={handleHearReinforcement}
              className="text-white/80 hover:text-white p-1"
              title="Hear voice encouragement"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {streak.weeklyHistory.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-white/80 uppercase">
                  {day.dayName}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    day.logged
                      ? 'bg-white text-emerald-700 shadow-xs ring-2 ring-emerald-300'
                      : day.isToday
                      ? 'bg-white/30 text-white border-2 border-white animate-pulse'
                      : 'bg-white/10 text-white/50 border border-white/10'
                  }`}
                  title={`${day.dayName}: ${day.logged ? 'Vitals logged' : day.isToday ? 'Today (Pending log)' : 'Not logged'}`}
                >
                  {day.logged ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  ) : day.isToday ? (
                    <span className="text-[10px]">Today</span>
                  ) : (
                    <span className="text-[10px] opacity-40">•</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-amber-100/90 mt-2.5 text-center italic">
            "{t.streakReinforcement}"
          </p>
        </div>

      </div>

      {/* 2. Safe Motherhood Badges Showcase */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">{t.badgesEarned}</h3>
              <p className="text-xs text-slate-500">Milestones for safe prenatal monitoring</p>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
            {unlockedBadges.length} Unlocked
          </span>
        </div>

        {/* Badges Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {badges.map((badge) => {
            const isUnlocked = Boolean(badge.unlockedAt);
            const isSelected = selectedBadge?.id === badge.id;

            return (
              <div
                key={badge.id}
                onClick={() => handleHearBadge(badge)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? isSelected
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300'
                      : 'bg-gradient-to-b from-white to-amber-50/30 border-amber-200 hover:border-amber-300 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-65 hover:opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-2xl select-none">{badge.icon}</span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        +{badge.pointsAwarded}
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar if in-progress */}
                {!isUnlocked && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5 font-mono">
                      <span>Progress</span>
                      <span>{badge.currentProgress}/{badge.requiredProgress}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (badge.currentProgress / badge.requiredProgress) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isUnlocked && (
                  <div className="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Unlocked</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Badge Detail Card */}
        {selectedBadge && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{selectedBadge.icon}</span>
              <div>
                <span className="font-bold block">{selectedBadge.title}</span>
                <span className="text-slate-500 text-[11px] block">{selectedBadge.description}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="text-slate-400 hover:text-slate-600 text-[11px] font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
