import React, { useState } from 'react';
import { PhotoItem, UserProfile } from '../types';
import { compressImage, downloadImage } from '../lib/galleryStorage';
import { submitChallengePhoto } from '../lib/challengeService';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChallengeTitle?: string;
  selectedChallengeId?: string;
  user?: UserProfile;
  onSubmitSuccess: (newPhoto: Partial<PhotoItem>, xpEarned: number) => void;
  onShowToast?: (msg: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  selectedChallengeTitle = 'Color Hunt – Blue',
  selectedChallengeId,
  user,
  onSubmitSuccess,
  onShowToast,
}) => {
  const samplePhotos = [
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0p1CMhk2ZCP8SDqMEvZXqvLeXxu_RNWvVa3GaLllPv0RBfAmH4RLkp4tJjtJtsb3gBXEbSzzRgPisusYn2JpzhsO3iPmFgMtirMv9-3G0me2IrAoWY6bCSnhDE0xv_oRVcSjGiUOm1gkXyoGzePPjDfwCixZxOvD6rV73HJmSUY7YU7JNwodVcQ2Bw911vLyEtP8ETVy31iSkz94UDO-Bs54p4JQpwAGBqTE0E9GcBBhb25_T-cO7',
      title: 'จังหวะสีน้ำเงินข้างตู้ล็อกเกอร์',
      colorMatch: 'คู่สีตรงโจทย์น้ำเงิน 92%',
      exif: 'f/2.0 • 1/320s • ISO 160',
    },
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqS4ceHsD4MlaFuGeeFe7LFV4B1do5a2WE0RHLk_x0JhuFsRx85KCX2KdOE-t9-R9RQPtAmEgAdw4kX2-raTo3LiG_3anLG8nEsDUBvwTwh-5z9d7xCUs-CzXJE-fP7_SLsTfXDBUiCs5PAvghzMt3Gzco50gzD4adseXckiN5dmcKxmN-rJccuL7eLspEtbrMkymXzQLaTFljkIWbtpJeLMWX1TwQEBiRtO5YO6o-81ZieKlegGE',
      title: 'ความสมมาตรล็อกเกอร์พาสเทล',
      colorMatch: 'ความกลมกลืนโคบอลต์ 88%',
      exif: 'f/2.8 • 1/250s • ISO 200',
    },
    {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmHihlHKQrIc1OUgOzoMy1PtZz6R8IPe-exHc84gfjZWNjRErDrdCt0PYNQJPVLDqZnfy5vBVjMzITevYYYXsHyy0f1HoKlrp0vmWVKW_562fBBAN8VM8M8TCe-0bTUPTWQ8bjgt8QK-WTEgBc9T3o4hqxtFDKNkcJdD8w2z-zFMfXLomy7_mB6YDu1eousi5IoC7vJaJRQdXnnfHRTER0NZYEfHmx1_LX8ojb173R3wsYKsYZ3c3Z',
      title: 'โบเก้แสงสีทองทางเดินอาคาร',
      colorMatch: 'โทนแสงอุ่นแอมเบอร์ 94%',
      exif: 'f/1.8 • 1/640s • ISO 100',
    },
  ];

  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState<string>(samplePhotos[0].title);
  const [aspectRatio, setAspectRatio] = useState<'aspect-[4/5]' | 'aspect-[3/4]' | 'aspect-square'>('aspect-[4/5]');
  const [rotation, setRotation] = useState(0);
  const [caption, setCaption] = useState(
    'บันทึกภาพแคนดิดระหว่างพักเบรกข้างตู้ล็อกเกอร์หน้าห้องสมุด แสงแดดยามบ่ายสะท้อนขับสีน้ำเงินของเสื้อให้โดดเด่นตัดกับความเบลอของฉากหลัง'
  );
  const [visibility, setVisibility] = useState<'members' | 'mentors'>('members');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  if (!isOpen) return null;

  const currentPhotoUrl = customImage || samplePhotos[currentSampleIndex].url;
  const currentMeta = samplePhotos[currentSampleIndex];

  const handleCycleSample = () => {
    setCustomImage(null);
    const nextIdx = (currentSampleIndex + 1) % samplePhotos.length;
    setCurrentSampleIndex(nextIdx);
    setPhotoTitle(samplePhotos[nextIdx].title);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingFile(true);
      try {
        const compressedUrl = await compressImage(file, 1280, 0.82);
        setCustomImage(compressedUrl);
        // Automatically suggest clean title from filename if title was default sample
        const isDefaultSampleTitle = samplePhotos.some((s) => s.title === photoTitle);
        if (!photoTitle || isDefaultSampleTitle) {
          const rawName = file.name.replace(/\.[^/.]+$/, '').trim();
          setPhotoTitle(rawName || 'ผลงานภาพถ่ายชิ้นใหม่');
        }
      } catch (err) {
        console.error('Image compression error:', err);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const cycleAspectRatio = () => {
    if (aspectRatio === 'aspect-[4/5]') setAspectRatio('aspect-[3/4]');
    else if (aspectRatio === 'aspect-[3/4]') setAspectRatio('aspect-square');
    else setAspectRatio('aspect-[4/5]');
  };

  const handleSubmit = async () => {
    if (!user?.isLoggedIn || !user.uid) {
      if (onShowToast) onShowToast('กรุณาเข้าสู่ระบบ Google ก่อนส่งผลงานภาพถ่าย');
      return;
    }
    if (!currentPhotoUrl) {
      if (onShowToast) onShowToast('กรุณาเลือกหรือถ่ายภาพก่อนส่งผลงาน');
      return;
    }

    setIsSubmitting(true);
    try {
      const chosenTitle = photoTitle.trim() || (customImage ? 'ผลงานภาพถ่ายชิ้นใหม่' : currentMeta.title);
      const sub = await submitChallengePhoto({
        userId: user.uid,
        studentName: user.name || 'Praew Kanya',
        studentGrade: user.grade || 'ม.5',
        studentAvatar: user.avatarUrl || null,
        challengeId: selectedChallengeId || 'ch-color-hunt-blue',
        challengeTitle: selectedChallengeTitle,
        imageData: currentPhotoUrl,
        caption,
        visibility: visibility === 'members' ? 'club' : 'private',
        aspectRatio,
        exif: {
          camera: 'Fujifilm X-T30 II',
          lens: 'XF 27mm f/2.8 R WR',
          focalLength: '27mm',
          aperture: 'f/2.8',
          shutterSpeed: '1/400s',
          iso: 'ISO 160',
        },
      });

      if (onShowToast) {
        onShowToast('ส่งผลงานภารกิจสำเร็จแล้ว! รออาจารย์/แอดมินตรวจผลงาน');
      }

      onSubmitSuccess(
        {
          id: sub.id,
          title: chosenTitle,
          imageUrl: sub.imageURL,
          questTitle: selectedChallengeTitle,
          aspectRatio,
          visualStory: caption,
          exif: {
            camera: 'Fujifilm X-T30 II',
            lens: 'XF 27mm f/2.8 R WR',
            focalLength: '27mm',
            aperture: 'f/2.8',
            shutterSpeed: '1/400s',
            iso: 'ISO 160',
          },
          likes: 0,
          commentsCount: 0,
          authorName: user.name || 'Praew Kanya',
          authorGrade: user.grade || 'ม.5',
          authorInitial: (user.name || 'P').charAt(0).toUpperCase(),
          authorAvatar: user.avatarUrl,
          avatarColorClass: 'bg-purple-100 text-purple-700',
          isVerified: false,
          isUserUpload: true,
          uploadedAt: new Date().toISOString(),
          tags: ['#RBShutterClub', `#${selectedChallengeTitle.replace(/\s+/g, '')}`],
        },
        0
      );
    } catch (err: any) {
      console.error('Submission failed:', err);
      if (onShowToast) {
        onShowToast(err?.message || 'เกิดข้อผิดพลาดในการส่งผลงาน');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveToDevice = async () => {
    await downloadImage(currentPhotoUrl, photoTitle || 'rb-shutter-capture');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md overflow-y-auto flex flex-col items-center justify-start sm:py-6 p-0 animate-in fade-in duration-200">
      <div className="bg-[#12141c] text-white w-full max-w-md sm:rounded-3xl shadow-2xl flex flex-col min-h-screen sm:min-h-0 overflow-hidden relative border border-gray-800/60 pb-8">
        {/* Modal Top App Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-[#171a25]/90 backdrop-blur sticky top-0 z-20">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
              ภารกิจที่ทำอยู่
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">
              {selectedChallengeTitle}
            </h2>
          </div>
          <button
            onClick={() => alert('คำแนะนำ: จัดวางจุดตัด 9 ช่อง และมองหาวัตถุที่มีโทนสีเด่นชัด')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
        </div>

        {/* Viewfinder Canvas Section */}
        <div className="p-4 flex flex-col items-center">
          <div className="w-full relative rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
            {/* The Image inside styled aspect ratio container */}
            <div
              className={`w-full ${aspectRatio} relative overflow-hidden flex items-center justify-center transition-all duration-300`}
            >
              <img
                src={currentPhotoUrl}
                alt="Capture preview"
                style={{ transform: `rotate(${rotation}deg)` }}
                className="w-full h-full object-cover transition-transform duration-300"
              />

              {/* Optical Camera Viewfinder Overlays */}
              {/* 3x3 Rule of Thirds Grid */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-b border-white/25"></div>
                <div className="border-r border-b border-white/25"></div>
                <div className="border-r border-b border-white/25 flex items-center justify-center">
                  {/* Center focus indicator circle */}
                  <div className="w-12 h-12 rounded-full border border-amber-300/80 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  </div>
                </div>
                <div className="border-b border-white/25"></div>
                <div className="border-r border-white/25"></div>
                <div className="border-r border-white/25"></div>
                <div></div>
              </div>

              {/* Four Viewfinder Corner Marks */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/80 pointer-events-none"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/80 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/80 pointer-events-none"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/80 pointer-events-none"></div>

              {/* Top Viewfinder Telemetry Pill */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-300 border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  RAW • {currentMeta.exif}
                </span>
                <span className="bg-purple-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-purple-200 border border-purple-400/30">
                  {currentMeta.colorMatch}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Editing & Camera Tools Dock */}
          <div className="flex items-center justify-between w-full mt-3 px-1">
            <button
              onClick={handleCycleSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
              title="สลับภาพตัวอย่าง"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>ภาพตัวอย่าง</span>
            </button>

            <button
              onClick={cycleAspectRatio}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
              title="เปลี่ยนสัดส่วนภาพ"
            >
              <span className="material-symbols-outlined text-[16px]">aspect_ratio</span>
              <span className="text-[11px] font-mono">
                {aspectRatio === 'aspect-[4/5]' ? '4:5' : aspectRatio === 'aspect-[3/4]' ? '3:4' : '1:1'}
              </span>
            </button>

            <button
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
              title="หมุน 90 องศา"
            >
              <span className="material-symbols-outlined text-[16px]">rotate_90_degrees_cw</span>
              <span>หมุนภาพ</span>
            </button>

            {/* Upload File Input */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-semibold cursor-pointer transition-colors border border-purple-700/50">
              <span className="material-symbols-outlined text-[16px]">upload</span>
              <span>อัปโหลด</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Direct Save Image button */}
            <button
              type="button"
              onClick={handleSaveToDevice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-700/50 active:scale-95"
              title="บันทึกภาพลงเครื่อง (Save to Device)"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>เซฟภาพ</span>
            </button>
          </div>
        </div>

        {/* Metadata & Details Form */}
        <div className="px-4 space-y-3.5">
          {/* Photo Title Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200">ชื่อภาพถ่ายผลงาน</label>
              <span className="text-[10px] text-purple-400 font-medium">บันทึกสู่แกลเลอรี</span>
            </div>
            <input
              type="text"
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
              placeholder="เช่น แสงยามเย็นริมระเบียง, จังหวะกระโดดชัชวาล..."
              className="w-full bg-[#1b1f2e] border border-gray-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
            />
          </div>

          {/* Caption & Story Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300">
                คำบรรยาย & เรื่องราวภาพถ่าย
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {caption.length}/280
              </span>
            </div>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 280))}
              placeholder="เล่าเรื่องราวเกี่ยวกับมุมมองภาพ เทคนิค แสง หรือสิ่งที่ประทับใจ..."
              className="w-full bg-[#1b1f2e] border border-gray-700/70 rounded-xl p-3 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Gallery Storage Guarantee Banner */}
          <div className="flex items-center gap-2.5 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl text-emerald-200 text-xs">
            <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0">
              cloud_done
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-[11px] text-emerald-300">
                จัดเก็บเข้าสู่คลังภาพ (Gallery) อัตโนมัติ
              </span>
              <span className="text-[10px] text-emerald-400/80">
                ภาพนี้จะถูกบันทึกไว้ในคลังแกลเลอรีของชมรม และแสดงในแท็บ "ภาพของฉัน" ทันทีที่ส่ง
              </span>
            </div>
          </div>

          {/* Auto-detected metadata pill */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-900/70 p-2.5 rounded-xl border border-gray-800">
            <span className="material-symbols-outlined text-purple-400 text-[18px]">
              auto_awesome
            </span>
            <div className="flex-1 truncate">
              ตรวจจับอัตโนมัติ: <span className="text-gray-200 font-mono">27mm • f/2.8 • แสงธรรมชาติ</span>
            </div>
          </div>

          {/* Applied Challenge display */}
          <div className="flex items-center justify-between bg-purple-950/40 border border-purple-800/40 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">
                stars
              </span>
              <div>
                <div className="text-xs font-bold text-white">ภารกิจที่ใช้ส่ง</div>
                <div className="text-[11px] text-purple-300">{selectedChallengeTitle}</div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
              +50 XP
            </span>
          </div>

          {/* Privacy & Safe School Space */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300">ใครมองเห็นภาพนี้ได้บ้าง?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('members')}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                  visibility === 'members'
                    ? 'border-purple-500 bg-purple-950/40 text-white'
                    : 'border-gray-800 bg-gray-900/40 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  <span>สมาชิกชมรม</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5">พื้นที่ปลอดภัยในโรงเรียน</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('mentors')}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                  visibility === 'mentors'
                    ? 'border-purple-500 bg-purple-950/40 text-white'
                    : 'border-gray-800 bg-gray-900/40 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>เฉพาะเมนเทอร์</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5">รับคำแนะนำแบบส่วนตัว</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="mt-6 px-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveToDevice}
            className="py-3 px-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            title="บันทึกภาพลงในอุปกรณ์ของคุณ (Save)"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>เซฟภาพ</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors"
          >
            บันทึกแบบร่าง
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_4px_18px_rgba(147,51,234,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>กำลังอัปโหลดและประเมินผล...</span>
              </span>
            ) : (
              <>
                <span>ส่งภาพผลงาน (+50 XP)</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
