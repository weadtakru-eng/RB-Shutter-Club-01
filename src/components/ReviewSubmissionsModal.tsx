import React, { useState } from 'react';
import { SubmissionDocument, approveSubmission, rejectSubmission } from '../lib/challengeService';
import { UserProfile } from '../types';

interface ReviewSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: SubmissionDocument[];
  currentUser: UserProfile;
  onShowToast: (msg: string) => void;
}

export const ReviewSubmissionsModal: React.FC<ReviewSubmissionsModalProps> = ({
  isOpen,
  onClose,
  submissions,
  currentUser,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  const handleApprove = async (sub: SubmissionDocument) => {
    if (processingId) return;
    setProcessingId(sub.id);
    try {
      const result = await approveSubmission(
        sub.id,
        currentUser.uid || 'teacher_admin',
        currentUser.name || 'อาจารย์ที่ปรึกษา'
      );
      if (result.success) {
        onShowToast(`อนุมัติผลงานของ ${sub.studentName} สำเร็จ (+${result.xpAwarded} XP)`);
      } else {
        onShowToast(result.message);
      }
    } catch (err: any) {
      console.error('Approval failed:', err);
      onShowToast(err?.message || 'เกิดข้อผิดพลาดในการอนุมัติผลงาน');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingId || processingId) return;
    setProcessingId(rejectingId);
    try {
      await rejectSubmission(
        rejectingId,
        currentUser.uid || 'teacher_admin',
        rejectReason.trim() || 'ภาพยังไม่ตรงตามเกณฑ์โจทย์ สามารถถ่ายส่งใหม่ได้'
      );
      onShowToast('ส่งกลับผลงานให้นักเรียนแก้ไขเรียบร้อยแล้ว');
      setRejectingId(null);
      setRejectReason('');
    } catch (err: any) {
      console.error('Rejection failed:', err);
      onShowToast(err?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex flex-col items-center justify-start sm:py-6 p-2 animate-in fade-in duration-200">
      <div className="bg-[#12141c] text-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-800 my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#171a26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-purple-300">
              <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">ตรวจผลงานภาพถ่าย (Review Submissions)</h2>
                <span className="text-[10px] bg-purple-800/80 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                  อาจารย์ / แอดมิน
                </span>
              </div>
              <p className="text-xs text-gray-400">
                ประเมินและให้ XP นักเรียนชมรม RB Shutter Club ตามเกณฑ์โจทย์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 border-b border-gray-800/60 flex items-center gap-2 overflow-x-auto bg-[#141722]">
          <button
            onClick={() => setFilter('pending')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filter === 'pending'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>รอการตรวจ</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                pendingCount > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filter === 'approved'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>อนุมัติแล้ว (+XP แล้ว)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('rejected')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filter === 'rejected'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>ส่งกลับแก้ไข</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
              {rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filter === 'all'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>ทั้งหมด</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-800 text-gray-400">
              {submissions.length}
            </span>
          </button>
        </div>

        {/* Submissions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-gray-600 mb-2">
                fact_check
              </span>
              <p className="text-sm font-semibold text-gray-300">ไม่มีรายการผลงานในหมวดนี้</p>
              <p className="text-xs text-gray-500 mt-1">
                {filter === 'pending'
                  ? 'นักเรียนส่งผลงานครบทุกรายการแล้ว เยี่ยมมาก!'
                  : 'ยังไม่มีผลงานในสถานะนี้'}
              </p>
            </div>
          ) : (
            filtered.map((sub) => (
              <div
                key={sub.id}
                className="bg-[#171a26] border border-gray-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-gray-700 transition-colors"
              >
                {/* Photo Thumbnail */}
                <div
                  onClick={() => setExpandedImage(sub.imageURL)}
                  className="w-full sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-gray-900 shrink-0 cursor-pointer relative group border border-gray-800"
                >
                  <img
                    src={sub.imageURL}
                    alt={sub.caption || sub.challengeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white text-[24px]">
                      zoom_in
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Student & Challenge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {sub.studentAvatar ? (
                          <img
                            src={sub.studentAvatar}
                            alt={sub.studentName}
                            className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-900/60 text-purple-200 text-xs font-bold flex items-center justify-center">
                            {sub.studentName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{sub.studentName}</span>
                            <span className="text-[10px] text-gray-400 bg-gray-800/80 px-1.5 py-0.2 rounded-sm">
                              {sub.studentGrade || 'ม.5'}
                            </span>
                          </div>
                          <span className="text-[10px] text-purple-400 font-semibold">
                            ภารกิจ: {sub.challengeTitle}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      {sub.status === 'pending' ? (
                        <span className="text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          รอตรวจ
                        </span>
                      ) : sub.status === 'approved' ? (
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          อนุมัติแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">cancel</span>
                          ส่งกลับแก้ไข
                        </span>
                      )}
                    </div>

                    {/* Caption */}
                    <p className="mt-2.5 text-xs text-gray-300 bg-[#12141c] p-2.5 rounded-xl border border-gray-800/60 leading-relaxed italic">
                      "{sub.caption || 'ไม่มีคำบรรยาย'}"
                    </p>

                    {/* Extra Meta */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-400">
                          stars
                        </span>
                        <strong className="text-amber-300">+{sub.points} XP</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          {sub.visibility === 'club' ? 'groups' : 'lock'}
                        </span>
                        <span>{sub.visibility === 'club' ? 'แสดงในแกลเลอรี' : 'เฉพาะเมนเทอร์'}</span>
                      </span>
                      {sub.submittedAt && (
                        <span className="text-gray-500">
                          {typeof sub.submittedAt?.toDate === 'function'
                            ? sub.submittedAt.toDate().toLocaleDateString('th-TH', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'เมื่อเร็วๆ นี้'}
                        </span>
                      )}
                    </div>

                    {/* Review comment note if exists */}
                    {sub.reviewComment && (
                      <div className="mt-2 text-[11px] text-rose-300/90 bg-rose-950/30 border border-rose-900/40 p-2 rounded-lg">
                        <strong>บันทึกจากอาจารย์:</strong> {sub.reviewComment}
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending */}
                  {sub.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-gray-800/60 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setRejectingId(sub.id);
                          setRejectReason('');
                        }}
                        disabled={processingId === sub.id}
                        className="py-1.5 px-3 rounded-lg border border-rose-800/70 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-xs font-bold active:scale-95 transition-all"
                      >
                        ส่งกลับแก้ไข
                      </button>
                      <button
                        onClick={() => handleApprove(sub)}
                        disabled={processingId === sub.id}
                        className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
                      >
                        {processingId === sub.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        )}
                        <span>อนุมัติ (+{sub.points} XP)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#171a26] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>สิทธิ์: {currentUser.role || 'อาจารย์ที่ปรึกษา'} ({currentUser.email})</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Reject Reason Dialog Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#171a26] border border-gray-700 rounded-2xl max-w-sm w-full p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-rose-400 text-[18px]">feedback</span>
              <span>ระบุเหตุผลในการส่งกลับผลงาน</span>
            </h3>
            <p className="text-xs text-gray-400">
              ข้อความนี้จะแสดงให้นักเรียนทราบ เพื่อให้นำไปปรับปรุงและถ่ายส่งใหม่ได้
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="เช่น ภาพยังไม่ตรงตามโจทย์รูปทรงวงกลม แสงยังมืดเกินไป..."
              className="w-full bg-[#12141c] border border-gray-700 rounded-xl p-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setRejectingId(null)}
                className="py-1.5 px-3 rounded-lg text-gray-400 hover:text-white text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={processingId === rejectingId}
                className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1"
              >
                {processingId === rejectingId ? 'กำลังส่ง...' : 'ยืนยันการส่งกลับ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image View */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-70 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={expandedImage}
            alt="Expanded view"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-gray-800"
          />
        </div>
      )}
    </div>
  );
};
