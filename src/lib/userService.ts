import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export type UserRole = 'member' | 'teacher' | 'admin';

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  xp: number;
  level: number;
  completedChallenges: number;
  photoCount: number;
  badgeCount: number;
  currentStreak: number;
  createdAt?: any;
  updatedAt?: any;
  thaiName?: string;
  grade?: string;
  room?: string;
  studentId?: string;
  cameraGear?: string;
  bio?: string;
}

export interface XpTransaction {
  id?: string;
  userId: string;
  amount: number;
  reason: string;
  source: string;
  createdAt: any;
}

export interface LeaderboardEntry {
  rank: number;
  uid?: string;
  name: string;
  grade: string;
  role?: string;
  title: string;
  xp: number;
  level: number;
  completedQuests?: number;
  change?: string;
  avatar: string;
  isYou?: boolean;
}

/**
 * Standard XP Reward constants
 */
export const XP_REWARDS = {
  DAILY_CHALLENGE: 20,
  WEEKLY_CHALLENGE: 50,
  SPECIAL_CHALLENGE: 100,
  PHOTOGRAPHY_WORKSHOP: 30,
  PHOTO_WALK: 30,
} as const;

/**
 * Level ranges definition:
 * Level 1 = 0–99 XP
 * Level 2 = 100–249 XP
 * Level 3 = 250–499 XP
 * Level 4 = 500–799 XP
 * Level 5 = 800–1199 XP
 * Level 6 = 1200–1699 XP
 * Level 7 = 1700–2299 XP
 * Level 8 = 2300–2999 XP
 * Level 9 = 3000–3999 XP
 * Level 10 = 4000+ XP
 */
export const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, nextXP: 100, title: 'ผู้เริ่มต้นชัตเตอร์ (Apprentice)' },
  { level: 2, minXP: 100, nextXP: 250, title: 'นักล่าแสงมือใหม่ (Light Seeker)' },
  { level: 3, minXP: 250, nextXP: 500, title: 'นักสำรวจองค์ประกอบ (Explorer)' },
  { level: 4, minXP: 500, nextXP: 800, title: 'ผู้เชี่ยวชาญมุมมอง (Perspective Artisan)' },
  { level: 5, minXP: 800, nextXP: 1200, title: 'นักเล่าเรื่องด้วยภาพ (Visual Storyteller)' },
  { level: 6, minXP: 1200, nextXP: 1700, title: 'ช่างภาพมากฝีมือ (Senior Shutter)' },
  { level: 7, minXP: 1700, nextXP: 2300, title: 'ปรมาจารย์แสงและเงา (Shadow Master)' },
  { level: 8, minXP: 2300, nextXP: 3000, title: 'ศิลปินภาพถ่าย (Club Artist)' },
  { level: 9, minXP: 3000, nextXP: 4000, title: 'ผู้กำกับภาพ (Visual Director)' },
  { level: 10, minXP: 4000, nextXP: 4000, title: 'ตำนานชัตเตอร์คลับ (Master of Pixel)' },
];

/**
 * Calculate user Level (1–10) based on current XP
 */
export function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 800) return 4;
  if (xp < 1200) return 5;
  if (xp < 1700) return 6;
  if (xp < 2300) return 7;
  if (xp < 3000) return 8;
  if (xp < 4000) return 9;
  return 10;
}

/**
 * Get Level Title by level number
 */
export function getLevelTitle(level: number): string {
  const safeLevel = Math.max(1, Math.min(10, level));
  return LEVEL_THRESHOLDS[safeLevel - 1]?.title || 'สมาชิกชัตเตอร์คลับ';
}

/**
 * Calculate detailed progress towards next level
 */
export function getLevelProgress(xp: number) {
  const level = calculateLevel(xp);
  const config = LEVEL_THRESHOLDS[level - 1];

  if (level >= 10) {
    return {
      level: 10,
      title: config.title,
      currentLevelMinXP: 4000,
      nextLevelXP: 4000,
      xpInCurrentLevel: Math.max(0, xp - 4000),
      xpRequiredForNext: 0,
      progressPercent: 100,
    };
  }

  const currentLevelMinXP = config.minXP;
  const nextLevelXP = config.nextXP;
  const xpInCurrentLevel = Math.max(0, xp - currentLevelMinXP);
  const xpRequiredForNext = nextLevelXP - currentLevelMinXP;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpRequiredForNext) * 100))
  );

  return {
    level,
    title: config.title,
    currentLevelMinXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpRequiredForNext,
    progressPercent,
  };
}

/**
 * Formatted Firestore Error Logging according to Firebase skill standards
 */
export function handleFirestoreError(error: unknown, operation: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operation,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
}

