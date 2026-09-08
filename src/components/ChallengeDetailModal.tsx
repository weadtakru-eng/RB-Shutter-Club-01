import React, { useState } from 'react';
import { ChallengeDocument, ChallengeParticipant } from '../lib/challengeService';
import { UserProfile } from '../types';

interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeDocument | null;
  user: UserProfile;
  participant?: ChallengeParticipant | null;
  onStartMission: (challenge: ChallengeDocument) => void;
  onShowToast: (msg: string) => void;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  isOpen,
  onClose,
  challenge,
  user,
  participant,
  onStartMission,
  onShowToast,
}) => {
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);

  if (!isOpen || !challenge) return null;

  const isExpired =
    challenge.status === 'expired' ||
    (challenge.deadline && new Date(challenge.deadline).getTime() < Date.now() - 86400000);
  const isCompleted = participant?.status === 'approved';
  const isSubmitted = participant?.status === 'submitted';
  const isStarted = participant?.status === 'started';

  const handleStart = () => {
    if (!user.isLoggedIn) {
      onShowToast('กรุณาเข้าสู่ระบบด้วย Google ก่อนเริ่มทำภารกิจ');
      return;
    }
    if (challenge.status !== 'active') {
      onShowToast('ภารกิจนี้ยังไม่เปิดหรือสิ้นสุดแล้ว');
      return;
    }
    onStartMission(challenge);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex flex-col items-center justify-start sm:py-6 p-2 animate-in fade-in duration-200">
      <div className="bg-[#12141c] text-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-800 relative my-auto">
        {/* Top Cover Image with Gradient */}
        <div className="relative h-56 w-full bg-gray-900 overflow-hidden">
          <img
            src={challenge.coverImage}
            alt={challenge.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/40 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm z-10"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="text-[10px] bg-purple-700 text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs">
              {challenge.categoryLabel || challenge.category}
            </span>
            <span className="text-[10px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-semibold">
              {challenge.difficulty === 'Easy'
                ? 'ระดับง่าย'
                : challenge.difficulty === 'Medium'
                ? 'ระดับปานกลาง'
                : 'ระดับท้าทาย'}
            </span>
          </div>

          {/* Bottom Title overlay */}
          <div className="absolute bottom-3 inset-x-4 flex items-end justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                ภารกิจถ่ายภาพประจำสัปดาห์
              </span>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                {challenge.title}
              </h2>
            </div>
            <div className="flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 px-2.5 py-1 rounded-full shrink-0">
              <span
                className="material-symbols-outlined text-amber-400 text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <span className="text-xs font-black text-amber-300">+{challenge.points} XP</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Status Alert Banner */}
          {isCompleted ? (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 p-3 rounded-2xl text-emerald-200 text-xs">
              <span
                className="material-symbols-outlined text-emerald-400 text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <div>
                <span className="font-bold">พิชิตภารกิจนี้เรียบร้อยแล้ว!</span>
                <p className="text-[11px] text-emerald-300/80">
                  คุณได้รับ +{challenge.points} XP และผลงานได้รับการอนุมัติเข้าสู่แกลเลอรี
                </p>
              </div>
            </div>
          ) : isSubmitted ? (
            <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-800/60 p-3 rounded-2xl text-amber-200 text-xs">
              <span className="material-symbols-outlined text-amber-400 text-[20px] animate-pulse">
                schedule
              </span>
              <div>
                <span className="font-bold">ส่งผลงานแล้ว – รออาจารย์/เมนเทอร์ตรวจ</span>
                <p className="text-[11px] text-amber-300/80">
                  คุณจะได้รับ +{challenge.points} XP ทันทีที่ผลงานได้รับการอนุมัติ
                </p>
              </div>
            </div>
          ) : null}

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              เป้าหมายภารกิจ
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">{challenge.description}</p>
          </div>

          {/* Mission Meta Grid */}
          <div className="grid grid-cols-2 gap-2 bg-[#171a26] p-3 rounded-2xl border border-gray-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">
                event_available
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">กำหนดส่ง</span>
                <span className="font-semibold text-gray-200">
                  {challenge.deadline || '30 ก.ย. 2026'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">
                group
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">ผู้เข้าร่วม</span>
                <span className="font-semibold text-gray-200">
                  {challenge.participantsCount || 0} คน
                </span>
              </div>
            </div>
          </div>

          {/* Rules List */}
          {challenge.rules && challenge.rules.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-purple-400 text-[16px]">
                  gavel
                </span>
                <span>กติกาและเงื่อนไข (Rules)</span>
              </h3>
              <ul className="space-y-1.5 bg-[#171a26] p-3 rounded-2xl border border-gray-800/80">
                {challenge.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-900/60 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Photography Tips */}
          {challenge.tips && challenge.tips.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-400 text-[16px]">
                  lightbulb
                </span>
                <span>เทคนิคการถ่ายภาพ (Photography Tips)</span>
              </h3>
              <div className="bg-amber-950/20 border border-amber-800/30 p-3 rounded-2xl space-y-1.5">
                {challenge.tips.map((tip, idx) => (
                  <div key={idx} className="text-xs text-amber-100/90 flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[15px] shrink-0 mt-0.5">
                      tips_and_updates
                    </span>
                    <span className="leading-snug">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example Photos */}
          {challenge.examplePhotos && challenge.examplePhotos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                ตัวอย่างมุมมองภาพถ่าย (Inspiration)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {challenge.examplePhotos.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-800 border border-gray-700"
                  >
                    <img
                      src={imgUrl}
                      alt={`Example ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="p-4 border-t border-gray-800/80 bg-[#171a26]/90 flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-full bg-gray-800 text-gray-300 hover:text-white font-bold text-xs active:scale-95 transition-all"
          >
            ปิด
          </button>

          {isCompleted ? (
            <button
              onClick={handleStart}
              className="flex-1 py-3 px-4 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">add_a_photo</span>
              <span>ส่งภาพเพิ่มเติม</span>
            </button>
          ) : isExpired ? (
            <button
              disabled
              className="flex-1 py-3 px-4 rounded-full bg-gray-800 text-gray-500 font-bold text-xs cursor-not-allowed"
            >
              ภารกิจนี้สิ้นสุดแล้ว
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-extrabold text-xs shadow-[0_4px_16px_rgba(107,56,212,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isStarted ? 'ถ่ายและส่งภาพภารกิจ' : 'เริ่มทำภารกิจ (Start Mission)'}</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
