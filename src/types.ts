export type ActiveTab = 'challenges' | 'gallery' | 'leaderboard' | 'achievements' | 'activities' | 'notifications' | 'settings' | 'profile';

export interface PhotoItem {
  id: string;
  title: string;
  imageUrl: string;
  authorName: string;
  authorGrade: string;
  authorAvatar?: string;
  authorInitial: string;
  avatarColorClass: string;
  questTitle: string;
  questCategory?: string;
  isMentorPick?: boolean;
  isClubLife?: boolean;
  isVerified?: boolean;
  likes: number;
  commentsCount: number;
  aspectRatio: 'aspect-[3/4]' | 'aspect-[4/5]' | 'aspect-square';
  isLiked?: boolean;
  isBookmarked?: boolean;
  isUserUpload?: boolean;
  uploadedAt?: string;
  authorId?: string;
  exif: {
    camera: string;
    lens: string;
    focalLength: string;
    aperture: string;
    shutterSpeed: string;
    iso: string;
    exposureComp?: string;
    metering?: string;
  };
  visualStory?: string;
  techniqueTip?: {
    title: string;
    content: string;
    curator: string;
  };
  tags: string[];
  critiques?: {
    id: string;
    author: string;
    role: string;
    timeAgo: string;
    content: string;
    likes: number;
    avatarLetter: string;
  }[];
}

export interface ChallengeItem {
  id: string;
  title: string;
  category: 'shape' | 'color' | 'nature' | 'school' | 'creative' | 'portrait' | 'night';
  categoryLabel: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  imageUrl: string;
  description: string;
  participantsCount: number;
  timeRemaining: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isInProgress?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  unlockLevel?: number;
  progressText?: string;
  progressFraction?: number; // 0 to 1
  mentorFeedback?: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  status: 'unlocked' | 'in_progress' | 'mastery';
  completedDate?: string;
  tagline?: string;
  progressCurrent?: number;
  progressTotal?: number;
  accentGradient: string;
  iconColor: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  type: 'Photo Hunt' | 'Workshop' | 'Photo Walk' | 'Exhibition';
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  description: string;
  xpReward: number;
  enrolledSpots: number;
  totalSpots: number;
  statusTag: 'You\'re Going' | 'Almost Full' | 'Open' | 'Waitlist Available' | 'Full';
  isEnrolled?: boolean;
}

export interface NotificationItem {
  id: string;
  category: 'quests' | 'friends' | 'system';
  title: string;
  description: string;
  timeAgo: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  isUnread: boolean;
  actionText?: string;
  actionTargetTab?: ActiveTab;
  badgeLabel?: string;
  imageUrl?: string;
}

export interface UserProfile {
  uid?: string;
  avatarUrl?: string;
  isLoggedIn?: boolean;
  name: string;
  thaiName: string;
  grade: string;
  room: string;
  role: string;
  email: string;
  studentId: string;
  cameraGear: string;
  bio: string;
  level: number;
  levelTitle: string;
  currentXP: number;
  targetXP: number;
  rank: number;
  totalMembers: number;
  photosCount: number;
  questsCompleted: number;
  questsTotal: number;
  badgesCount: number;
}
