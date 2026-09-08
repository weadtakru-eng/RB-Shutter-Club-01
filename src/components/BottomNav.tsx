import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenShutter: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenShutter,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_rgba(107,56,212,0.06)] pb-safe">
      <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around relative">
        {/* Tab 1: Challenges (Home) */}
        <button
          onClick={() => onNavigate('challenges')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-14 transition-colors active:scale-95 ${
            currentTab === 'challenges'
              ? 'text-purple-700 font-bold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{ fontVariationSettings: currentTab === 'challenges' ? "'FILL' 1" : "'FILL' 0" }}
          >
            auto_awesome_mosaic
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">หน้าหลัก</span>
        </button>

        {/* Tab 2: Activities / Quests */}
        <button
          onClick={() => onNavigate('activities')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-14 transition-colors active:scale-95 ${
            currentTab === 'activities'
              ? 'text-purple-700 font-bold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{ fontVariationSettings: currentTab === 'activities' ? "'FILL' 1" : "'FILL' 0" }}
          >
            calendar_month
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">กิจกรรม</span>
        </button>

        {/* Center: Floating Shutter Capture Trigger */}
        <div className="relative flex items-center justify-center w-14">
          <button
            onClick={onOpenShutter}
            aria-label="ถ่ายภาพและส่งผลงาน"
            className="absolute -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-500 text-white shadow-[0_8px_24px_rgba(107,56,212,0.42)] active:scale-90 transition-transform ring-4 ring-white"
          >
            <span className="material-symbols-outlined text-[28px]">photo_camera</span>
          </button>
        </div>

        {/* Tab 3: Gallery */}
        <button
          onClick={() => onNavigate('gallery')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-14 transition-colors active:scale-95 ${
            currentTab === 'gallery'
              ? 'text-purple-700 font-bold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{ fontVariationSettings: currentTab === 'gallery' ? "'FILL' 1" : "'FILL' 0" }}
          >
            perm_media
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">แกลเลอรี</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-14 transition-colors active:scale-95 ${
            currentTab === 'profile'
              ? 'text-purple-700 font-bold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
          }`}
        >
          <span
            className="material-symbols-outlined text-[23px]"
            style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
          >
            person
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">โปรไฟล์</span>
        </button>
      </div>
    </nav>
  );
};
