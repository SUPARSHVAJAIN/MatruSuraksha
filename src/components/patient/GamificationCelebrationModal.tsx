import React, { useEffect } from 'react';
import { Sparkles, Trophy, Star, CheckCircle2, Flame, Award, X } from 'lucide-react';
import { speakMessage } from '../../services/audio';
import { translations } from '../../translations';
import type { MaternalBadge } from '../../types';

interface GamificationCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  pointsEarned: number;
  unlockedBadges: MaternalBadge[];
  language: string;
}

export const GamificationCelebrationModal: React.FC<GamificationCelebrationModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  pointsEarned,
  unlockedBadges,
  language,
}) => {
  const t = translations[language] || translations.en;

  useEffect(() => {
    if (isOpen) {
      if (unlockedBadges.length > 0) {
        speakMessage(
          `Hongera Mama! You unlocked the ${unlockedBadges[0].title} badge and reached a ${streakCount} day health streak!`,
          language
        );
      } else {
        speakMessage(
          `Great job Mama! You maintained your ${streakCount} day health streak and earned ${pointsEarned} points.`,
          language
        );
      }
    }
  }, [isOpen, streakCount, pointsEarned, unlockedBadges, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-amber-300 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95 duration-200 relative">
        
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Icon Header */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-500 mx-auto flex items-center justify-center text-4xl shadow-lg shadow-orange-200">
          {unlockedBadges.length > 0 ? (
            <Trophy className="w-10 h-10 text-white animate-bounce" />
          ) : (
            <span className="animate-bounce">🔥</span>
          )}
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            {unlockedBadges.length > 0 ? t.unlockedBadgeToast : 'Health Habit Champion!'}
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 font-display">
            {streakCount} {t.daysStreak}!
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            "{t.streakReinforcement}"
          </p>
        </div>

        {/* Points Banner */}
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex items-center justify-center gap-2 text-sm font-bold text-amber-900 font-mono">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>+{pointsEarned} Maternal Health Points!</span>
        </div>

        {/* Newly Unlocked Badge details if any */}
        {unlockedBadges.length > 0 && (
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-3.5 border border-rose-200 text-left space-y-1">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
              Badge Unlocked
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{unlockedBadges[0].icon}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{unlockedBadges[0].title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{unlockedBadges[0].description}</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
        >
          Keep Up the Great Care!
        </button>

      </div>
    </div>
  );
};
