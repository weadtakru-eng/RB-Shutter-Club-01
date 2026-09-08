import React, { useState } from 'react';
import { PhotoItem, UserProfile, ActiveTab } from '../types';
import { INITIAL_BADGES } from '../data/mockData';

interface ProfileViewProps {
  user: UserProfile;
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onNavigate: (tab: ActiveTab) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onShowToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  photos,
  onSelectPhoto,
  onNavigate,
  onUpdateUser,
  onShowToast,
}) => {
  const [profileSubTab, setProfileSubTab] = useState<'photos' | 'badges' | 'quests'>('photos');
  const [photoFilter, setPhotoFilter] = useState<'all' | 'picks' | 'quests'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState(user.bio);
  const [editGear, setEditGear] = useState(user.cameraGear);

  const myPhotos = photos.filter((p) => p.authorName === 'Praew Kanya' || p.authorName === 'Praew K.');

  const displayedPhotos = myPhotos.filter((p) => {
    if (photoFilter === 'picks') return p.isMentorPick;
    if (photoFilter === 'quests') return Boolean(p.questTitle);
    return true;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ bio: editBio, cameraGear: editGear });
    setIsEditModalOpen(false);
    onShowToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
  };

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-5 pt-3">
      {/* Profile Header Block */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex flex-col gap-4">
        {/* Top bar with avatar & settings gear */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-purple-100 shadow-md">
                P
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-900 font-black text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-xs">
                Lv.{user.level}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-gray-900 tracking-tight">
                  {user.thaiName}
                </h1>
                <span
                  className="material-symbols-outlined text-purple-600 text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  title="Verified Student Photographer"
                >
                  verified
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium">{user.name}</span>
              <span className="text-[11px] text-purple-700 font-bold mt-0.5">
                {user.room} • {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>

        {/* Camera Gear Pill */}
        <div className="flex items-center gap-2 bg-purple-50/80 border border-purple-100/80 px-3 py-1.5 rounded-xl text-xs text-purple-950 font-semibold">
          <span className="material-symbols-outlined text-purple-700 text-[16px]">
            photo_camera
          </span>
          <span className="truncate">{user.cameraGear}</span>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-600 leading-relaxed">{user.bio}</p>

        {/* Edit Profile & Access Rights buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors text-center"
          >
            Edit Profile
          </button>
          <button
            onClick={() => onShowToast('สิทธิ์การใช้งาน: ชมรมถ่ายภาพระยองวิทยาคม (Verified)')}
            className="flex-1 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors text-center flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">badge</span>
            <span>Access Rights</span>
          </button>
        </div>

        {/* Level Progression */}
        <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">
              {user.levelTitle} Lv.{user.level}
            </span>
            <span className="font-mono text-gray-500 text-[11px]">
              {user.currentXP} / {user.targetXP} XP
            </span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(user.currentXP / user.targetXP) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 text-right">
            อีก {user.targetXP - user.currentXP} XP เพื่อเลื่อนระดับเป็น Level 4 Lens Artisan
          </span>
        </div>
      </div>

      {/* Stats 4-Grid Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div
          onClick={() => onNavigate('leaderboard')}
          className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col items-center cursor-pointer hover:border-purple-200 transition-colors"
        >
          <span className="text-sm font-black text-purple-700">#{user.rank}</span>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">Rank</span>
          <span className="text-[8px] text-gray-400">Top 10</span>
        </div>

        <div
          onClick={() => setProfileSubTab('photos')}
          className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col items-center cursor-pointer hover:border-purple-200 transition-colors"
        >
          <span className="text-sm font-black text-gray-900">{myPhotos.length}</span>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">ภาพถ่าย</span>
          <span className="text-[8px] text-emerald-600">Active</span>
        </div>

        <div
          onClick={() => onNavigate('challenges')}
          className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col items-center cursor-pointer hover:border-purple-200 transition-colors"
        >
          <span className="text-sm font-black text-gray-900">
            {user.questsCompleted}/{user.questsTotal}
          </span>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">ภารกิจ</span>
          <span className="text-[8px] text-purple-600">75% Done</span>
        </div>

        <div
          onClick={() => onNavigate('achievements')}
          className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col items-center cursor-pointer hover:border-purple-200 transition-colors"
        >
          <span className="text-sm font-black text-amber-600">{user.badgesCount}</span>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">เหรียญ</span>
          <span className="text-[8px] text-amber-700">+320 XP</span>
        </div>
      </div>

      {/* Profile Sub Tabs */}
      <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          onClick={() => setProfileSubTab('photos')}
          className={`py-2 rounded-lg transition-all ${
            profileSubTab === 'photos'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-gray-500'
          }`}
        >
          รูปถ่ายของฉัน ({myPhotos.length})
        </button>
        <button
          onClick={() => setProfileSubTab('badges')}
          className={`py-2 rounded-lg transition-all ${
            profileSubTab === 'badges'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-gray-500'
          }`}
        >
          เหรียญรางวัล ({user.badgesCount})
        </button>
        <button
          onClick={() => setProfileSubTab('quests')}
          className={`py-2 rounded-lg transition-all ${
            profileSubTab === 'quests'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-gray-500'
          }`}
        >
          ภารกิจ (Quests)
        </button>
      </div>

      {/* Sub Tab: My Photos */}
      {profileSubTab === 'photos' && (
        <div className="space-y-3">
          {/* Photo filter chips */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPhotoFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                photoFilter === 'all'
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setPhotoFilter('picks')}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                photoFilter === 'picks'
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              Mentor Picks ⭐
            </button>
            <button
              onClick={() => setPhotoFilter('quests')}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                photoFilter === 'quests'
                  ? 'bg-purple-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              ส่งภารกิจชมรม
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 gap-3">
            {displayedPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onSelectPhoto(photo)}
                className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-square border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {photo.isMentorPick && (
                  <span className="absolute top-2 left-2 bg-purple-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    Pick
                  </span>
                )}

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px]">
                  <span className="font-bold truncate max-w-[90px]">{photo.title}</span>
                  <span className="flex items-center gap-0.5">
                    <span
                      className="material-symbols-outlined text-[13px] text-rose-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                    {photo.likes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab: Badges */}
      {profileSubTab === 'badges' && (
        <div className="space-y-3">
          {INITIAL_BADGES.slice(0, 3).map((badge) => (
            <div
              key={badge.id}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex items-center gap-3"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.accentGradient} flex items-center justify-center shrink-0 ${badge.iconColor}`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {badge.icon}
                </span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-gray-900">{badge.name}</h4>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full">
                    +{badge.xp} XP
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{badge.description}</p>
                <span className="text-[10px] text-emerald-700 font-bold mt-1">
                  {badge.completedDate || 'Awarded'}
                </span>
              </div>
            </div>
          ))}
          <button
            onClick={() => onNavigate('achievements')}
            className="w-full py-2.5 rounded-xl bg-purple-50 text-purple-800 font-bold text-xs hover:bg-purple-100 transition-colors"
          >
            ดูเหรียญรางวัลทั้งหมดใน Hall of Trophies
          </button>
        </div>
      )}

      {/* Sub Tab: Quests */}
      {profileSubTab === 'quests' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-purple-700">
                Current Streak
              </span>
              <h4 className="text-base font-black text-gray-900 mt-0.5">7-Day Creative Streak</h4>
              <p className="text-xs text-gray-500">Term 2 Week 6 active</p>
            </div>
            <span
              className="material-symbols-outlined text-amber-500 text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>

          <button
            onClick={() => onNavigate('challenges')}
            className="w-full py-3 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all text-center"
          >
            สำรวจภารกิจท้าทายใหม่
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">แก้ไขข้อมูลโปรไฟล์</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">อุปกรณ์กล้อง & เลนส์ (Camera Gear)</label>
              <input
                type="text"
                value={editGear}
                onChange={(e) => setEditGear(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">ประวัติโดยย่อ (Bio)</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2 rounded-full bg-gray-100 text-gray-700 text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
