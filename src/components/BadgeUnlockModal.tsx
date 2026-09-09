import React from 'react';
import { BadgeDocument } from '../lib/gamificationService';

interface BadgeUnlockModalProps {
  badge: BadgeDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onViewBadge: () => void;
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  badge,
  isOpen,
  onClose,
  onViewBadge,
}) => {
  if (!isOpen || !badge) return null;

  return (
    <div
      id="badge-unlock-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="badge-unlock-card"
        className="bg-white rounded-3xl p-6 w-full max-w-sm border border-purple-100 shadow-2xl flex flex-col items-center text-center relative overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow Background Effect */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-purple-200/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-200/50 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close button */}
        <button
          id="btn-close-badge-modal"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          title="ปิด"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
          <span
            className="material-symbols-outlined text-[15px] text-amber-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
          <span>Achievement Unlocked! 🎉</span>
        </div>

        {/* Badge Icon with Dynamic Radiant Rings */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-purple-400 to-amber-300 opacity-30 blur-xl animate-pulse"></div>
          <div
            className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${badge.accentGradient} ring-4 ring-white shadow-xl flex items-center justify-center ${badge.iconColor} z-10`}
          >
            <span
              className="material-symbols-outlined text-[42px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {badge.icon}
            </span>
          </div>
        </div>

        {/* Badge Title & Subtitle */}
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
          <span>🏆</span>
          <span>{badge.nameEn || badge.name}</span>
        </h3>

        <p className="text-xs text-purple-700 font-bold mt-0.5">{badge.name}</p>

        {/* Description */}
        <p className="text-xs text-gray-600 mt-2 px-2 leading-relaxed">
          {badge.description}
        </p>

        {/* XP Bonus Pill */}
        {badge.xpBonus > 0 && (
          <div className="mt-3 inline-flex items-center gap-1 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full text-xs font-extrabold text-purple-800">
            <span
              className="material-symbols-outlined text-[15px] text-purple-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <span>+{badge.xpBonus} XP โบนัสความสำเร็จ</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col w-full gap-2 z-10">
          <button
            id="btn-view-badge"
            onClick={onViewBadge}
            className="w-full py-3 rounded-full bg-purple-700 hover:bg-purple-800 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
            <span>ดู Badge ในหอเกียรติยศ</span>
          </button>

          <button
            id="btn-continue-challenge"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-xs transition-colors"
          >
            ทำ Challenge ต่อ
          </button>
        </div>
      </div>
    </div>
  );
};
