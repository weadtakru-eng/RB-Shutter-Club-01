import React, { useState, useEffect } from 'react';
import { ActiveTab, PhotoItem, ChallengeItem, UserProfile } from './types';
import {
  INITIAL_USER,
  INITIAL_PHOTOS,
  INITIAL_CHALLENGES,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import {
  auth,
  onAuthStateChanged,
  signOutUser,
  getRedirectResult,
} from './lib/firebase';
import {
  subscribeToGalleryPhotos,
  persistPhotoToGallery,
} from './lib/galleryStorage';
import {
  syncUserOnAuth,
  subscribeToUserProfile,
  updateUserProfile,
  addXP,
  incrementUserStats,
  subscribeToLeaderboard,
  getLevelProgress,
  LeaderboardEntry,
} from './lib/userService';
import {
  subscribeToChallenges,
  subscribeToUserParticipants,
  subscribeToSubmissions,
  startChallengeMission,
  ChallengeDocument,
  ChallengeParticipant,
  SubmissionDocument,
} from './lib/challengeService';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { ChallengesView } from './components/ChallengesView';
import { GalleryView } from './components/GalleryView';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { MissionCompleteModal } from './components/MissionCompleteModal';
import { ChallengeDetailModal } from './components/ChallengeDetailModal';
import { ReviewSubmissionsModal } from './components/ReviewSubmissionsModal';
import { LeaderboardView } from './components/LeaderboardView';
import { AchievementsView } from './components/AchievementsView';
import { ActivitiesView } from './components/ActivitiesView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { LoginModal } from './components/LoginModal';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { BadgeDocument } from './lib/gamificationService';
import { Toast } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('challenges');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES);
  const [firestoreChallenges, setFirestoreChallenges] = useState<ChallengeDocument[]>([]);
  const [userParticipants, setUserParticipants] = useState<Record<string, ChallengeParticipant>>({});
  const [submissions, setSubmissions] = useState<SubmissionDocument[]>([]);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [leaderboardMembers, setLeaderboardMembers] = useState<LeaderboardEntry[]>([]);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isShutterOpen, setIsShutterOpen] = useState(false);
  const [shutterChallengeTitle, setShutterChallengeTitle] = useState('Color Hunt – Blue');
  const [shutterChallengeId, setShutterChallengeId] = useState('ch-color-hunt-blue');
  const [selectedChallengeForDetail, setSelectedChallengeForDetail] = useState<ChallengeDocument | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isMissionCompleteOpen, setIsMissionCompleteOpen] = useState(false);
  const [lastSubmittedPhoto, setLastSubmittedPhoto] = useState<Partial<PhotoItem> | undefined>(undefined);
  const [selectedDetailPhoto, setSelectedDetailPhoto] = useState<PhotoItem | null>(null);

  // Badge Unlock Modal State
  const [unlockedBadgeQueue, setUnlockedBadgeQueue] = useState<BadgeDocument[]>([]);
  const [currentUnlockedBadge, setCurrentUnlockedBadge] = useState<BadgeDocument | null>(null);

  const triggerBadgeUnlock = (badges: BadgeDocument[]) => {
    if (!badges || badges.length === 0) return;
    if (!currentUnlockedBadge) {
      setCurrentUnlockedBadge(badges[0]);
      setUnlockedBadgeQueue(badges.slice(1));
    } else {
      setUnlockedBadgeQueue((prev) => [...prev, ...badges]);
    }
  };

  const handleCloseBadgeModal = () => {
    setCurrentUnlockedBadge(null);
    if (unlockedBadgeQueue.length > 0) {
      const next = unlockedBadgeQueue[0];
      setUnlockedBadgeQueue((prev) => prev.slice(1));
      setTimeout(() => {
        setCurrentUnlockedBadge(next);
      }, 250);
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper to synchronize authenticated user with Firestore
  const handleUserAuthenticated = async (u: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }) => {
    try {
      const firestoreUser = await syncUserOnAuth(u);
      const progress = getLevelProgress(firestoreUser.xp || 0);

      setUser((prev) => ({
        ...prev,
        uid: firestoreUser.uid,
        isLoggedIn: true,
        name: firestoreUser.displayName || prev.name,
        thaiName: firestoreUser.thaiName || firestoreUser.displayName || prev.thaiName,
        email: firestoreUser.email || prev.email,
        avatarUrl: firestoreUser.photoURL || undefined,
        grade: firestoreUser.grade || prev.grade,
        room: firestoreUser.room || prev.room,
        role:
          firestoreUser.role === 'teacher'
            ? 'อาจารย์ที่ปรึกษา'
            : firestoreUser.role === 'admin'
            ? 'ผู้ดูแลระบบ'
            : 'สมาชิกชมรม',
        cameraGear: firestoreUser.cameraGear || prev.cameraGear,
        bio: firestoreUser.bio || prev.bio,
        studentId: firestoreUser.studentId || prev.studentId,
        level: progress.level,
        levelTitle: progress.title,
        currentXP: firestoreUser.xp || 0,
        targetXP: progress.nextLevelXP,
        photosCount:
          typeof firestoreUser.photoCount === 'number'
            ? firestoreUser.photoCount
            : prev.photosCount,
        questsCompleted:
          typeof firestoreUser.completedChallenges === 'number'
            ? firestoreUser.completedChallenges
            : prev.questsCompleted,
        badgesCount:
          typeof firestoreUser.badgeCount === 'number'
            ? firestoreUser.badgeCount
            : prev.badgesCount,
        currentStreak:
          typeof firestoreUser.currentStreak === 'number'
            ? firestoreUser.currentStreak
            : prev.currentStreak,
        longestStreak:
          typeof firestoreUser.longestStreak === 'number'
            ? firestoreUser.longestStreak
            : prev.longestStreak,
        lastChallengeDate: firestoreUser.lastChallengeDate || prev.lastChallengeDate,
      }));
    } catch (err) {
      console.error('Error syncing user on auth:', err);
    }
  };

  // Listen to Firebase Auth state & Handle Redirect result
  useEffect(() => {
    // Open Login Modal automatically if launched with ?login=true or #login
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('login') === 'true' || window.location.hash === '#login') {
        setIsLoginModalOpen(true);
      }
    }

    // Check if coming back from signInWithRedirect
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const u = result.user;
          handleUserAuthenticated(u);
          setCurrentTab('challenges'); // นำผู้ใช้ไปหน้า Home (ภารกิจ)
          showToast(`ยินดีต้อนรับ ${u.displayName || u.email || 'สมาชิกชมรม'}!`);
        }
      })
      .catch((err: any) => {
        console.error('[Firebase Auth Error - getRedirectResult]:', {
          code: err?.code,
          message: err?.message,
          fullError: err,
        });
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        handleUserAuthenticated(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for real-time user profile updates from Firestore
  useEffect(() => {
    if (!user.uid || !user.isLoggedIn) return;

    const unsubscribe = subscribeToUserProfile(user.uid, (freshUser) => {
      const progress = getLevelProgress(freshUser.xp || 0);
      setUser((prev) => ({
        ...prev,
        name: freshUser.displayName || prev.name,
        thaiName: freshUser.thaiName || freshUser.displayName || prev.thaiName,
        avatarUrl: freshUser.photoURL || undefined,
        currentXP: typeof freshUser.xp === 'number' ? freshUser.xp : prev.currentXP,
        level: progress.level,
        levelTitle: progress.title,
        targetXP: progress.nextLevelXP,
        photosCount:
          typeof freshUser.photoCount === 'number'
            ? freshUser.photoCount
            : prev.photosCount,
        questsCompleted:
          typeof freshUser.completedChallenges === 'number'
            ? freshUser.completedChallenges
            : prev.questsCompleted,
        badgesCount:
          typeof freshUser.badgeCount === 'number'
            ? freshUser.badgeCount
            : prev.badgesCount,
        currentStreak:
          typeof freshUser.currentStreak === 'number'
            ? freshUser.currentStreak
            : prev.currentStreak,
        longestStreak:
          typeof freshUser.longestStreak === 'number'
            ? freshUser.longestStreak
            : prev.longestStreak,
        lastChallengeDate: freshUser.lastChallengeDate || prev.lastChallengeDate,
        grade: freshUser.grade || prev.grade,
        room: freshUser.room || prev.room,
        cameraGear: freshUser.cameraGear || prev.cameraGear,
        bio: freshUser.bio || prev.bio,
      }));
    });

    return () => unsubscribe();
  }, [user.uid, user.isLoggedIn]);

  // Listen for real-time Leaderboard rankings from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((liveMembers) => {
      setLeaderboardMembers(liveMembers);
      if (user.uid) {
        const found = liveMembers.find((m) => m.uid === user.uid);
        if (found) {
          setUser((prev) => ({
            ...prev,
            rank: found.rank,
          }));
        }
      }
    }, user.uid);

    return () => unsubscribe();
  }, [user.uid]);

  // Listen for gallery photos synchronization across Firestore and LocalStorage
  useEffect(() => {
    const unsubscribe = subscribeToGalleryPhotos(INITIAL_PHOTOS, (mergedPhotos) => {
      setPhotos(mergedPhotos);
    });
    return () => unsubscribe();
  }, []);

  const isTeacherOrAdmin =
    user.role === 'อาจารย์ที่ปรึกษา' ||
    user.role === 'ผู้ดูแลระบบ' ||
    user.email === 'edtech@rajinibon.ac.th';

  // Helper to map Firestore Challenge Document to UI ChallengeItem
  const mapFirestoreToChallengeItem = (
    c: ChallengeDocument,
    participant?: ChallengeParticipant
  ): ChallengeItem => {
    const isCompleted = participant?.status === 'approved';
    const isSubmitted = participant?.status === 'submitted';
    const isStarted = participant?.status === 'started';

    const catKey = (c.categoryKey ||
      (c.category?.toLowerCase().includes('shape')
        ? 'shape'
        : c.category?.toLowerCase().includes('color')
        ? 'color'
        : c.category?.toLowerCase().includes('portrait')
        ? 'portrait'
        : c.category?.toLowerCase().includes('nature')
        ? 'nature'
        : c.category?.toLowerCase().includes('school')
        ? 'school'
        : c.category?.toLowerCase().includes('night')
        ? 'night'
        : 'creative')) as any;

    return {
      id: c.id,
      title: c.title,
      category: catKey,
      categoryLabel: c.categoryLabel || c.category || 'ภารกิจ',
      difficulty: c.difficulty || 'Medium',
      xpReward: c.points || 50,
      imageUrl: c.coverImage,
      description: c.description,
      participantsCount: c.participantsCount || 20,
      timeRemaining: c.deadline ? `เหลือเวลา ${c.deadline}` : 'สัปดาห์นี้',
      isFeatured: !!c.isFeatured,
      isNew: !!c.isNew,
      isInProgress: isStarted || isSubmitted,
      isCompleted: isCompleted,
      progressText: isCompleted
        ? 'ภารกิจสำเร็จแล้ว (+XP)'
        : isSubmitted
        ? 'ส่งผลงานแล้ว รอตรวจ'
        : isStarted
        ? 'กำลังทำภารกิจ'
        : undefined,
      progressFraction: isCompleted ? 1 : isSubmitted ? 0.75 : isStarted ? 0.3 : 0,
      mentorFeedback: isCompleted ? 'ผลงานผ่านการอนุมัติเรียบร้อยแล้ว' : undefined,
    };
  };

  // Listen for real-time challenges from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToChallenges((fChallenges) => {
      setFirestoreChallenges(fChallenges);
      if (fChallenges && fChallenges.length > 0) {
        const mapped = fChallenges.map((c) =>
          mapFirestoreToChallengeItem(c, userParticipants[c.id])
        );
        setChallenges(mapped);
      }
    });
    return () => unsubscribe();
  }, [userParticipants]);

  // Listen for user challenge participants from Firestore
  useEffect(() => {
    if (!user.uid || !user.isLoggedIn) return;
    const unsubscribe = subscribeToUserParticipants(user.uid, (pMap) => {
      setUserParticipants(pMap);
    });
    return () => unsubscribe();
  }, [user.uid, user.isLoggedIn]);

  // Listen for real-time photo submissions (admin sees all, member sees own)
  useEffect(() => {
    const targetUserId = isTeacherOrAdmin ? null : user.uid ? user.uid : null;
    const unsubscribe = subscribeToSubmissions(targetUserId, (subs) => {
      setSubmissions(subs);
    });
    return () => unsubscribe();
  }, [user.uid, isTeacherOrAdmin]);

  const pendingReviewsCount = submissions.filter((s) => s.status === 'pending').length;

  const handleLoginSuccess = (googleUser: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    uid: string;
  }) => {
    handleUserAuthenticated(googleUser);
    setCurrentTab('challenges');
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error(e);
    }
    setUser({
      ...INITIAL_USER,
      isLoggedIn: false,
      avatarUrl: undefined,
    });
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // Likes & Bookmarks Handlers
  const handleToggleLike = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );

    if (selectedDetailPhoto && selectedDetailPhoto.id === photoId) {
      setSelectedDetailPhoto((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likes: !prev.isLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
            }
          : null
      );
    }
  };

  const handleToggleBookmark = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const isBookmarked = !p.isBookmarked;
          showToast(isBookmarked ? 'บันทึกภาพลงในคอลเลกชันแล้ว' : 'ลบออกจากคอลเลกชันแล้ว');
          return { ...p, isBookmarked };
        }
        return p;
      })
    );

    if (selectedDetailPhoto && selectedDetailPhoto.id === photoId) {
      setSelectedDetailPhoto((prev) =>
        prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null
      );
    }
  };

  const handleAddComment = (photoId: string, commentText: string) => {
    const newComment = {
      id: `critique-${Date.now()}`,
      author: user.name,
      role: user.grade,
      timeAgo: 'Just now',
      content: commentText,
      likes: 0,
      avatarLetter: 'P',
    };

    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            critiques: [...(p.critiques || []), newComment],
          };
        }
        return p;
      })
    );

    if (selectedDetailPhoto && selectedDetailPhoto.id === photoId) {
      setSelectedDetailPhoto((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
              critiques: [...(prev.critiques || []), newComment],
            }
          : null
      );
    }
  };

  // Open Shutter Capture
  const handleOpenShutterForChallenge = (title: string, challengeId?: string) => {
    const targetId =
      challengeId ||
      firestoreChallenges.find((c) => c.title === title)?.id ||
      'ch-color-hunt-blue';
    setShutterChallengeTitle(title);
    setShutterChallengeId(targetId);

    if (user.uid && user.isLoggedIn && targetId) {
      startChallengeMission(user.uid, targetId).catch((err) => {
        console.warn('Start mission error:', err);
      });
    }

    setIsShutterOpen(true);
  };

  const handleSelectChallengeDetail = (challenge: ChallengeItem | ChallengeDocument) => {
    const found = firestoreChallenges.find(
      (c) => c.id === challenge.id || c.title === challenge.title
    );
    if (found) {
      setSelectedChallengeForDetail(found);
    } else {
      setSelectedChallengeForDetail({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: (challenge as any).categoryLabel || 'ภารกิจถ่ายภาพ',
        categoryKey: (challenge as any).category || 'color',
        points: (challenge as any).xpReward || 50,
        deadline: (challenge as any).timeRemaining || 'สัปดาห์นี้',
        coverImage: (challenge as any).imageUrl,
        difficulty: (challenge as any).difficulty || 'Medium',
        rules: [
          'ถ่ายภาพด้วยอุปกรณ์สมาร์ตโฟนหรือกล้องถ่ายภาพ',
          'ภาพต้องสื่อถึงโจทย์ได้อย่างชัดเจนและสร้างสรรค์',
          'รักษาบรรยากาศความสุภาพและความปลอดภัยในโรงเรียน',
        ],
        tips: [
          'มองหาทิศทางของแสงที่ตกกระทบวัตถุ',
          'ทดลองเปลี่ยนมุมมองจากระดับสายตาปกติเพื่อสร้างความน่าสนใจ',
        ],
        exampleImages: [(challenge as any).imageUrl],
        status: 'active',
        participantsCount: (challenge as any).participantsCount || 20,
      });
    }
  };

  // Submission Completed
  const handleSubmitSuccess = (newPhoto: Partial<PhotoItem>, xpEarned: number) => {
    setIsShutterOpen(false);
    setLastSubmittedPhoto(newPhoto);

    // Optimistically update User XP & Stats in UI
    setUser((prev) => {
      const nextXP = prev.currentXP + xpEarned;
      const progress = getLevelProgress(nextXP);
      return {
        ...prev,
        currentXP: nextXP,
        level: progress.level,
        levelTitle: progress.title,
        targetXP: progress.nextLevelXP,
        photosCount: prev.photosCount + 1,
      };
    });

    // Atomic Firestore Transaction for XP if immediately awarded
    if (xpEarned > 0 && user.uid && user.isLoggedIn) {
      addXP(user.uid, xpEarned, shutterChallengeTitle || 'ภารกิจถ่ายภาพ', 'challenge_submission')
        .then((res) => {
          if (res.leveledUp) {
            showToast(`🎉 ยินดีด้วย! คุณเลื่อนระดับขึ้นเป็น Level ${res.newLevel}!`);
          }
        })
        .catch((err) => {
          console.warn('XP transaction deferred/offline:', err);
        });

      incrementUserStats(user.uid, {
        photoIncrement: 1,
      });
    }

    // Add to photos list & persist to gallery storage
    if (newPhoto.title && newPhoto.imageUrl) {
      const fullPhoto: PhotoItem = {
        id: newPhoto.id || `photo-sub-${Date.now()}`,
        title: newPhoto.title,
        imageUrl: newPhoto.imageUrl,
        authorName: user.name,
        authorGrade: user.grade,
        authorInitial: (user.name || 'P').charAt(0).toUpperCase(),
        authorAvatar: user.avatarUrl,
        authorId: user.uid,
        avatarColorClass: 'bg-primary-fixed text-primary',
        questTitle: shutterChallengeTitle,
        questCategory: 'color',
        likes: 0,
        commentsCount: 0,
        aspectRatio: (newPhoto.aspectRatio as any) || 'aspect-[4/5]',
        isLiked: false,
        isBookmarked: false,
        isUserUpload: true,
        uploadedAt: new Date().toISOString(),
        exif: newPhoto.exif || {
          camera: 'Fujifilm X-T30 II',
          lens: 'XF 27mm f/2.8 R WR',
          focalLength: '27mm',
          aperture: 'f/2.8',
          shutterSpeed: '1/400s',
          iso: 'ISO 160',
        },
        visualStory: newPhoto.visualStory,
        tags: newPhoto.tags || ['#RBShutterClub'],
      };

      // Persist to LocalStorage and Firestore
      persistPhotoToGallery(fullPhoto, user.uid).catch((err) => {
        console.error('Failed to persist photo to gallery:', err);
      });

      setPhotos((prev) => [fullPhoto, ...prev.filter((p) => p.id !== fullPhoto.id)]);
      showToast('ส่งผลงานภารกิจเรียบร้อยแล้ว! รออาจารย์ตรวจเพื่อรับ XP');
    }

    // Update challenges state if applicable
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.title === shutterChallengeTitle || c.id === shutterChallengeId) {
          return {
            ...c,
            isInProgress: false,
            progressText: 'ส่งผลงานแล้ว (รอตรวจ)',
            progressFraction: 0.75,
          };
        }
        return c;
      })
    );

    // Open Mission Complete Celebration
    setIsMissionCompleteOpen(true);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    showToast('ทำเครื่องหมายอ่านทั้งหมดแล้ว');
  };

  const handleUpdateUser = async (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    if (user.uid && user.isLoggedIn) {
      try {
        await updateUserProfile(user.uid, {
          displayName: updated.name,
          thaiName: updated.thaiName,
          grade: updated.grade,
          room: updated.room,
          studentId: updated.studentId,
          cameraGear: updated.cameraGear,
          bio: updated.bio,
          photoURL: updated.avatarUrl || null,
        });
        showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
      } catch (err) {
        console.error('Failed to update user profile in Firestore:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col items-center selection:bg-purple-200">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Main App Container Constrained for Optimal Mobile/Tablet Proportions */}
      <div className="w-full max-w-md min-h-screen bg-[#f7f9fb] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.03)]">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          unreadCount={unreadCount}
          user={user}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />

        {/* Dynamic Views Container */}
        <main className="flex-1 w-full pt-16">
          {currentTab === 'challenges' && (
            <ChallengesView
              challenges={challenges}
              user={user}
              onOpenShutterForChallenge={handleOpenShutterForChallenge}
              onViewSubmission={(title) => {
                const found = photos.find((p) => p.questTitle === title) || photos[0];
                setSelectedDetailPhoto(found);
              }}
              onShowToast={showToast}
              onSelectChallengeDetail={handleSelectChallengeDetail}
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
              pendingReviewsCount={pendingReviewsCount}
            />
          )}

          {currentTab === 'gallery' && (
            <GalleryView
              photos={photos}
              user={user}
              onSelectPhoto={(photo) => setSelectedDetailPhoto(photo)}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onOpenShutter={() => setIsShutterOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'leaderboard' && (
            <LeaderboardView
              user={user}
              members={leaderboardMembers}
              onGoToChallenges={() => setCurrentTab('challenges')}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'achievements' && (
            <AchievementsView
              user={user}
              onGoToChallenges={() => setCurrentTab('challenges')}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'activities' && <ActivitiesView onShowToast={showToast} />}

          {currentTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onNavigate={setCurrentTab}
              onOpenShutter={() => setIsShutterOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              onShowToast={showToast}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onLogout={handleLogout}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              photos={photos}
              onSelectPhoto={(photo) => setSelectedDetailPhoto(photo)}
              onNavigate={setCurrentTab}
              onUpdateUser={handleUpdateUser}
              onShowToast={showToast}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          onOpenShutter={() => setIsShutterOpen(true)}
        />

        {/* Modals & Overlays */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />

        {/* Modals & Overlays */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />

        <CameraCaptureModal
          isOpen={isShutterOpen}
          onClose={() => setIsShutterOpen(false)}
          selectedChallengeTitle={shutterChallengeTitle}
          selectedChallengeId={shutterChallengeId}
          user={user}
          onSubmitSuccess={handleSubmitSuccess}
          onShowToast={showToast}
        />

        <ChallengeDetailModal
          isOpen={!!selectedChallengeForDetail}
          onClose={() => setSelectedChallengeForDetail(null)}
          challenge={selectedChallengeForDetail}
          participant={
            selectedChallengeForDetail
              ? userParticipants[selectedChallengeForDetail.id]
              : undefined
          }
          onStartMission={(ch) => {
            handleOpenShutterForChallenge(ch.title, ch.id);
            setSelectedChallengeForDetail(null);
          }}
        />

        <ReviewSubmissionsModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          submissions={submissions}
          currentUser={user}
          onShowToast={showToast}
          onBadgeUnlocked={(badges) => triggerBadgeUnlock(badges)}
        />

        <BadgeUnlockModal
          badge={currentUnlockedBadge}
          onClose={handleCloseBadgeModal}
          onShare={() => showToast('แชร์เหรียญรางวัลลงโปรไฟล์สำเร็จ!')}
        />

        <MissionCompleteModal
          isOpen={isMissionCompleteOpen}
          onClose={() => setIsMissionCompleteOpen(false)}
          submittedPhoto={lastSubmittedPhoto}
          user={user}
          onGoToGallery={() => {
            setIsMissionCompleteOpen(false);
            setCurrentTab('gallery');
          }}
          onStartNextChallenge={() => {
            setIsMissionCompleteOpen(false);
            handleOpenShutterForChallenge('Golden Hour Campus Magic');
          }}
          onShowToast={showToast}
        />

        <PhotoDetailModal
          photo={selectedDetailPhoto}
          onClose={() => setSelectedDetailPhoto(null)}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
          onAddComment={handleAddComment}
          onShowToast={showToast}
        />
      </div>
    </div>
  );
}
