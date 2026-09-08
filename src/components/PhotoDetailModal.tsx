import React, { useState } from 'react';
import { PhotoItem } from '../types';

interface PhotoDetailModalProps {
  photo: PhotoItem | null;
  onClose: () => void;
  onToggleLike: (photoId: string) => void;
  onToggleBookmark: (photoId: string) => void;
  onAddComment: (photoId: string, commentText: string) => void;
  onShowToast: (msg: string) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  onClose,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  onShowToast,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  if (!photo) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(photo.id, commentInput);
    setCommentInput('');
    onShowToast('ส่งความคิดเห็นและคำแนะนำวิจารณ์ภาพแล้ว! (+10 XP)');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex flex-col items-center justify-start sm:py-6 p-0 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden pb-12">
        {/* Top Header Navigation Bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-gray-700 hover:text-black text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Gallery</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(photo.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                photo.isBookmarked ? 'text-purple-700 bg-purple-50' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: photo.isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
            <button
              onClick={() => onShowToast('คัดลอกลิงก์ผลงานแล้ว พร้อมแชร์')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </div>

        {/* Hero Photo Container */}
        <div className="relative w-full aspect-[4/5] bg-black">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-full object-cover"
          />
          {photo.isMentorPick && (
            <div className="absolute top-3 left-3 bg-purple-700 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <span className="material-symbols-outlined text-[14px]">star</span>
              <span>Mentor Pick</span>
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/10">
            {photo.exif.camera} • {photo.exif.aperture}
          </div>
        </div>

        {/* Author Bio Block */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              {photo.authorInitial}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-gray-900">{photo.authorName}</span>
                {photo.isVerified && (
                  <span
                    className="material-symbols-outlined text-purple-600 text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {photo.authorGrade} • Level 3 Amateur Shutter
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsFollowing(!isFollowing);
              onShowToast(isFollowing ? 'เลิกติดตามแล้ว' : `ติดตาม ${photo.authorName} สำเร็จ!`);
            }}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
              isFollowing
                ? 'bg-gray-100 text-gray-700'
                : 'bg-purple-700 text-white hover:bg-purple-800'
            }`}
          >
            {isFollowing ? 'Following' : '+ Follow'}
          </button>
        </div>

        {/* Interactive Action Bar */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggleLike(photo.id)}
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
              <span>{photo.likes} Likes</span>
            </button>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              <span>{photo.commentsCount} Critiques</span>
            </div>
          </div>
          <button
            onClick={() => onShowToast('ส่งเหรียญรางวัล Tip ให้เพื่อนสำเร็จ! (+5 XP)')}
            className="flex items-center gap-1 text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full"
          >
            <span className="material-symbols-outlined text-[16px]">stars</span>
            <span>Award Tip</span>
          </button>
        </div>

        {/* Photo Title & Story */}
        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {photo.questTitle}
              </span>
            </div>
            <h2 className="text-lg font-black text-gray-900 mt-1">{photo.title}</h2>
            <p className="text-xs text-gray-600 leading-relaxed mt-1">
              {photo.visualStory ||
                'Caught this natural candid during afternoon break by the library lockers. The contrast of the natural morning sunlight against the blue denim jacket really made the colors pop without needing heavy post-processing.'}
            </p>
          </div>

          {/* Photography Technique Tip Card */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              <span>Rule of Thirds & Color Balance</span>
            </div>
            <p className="text-[11px] text-gray-700 leading-relaxed">
              {photo.techniqueTip?.content ||
                'Try placing your subject slightly off-center along the vertical grid intersection lines to create a more dynamic composition. Notice how Praew allowed negative space on the left, giving the subject\'s gaze room to breathe while the rich blue hue anchors the primary visual weight.'}
            </p>
            <span className="text-[10px] text-purple-700 font-medium italic pt-1">
              {photo.techniqueTip?.curator || 'Curated by Mentor Maya (Photo Lead) • XP Certified'}
            </span>
          </div>

          {/* EXIF Data Grid */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-gray-500">
                camera
              </span>
              <span>Camera & EXIF Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Camera Body</span>
                <span className="font-semibold text-gray-800">{photo.exif.camera}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Lens</span>
                <span className="font-semibold text-gray-800">{photo.exif.lens}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Aperture</span>
                <span className="font-semibold text-gray-800">{photo.exif.aperture}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Shutter Speed</span>
                <span className="font-semibold text-gray-800">{photo.exif.shutterSpeed}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">ISO</span>
                <span className="font-semibold text-gray-800">{photo.exif.iso}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Focal Length</span>
                <span className="font-semibold text-gray-800">{photo.exif.focalLength}</span>
              </div>
            </div>
          </div>

          {/* Critiques Thread */}
          <div className="flex flex-col gap-3 pt-2">
            <h3 className="text-xs font-bold text-gray-900 flex items-center justify-between">
              <span>Club Critiques & Insights</span>
              <span className="text-[11px] text-gray-500 font-normal">
                {photo.critiques?.length || 0} Comments
              </span>
            </h3>

            {/* Critique Item List */}
            <div className="space-y-3">
              {photo.critiques && photo.critiques.length > 0 ? (
                photo.critiques.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {c.avatarLetter}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-xs">{c.author}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-semibold">
                            {c.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">{c.timeAgo}</span>
                      </div>
                      <p className="text-gray-700 text-xs mt-1 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Be the first to share a constructive critique or photography tip!
                </p>
              )}
            </div>

            {/* Post a Critique Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a constructive critique or ask a question..."
                className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-full shrink-0 shadow-xs active:scale-95 transition-all"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
