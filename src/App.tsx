import React, { useState, useEffect } from 'react';
import { ActiveTab, PhotoItem, ChallengeItem, UserProfile } from './types';
import {
  INITIAL_USER,
  INITIAL_PHOTOS,
  INITIAL_CHALLENGES,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { auth, onAuthStateChanged, signOutUser } from './lib/firebase';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { ChallengesView } from './components/ChallengesView';
import { GalleryView } from './components/GalleryView';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { MissionCompleteModal } from './components/MissionCompleteModal';
import { LeaderboardView } from './components/LeaderboardView';
import { AchievementsView } from './components/AchievementsView';
import { ActivitiesView } from './components/ActivitiesView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { LoginModal } from './components/LoginModal';
import { Toast } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('challenges');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isShutterOpen, setIsShutterOpen] = useState(false);
  const [shutterChallengeTitle, setShutterChallengeTitle] = useState('Color Hunt – Blue');
  const [isMissionCompleteOpen, setIsMissionCompleteOpen] = useState(false);
  const [lastSubmittedPhoto, setLastSubmittedPhoto] = useState<Partial<PhotoItem> | undefined>(undefined);
  const [selectedDetailPhoto, setSelectedDetailPhoto] = useState<PhotoItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser((prev) => ({
          ...prev,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || prev.name,
          thaiName: firebaseUser.displayName || prev.thaiName,
          email: firebaseUser.email || prev.email,
          avatarUrl: firebaseUser.photoURL || undefined,
          isLoggedIn: true,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (googleUser: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    uid: string;
  }) => {
    setUser((prev) => ({
      ...prev,
      uid: googleUser.uid,
      name: googleUser.displayName || prev.name,
      thaiName: googleUser.displayName || prev.thaiName,
      email: googleUser.email || prev.email,
      avatarUrl: googleUser.photoURL || undefined,
      isLoggedIn: true,
    }));
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error(e);
    }
    setUser((prev) => ({
      ...prev,
      isLoggedIn: false,
      avatarUrl: undefined,
    }));
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
  const handleOpenShutterForChallenge = (title: string) => {
    setShutterChallengeTitle(title);
    setIsShutterOpen(true);
  };

  // Submission Completed
  const handleSubmitSuccess = (newPhoto: Partial<PhotoItem>, xpEarned: number) => {
    setIsShutterOpen(false);
    setLastSubmittedPhoto(newPhoto);

    // Update User XP & Stats
    setUser((prev) => ({
      ...prev,
      currentXP: prev.currentXP + xpEarned,
      photosCount: prev.photosCount + 1,
      questsCompleted: prev.questsCompleted + 1,
      rank: Math.max(1, prev.rank - 1),
    }));

    // Add to photos list
    if (newPhoto.title && newPhoto.imageUrl) {
      const fullPhoto: PhotoItem = {
        id: newPhoto.id || `photo-${Date.now()}`,
        title: newPhoto.title,
        imageUrl: newPhoto.imageUrl,
        authorName: user.name,
        authorGrade: user.grade,
        authorInitial: 'P',
        avatarColorClass: 'bg-primary-fixed text-primary',
        questTitle: shutterChallengeTitle,
        questCategory: 'color',
        likes: 1,
        commentsCount: 0,
        aspectRatio: (newPhoto.aspectRatio as any) || 'aspect-[4/5]',
        isLiked: false,
        isBookmarked: false,
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
      setPhotos((prev) => [fullPhoto, ...prev]);
    }

    // Update challenges state if applicable
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.title === shutterChallengeTitle) {
          return {
            ...c,
            isInProgress: false,
            isCompleted: true,
            progressText: '2 / 2 Photos Submitted',
            mentorFeedback: 'Outstanding balance and chromatic clarity!',
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
            />
          )}

          {currentTab === 'gallery' && (
            <GalleryView
              photos={photos}
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
              onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
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
          onSubmitSuccess={handleSubmitSuccess}
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
