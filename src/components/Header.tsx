import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { APP_LOGO_URL } from '../data/mockData';

interface HeaderProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  unreadCount: number;
  user: UserProfile;
  onOpenOnboarding: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  user,
  onOpenOnboarding,
  onOpenLogin,
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'challenges':
        return { title: 'ภารกิจถ่ายภาพ', sub: 'ชมรมถ่ายภาพราชินีบน' };
      case 'gallery':
        return { title: 'แกลเลอรีภาพถ่าย', sub: 'ชมรมถ่ายภาพราชินีบน' };
      case 'leaderboard':
        return { title: 'กระดานจัดอันดับ', sub: 'ซีซัน 2 • สัปดาห์ที่ 6' };
      case 'achievements':
        return { title: 'หอเกียรติยศ', sub: 'เหรียญรางวัลและความสำเร็จ' };
      case 'activities':
        return { title: 'กิจกรรมชมรม', sub: 'โรงเรียนราชินีบน' };
      case 'notifications':
        return { title: 'การแจ้งเตือน', sub: 'ข้อความ & ข่าวสาร' };
      case 'settings':
        return { title: 'การตั้งค่า', sub: 'ความเป็นส่วนตัว & บัญชี' };
      case 'profile':
        return { title: 'โปรไฟล์สมาชิก', sub: 'ราชินีบน ชัตเตอร์คลับ' };
      default:
        return { title: 'PIXEL QUEST', sub: 'ชมรมถ่ายภาพราชินีบน' };
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors active:scale-95"
            title="The Flash Club Tour"
          >
            <span className="material-symbols-outlined text-[19px]">explore</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => onNavigate('notifications')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative active:scale-95 ${
              currentTab === 'notifications'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Google Login Status or Avatar */}
          {!user.isLoggedIn ? (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-purple-600 hover:bg-purple-50/50 py-1 px-2.5 rounded-full text-xs font-bold text-gray-700 transition-all shadow-2xs active:scale-95"
              title="เข้าสู่ระบบด้วย Gmail"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden xs:inline text-[11px] text-purple-900 font-bold">เข้าสู่ระบบ</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('profile')}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative transition-transform active:scale-95 ${
                currentTab === 'profile'
                  ? 'ring-2 ring-purple-600 bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-800 ring-1 ring-purple-200'
              }`}
              title={`โปรไฟล์: ${user.name}`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-900 font-extrabold text-[8px] px-1 py-0.2 rounded-full border border-white leading-none">
                L{user.level}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
