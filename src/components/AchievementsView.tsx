import React, { useState, useEffect, useMemo } from 'react';
import { BadgeItem, UserProfile } from '../types';
import { INITIAL_BADGES } from '../data/mockData';
import {
  subscribeToBadges,
  subscribeToUserBadges,
  BadgeDocument,
  UserBadgeDocument,
  SEED_BADGES,
} from '../lib/gamificationService';

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
  const [firestoreBadges, setFirestoreBadges] = useState<BadgeDocument[]>(SEED_BADGES as BadgeDocument[]);
  const [userBadges, setUserBadges] = useState<UserBadgeDocument[]>([]);

  // Real-time listener for Badges definitions
  useEffect(() => {
    const unsub = subscribeToBadges((list) => {
      if (list && list.length > 0) {
        setFirestoreBadges(list);
      }
    });
    return () => unsub();
  }, []);

  // Real-time listener for User's earned badges
  useEffect(() => {
    if (!user.uid) {
      setUserBadges([]);
      return;
    }
    const unsub = subscribeToUserBadges(user.uid, (list) => {
      setUserBadges(list);
    });
    return () => unsub();
  }, [user.uid]);

  // Merge Firestore badge definitions with user progress and unlocked status
  const badgesList: BadgeItem[] = useMemo(() => {
    const earnedIds = new Set(userBadges.map((ub) => ub.badgeId));

    return firestoreBadges.map((b) => {
      const isUnlocked = earnedIds.has(b.id);

      // Compute progress for locked badges
      let progressCurrent = 0;
      const progressTotal = b.requirementValue || 1;
      let tagline = b.requirement;

      if (isUnlocked) {
        progressCurrent = progressTotal;
        tagline = 'ปลดล็อกแล้ว';
      } else {
        switch (b.id) {
          case 'first-shot':
            progressCurrent = Math.min(user.questsCompleted || 0, 1);
            tagline = `${progressCurrent}/${progressTotal} ภารกิจ`;
            break;
          case 'color-explorer':
            progressCurrent = Math.min(user.questsCompleted || 0, 5);
            tagline = `${progressCurrent}/${progressTotal} Color Hunt`;
            break;
          case 'shape-hunter':
            progressCurrent = Math.min(user.questsCompleted || 0, 10);
            tagline = `${progressCurrent}/${progressTotal} Shape Hunt`;
            break;
          case 'creative-eye':
            progressCurrent = Math.min(user.questsCompleted || 0, 5);
            tagline = `${progressCurrent}/${progressTotal} Creative`;
            break;
          case 'bronze-streak':
            progressCurrent = Math.min(user.currentStreak || 0, 3);
            tagline = `สตรีคปัจจุบัน ${user.currentStreak || 0}/${progressTotal} วัน`;
            break;
          case 'challenge-streak':
            progressCurrent = Math.min(user.currentStreak || 0, 7);
            tagline = `สตรีคปัจจุบัน ${user.currentStreak || 0}/${progressTotal} วัน`;
            break;
          case 'photography-dedication':
            progressCurrent = Math.min(user.currentStreak || 0, 14);
            tagline = `สตรีคปัจจุบัน ${user.currentStreak || 0}/${progressTotal} วัน`;
            break;
          case 'shutter-legend':
            progressCurrent = Math.min(user.currentStreak || 0, 30);
            tagline = `สตรีคปัจจุบัน ${user.currentStreak || 0}/${progressTotal} วัน`;
            break;
          case 'photography-explorer':
            progressCurrent = Math.min(user.questsCompleted || 0, 20);
            tagline = `${progressCurrent}/${progressTotal} ภารกิจสะสม`;
            break;
          case 'top-photographer':
            progressCurrent = user.rank && user.rank <= 3 ? 3 : 1;
            tagline = user.rank ? `ปัจจุบันอยู่อันดับ #${user.rank}` : 'ติดอันดับ 1-3 บน Leaderboard';
            break;
          default:
            progressCurrent = Math.min(user.questsCompleted || 0, progressTotal);
            tagline = `${progressCurrent}/${progressTotal}`;
            break;
        }
      }

      return {
        id: b.id,
        name: b.name,
        description: b.description,
        xp: b.xpBonus || 50,
        icon: b.icon,
        status: isUnlocked ? 'unlocked' : 'in_progress',
        completedDate: isUnlocked ? 'ปลดล็อกแล้ว 🏆' : undefined,
        tagline,
        progressCurrent,
        progressTotal,
        accentGradient: b.accentGradient || 'from-purple-100 via-purple-200 to-indigo-100',
        iconColor: b.iconColor || 'text-purple-600',
      };
    });
  }, [firestoreBadges, userBadges, user]);

  const unlockedCount = useMemo(() => badgesList.filter((b) => b.status === 'unlocked').length, [badgesList]);
  const inProgressCount = useMemo(() => badgesList.filter((b) => b.status === 'in_progress').length, [badgesList]);
  const masteryCount = useMemo(() => badgesList.filter((b) => b.xp >= 150).length, [badgesList]);

  const totalBonusXP = useMemo(() => {
    return badgesList
      .filter((b) => b.status === 'unlocked')
      .reduce((sum, b) => sum + (b.xp || 0), 0);
  }, [badgesList]);

  const completionPercentage = useMemo(() => {
    if (badgesList.length === 0) return 0;
    return Math.round((unlockedCount / badgesList.length) * 100);
  }, [unlockedCount, badgesList.length]);

  const filteredBadges = badgesList.filter((b) => {
    if (filterTab === 'unlocked') return b.status === 'unlocked';
    if (filterTab === 'progress') return b.status === 'in_progress';
    if (filterTab === 'mastery') return b.xp >= 150;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-5 pt-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
            หอเกียรติยศและเหรียญรางวัล
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">ความสำเร็จ & เหรียญตรา</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            พัฒนาทักษะการถ่ายภาพและสะสมเหรียญตราเกียรติยศ
          </p>
        </div>
        <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
          <span
            className="material-symbols-outlined text-[16px] text-amber-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            stars
          </span>
          รวม +{totalBonusXP} XP
        </span>
      </div>

      {/* Progress Card with Radial Gauge */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex items-center justify-between gap-4">
        {/* Left: Level and XP Info */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
            ระดับปัจจุบัน
          </span>
          <h3 className="text-base font-extrabold text-gray-900 mt-0.5 truncate">
            เลเวล {user.level} {user.levelTitle}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            ปลดล็อกแล้ว {unlockedCount} / {badgesList.length} เหรียญตรา
          </p>

          <div className="mt-3 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-500">
              <span>เส้นทางสู่ระดับถัดไป</span>
              <span>{user.currentXP} / {user.targetXP} XP</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (user.currentXP / (user.targetXP || 1)) * 100)}%` }}
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
              className="text-purple-600 transition-all duration-700"
              strokeDasharray={`${completionPercentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-sm font-black text-gray-900">{completionPercentage}%</span>
            <span className="text-[8px] uppercase font-bold text-gray-400">ภาพรวม</span>
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
          ทั้งหมด ({badgesList.length})
        </button>
        <button
          onClick={() => setFilterTab('unlocked')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filterTab === 'unlocked'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          ปลดล็อกแล้ว ({unlockedCount})
        </button>
        <button
          onClick={() => setFilterTab('progress')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filterTab === 'progress'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          กำลังทำ ({inProgressCount})
        </button>
        <button
          onClick={() => setFilterTab('mastery')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            filterTab === 'mastery'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          ระดับเชี่ยวชาญ ({masteryCount})
        </button>
      </div>

      {/* Badges List */}
      <div className="space-y-3">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`bg-white rounded-2xl p-4 border shadow-xs flex items-center gap-3.5 hover:shadow-md transition-all ${
              badge.status === 'unlocked' ? 'border-purple-200/80' : 'border-gray-100 opacity-90'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.accentGradient} flex items-center justify-center shrink-0 shadow-xs ${badge.iconColor} ${
                badge.status === 'unlocked' ? 'ring-2 ring-purple-200' : 'grayscale-30'
              }`}
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

              {badge.status === 'in_progress' && badge.progressCurrent !== undefined && badge.progressTotal ? (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                    <span>{badge.tagline}</span>
                    <span>{badge.progressCurrent} / {badge.progressTotal}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (badge.progressCurrent / badge.progressTotal) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {badge.completedDate || 'ปลดล็อกแล้ว'}
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
            ภารกิจลับพิเศษ
          </span>
          <h3 className="text-base font-black">ผู้เล่นแร่แปรธาตุแสงสีทอง</h3>
          <p className="text-xs text-purple-200 leading-relaxed">
            ถ่ายภาพช่วงแสงสีทองในโรงเรียน 3 ภาพ ควบคุมแสงแฟลร์ได้อย่างประณีต เพื่อปลดล็อกใบประกาศนียบัตรพิเศษ
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">รางวัล +250 XP</span>
            <button
              onClick={onGoToChallenges}
              className="bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm"
            >
              ดูภารกิจ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
