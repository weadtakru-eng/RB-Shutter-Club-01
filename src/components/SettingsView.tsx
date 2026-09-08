import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onShowToast: (msg: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onShowToast,
  onOpenLogin,
  onLogout,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [notifChallenges, setNotifChallenges] = useState(true);
  const [notifActivities, setNotifActivities] = useState(true);
  const [notifSocial, setNotifSocial] = useState(true);
  const [notifLeaderboard, setNotifLeaderboard] = useState(true);
  const [showExif, setShowExif] = useState(true);
  const [allowCritiques, setAllowCritiques] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-5 pt-3">
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">การตั้งค่าและความเป็นส่วนตัว</h1>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          จัดการการแจ้งเตือน การส่งผลงาน และการควบคุมความเป็นส่วนตัวของภาพถ่าย
        </p>
      </div>

      {/* Safe Club Environment Badge Card */}
      <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">shield</span>
        </div>
        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-purple-900">
            ชุมชนโรงเรียนที่ได้รับการรับรอง • มัธยมศึกษาปีที่ 1-6
          </h4>
          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
            รูปภาพและคำติชมทั้งหมดอยู่ภายในโดเมนโรงเรียนระยองวิทยาคม และได้รับการดูแลโดยอาจารย์ที่ปรึกษาชมรม
          </p>
        </div>
      </div>

      {/* Section 1: Appearance */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
          รูปแบบการแสดงผล (ธีม)
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Light */}
          <button
            onClick={() => {
              setTheme('light');
              onShowToast('เปลี่ยนธีมเป็นโหมดสว่างเรียบร้อย');
            }}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
              theme === 'light'
                ? 'border-purple-600 bg-purple-50/40 text-purple-950 font-bold shadow-xs'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">light_mode</span>
            <span className="text-xs">สว่าง</span>
          </button>

          {/* Dark */}
          <button
            onClick={() => {
              setTheme('dark');
              onShowToast('เปลี่ยนธีมเป็นโหมดมืดเรียบร้อย');
            }}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'border-purple-600 bg-purple-50/40 text-purple-950 font-bold shadow-xs'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">dark_mode</span>
            <span className="text-xs">มืด</span>
          </button>

          {/* Auto */}
          <button
            onClick={() => {
              setTheme('auto');
              onShowToast('ตั้งค่าธีมอัตโนมัติตามระบบ');
            }}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
              theme === 'auto'
                ? 'border-purple-600 bg-purple-50/40 text-purple-950 font-bold shadow-xs'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">brightness_auto</span>
            <span className="text-xs">อัตโนมัติ</span>
          </button>
        </div>
      </div>

      {/* Section 2: Notifications */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
          การแจ้งเตือน
        </span>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">แจ้งเตือนภารกิจ</span>
              <span className="text-[11px] text-gray-500">
                แจ้งเตือนภารกิจใหม่ประจำวันและเวลาส่งที่ใกล้หมดเขต
              </span>
            </div>
            <button
              onClick={() => {
                setNotifChallenges(!notifChallenges);
                onShowToast(notifChallenges ? 'ปิดการแจ้งเตือนภารกิจแล้ว' : 'เปิดการแจ้งเตือนภารกิจแล้ว');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifChallenges ? 'bg-purple-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  notifChallenges ? 'left-6' : 'left-1'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">แจ้งเตือนกิจกรรม</span>
              <span className="text-[11px] text-gray-500">
                ข่าวสารเวิร์กช็อปและกิจกรรมเดินถ่ายภาพที่ลงทะเบียนไว้
              </span>
            </div>
            <button
              onClick={() => {
                setNotifActivities(!notifActivities);
                onShowToast(notifActivities ? 'ปิดการแจ้งเตือนกิจกรรมแล้ว' : 'เปิดการแจ้งเตือนกิจกรรมแล้ว');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifActivities ? 'bg-purple-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  notifActivities ? 'left-6' : 'left-1'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">การถูกใจและคำติชม</span>
              <span className="text-[11px] text-gray-500">
                เมื่ออาจารย์หรือเพื่อนกดถูกใจ ให้คำติชม หรือมอบรางวัลภาพถ่าย
              </span>
            </div>
            <button
              onClick={() => {
                setNotifSocial(!notifSocial);
                onShowToast(notifSocial ? 'ปิดการแจ้งเตือนฟีดแบคแล้ว' : 'เปิดการแจ้งเตือนฟีดแบคแล้ว');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifSocial ? 'bg-purple-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  notifSocial ? 'left-6' : 'left-1'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">การอัปเดตกระดานผู้นำ</span>
              <span className="text-[11px] text-gray-500">
                อันดับประจำสัปดาห์และความคืบหน้าของคะแนน XP
              </span>
            </div>
            <button
              onClick={() => {
                setNotifLeaderboard(!notifLeaderboard);
                onShowToast(notifLeaderboard ? 'ปิดการแจ้งเตือนอันดับแล้ว' : 'เปิดการแจ้งเตือนอันดับแล้ว');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifLeaderboard ? 'bg-purple-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  notifLeaderboard ? 'left-6' : 'left-1'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Privacy & Sharing */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
          ความเป็นส่วนตัวและการแชร์
        </span>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">การมองเห็นโปรไฟล์</span>
              <span className="text-[11px] text-gray-500">
                มองเห็นได้เฉพาะสมาชิกชมรมและอาจารย์โรงเรียนเท่านั้น
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              ปลอดภัย
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">แสดงข้อมูลกล้องและค่าถ่ายภาพ (EXIF)</span>
              <span className="text-[11px] text-gray-500">
                แสดงความเร็วชัตเตอร์ รูรับแสง และอุปกรณ์กล้องบนภาพถ่ายของคุณ
              </span>
            </div>
            <button
              onClick={() => {
                setShowExif(!showExif);
                onShowToast(showExif ? 'ซ่อนข้อมูลกล้อง EXIF แล้ว' : 'แสดงข้อมูลกล้อง EXIF แล้ว');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                showExif ? 'bg-purple-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  showExif ? 'left-6' : 'left-1'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">สิทธิ์การแสดงความคิดเห็น</span>
              <span className="text-[11px] text-gray-500">
                เปิดรับคำติชมและคำแนะนำจากเพื่อนสมาชิกชมรม
              </span>
            </div>
            <button
              onClick={() => {
                setAllowCritiques(!allowCritiques);
                onShowToast(allowCritiques ? 'ปิดรับคอมเมนต์แล้ว' : 'เปิดรับคอมเมนต์แล้ว');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                allowCritiques ? 'bg-purple-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  allowCritiques ? 'left-6' : 'left-1'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Account & School Verification */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
          บัญชีและการยืนยันตัวตนในโรงเรียน
        </span>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-gray-900">{user.thaiName}</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.2 rounded-full">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {user.isLoggedIn && (
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span className="text-[11px] text-gray-500 truncate max-w-[190px]">{user.email}</span>
              </div>
              <span className="text-[10px] text-gray-400">รหัสนักเรียน: {user.studentId}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            {user.isLoggedIn ? (
              <button
                onClick={onLogout}
                className="text-xs font-bold text-gray-700 hover:text-black py-1.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5 shadow-2xs"
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
                <span>เข้าสู่ระบบด้วย Gmail</span>
              </button>
            )}

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 py-1.5 px-3 rounded-xl hover:bg-rose-50 transition-colors"
            >
              ขอลบบัญชีผู้ใช้
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <h3 className="text-sm font-black text-gray-900 text-center">
              ลบบัญชีและข้อมูลภาพถ่าย?
            </h3>
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              การขอลบบัญชีจะส่งคำขอไปยังอาจารย์ที่ปรึกษาชมรมเพื่อถอนชื่อนักเรียนออกจากระบบกิจกรรม
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2 rounded-full bg-gray-100 text-gray-700 text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  onShowToast('ส่งคำขอลบบัญชีให้อาจารย์ที่ปรึกษาแล้ว');
                }}
                className="flex-1 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                ยืนยันคำขอ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
