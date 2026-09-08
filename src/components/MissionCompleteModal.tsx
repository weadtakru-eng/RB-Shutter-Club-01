import React from 'react';
import { PhotoItem, UserProfile } from '../types';

interface MissionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  submittedPhoto?: Partial<PhotoItem>;
  user: UserProfile;
  onGoToGallery: () => void;
  onStartNextChallenge: () => void;
  onShowToast: (msg: string) => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  isOpen,
  onClose,
  submittedPhoto,
  user,
  onGoToGallery,
  onStartNextChallenge,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const photoUrl =
    submittedPhoto?.imageUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA0p1CMhk2ZCP8SDqMEvZXqvLeXxu_RNWvVa3GaLllPv0RBfAmH4RLkp4tJjtJtsb3gBXEbSzzRgPisusYn2JpzhsO3iPmFgMtirMv9-3G0me2IrAoWY6bCSnhDE0xv_oRVcSjGiUOm1gkXyoGzePPjDfwCixZxOvD6rV73HJmSUY7YU7JNwodVcQ2Bw911vLyEtP8ETVy31iSkz94UDO-Bs54p4JQpwAGBqTE0E9GcBBhb25_T-cO7';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex flex-col items-center justify-start sm:py-6 p-2 animate-in fade-in duration-300">
      <div className="bg-[#12141c] text-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-purple-500/30 relative my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-600/30 to-transparent pointer-events-none"></div>

        {/* Header Ribbon & Close */}
        <div className="relative z-10 px-5 pt-6 pb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
            <span className="material-symbols-outlined text-[14px]">military_tech</span>
            Challenge Mastered
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Title & Celebration */}
        <div className="px-5 text-center flex flex-col items-center relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>Mission Complete!</span>
            <span className="text-2xl">🎉</span>
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
            Outstanding capture! You found vibrant blue tones and maintained impeccable compositional balance.
          </p>
        </div>

        {/* Photo Card Preview */}
        <div className="px-5 mt-4 relative z-10">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-[4/5] bg-black">
            <img
              src={photoUrl}
              alt="Submitted photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Top Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>Verified Submission</span>
            </div>

            {/* Bottom Photo Metadata */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight text-white drop-shadow">
                  {submittedPhoto?.title || 'Blue Rhythms by the Lockers'}
                </span>
                <span className="text-[10px] text-gray-300 font-mono">
                  RAW • f/2.0 • 1/320s • ISO 160
                </span>
              </div>
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Gr.11
              </span>
            </div>
          </div>
        </div>

        {/* Rewards & Progression Grid */}
        <div className="px-5 mt-4 space-y-3 relative z-10">
          {/* XP Tile & Rank Tile */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#1b1f2e] border border-purple-500/20 p-3 rounded-2xl flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total XP</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-amber-300">
                  {user.currentXP + 50}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded-full">
                  +50
                </span>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">This week</span>
            </div>

            <div className="bg-[#1b1f2e] border border-purple-500/20 p-3 rounded-2xl flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400">Club Rank</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-white">#6</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded-full flex items-center">
                  <span className="material-symbols-outlined text-[10px]">arrow_upward</span> 1 Up
                </span>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">Top 15% of Club</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-[#1b1f2e] border border-purple-500/20 p-3 rounded-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300">Level 3 Amateur Shutter</span>
              <span className="font-mono text-gray-400 text-[11px]">730 / 800 XP</span>
            </div>
            <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                style={{ width: '91%' }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-400 text-right">
              Only 70 XP to Level 4 Lens Artisan
            </span>
          </div>

          {/* New Badge Unlocked Banner */}
          <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-pink-900/40 border border-purple-400/40 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-600/60 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-lg text-amber-300">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                palette
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                New Badge Unlocked
              </span>
              <h4 className="text-xs font-bold text-white truncate">Color Explorer</h4>
              <p className="text-[11px] text-gray-300 line-clamp-1">
                Completed 5 Color Hunt challenges (+50 XP Bonus)
              </p>
            </div>
          </div>

          {/* Mentor Feedback Snippet */}
          <div className="bg-[#181b28] border border-gray-800 p-3 rounded-2xl flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-pink-950 text-pink-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              M
            </div>
            <div className="flex flex-col min-w-0 text-xs">
              <span className="font-bold text-gray-200 text-[11px]">
                Mentor Maya Sterling (Photo Lead)
              </span>
              <p className="text-gray-400 italic text-[11px] mt-0.5 leading-relaxed">
                "The depth of field separates your friend smoothly from the background hallway blur. Superb composition!"
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={onGoToGallery}
              className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs transition-colors text-center"
            >
              View Club Gallery
            </button>
            <button
              onClick={onStartNextChallenge}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-1"
            >
              <span>Next: Golden Hour</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <button
            onClick={() => onShowToast('คัดลอกลิงก์การ์ดภาพถ่ายความสำเร็จแล้ว! พร้อมแชร์ลง Instagram Story')}
            className="text-center text-[11px] text-purple-400 hover:text-purple-300 font-semibold py-1 flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">share</span>
            <span>Share Photo Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
