import React, { useState, useEffect, useMemo } from 'react';
import { PhotoItem, UserProfile, ActiveTab } from '../types';
import { INITIAL_BADGES } from '../data/mockData';
import {
  subscribeToBadges,
  subscribeToUserBadges,
  BadgeDocument,
  UserBadgeDocument,
  SEED_BADGES,
} from '../lib/gamificationService';

interface ProfileViewProps {
  user: UserProfile;
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onNavigate: (tab: ActiveTab) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onShowToast: (msg: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  photos,
  onSelectPhoto,
  onNavigate,
  onUpdateUser,
  onShowToast,
  onOpenLogin,
  onLogout,
}) => {
  const [profileSubTab, setProfileSubTab] = useState<'photos' | 'badges' | 'quests'>('photos');
  const [photoFilter, setPhotoFilter] = useState<'all' | 'picks' | 'quests'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState(user.bio);
  const [editGear, setEditGear] = useState(user.cameraGear);

  const [firestoreBadges, setFirestoreBadges] = useState<BadgeDocument[]>(SEED_BADGES as BadgeDocument[]);
  const [userBadges, setUserBadges] = useState<UserBadgeDocument[]>([]);

  useEffect(() => {
    const unsub = subscribeToBadges((list) => {
      if (list && list.length > 0) setFirestoreBadges(list);
    });
    return () => unsub();
  }, []);

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

  const earnedBadgeIds = useMemo(() => new Set(userBadges.map((b) => b.badgeId)), [userBadges]);

  const earnedBadges = useMemo(
    () => firestoreBadges.filter((b) => earnedBadgeIds.has(b.id)),
    [firestoreBadges, earnedBadgeIds]
  );

  const lockedBadges = useMemo(
    () => firestoreBadges.filter((b) => !earnedBadgeIds.has(b.id)),
    [firestoreBadges, earnedBadgeIds]
  );

  const earnedBonusXP = useMemo(
    () => earnedBadges.reduce((sum, b) => sum + (b.xpBonus || 0), 0),
    [earnedBadges]
  );

  const myPhotos = photos.filter(
    (p) =>
      (user.uid && p.authorId === user.uid) ||
      p.authorName === user.name ||
      p.authorName === user.thaiName ||
      p.authorName === 'Praew Kanya' ||
      p.authorName === 'Praew K.'
  );

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
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-purple-100 shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
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
            title="การตั้งค่า"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>

        {/* Google Account Status Badge / Quick Login */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0 border border-purple-100">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {user.isLoggedIn ? 'บัญชี Google / Gmail' : 'ระบบยืนยันตัวตน'}
              </span>
              <span className="text-xs font-bold text-gray-900 truncate">
                {user.isLoggedIn ? user.email : 'ยังไม่ได้เชื่อมต่อ Gmail'}
              </span>
            </div>
          </div>

          {user.isLoggedIn ? (
            <button
              onClick={onLogout}
              className="text-[11px] font-bold text-gray-600 hover:text-rose-600 bg-white border border-gray-200 px-2.5 py-1 rounded-xl shrink-0 transition-colors shadow-2xs"
            >
              ออกจากระบบ
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 px-2.5 py-1 rounded-xl shrink-0 transition-colors shadow-2xs hover:bg-purple-50"
            >
              เข้าสู่ระบบ
            </button>
          )}
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
            แก้ไขโปรไฟล์
          </button>
          <button
            onClick={() => onShowToast('สิทธิ์การใช้งาน: ชมรมถ่ายภาพระยองวิทยาคม (Verified)')}
            className="flex-1 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors text-center flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">badge</span>
            <span>สิทธิ์การใช้งาน</span>
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
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">อันดับ</span>
          <span className="text-[8px] text-gray-400">ท็อป 10</span>
        </div>

        <div
          onClick={() => setProfileSubTab('photos')}
          className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col items-center cursor-pointer hover:border-purple-200 transition-colors"
        >
          <span className="text-sm font-black text-gray-900">{user.photosCount || myPhotos.length}</span>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">ภาพถ่าย</span>
          <span className="text-[8px] text-emerald-600">เผยแพร่</span>
        </div>

        <div
          onClick={() => onNavigate('challenges')}
          className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col items-center cursor-pointer hover:border-purple-200 transition-colors"
        >
          <span className="text-sm font-black text-gray-900">
            {user.questsCompleted}/{user.questsTotal}
          </span>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">ภารกิจ</span>
          <span className="text-[8px] text-purple-600">สำเร็จแล้ว</span>
        </div>

        <div
          onClick={() => onNavigate('achievements')}
          className="bg-white rounded-2xl p-2.5 border border-gray-100 shadow-xs flex flex-col items-center cursor-pointer hover:border-purple-200 transition-colors"
        >
          <span className="text-sm font-black text-amber-600">{earnedBadges.length || user.badgesCount}</span>
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">เหรียญ</span>
          <span className="text-[8px] text-amber-700">+{earnedBonusXP} XP</span>
        </div>
      </div>

      {/* Streak & Consistency Showcase Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-black text-gray-900">
                สตรีค {user.currentStreak || 0} วันต่อเนื่อง
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                Active Streak
              </span>
            </div>
            <span className="text-[11px] text-gray-600 font-medium mt-0.5">
              สถิติต่อเนื่องสูงสุด: <span className="font-bold text-purple-700">{user.longestStreak || user.currentStreak || 0} วัน</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('challenges')}
          className="px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-amber-200 text-amber-900 text-xs font-bold transition-all shadow-2xs shrink-0 active:scale-95"
        >
          รักษา สตรีค
        </button>
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
          เหรียญรางวัล ({earnedBadges.length || user.badgesCount})
        </button>
        <button
          onClick={() => setProfileSubTab('quests')}
          className={`py-2 rounded-lg transition-all ${
            profileSubTab === 'quests'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-gray-500'
          }`}
        >
          ภารกิจท้าทาย
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
              ภาพเด่นจากเมนเทอร์ ⭐
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
                    ภาพเด่น
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
        <div className="space-y-4">
          {/* Section: Badges ที่ได้รับ (Earned) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[16px] text-amber-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
                เหรียญรางวัลที่ได้รับ ({earnedBadges.length})
              </span>
              <span className="text-[10px] text-purple-700 font-bold">
                รวม +{earnedBonusXP} XP
              </span>
            </div>

            {earnedBadges.length === 0 ? (
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/60 text-center">
                <p className="text-xs text-purple-900 font-bold">ยังไม่มีเหรียญรางวัล</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ส่งผลงานภาพถ่ายภารกิจเพื่อปลดล็อกเหรียญตราแรก!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-xs flex items-center gap-3"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.accentGradient || 'from-purple-100 to-indigo-100'} flex items-center justify-center shrink-0 ${badge.iconColor || 'text-purple-600'} ring-2 ring-purple-100`}
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
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                          +{badge.xpBonus} XP
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{badge.description}</p>
                      <span className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-[13px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        ปลดล็อกแล้ว
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Badges ที่ยังไม่ได้ (Locked พร้อม Requirement) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-gray-400">
                  lock
                </span>
                เหรียญตราที่รอการปลดล็อก ({lockedBadges.length})
              </span>
              <span className="text-[10px] text-gray-400 font-medium">เงื่อนไขความสำเร็จ</span>
            </div>

            <div className="space-y-2.5">
              {lockedBadges.slice(0, 5).map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-50/80 rounded-2xl p-3 border border-gray-200/70 shadow-2xs flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-2xl bg-gray-200/80 text-gray-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">
                      {badge.icon}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-gray-700">{badge.name}</h4>
                      <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.2 rounded-full">
                        +{badge.xpBonus} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{badge.description}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50/90 px-2 py-0.5 rounded-md font-semibold border border-purple-100/80">
                      <span className="material-symbols-outlined text-[12px]">flag</span>
                      <span className="truncate">เงื่อนไข: {badge.requirement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('achievements')}
            className="w-full py-2.5 rounded-xl bg-purple-50 text-purple-800 font-bold text-xs hover:bg-purple-100 transition-colors"
          >
            ดูเหรียญรางวัลทั้งหมดในหอเกียรติยศ ({firestoreBadges.length} เหรียญ)
          </button>
        </div>
      )}

      {/* Sub Tab: Quests */}
      {profileSubTab === 'quests' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-purple-700">
                ทำภารกิจต่อเนื่อง
              </span>
              <h4 className="text-base font-black text-gray-900 mt-0.5">ต่อเนื่อง 7 วันแห่งความคิดสร้างสรรค์</h4>
              <p className="text-xs text-gray-500">ภาคเรียนที่ 2 สัปดาห์ที่ 6</p>
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
