import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onShowToast }) => {
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
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings & Privacy</h1>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          Manage your club experience, submission alerts, and photo visibility controls.
        </p>
      </div>

      {/* Safe Club Environment Badge Card */}
      <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">shield</span>
        </div>
        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-purple-900">
            Verified School Community • Grade 7-12
          </h4>
          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
            All photos and feedback remain within the Rayongwittayakom school domain and are moderated by faculty sponsors.
          </p>
        </div>
      </div>

      {/* Section 1: Appearance */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
          Appearance
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Light */}
          <button
            onClick={() => {
              setTheme('light');
              onShowToast('เปลี่ยนธีมเป็น Light Mode เรียบร้อย');
            }}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
              theme === 'light'
                ? 'border-purple-600 bg-purple-50/40 text-purple-950 font-bold shadow-xs'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">light_mode</span>
            <span className="text-xs">Light</span>
          </button>

          {/* Dark */}
          <button
            onClick={() => {
              setTheme('dark');
              onShowToast('เปลี่ยนธีมเป็น Dark Mode เรียบร้อย');
            }}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'border-purple-600 bg-purple-50/40 text-purple-950 font-bold shadow-xs'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">dark_mode</span>
            <span className="text-xs">Dark</span>
          </button>

          {/* Auto */}
          <button
            onClick={() => {
              setTheme('auto');
              onShowToast('ตั้งค่าธีมอัตโนมัติตามอุปกรณ์');
            }}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
              theme === 'auto'
                ? 'border-purple-600 bg-purple-50/40 text-purple-950 font-bold shadow-xs'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">brightness_auto</span>
            <span className="text-xs">Auto</span>
          </button>
        </div>
      </div>

      {/* Section 2: Notifications */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
          Notifications
        </span>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">Challenge Notifications</span>
              <span className="text-[11px] text-gray-500">
                Alerts for new daily quests and approaching deadlines
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
              <span className="text-xs font-bold text-gray-900">Activity Notifications</span>
              <span className="text-[11px] text-gray-500">
                Updates for registered workshops and photo walks
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
              <span className="text-xs font-bold text-gray-900">Social & Kudos</span>
              <span className="text-[11px] text-gray-500">
                When mentors or peers like, critique, or award your shots
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
              <span className="text-xs font-bold text-gray-900">Leaderboard Updates</span>
              <span className="text-[11px] text-gray-500">
                Weekly rank shifts and XP milestone achievements
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
          Privacy & Sharing
        </span>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">Profile Visibility</span>
              <span className="text-[11px] text-gray-500">
                Visible to club members and school faculty only
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Safe
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-gray-900">Show Camera & EXIF Information</span>
              <span className="text-[11px] text-gray-500">
                Display shutter speed, aperture, and camera gear on your shots
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
              <span className="text-xs font-bold text-gray-900">Comment Permissions</span>
              <span className="text-[11px] text-gray-500">
                Allow peer critiques from verified club members
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
          Account & School Verification
        </span>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-sm">
              P
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-gray-900">{user.thaiName}</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.2 rounded-full">
                  {user.role}
                </span>
              </div>
              <span className="text-[11px] text-gray-500">{user.email}</span>
              <span className="text-[10px] text-gray-400">Student ID: {user.studentId}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => onShowToast('ออกจากระบบเรียบร้อยแล้ว')}
              className="text-xs font-bold text-gray-700 hover:text-black py-1.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 py-1.5 px-3 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Request Account Deletion
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
