import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { APP_LOGO_URL } from '../data/mockData';

interface HeaderProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  unreadCount: number;
  user: UserProfile;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  user,
  onOpenOnboarding,
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'challenges':
        return { title: 'Challenges', sub: 'RB Shutter Club' };
      case 'gallery':
        return { title: 'Gallery', sub: 'RB Shutter Club' };
      case 'leaderboard':
        return { title: 'Leaderboard', sub: 'Season 2 • Week 6' };
      case 'achievements':
        return { title: 'Achievements', sub: 'Hall of Trophies' };
      case 'activities':
        return { title: 'Club Activities', sub: 'Rayongwittayakom' };
      case 'notifications':
        return { title: 'การแจ้งเตือน', sub: 'Notifications' };
      case 'settings':
        return { title: 'Settings', sub: 'RB Shutter Club' };
      case 'profile':
        return { title: 'Member Profile', sub: 'PIXEL QUEST' };
      default:
        return { title: 'PIXEL QUEST', sub: 'RB Shutter Club' };
    }
  };

  const { title, sub } = getTitle();

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        {/* Left: Brand Logo & Context */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => onNavigate('challenges')}
            className="flex items-center gap-2 text-left focus:outline-none group active:scale-95 transition-transform"
            title="Go to Home"
          >
            <img
              src={APP_LOGO_URL}
              alt="RB Shutter Club"
              className="h-8 w-8 object-contain rounded-full shadow-xs"
              onError={(e) => {
                // Fallback icon if image network is delayed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-[16px] text-gray-900 tracking-tight leading-tight group-hover:text-purple-700 transition-colors truncate max-w-[130px]">
                {title}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 tracking-wider uppercase leading-none">
                {sub}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Quick navigation pill badges */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold">
          <button
            onClick={() => onNavigate('leaderboard')}
            className={`px-2 py-1 rounded-full transition-colors ${
              currentTab === 'leaderboard'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Rank #{user.rank}
          </button>
          <button
            onClick={() => onNavigate('achievements')}
            className={`px-2 py-1 rounded-full transition-colors ${
              currentTab === 'achievements'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Badges
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Welcome / Onboarding Splash Re-open */}
          <button
            onClick={onOpenOnboarding}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors active:scale-95"
            title="The Flash Club Tour"
          >
            <span className="material-symbols-outlined text-[20px]">explore</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => onNavigate('notifications')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors relative active:scale-95 ${
              currentTab === 'notifications'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[21px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar -> Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative transition-transform active:scale-95 ${
              currentTab === 'profile'
                ? 'ring-2 ring-purple-600 bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-800 ring-1 ring-purple-200'
            }`}
            title="My Profile"
          >
            <span>P</span>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-900 font-extrabold text-[8px] px-1 py-0.2 rounded-full border border-white leading-none">
              L{user.level}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
