import React, { useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
  isInIframe,
  isAuthorizedDomain,
} from '../lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (googleUser: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    uid: string;
  }) => void;
  onShowToast: (msg: string) => void;
}

const VERCEL_PROD_URL = 'https://rb-shutter-club-01.vercel.app';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInIframe(isInIframe());
      setErrorMessage(null);
      setErrorCode(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const user = await signInWithGoogle();
      onLoginSuccess({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      });
      onShowToast(`ยินดีต้อนรับ ${user.displayName || user.email || 'สมาชิกชมรม'}!`);
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';
      setErrorCode(code);

      // Explicit console.error logging required by diagnostic guidelines
      console.error('[Firebase Auth Error - LoginModal handleGoogleSignIn]:', {
        code,
        message,
        currentHost,
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        error: err,
      });

      if (code === 'auth/unauthorized-domain') {
        setErrorMessage(
          `โดเมนปัจจุบัน (${currentHost}) ยังไม่ได้รับอนุญาตใน Firebase Authentication > Authorized domains ของโปรเจกต์ rb-shutter-club-01`
        );
      } else if (code === 'auth/invalid-continue-uri') {
        setErrorMessage(
          `API Key และ authDomain ไม่ตรงกันกับ Firebase Project (โปรดตรวจสอบ VITE_FIREBASE_API_KEY ใน Vercel Environment Variables ให้ตรงกับโปรเจกต์ rb-shutter-club-01)`
        );
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage(
          'เบราว์เซอร์หรือ iFrame บล็อกหน้าต่างป๊อปอัป กรุณาเลือก "เปิดในหน้าต่างหลัก" หรือใช้วิธี Redirect เพื่อเข้าสู่ระบบ'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('คุณได้ปิดหน้าต่างเข้าสู่ระบบก่อนดำเนินการเสร็จสิ้น');
      } else if (code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setErrorMessage(message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInMainWindow = () => {
    const targetUrl = window.location.origin + window.location.pathname + '?login=true';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGoogleRedirect = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogleRedirect();
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';
      setErrorCode(code);

      // Explicit console.error logging required by diagnostic guidelines
      console.error('[Firebase Auth Error - LoginModal handleGoogleRedirect]:', {
        code,
        message,
        currentHost,
        error: err,
      });

      setErrorMessage(message || 'ไม่สามารถเริ่มการเข้าสู่ระบบแบบ Redirect ได้');
      setIsLoading(false);
    }
  };

  const handleCopyCurrentDomain = () => {
    if (navigator?.clipboard && currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      onShowToast(`คัดลอกโดเมน ${currentHost} แล้ว`);
      setTimeout(() => setCopiedDomain(false), 3000);
    }
  };

  const handleDemoSignIn = () => {
    // Quick guest or school student login fallback for testing
    onLoginSuccess({
      displayName: 'Praew Kanya (บัญชีนักเรียน)',
      email: 'praew.k@rajinibon.ac.th',
      photoURL: null,
      uid: 'demo-student-rb-01',
    });
    onShowToast('เข้าสู่ระบบในฐานะสมาชิกชมรม (บัญชีนักเรียนจำลอง)');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 border border-purple-100 max-h-[90vh] overflow-y-auto">
        {/* Top bar with close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700">
              RB Shutter Club • เข้าสู่ระบบ
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Brand visual header */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 mb-3">
            <span
              className="material-symbols-outlined text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              photo_camera
            </span>
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            เข้าสู่ระบบด้วย Gmail
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed px-2">
            เข้าสู่ระบบด้วยบัญชี Google หรืออีเมลโรงเรียน (@rajinibon.ac.th) เพื่อบันทึกผลงาน สะสมเหรียญตรา และรับคะแนน XP
          </p>
        </div>

        {/* In-Iframe Advisory Banner */}
        {inIframe && (
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-2.5 flex flex-col gap-1.5 text-[11px] text-purple-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-purple-600 shrink-0">info</span>
              <span className="flex-1">
                กำลังรันใน iFrame Preview หากพบปัญหาป๊อปอัป สามารถเปิดในหน้าต่างหลักเพื่อล็อกอินได้อย่างปลอดภัย
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenInMainWindow}
              className="self-start text-[11px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 pl-6"
            >
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              <span>เปิดแอปในหน้าต่างหลัก (แท็บใหม่)</span>
            </button>
          </div>
        )}

        {/* Error message card */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-col gap-2 text-rose-700 text-xs">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <div className="flex-1">
                <p className="font-bold">{errorMessage}</p>
              </div>
            </div>

            {/* Special Diagnosis & Actions for auth/unauthorized-domain or auth/invalid-continue-uri */}
            {(errorCode === 'auth/unauthorized-domain' || errorCode === 'auth/invalid-continue-uri') && (
              <div className="mt-1 pt-2 border-t border-rose-200/80 flex flex-col gap-1.5 text-[11px] text-rose-800">
                <p className="leading-snug">
                  💡 <strong>แนวทางแก้ไข:</strong>
                </p>
                <div className="space-y-1.5">
                  <a
                    href={VERCEL_PROD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-rose-300 font-bold text-purple-700 hover:bg-purple-50 transition-colors shadow-xs"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>เปิดบน Vercel Production</span>
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md shrink-0">
                      แนะนำ (ล็อกอินได้ทันที)
                    </span>
                  </a>

                  {inIframe && (
                    <button
                      onClick={handleOpenInMainWindow}
                      type="button"
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold transition-colors text-[11px] border border-purple-200"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      <span>เปิดในหน้าต่างหลักเพื่อล็อกอิน</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopyCurrentDomain}
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-rose-100/70 hover:bg-rose-200 text-rose-800 font-medium transition-colors text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedDomain ? 'check' : 'content_copy'}
                    </span>
                    <span>
                      {copiedDomain
                        ? 'คัดลอกโดเมนเรียบร้อยแล้ว!'
                        : `คัดลอก "${currentHost}" ไปเพิ่มใน Firebase`}
                    </span>
                  </button>

                  <button
                    onClick={handleDemoSignIn}
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold transition-colors text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    <span>ทดสอบด้วยบัญชีนักเรียน (Demo Login)</span>
                  </button>

                  <button
                    onClick={handleGoogleSignIn}
                    type="button"
                    className="w-full py-1 text-center text-[10px] text-gray-500 hover:text-purple-700 underline transition-colors"
                  >
                    ลองเชื่อมต่อ Google อีกครั้ง (หากเพิ่มโดเมนใน Firebase แล้ว)
                  </button>
                </div>
              </div>
            )}

            {errorCode === 'auth/popup-blocked' && (
              <div className="mt-1 flex flex-col gap-1.5 text-[11px] text-rose-800">
                <button
                  type="button"
                  onClick={handleOpenInMainWindow}
                  className="font-bold underline text-left hover:text-rose-950 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  <span>เปิดแอปในหน้าต่างหลักเพื่อเข้าสู่ระบบ</span>
                </button>
                {!inIframe && (
                  <button
                    type="button"
                    onClick={handleGoogleRedirect}
                    className="font-bold underline text-left hover:text-rose-950"
                  >
                    คลิกที่นี่เพื่อเข้าสู่ระบบด้วยวิธี Redirect แทน
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Main Google Popup Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50/40 text-gray-800 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-purple-700">
                <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                <span>กำลังเชื่อมต่อกับ Google...</span>
              </div>
            ) : (
              <>
                {/* SVG Google 'G' Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>เข้าสู่ระบบด้วย Google (Gmail)</span>
              </>
            )}
          </button>

          {/* Direct link to open Vercel if in preview */}
          {inIframe && (
            <a
              href={VERCEL_PROD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">launch</span>
              <span>เปิดบน Vercel Production</span>
            </a>
          )}

          {/* School Demo Account Fallback */}
          <button
            onClick={handleDemoSignIn}
            className="w-full py-2.5 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-purple-600">school</span>
            <span>เข้าใช้งานด่วนด้วยบัญชีนักเรียนจำลอง</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            ปลอดภัยสำหรับนักเรียน • Firebase Project: rb-shutter-club-01
          </p>
        </div>
      </div>
    </div>
  );
};

