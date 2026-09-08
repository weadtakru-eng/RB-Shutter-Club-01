import React, { useState } from 'react';
import { ActiveTab, NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenShutter: () => void;
  onShowToast: (msg: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onNavigate,
  onOpenShutter,
  onShowToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'quests' | 'friends'>('all');

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.isUnread;
    if (activeFilter === 'quests') return n.category === 'quests';
    if (activeFilter === 'friends') return n.category === 'friends';
    return true;
  });

  const todayNotifs = filtered.slice(0, 4);
  const earlierNotifs = filtered.slice(4);

  const handleAction = (notif: NotificationItem) => {
    if (notif.actionTargetTab) {
      onNavigate(notif.actionTargetTab);
    } else if (notif.actionText === 'ส่งรูปตอนนี้') {
      onOpenShutter();
    } else {
      onShowToast(`เปิดรายละเอียด: ${notif.title}`);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-4 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">การแจ้งเตือน</h1>
          {unreadCount > 0 && (
            <span className="text-xs bg-rose-500 text-white font-black px-2 py-0.5 rounded-full shadow-xs">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
          >
            อ่านทั้งหมด
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            activeFilter === 'all'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            activeFilter === 'unread'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          ยังไม่อ่าน {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          onClick={() => setActiveFilter('quests')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            activeFilter === 'quests'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          ภารกิจ
        </button>
        <button
          onClick={() => setActiveFilter('friends')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            activeFilter === 'friends'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          เพื่อน & ชุมชน
        </button>
      </div>

      {/* Group: วันนี้ (Today) */}
      {todayNotifs.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
            วันนี้
          </span>
          <div className="space-y-2.5">
            {todayNotifs.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  item.isUnread
                    ? 'bg-white border-purple-200/80 shadow-xs'
                    : 'bg-white/70 border-gray-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl ${item.iconBgClass} ${item.iconColorClass} flex items-center justify-center shrink-0 shadow-xs`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-extrabold text-xs text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0">{item.timeAgo}</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {item.badgeLabel && (
                    <div className="mt-1.5">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                        {item.badgeLabel}
                      </span>
                    </div>
                  )}

                  {item.actionText && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => handleAction(item)}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-full transition-all active:scale-95 shadow-xs"
                      >
                        {item.actionText}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group: ก่อนหน้านี้ (Earlier) */}
      {earlierNotifs.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
            ก่อนหน้านี้
          </span>
          <div className="space-y-2.5">
            {earlierNotifs.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-start gap-3.5"
              >
                <div
                  className={`w-10 h-10 rounded-2xl ${item.iconBgClass} ${item.iconColorClass} flex items-center justify-center shrink-0 shadow-xs`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-extrabold text-xs text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0">{item.timeAgo}</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {item.badgeLabel && (
                    <div className="mt-1.5">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                        {item.badgeLabel}
                      </span>
                    </div>
                  )}

                  {item.actionText && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => handleAction(item)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-1.5 rounded-full transition-all active:scale-95"
                      >
                        {item.actionText}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
