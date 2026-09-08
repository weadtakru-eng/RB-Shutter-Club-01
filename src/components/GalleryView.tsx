import React, { useState } from 'react';
import { PhotoItem, UserProfile } from '../types';
import { downloadImage } from '../lib/galleryStorage';

interface GalleryViewProps {
  photos: PhotoItem[];
  user?: UserProfile;
  onSelectPhoto: (photo: PhotoItem) => void;
  onToggleLike: (photoId: string) => void;
  onToggleBookmark: (photoId: string) => void;
  onOpenShutter: () => void;
  onShowToast: (msg: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  user,
  onSelectPhoto,
  onToggleLike,
  onToggleBookmark,
  onOpenShutter,
  onShowToast,
}) => {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'feed'>('grid');
  const [activeFilter, setActiveFilter] = useState<string>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDownloadPhoto = async (e: React.MouseEvent, photo: PhotoItem) => {
    e.stopPropagation();
    onShowToast(`กำลังบันทึกภาพ "${photo.title}"...`);
    try {
      await downloadImage(photo.imageUrl, photo.title || 'rb-shutter-photo');
      onShowToast('บันทึกภาพลงเครื่องเรียบร้อยแล้ว!');
    } catch {
      onShowToast('ไม่สามารถบันทึกภาพได้โดยตรง');
    }
  };

  const filterChips = [
    { id: 'latest', label: 'ทั้งหมด' },
    { id: 'my-uploads', label: 'ภาพของฉัน 📸' },
    { id: 'popular', label: 'ยอดนิยม 🔥' },
    { id: 'quests', label: 'จากภารกิจ' },
    { id: 'nature', label: 'ธรรมชาติ' },
    { id: 'portrait', label: 'ภาพบุคคล' },
    { id: 'creative', label: 'สร้างสรรค์' },
  ];

  const userUploadsCount = photos.filter(
    (p) =>
      p.isUserUpload ||
      p.authorName === user?.name ||
      p.authorId === user?.uid ||
      p.id.startsWith('photo-sub-')
  ).length;

  const filteredPhotos = photos.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.questTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'my-uploads') {
      return (
        p.isUserUpload ||
        p.authorName === user?.name ||
        p.authorId === user?.uid ||
        p.id.startsWith('photo-sub-')
      );
    }
    if (activeFilter === 'popular') return p.likes > 30;
    if (activeFilter === 'nature') return p.questCategory === 'nature';
    if (activeFilter === 'portrait') return p.questCategory === 'portrait';
    if (activeFilter === 'quests') return Boolean(p.questTitle);
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-28 px-4 space-y-4 pt-3">
      {/* Top Header info & view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">แกลเลอรีภาพถ่าย</h1>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">cloud_done</span>
              คลังจัดเก็บถาวร
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            ภาพถ่ายฝีมือนักเรียน ภาพจากภารกิจ และผลงานที่จัดเก็บในชมรม
          </p>
        </div>

        {/* Grid vs Feed toggle */}
        <div className="flex items-center bg-gray-100 p-1 rounded-full shrink-0">
          <button
            onClick={() => setLayoutMode('grid')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              layoutMode === 'grid'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="มุมมองตาราง"
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>
          <button
            onClick={() => setLayoutMode('feed')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              layoutMode === 'feed'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="มุมมองฟีด"
          >
            <span className="material-symbols-outlined text-[18px]">view_agenda</span>
          </button>
        </div>
      </div>

      {/* Direct Upload & Storage Action Strip */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-2xl p-3 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-purple-200 shrink-0">
            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs">จัดเก็บภาพเข้าแกลเลอรี</span>
            <span className="text-[10px] text-purple-200">
              {userUploadsCount > 0
                ? `คุณบันทึกผลงานไว้แล้ว ${userUploadsCount} ภาพ`
                : 'อัปโหลดภาพของคุณเพื่อจัดเก็บและแชร์ในชมรม'}
            </span>
          </div>
        </div>
        <button
          onClick={onOpenShutter}
          className="px-3.5 py-1.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">upload</span>
          <span>อัปโหลดภาพ</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 bg-white rounded-full px-3.5 py-2.5 flex items-center gap-2 shadow-xs border border-gray-100 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
          <span className="material-symbols-outlined text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาภาพถ่าย ภารกิจ ชื่อเพื่อน หรือกล้องที่ใช้..."
            className="bg-transparent border-none outline-none text-xs text-gray-900 placeholder:text-gray-400 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveFilter(chip.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 flex items-center gap-1 ${
              activeFilter === chip.id
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-100'
            }`}
          >
            <span>{chip.label}</span>
            {chip.id === 'my-uploads' && userUploadsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'my-uploads' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
              }`}>
                {userUploadsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Gallery Items Display */}
      {layoutMode === 'grid' ? (
        /* 2-Column Responsive Masonry Grid */
        <div className="grid grid-cols-2 gap-3">
          {filteredPhotos.map((photo) => {
            return (
              <div
                key={photo.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectPhoto(photo)}
              >
                {/* Photo Image Container */}
                <div className={`relative w-full ${photo.aspectRatio} overflow-hidden bg-gray-100`}>
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Mentor Pick Ribbon */}
                  {photo.isMentorPick && (
                    <div className="absolute top-2 left-2 bg-purple-700/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[11px]">star</span>
                      <span>ภาพเด่นเมนเทอร์</span>
                    </div>
                  )}

                  {/* Club Life Tag */}
                  {photo.isClubLife && (
                    <div className="absolute top-2 left-2 bg-pink-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[11px]">groups</span>
                      <span>ชีวิตชมรม</span>
                    </div>
                  )}

                  {/* User Uploaded & Stored Badge */}
                  {photo.isUserUpload && (
                    <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[11px]">save</span>
                      <span>บันทึกแล้ว</span>
                    </div>
                  )}

                  {/* Floating Direct Save Button on hover */}
                  <button
                    onClick={(e) => handleDownloadPhoto(e, photo)}
                    title="บันทึกภาพลงเครื่อง (Save)"
                    className={`absolute ${photo.isUserUpload ? 'top-8' : 'top-2'} right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-emerald-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90 z-10`}
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                  </button>

                  {/* Bottom Image Stamp */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] drop-shadow">
                    <span className="font-mono bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px]">
                      {photo.exif.aperture} • {photo.exif.shutterSpeed}
                    </span>
                  </div>
                </div>

                {/* Card Meta & Interactions */}
                <div className="p-2.5 flex flex-col gap-1.5">
                  <h3 className="text-xs font-bold text-gray-900 truncate leading-snug">
                    {photo.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span className="truncate max-w-[90px] font-medium">
                      {photo.authorName} ({photo.authorGrade})
                    </span>
                    <span className="text-purple-600 font-bold truncate max-w-[70px]">
                      {photo.questTitle}
                    </span>
                  </div>

                  {/* Interaction Buttons Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-[11px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(photo.id);
                      }}
                      className={`flex items-center gap-1 transition-colors ${
                        photo.isLiked ? 'text-rose-600 font-bold' : 'text-gray-500 hover:text-rose-600'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[15px]"
                        style={{ fontVariationSettings: photo.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span>{photo.likes}</span>
                    </button>

                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="material-symbols-outlined text-[15px]">chat_bubble</span>
                      <span>{photo.commentsCount}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Save to Device button */}
                      <button
                        onClick={(e) => handleDownloadPhoto(e, photo)}
                        title="บันทึกภาพลงเครื่อง (Save Photo)"
                        className="p-1 rounded-full text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(photo.id);
                        }}
                        className={`transition-colors ${
                          photo.isBookmarked ? 'text-purple-700' : 'text-gray-400 hover:text-purple-700'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[15px]"
                          style={{ fontVariationSettings: photo.isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          bookmark
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full-Width Feed Layout */
        <div className="flex flex-col gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onSelectPhoto(photo)}
            >
              {/* Feed Card Author Header */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    {photo.authorInitial}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-gray-900">{photo.authorName}</span>
                      <span className="text-[10px] text-gray-500">• {photo.authorGrade}</span>
                    </div>
                    <span className="text-[10px] text-purple-700 font-semibold">{photo.questTitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {photo.isMentorPick && (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      ภาพเด่นเมนเทอร์
                    </span>
                  )}
                  {photo.isUserUpload && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">cloud_done</span>
                      บันทึกในแกลเลอรี
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Image */}
              <div className="relative w-full aspect-[4/5] bg-black">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-mono">
                  {photo.exif.camera} • {photo.exif.aperture} • {photo.exif.shutterSpeed}
                </div>
              </div>

              {/* Action Bar & Caption */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(photo.id);
                      }}
                      className={`flex items-center gap-1.5 ${
                        photo.isLiked ? 'text-rose-600 font-bold' : 'text-gray-600 hover:text-rose-600'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: photo.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span>{photo.likes} ถูกใจ</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPhoto(photo);
                      }}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                      <span>{photo.commentsCount} ความคิดเห็น</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDownloadPhoto(e, photo)}
                      title="บันทึกภาพลงเครื่อง (Save Photo)"
                      className="flex items-center gap-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>เซฟภาพ</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(photo.id);
                      }}
                      className={photo.isBookmarked ? 'text-purple-700' : 'text-gray-400 hover:text-gray-700'}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: photo.isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>
                </div>

                <h4 className="font-extrabold text-sm text-gray-900 mt-1">{photo.title}</h4>
                {photo.visualStory && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {photo.visualStory}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State when no photos match filter */}
      {filteredPhotos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[28px]">photo_library</span>
          </div>
          <h3 className="font-bold text-sm text-gray-900 mb-1">
            {activeFilter === 'my-uploads'
              ? 'คุณยังไม่มีภาพถ่ายที่จัดเก็บไว้'
              : 'ไม่พบภาพถ่ายที่ตรงกับการค้นหา'}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mb-4">
            {activeFilter === 'my-uploads'
              ? 'อัปโหลดภาพถ่ายของคุณเพื่อบันทึกลงในคลังแกลเลอรีชมรม'
              : 'ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูภาพผลงาน'}
          </p>
          {activeFilter === 'my-uploads' && (
            <button
              onClick={onOpenShutter}
              className="px-4 py-2 bg-purple-700 text-white rounded-full text-xs font-bold shadow-xs hover:bg-purple-800 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              <span>อัปโหลดภาพถ่ายแรกของคุณ</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Action Button: Submit Shot */}
      <button
        onClick={onOpenShutter}
        className="fixed bottom-20 right-4 z-30 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-3 rounded-full shadow-[0_6px_20px_rgba(107,56,212,0.4)] active:scale-95 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
        <span>ส่งผลงานภาพถ่าย</span>
      </button>
    </div>
  );
};