/**
 * Convert technical Firebase errors to friendly Thai messages
 */
export function getFriendlyErrorMessage(error: any): string {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'permission-denied' || message.includes('Missing or insufficient permissions')) {
    return 'ไม่มีสิทธิ์ในการแก้ไขข้อมูลนี้ (จำกัดเฉพาะอาจารย์ที่ปรึกษาหรือเจ้าของโปรไฟล์)';
  }
  if (code === 'unavailable' || message.includes('offline') || message.includes('client is offline')) {
    return 'กำลังทำงานในโหมดออฟไลน์ ข้อมูลจะบันทึกในอุปกรณ์และซิงค์อัตโนมัติเมื่อออนไลน์';
  }
  if (code === 'resource-exhausted' || message.includes('Quota')) {
    return 'โควตาการใช้งานชั่วคราวเต็ม ระบบจะรีเซ็ตในวันถัดไป';
  }
  return 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
}

/**
 * Synchronize User profile upon successful Google Login
 * - If user does not exist in `users/{uid}`, create with initial stats (role=member, xp=0, level=1)
 * - If user ALREADY EXISTS: strictly preserve XP, Level, Badges, and Stats!
 */
export async function syncUserOnAuth(googleUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}): Promise<FirestoreUser> {
  const userDocRef = doc(db, 'users', googleUser.uid);

  try {
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const existing = userDocSnap.data() as FirestoreUser;

      // DO NOT reset XP, Level, Badges, or Statistics!
      // Update only displayName, photoURL, and updatedAt
      const updates: Partial<FirestoreUser> = {
        displayName: googleUser.displayName || existing.displayName || 'สมาชิกชมรม',
        photoURL: googleUser.photoURL || existing.photoURL || null,
        updatedAt: serverTimestamp(),
      };

      try {
        await updateDoc(userDocRef, updates);
      } catch (updateErr) {
        handleFirestoreError(updateErr, 'update', `users/${googleUser.uid}`);
      }

      return {
        ...existing,
        displayName: updates.displayName || existing.displayName,
        photoURL: updates.photoURL || existing.photoURL,
        uid: googleUser.uid,
        email: existing.email || googleUser.email || '',
      };
    } else {
      // Create new user profile document
      const newUser: FirestoreUser = {
        uid: googleUser.uid,
        email: googleUser.email || '',
        displayName: googleUser.displayName || 'สมาชิกชมรมถ่ายภาพ',
        photoURL: googleUser.photoURL || null,
        role: 'member',
        xp: 0,
        level: 1,
        completedChallenges: 0,
        photoCount: 0,
        badgeCount: 0,
        currentStreak: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        thaiName: googleUser.displayName || 'สมาชิกชมรม',
        grade: 'ม.ปลาย',
        room: 'ม.5/4',
        studentId: '',
        cameraGear: 'สมาร์ทโฟน / กล้องดิจิทัล',
        bio: 'ยินดีต้อนรับสู่ชมรมถ่ายภาพราชินีบน!',
      };

      await setDoc(userDocRef, newUser);
      return newUser;
    }
  } catch (error) {
    handleFirestoreError(error, 'syncUserOnAuth', `users/${googleUser.uid}`);
    // Fallback in-memory user to prevent app crashing
    return {
      uid: googleUser.uid,
      email: googleUser.email || '',
      displayName: googleUser.displayName || 'สมาชิกชมรม',
      photoURL: googleUser.photoURL || null,
      role: 'member',
      xp: 0,
      level: 1,
      completedChallenges: 0,
      photoCount: 0,
      badgeCount: 0,
      currentStreak: 0,
      thaiName: googleUser.displayName || 'สมาชิกชมรม',
      grade: 'ม.ปลาย',
      room: 'ชมรมถ่ายภาพ',
      studentId: '',
      cameraGear: 'สมาร์ทโฟน',
      bio: 'ยินดีต้อนรับสู่ชมรมถ่ายภาพราชินีบน!',
    };
  }
}

/**
 * Add XP to user using an Atomic Firestore Transaction
 * - Prevents duplicate or corrupt XP increments
 * - Updates user level automatically
 * - Logs audit record in `xpTransactions` collection
 */
export async function addXP(
  userId: string,
  amount: number,
  reason: string,
  source: string = 'system'
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const userRef = doc(db, 'users', userId);
  const xpTxRef = doc(collection(db, 'xpTransactions'));

  try {
    const result = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) {
        throw new Error(`User ${userId} not found in Firestore`);
      }

      const userData = userSnap.data() as FirestoreUser;
      const currentXP = userData.xp || 0;
      const previousLevel = userData.level || calculateLevel(currentXP);

      const newXP = currentXP + amount;
      const newLevel = calculateLevel(newXP);

      // 1. Update user document atomically
      transaction.update(userRef, {
        xp: newXP,
        level: newLevel,
        updatedAt: serverTimestamp(),
      });

      // 2. Insert immutable XP transaction audit log
      transaction.set(xpTxRef, {
        userId,
        amount,
        reason,
        source,
        createdAt: serverTimestamp(),
      });

      return {
        newXP,
        newLevel,
        leveledUp: newLevel > previousLevel,
      };
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, 'transaction_addXP', `users/${userId}`);
    throw error;
  }
}

