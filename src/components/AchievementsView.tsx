import React, { useState } from 'react';
import { BadgeItem, UserProfile } from '../types';
import { INITIAL_BADGES } from '../data/mockData';

interface AchievementsViewProps {
  user: UserProfile;
  onGoToChallenges: () => void;
  onShowToast: (msg: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  user,
  onGoToChallenges,
  onShowToast,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'unlocked' | 'progress' | 'mastery'>('all');
  const [badges] = useState<BadgeItem[]>(INITIAL_BADGES);

  const filteredBadges = badges.filter((b) => {
    if (filterTab === 'unlocked') return b.status === 'unlocked';
    if (filterTab === 'progress') return b.status === 'in_progress';
    if (filterTab === 'mastery') return b.xp >= 100;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-5 pt-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
            Hall of Trophies
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Achievements</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Level up your creative skills and earn recognized badges
          </p>
        </div>
        <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
          <span
            className="material-symbols-outlined text-[16px] text-amber-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            stars
          </span>
          +320 XP Total
        </span>
      </div>

      {/* Progress Card with Radial Gauge */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex items-center justify-between gap-4">
        {/* Left: Level and XP Info */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
            Current Level
          </span>
          <h3 className="text-base font-extrabold text-gray-900 mt-0.5 truncate">
            Level {user.level} {user.levelTitle}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            7 / 16 Badges Unlocked
          </p>

          <div className="mt-3 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-500">
              <span>Mastery Path</span>
              <span>{user.currentXP} / {user.targetXP} XP</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(user.currentXP / user.targetXP) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right: SVG Radial Progress Ring */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-purple-600"
              strokeDasharray="44, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-sm font-black text-gray-900">44%</span>
            <span className="text-[8px] uppercase font-bold text-gray-400">Global</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filterTab === 'all'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          All Badges (16)
        </button>
        <button
          onClick={() => setFilterTab('unlocked')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filterTab === 'unlocked'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          Unlocked (7)
        </button>
        <button
          onClick={() => setFilterTab('progress')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filterTab === 'progress'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          In Progress (5)
        </button>
        <button
          onClick={() => setFilterTab('mastery')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filterTab === 'mastery'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          Mastery (4)
        </button>
      </div>

      {/* Badges List */}
      <div className="space-y-3">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.accentGradient} flex items-center justify-center shrink-0 shadow-xs ${badge.iconColor}`}
            >
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {badge.icon}
              </span>
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-gray-900 truncate">
                  {badge.name}
                </h4>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                  +{badge.xp} XP
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>

              {badge.status === 'in_progress' && badge.progressCurrent && badge.progressTotal ? (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                    <span>{badge.tagline}</span>
                    <span>{badge.progressCurrent} / {badge.progressTotal}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{
                        width: `${(badge.progressCurrent / badge.progressTotal) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {badge.completedDate || 'Completed'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Secret Quest Spotlight */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
            Secret Quest Spotlight
          </span>
          <h3 className="text-base font-black">The Golden Hour Alchemist</h3>
          <p className="text-xs text-purple-200 leading-relaxed">
            Capture 3 unique golden hour campus shots during sunrise or sunset with lens flare control. Unlocks exclusive Club Lead certificate.
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">+250 XP Reward</span>
            <button
              onClick={onGoToChallenges}
              className="bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm"
            >
              View Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
