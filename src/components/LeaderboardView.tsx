import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LEADERBOARD_MEMBERS } from '../data/mockData';

interface LeaderboardViewProps {
  user: UserProfile;
  onGoToChallenges: () => void;
  onShowToast: (msg: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  onGoToChallenges,
  onShowToast,
}) => {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'all'>('weekly');

  const top1 = LEADERBOARD_MEMBERS[0];
  const top2 = LEADERBOARD_MEMBERS[1];
  const top3 = LEADERBOARD_MEMBERS[2];
  const restMembers = LEADERBOARD_MEMBERS.slice(3);

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
          <span className="text-[10px] text-gray-500 truncate w-full text-center">
            {top2.title}
          </span>
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
          <span className="text-[10px] text-purple-700 font-bold truncate w-full text-center">
            {top1.title}
          </span>
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
          <span className="text-[10px] text-gray-500 truncate w-full text-center">
            {top3.title}
          </span>
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
                  อันดับ #{user.rank}
                </span>
              </div>
              <span className="text-xs text-purple-200">
                {user.currentXP} XP • ต่อเนื่อง 4 วัน
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
          ตามหลังอันดับ #6 (น้องพลอย) เพียง <span className="font-bold text-white">45 XP</span>! พิชิตภารกิจล่าสีสันวันนี้เพื่อเลื่อนอันดับ
        </p>
      </div>

      {/* Rankings List */}
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-500">
          <span>ช่างภาพร่วมกิจกรรม (32 คน)</span>
          <span>คะแนน XP</span>
        </div>

        {restMembers.map((member) => (
          <div
            key={member.rank}
            className={`px-4 py-3 flex items-center justify-between transition-colors ${
              member.isYou ? 'bg-purple-50/60' : 'hover:bg-gray-50'
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
                <span className="text-[10px] text-gray-500 truncate">{member.title}</span>
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
