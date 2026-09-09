import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LEADERBOARD_MEMBERS } from '../data/mockData';
import { LeaderboardEntry } from '../lib/userService';

interface LeaderboardViewProps {
  user: UserProfile;
  onGoToChallenges: () => void;
  onShowToast: (msg: string) => void;
  members?: LeaderboardEntry[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  onGoToChallenges,
  onShowToast,
  members,
}) => {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'all'>('weekly');

  // Merge Firestore members with mock data if less than 3 exist so podium is always rendered nicely
  const activeMembers: LeaderboardEntry[] = React.useMemo(() => {
    if (!members || members.length === 0) {
      return LEADERBOARD_MEMBERS.map((m) => ({
        ...m,
        uid: `mock-${m.rank}`,
        level: Math.max(1, Math.min(10, Math.floor(m.xp / 400) + 1)),
        isYou: Boolean(m.isYou),
      }));
    }

    if (members.length >= 3) {
      return members;
    }

    // If 1 or 2 real users exist, append mock members to fill the podium
    const userNames = new Set(members.map((m) => m.name));
    const filler: LeaderboardEntry[] = LEADERBOARD_MEMBERS.filter((m) => !userNames.has(m.name)).map((m) => ({
      ...m,
      uid: `mock-${m.rank}`,
      level: Math.max(1, Math.min(10, Math.floor(m.xp / 400) + 1)),
      isYou: false,
    }));

    const combined = [...members, ...filler];
    return combined.map((m, idx) => ({
      ...m,
      rank: idx + 1,
      isYou: m.isYou || (user.uid ? m.uid === user.uid : false),
    }));
  }, [members, user.uid]);

  const defaultTop1: LeaderboardEntry = {
    rank: 1,
    name: 'Praew Kanya',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    title: 'Visual Alchemist',
    xp: 2850,
    level: 7,
    badgeCount: 5,
    completedQuests: 8,
  };

  const defaultTop2: LeaderboardEntry = {
    rank: 2,
    name: 'Pimchanok S.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    title: 'Color Chaser',
    xp: 2420,
    level: 6,
    badgeCount: 3,
    completedQuests: 6,
  };

  const defaultTop3: LeaderboardEntry = {
    rank: 3,
    name: 'Natapat W.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    title: 'Street Scout',
    xp: 2190,
    level: 5,
    badgeCount: 3,
    completedQuests: 5,
  };

  const top1: LeaderboardEntry = activeMembers[0] || defaultTop1;
  const top2: LeaderboardEntry = activeMembers[1] || defaultTop2;
  const top3: LeaderboardEntry = activeMembers[2] || defaultTop3;
  const restMembers = activeMembers.slice(3);

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-4 pt-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
            ซีซัน 2 • สัปดาห์ที่ 6
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">ตารางอันดับชมรม</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            ท้าทายตนเอง สร้างแรงบันดาลใจให้เพื่อน
          </p>
        </div>
        <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
          <span className="material-symbols-outlined text-[13px]">timer</span>
          เหลือเวลา 2 วัน 14 ชม.
        </span>
      </div>

      {/* Time Filter Tabs */}
      <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          onClick={() => setTimeFilter('weekly')}
          className={`py-1.5 rounded-lg transition-all ${
            timeFilter === 'weekly' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          รายสัปดาห์
        </button>
        <button
          onClick={() => setTimeFilter('monthly')}
          className={`py-1.5 rounded-lg transition-all ${
            timeFilter === 'monthly' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          รายเดือน
        </button>
        <button
          onClick={() => setTimeFilter('all')}
          className={`py-1.5 rounded-lg transition-all ${
            timeFilter === 'all' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'
          }`}
        >
          ตลอดกาล
        </button>
      </div>

      {/* Top 3 Podium Display */}
      <div className="bg-gradient-to-b from-purple-100/70 via-white to-white rounded-3xl p-5 border border-purple-100 shadow-sm flex items-end justify-center gap-3 pt-8 pb-4">
        {/* #2 Rank: Left */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="relative mb-2">
            <img
              src={top2.avatar}
              alt={top2.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-300 shadow-sm"
            />
            <span className="absolute -bottom-2 inset-x-0 mx-auto w-5 h-5 rounded-full bg-slate-400 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
              2
            </span>
          </div>
          <span className="font-extrabold text-xs text-gray-900 truncate mt-1 w-full text-center">
            {top2.name}
          </span>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
            <span className="bg-purple-50 text-purple-700 font-bold px-1.5 py-0.2 rounded-md">
              Lv.{top2.level || 1}
            </span>
            <span>🏅 {top2.badgeCount ?? 2}</span>
          </div>
          <span className="text-xs font-extrabold text-purple-700 mt-1">{top2.xp} XP</span>
        </div>

        {/* #1 Rank: Center (Elevated) */}
        <div className="flex flex-col items-center flex-1 min-w-0 -mt-4">
          <span className="material-symbols-outlined text-amber-500 text-[24px] mb-1 animate-bounce">
            crown
          </span>
          <div className="relative mb-2">
            <img
              src={top1.avatar}
              alt={top1.name}
              className="w-18 h-18 rounded-full object-cover border-4 border-amber-400 shadow-md ring-4 ring-amber-100"
            />
            <span className="absolute -bottom-2 inset-x-0 mx-auto w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              1
            </span>
          </div>
          <span className="font-black text-sm text-gray-900 truncate mt-1 w-full text-center">
            {top1.name}
          </span>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-600 mt-0.5">
            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
              Lv.{top1.level || 1}
            </span>
            <span>🏅 {top1.badgeCount ?? 4}</span>
          </div>
          <span className="text-sm font-black text-amber-600 mt-1">{top1.xp} XP</span>
        </div>

        {/* #3 Rank: Right */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="relative mb-2">
            <img
              src={top3.avatar}
              alt={top3.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-600 shadow-sm"
            />
            <span className="absolute -bottom-2 inset-x-0 mx-auto w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
              3
            </span>
          </div>
          <span className="font-extrabold text-xs text-gray-900 truncate mt-1 w-full text-center">
            {top3.name}
          </span>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
            <span className="bg-purple-50 text-purple-700 font-bold px-1.5 py-0.2 rounded-md">
              Lv.{top3.level || 1}
            </span>
            <span>🏅 {top3.badgeCount ?? 2}</span>
          </div>
          <span className="text-xs font-extrabold text-purple-700 mt-1">{top3.xp} XP</span>
        </div>
      </div>

      {/* Current User Standing Banner */}
      <div className="w-full bg-purple-900 text-white rounded-2xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-sm border-2 border-purple-400">
              คุณ
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{user.name}</span>
                <span className="text-[10px] bg-purple-800 text-purple-200 px-2 py-0.2 rounded-full font-semibold">
                  อันดับ #{user.rank} • Lv.{user.level}
                </span>
              </div>
              <span className="text-xs text-purple-200 mt-0.5">
                {user.currentXP} XP • สตรีค {user.currentStreak || 0} วัน • 🏅 {user.badgesCount || 0} เหรียญ
              </span>
            </div>
          </div>
          <button
            onClick={onGoToChallenges}
            className="bg-white hover:bg-purple-50 text-purple-900 font-bold text-xs px-3.5 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
          >
            ดูภารกิจ
          </button>
        </div>
        <p className="text-[11px] text-purple-200/90 leading-relaxed border-t border-purple-800/80 pt-2">
          พิชิตภารกิจสัปดาห์นี้เพื่อรับ XP เพิ่มเติมและไต่อันดับสู่ท็อปช่างภาพ!
        </p>
      </div>

      {/* Rankings List */}
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-500">
          <span>ช่างภาพร่วมกิจกรรม ({activeMembers.length} คน)</span>
          <span>คะแนน XP</span>
        </div>

        {restMembers.map((member) => (
          <div
            key={member.rank}
            className={`px-4 py-3 flex items-center justify-between transition-colors ${
              member.isYou
                ? 'bg-purple-50/90 border-l-4 border-purple-600 ring-1 ring-purple-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-5 text-center font-bold text-xs text-gray-500">
                {member.rank}
              </span>
              <img
                src={member.avatar}
                alt={member.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-gray-900 truncate">
                    {member.name}
                  </span>
                  {member.isYou && (
                    <span className="text-[9px] bg-purple-700 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                      คุณ
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">({member.grade})</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                  <span className="bg-purple-50 text-purple-700 font-bold px-1.5 py-0.2 rounded-md">
                    Lv.{member.level || 1}
                  </span>
                  <span>🏅 {member.badgeCount ?? 1}</span>
                  <span>🎯 {member.completedQuests ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {member.change && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    member.change.startsWith('+')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {member.change}
                </span>
              )}
              <span className="font-black text-xs text-gray-900">{member.xp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Inspirational Club Quote */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
        <p className="text-xs italic text-gray-600 font-serif">
          "การถ่ายภาพคือเรื่องราวที่เราไม่อาจบรรยายออกมาเป็นคำพูดได้"
        </p>
        <span className="text-[10px] text-gray-400 font-sans mt-1 block">
          — เดสติน สปาร์กส์ • ข้อคิดประจำสัปดาห์ ชมรม RB Shutter Club
        </span>
      </div>
    </div>
  );
};