/**
 * Increment completed challenge and photo counts atomically
 */
export async function incrementUserStats(
  userId: string,
  data: {
    photoIncrement?: number;
    challengeIncrement?: number;
    badgeIncrement?: number;
  }
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data() as FirestoreUser;
      const updates: any = {
        updatedAt: serverTimestamp(),
      };

      if (data.photoIncrement) {
        updates.photoCount = (userData.photoCount || 0) + data.photoIncrement;
      }
      if (data.challengeIncrement) {
        updates.completedChallenges = (userData.completedChallenges || 0) + data.challengeIncrement;
      }
      if (data.badgeIncrement) {
        updates.badgeCount = (userData.badgeCount || 0) + data.badgeIncrement;
      }

      transaction.update(userRef, updates);
    });
  } catch (error) {
    handleFirestoreError(error, 'incrementUserStats', `users/${userId}`);
  }
}

/**
 * Real-time listener for current user's profile document
 */
export function subscribeToUserProfile(
  uid: string,
  onUserUpdate: (user: FirestoreUser) => void,
  onError?: (err: any) => void
): () => void {
  const userRef = doc(db, 'users', uid);

  return onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreUser;
        onUserUpdate({
          ...data,
          uid: docSnap.id,
        });
      }
    },
    (error) => {
      handleFirestoreError(error, 'subscribeToUserProfile', `users/${uid}`);
      if (onError) onError(error);
    }
  );
}

/**
 * Update allowed profile fields only (strictly blocks editing xp, level, role)
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<
    Pick<
      FirestoreUser,
      'displayName' | 'thaiName' | 'grade' | 'room' | 'studentId' | 'cameraGear' | 'bio' | 'photoURL'
    >
  >
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  // Strictly sanitize fields to prevent tampering with role, xp, level
  const sanitized: any = {
    updatedAt: serverTimestamp(),
  };

  if (data.displayName !== undefined) sanitized.displayName = data.displayName;
  if (data.thaiName !== undefined) sanitized.thaiName = data.thaiName;
  if (data.grade !== undefined) sanitized.grade = data.grade;
  if (data.room !== undefined) sanitized.room = data.room;
  if (data.studentId !== undefined) sanitized.studentId = data.studentId;
  if (data.cameraGear !== undefined) sanitized.cameraGear = data.cameraGear;
  if (data.bio !== undefined) sanitized.bio = data.bio;
  if (data.photoURL !== undefined) sanitized.photoURL = data.photoURL;

  try {
    await updateDoc(userRef, sanitized);
  } catch (error) {
    handleFirestoreError(error, 'updateUserProfile', `users/${uid}`);
    throw error;
  }
}

/**
 * Real-time listener for Club Leaderboard
 * Queries Firestore `users` ordered by `xp` desc, limit 50
 */
export function subscribeToLeaderboard(
  onLeaderboardUpdate: (members: LeaderboardEntry[]) => void,
  currentUserId?: string
): () => void {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('xp', 'desc'), limit(50));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreMembers: LeaderboardEntry[] = [];
        let rankIndex = 1;

        snapshot.forEach((docSnap) => {
          const u = docSnap.data() as FirestoreUser;
          const userXp = typeof u.xp === 'number' ? u.xp : 0;
          const userLevel = u.level || calculateLevel(userXp);

          firestoreMembers.push({
            rank: rankIndex++,
            uid: docSnap.id,
            name: u.thaiName || u.displayName || 'สมาชิกชมรม',
            grade: u.grade || u.room || 'ม.ปลาย',
            role: u.role || 'member',
            title: getLevelTitle(userLevel),
            xp: userXp,
            level: userLevel,
            completedQuests: u.completedChallenges || 0,
            avatar:
              u.photoURL ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                u.displayName || 'RB'
              )}`,
            isYou: currentUserId ? docSnap.id === currentUserId : false,
          });
        });

        onLeaderboardUpdate(firestoreMembers);
      },
      (error) => {
        handleFirestoreError(error, 'subscribeToLeaderboard', 'users');
      }
    );
  } catch (err) {
    console.warn('[Leaderboard] Fallback listener:', err);
    return () => {};
  }
}
