import React, { useState } from 'react';
import { ChallengeItem, UserProfile } from '../types';

interface ChallengesViewProps {
  challenges: ChallengeItem[];
  user: UserProfile;
  onOpenShutterForChallenge: (challengeTitle: string) => void;
  onViewSubmission: (challengeTitle: string) => void;
  onShowToast: (message: string) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  user,
  onOpenShutterForChallenge,
  onViewSubmission,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestModalOpen, setSuggestModalOpen] = useState<boolean>(false);
  const [suggestionText, setSuggestionText] = useState<string>('');

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'shape', label: 'ล่ารูปทรง' },
    { id: 'color', label: 'ล่าเฉดสี' },
    { id: 'nature', label: 'ธรรมชาติ' },
    { id: 'school', label: 'ชีวิตในโรงเรียน' },
    { id: 'creative', label: 'สร้างสรรค์' },
    { id: 'portrait', label: 'ภาพบุคคล' },
    { id: 'night', label: 'ภาพกลางคืน' },
  ];

  const filteredChallenges = challenges.filter((c) => {
    const matchesCat = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featured = challenges.find((c) => c.isFeatured);
  const activeMissions = filteredChallenges.filter((c) => !c.isFeatured);

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setSuggestModalOpen(false);
    setSuggestionText('');
    onShowToast('ส่งไอเดียภารกิจใหม่ให้อาจารย์ที่ปรึกษาแล้ว! (+20 XP)');
  };

  return (
    <div className="flex flex-col w-full pb-24 px-4 space-y-5 pt-3">
      {/* Season & Streak Banner (Tactile Glow Card) */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-purple-50 flex items-center justify-between relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-purple-200/40 blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 shadow-sm text-amber-700">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                ซีซัน 2 • ภาคเรียนที่ 2
              </span>
              <span className="text-[11px] text-gray-500 font-medium">สัปดาห์ที่ 6</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-base font-extrabold text-gray-900 tracking-tight">
                สตรีคถ่ายภาพ 7 วันต่อเนื่อง
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 px-2.5 py-1.5 rounded-full shadow-xs">
            <span
              className="material-symbols-outlined text-amber-600 text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <span className="text-xs text-amber-900 font-extrabold">1,450 XP</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
          </div>
        </div>
      </div>

      {/* Content Header Block */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">ภารกิจถ่ายภาพ</h1>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          เปลี่ยนช่วงเวลาธรรมดารอบตัวให้เป็นภารกิจถ่ายภาพสร้างสรรค์
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 bg-white rounded-full px-3.5 py-2.5 flex items-center gap-2 shadow-xs border border-gray-100 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
          <span className="material-symbols-outlined text-gray-400 text-[20px]">
            center_focus_strong
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาภารกิจ เทคนิค หรือหมวดหมู่ภาพถ่าย..."
            className="bg-transparent border-none outline-none text-xs text-gray-900 placeholder:text-gray-400 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        <button
          aria-label="Filter challenges"
          onClick={() => onShowToast('กำลังแสดงภารกิจล่าสุดทั้งหมด')}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-xs border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </div>

      {/* Horizontal Scrollable Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 ${
              activeCategory === cat.id
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Challenge (Mega Quest Card) */}
      {featured && activeCategory === 'all' && (
        <div className="flex flex-col w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-100 group">
          {/* Visual Staging Container */}
          <div className="relative h-60 w-full overflow-hidden bg-gray-900">
            <img
              src={featured.imageUrl}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500 text-black font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <span className="material-symbols-outlined text-[13px]">bolt</span> ภารกิจพิเศษประจำสัปดาห์ (MEGA QUEST)
              </span>
              <span className="text-[10px] bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[12px]">schedule</span> {featured.timeRemaining}
              </span>
            </div>

            {/* Over-image Meta Hook */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1">
              <h2 className="text-xl text-white font-extrabold drop-shadow-sm leading-tight">
                {featured.title}
              </h2>
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  เทคนิคขั้นสูง
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">group</span> เข้าร่วมแล้ว {featured.participantsCount} คน
                </span>
              </div>
            </div>
          </div>

          {/* Content & Action Strip */}
          <div className="p-4 flex flex-col gap-3">
            <p className="text-xs text-gray-600 leading-relaxed">{featured.description}</p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full">
                <span
                  className="material-symbols-outlined text-amber-700 text-[17px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  stars
                </span>
                <span className="text-xs text-amber-900 font-extrabold">+{featured.xpReward} XP เควมารานี้</span>
              </div>
              <button
                onClick={() => onOpenShutterForChallenge(featured.title)}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all active:scale-95 shadow-[0_4px_14px_rgba(107,56,212,0.3)] flex items-center gap-1.5"
              >
                <span>เริ่มภารกิจ</span>
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenges Stream Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">ภารกิจที่เปิดอยู่</span>
          <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
            พร้อมทำ {activeMissions.length} ภารกิจ
          </span>
        </div>
        <span className="text-xs text-purple-700 font-semibold flex items-center gap-0.5 cursor-pointer">
          เรียงตามล่าสุด <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </span>
      </div>

      {/* Challenge Cards Grid */}
      <div className="flex flex-col w-full gap-4">
        {activeMissions.map((mission) => {
          return (
            <div
              key={mission.id}
              className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Image Preview Container */}
              <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                <img
                  src={mission.imageUrl}
                  alt={mission.title}
                  className={`w-full h-full object-cover ${
                    mission.isCompleted ? 'grayscale-[20%]' : ''
                  }`}
                />
                {mission.isCompleted && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
                )}

                {/* Top badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  {mission.isCompleted ? (
                    <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs">
                      <span
                        className="material-symbols-outlined text-[13px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      สำเร็จแล้ว
                    </span>
                  ) : (
                    <>
                      {mission.isNew && (
                        <span className="text-[10px] bg-purple-700 text-white px-2 py-0.5 rounded-full font-bold">
                          ใหม่
                        </span>
                      )}
                      <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                        {mission.difficulty === 'Easy' ? 'ง่าย' : mission.difficulty === 'Medium' ? 'ปานกลาง' : 'ท้าทาย'}
                      </span>
                      <span className="text-[10px] bg-white/90 backdrop-blur-md text-gray-800 px-2 py-0.5 rounded-full font-medium">
                        {mission.categoryLabel}
                      </span>
                    </>
                  )}
                </div>

                {/* Top-right Status */}
                <div className="absolute top-2.5 right-2.5">
                  {mission.isInProgress && (
                    <span className="text-[10px] bg-purple-600 text-white px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      กำลังดำเนินการ
                    </span>
                  )}
                  {mission.isCompleted && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[13px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        stars
                      </span>
                      รับแล้ว +{mission.xpReward} XP
                    </span>
                  )}
                </div>

                {/* Bottom-right Time Remaining */}
                {!mission.isCompleted && (
                  <div className="absolute bottom-2 right-2.5">
                    <span className="text-[10px] bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">schedule</span>
                      {mission.timeRemaining}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{mission.title}</h3>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[13px]">group</span>
                      เข้าร่วมแล้ว {mission.participantsCount} คน
                    </span>
                  </div>
                  {!mission.isCompleted && (
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                      <span
                        className="material-symbols-outlined text-amber-600 text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        stars
                      </span>
                      <span className="text-[11px] text-amber-900 font-bold">
                        +{mission.xpReward} XP
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {mission.description}
                </p>

                {/* Progress bar if in progress */}
                {mission.isInProgress && mission.progressText && (
                  <div className="flex flex-col gap-1 bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-gray-800">ความคืบหน้าของภารกิจ</span>
                      <span className="font-bold text-purple-700">{mission.progressText}</span>
                    </div>
                    <div className="w-full bg-purple-200/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(mission.progressFraction || 0.5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Mentor feedback if completed */}
                {mission.mentorFeedback && (
                  <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex items-start gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">reviews</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-800 text-[11px]">
                        คำวิจารณ์จากพี่เมย์ (เมนเทอร์)
                      </span>
                      <p className="text-gray-600 italic text-[11px] mt-0.5">
                        "{mission.mentorFeedback}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions bottom strip */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                    {mission.categoryLabel}
                  </span>

                  {mission.isCompleted ? (
                    <button
                      onClick={() => onViewSubmission(mission.title)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all"
                    >
                      ดูผลงานที่ส่งแล้ว
                    </button>
                  ) : mission.isInProgress ? (
                    <button
                      onClick={() => onOpenShutterForChallenge(mission.title)}
                      className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-xs active:scale-95 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_a_photo</span>
                      <span>ส่งภาพที่ 2</span>
                    </button>
                  ) : mission.isLocked ? (
                    <button
                      disabled
                      className="bg-gray-100 text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-full cursor-not-allowed"
                    >
                      ล็อกอยู่ (เลเวล {mission.unlockLevel})
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenShutterForChallenge(mission.title)}
                      className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs active:scale-95 transition-all"
                    >
                      เริ่มภารกิจ
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestion Prompt Incentive Card */}
      <div className="w-full bg-gradient-to-r from-purple-100 via-purple-50 to-pink-50 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs border border-purple-200/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">lightbulb</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-xs font-bold text-gray-900 leading-snug truncate">
              มีไอเดียสำหรับสัปดาห์หน้าไหม?
            </h4>
            <p className="text-[11px] text-gray-600 line-clamp-1">
              เสนอโจทย์ภาพถ่ายสร้างสรรค์เพื่อรับโบนัส +20 XP
            </p>
          </div>
        </div>
        <button
          onClick={() => setSuggestModalOpen(true)}
          className="shrink-0 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3.5 py-2 rounded-full active:scale-95 transition-all shadow-xs"
        >
          เสนอไอเดีย
        </button>
      </div>

      {/* Modal for Prompt Suggestion */}
      {suggestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700 text-[22px]">
                  edit_note
                </span>
                <h3 className="text-base font-bold text-gray-900">เสนอไอเดียภารกิจชมรม</h3>
              </div>
              <button
                onClick={() => setSuggestModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <p className="text-xs text-gray-500">
              ไอเดียของคุณจะถูกส่งให้อาจารย์ที่ปรึกษาและพี่เมนเทอร์พิจารณาสำหรับ Challenge สัปดาห์ถัดไป!
            </p>
            <textarea
              rows={3}
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              placeholder="เช่น: ตามหาแสงสะท้อนบนหน้าต่างห้องสมุดช่วงเช้า (Golden Window Rays)..."
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSuggestModalOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSuggestSubmit}
                className="flex-1 py-2.5 rounded-full bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 shadow-sm"
              >
                ส่งไอเดีย (+20 XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
