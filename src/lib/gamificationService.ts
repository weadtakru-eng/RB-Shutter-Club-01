import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { FirestoreUser } from './userService';

export interface BadgeDocument {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  category: 'challenge' | 'streak' | 'leaderboard' | 'mastery';
  requirement: string;
  requirementType: 'completedChallenges' | 'categoryCount' | 'streak' | 'leaderboardRank';
  requirementValue: number;
  requirementCategory?: string;
  xpBonus: number;
  accentGradient: string;
  iconColor: string;
  order: number;
  createdAt?: any;
}

export interface UserBadgeDocument {
  id: string; // `${userId}_${badgeId}`
  userId: string;
  badgeId: string;
  badgeName?: string;
  earnedAt: any;
  badge?: BadgeDocument;
}

// Initial Standard Badges specification
export const SEED_BADGES: Omit<BadgeDocument, 'createdAt'>[] = [
  {
    id: 'first-shot',
    name: 'First Shot (ช็อตแรกเปิดเลนส์)',
    nameEn: 'First Shot',
    description: 'ทำ Challenge สำเร็จครั้งแรกในชมรม',
    icon: 'photo_camera',
    category: 'challenge',
    requirement: 'ทำ Challenge สำเร็จอย่างน้อย 1 ครั้ง',
    requirementType: 'completedChallenges',
    requirementValue: 1,
    xpBonus: 50,
    accentGradient: 'from-purple-100 via-purple-200 to-indigo-100',
    iconColor: 'text-purple-600',
    order: 1,
  },
  {
    id: 'color-explorer',
    name: 'Color Explorer (นักสำรวจเฉดสี)',
    nameEn: 'Color Explorer',
    description: 'ทำ Color Hunt Challenge สำเร็จครบ 5 ครั้ง',
    icon: 'palette',
    category: 'challenge',
    requirement: 'ทำ Color Hunt สำเร็จ 5 ครั้ง',
    requirementType: 'categoryCount',
    requirementValue: 5,
    requirementCategory: 'color',
    xpBonus: 100,
    accentGradient: 'from-amber-100 via-purple-100 to-pink-100',
    iconColor: 'text-purple-600',
    order: 2,
  },
  {
    id: 'shape-hunter',
    name: 'Shape Hunter (นักล่ารูปทรงเรขาคณิต)',
    nameEn: 'Shape Hunter',
    description: 'ทำ Shape Hunt Challenge สำเร็จครบ 10 ครั้ง',
    icon: 'category',
    category: 'challenge',
    requirement: 'ทำ Shape Hunt สำเร็จ 10 ครั้ง',
    requirementType: 'categoryCount',
    requirementValue: 10,
    requirementCategory: 'shape',
    xpBonus: 150,
    accentGradient: 'from-blue-100 via-indigo-100 to-purple-100',
    iconColor: 'text-indigo-600',
    order: 3,
  },
  {
    id: 'creative-eye',
    name: 'Creative Eye (ดวงตานักสร้างสรรค์)',
    nameEn: 'Creative Eye',
    description: 'ทำ Creative Challenge สำเร็จครบ 5 ครั้ง',
    icon: 'visibility',
    category: 'challenge',
    requirement: 'ทำ Creative Challenge สำเร็จ 5 ครั้ง',
    requirementType: 'categoryCount',
    requirementValue: 5,
    requirementCategory: 'creative',
    xpBonus: 100,
    accentGradient: 'from-emerald-100 via-teal-100 to-cyan-100',
    iconColor: 'text-emerald-600',
    order: 4,
  },
  {
    id: 'bronze-streak',
    name: 'Bronze Streak (สตรีคชัตเตอร์ 3 วัน)',
    nameEn: 'Bronze Streak',
    description: 'ทำ Challenge ต่อเนื่อง 3 วันติดกัน',
    icon: 'whatshot',
    category: 'streak',
    requirement: 'สตรีคถ่ายภาพต่อเนื่อง >= 3 วัน',
    requirementType: 'streak',
    requirementValue: 3,
    xpBonus: 50,
    accentGradient: 'from-amber-100 to-orange-100',
    iconColor: 'text-amber-700',
    order: 5,
  },
  {
    id: 'challenge-streak',
    name: 'Challenge Streak (สตรีคถ่ายภาพ 7 วัน)',
    nameEn: 'Challenge Streak',
    description: 'ทำ Challenge ต่อเนื่อง 7 วันติดกัน',
    icon: 'local_fire_department',
    category: 'streak',
    requirement: 'สตรีคถ่ายภาพต่อเนื่อง >= 7 วัน',
    requirementType: 'streak',
    requirementValue: 7,
    xpBonus: 100,
    accentGradient: 'from-amber-200 via-orange-200 to-rose-200',
    iconColor: 'text-orange-600',
    order: 6,
  },
  {
    id: 'photography-dedication',
    name: 'Photography Dedication (ความมุ่งมั่น 14 วัน)',
    nameEn: 'Photography Dedication',
    description: 'ทำ Challenge ต่อเนื่อง 14 วันติดกัน',
    icon: 'flare',
    category: 'streak',
    requirement: 'สตรีคถ่ายภาพต่อเนื่อง >= 14 วัน',
    requirementType: 'streak',
    requirementValue: 14,
    xpBonus: 200,
    accentGradient: 'from-rose-100 via-pink-200 to-purple-200',
    iconColor: 'text-rose-600',
    order: 7,
  },
  {
    id: 'shutter-legend',
    name: 'Shutter Legend (ตำนานสตรีค 30 วัน)',
    nameEn: 'Shutter Legend',
    description: 'ทำ Challenge ต่อเนื่อง 30 วันติดกัน',
    icon: 'military_tech',
    category: 'streak',
    requirement: 'สตรีคถ่ายภาพต่อเนื่อง >= 30 วัน',
    requirementType: 'streak',
    requirementValue: 30,
    xpBonus: 500,
    accentGradient: 'from-yellow-200 via-amber-300 to-purple-300',
    iconColor: 'text-amber-800',
    order: 8,
  },
  {
    id: 'photography-explorer',
    name: 'Photography Explorer (นักสำรวจ 20 ภารกิจ)',
    nameEn: 'Photography Explorer',
    description: 'ทำ Challenge ครบ 20 ครั้งสะสมในชมรม',
    icon: 'explore',
    category: 'challenge',
    requirement: 'ทำ Challenge ครบ 20 ครั้ง',
    requirementType: 'completedChallenges',
    requirementValue: 20,
    xpBonus: 250,
    accentGradient: 'from-cyan-100 via-sky-200 to-blue-200',
    iconColor: 'text-sky-700',
    order: 9,
  },
  {
    id: 'top-photographer',
    name: 'Top Photographer (สุดยอดช่างภาพ Top 3)',
    nameEn: 'Top Photographer',
    description: 'ติด Top 3 บนตารางคะแนนชมรม',
    icon: 'emoji_events',
    category: 'leaderboard',
    requirement: 'อันดับ Leaderboard 1-3',
    requirementType: 'leaderboardRank',
    requirementValue: 3,
    xpBonus: 200,
    accentGradient: 'from-yellow-100 via-amber-200 to-yellow-300',
    iconColor: 'text-amber-800',
    order: 10,
  },
];

/**
 * Seed initial badges into Firestore if empty
 */
export async function ensureInitialBadgesSeeded(): Promise<void> {
  try {
    const colRef = collection(db, 'badges');
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      for (const badge of SEED_BADGES) {
        const docRef = doc(db, 'badges', badge.id);
        await setDoc(docRef, {
          ...badge,
          createdAt: serverTimestamp(),
        });
      }
      console.log('Seeded initial badges into Firestore badges collection');
    }
  } catch (err) {
    console.warn('Badges seeding check deferred/offline:', err);
  }
}

/**
 * Get Thailand date string (YYYY-MM-DD)
 */
export function getThailandDateString(date: Date = new Date()): string {
  // UTC+7
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const thTime = new Date(utc + 7 * 3600000);
  return thTime.toISOString().slice(0, 10);
}

/**
 * Compute streak increment and longest streak safely
 */
export function computeStreakUpdate(
  lastChallengeDate: string | null | undefined,
  currentStreak: number = 0,
  longestStreak: number = 0
): { newStreak: number; newLongestStreak: number; todayStr: string; isStreakContinued: boolean } {
  const todayStr = getThailandDateString();

  if (!lastChallengeDate) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak || 0, 1),
      todayStr,
      isStreakContinued: true,
    };
  }

  if (lastChallengeDate === todayStr) {
    // Already did a challenge today: streak continues, don't double count
    const validCurrent = Math.max(1, currentStreak || 1);
    return {
      newStreak: validCurrent,
      newLongestStreak: Math.max(longestStreak || 0, validCurrent),
      todayStr,
      isStreakContinued: true,
    };
  }

  // Parse day difference
  const lastDate = new Date(`${lastChallengeDate}T00:00:00Z`);
  const curDate = new Date(`${todayStr}T00:00:00Z`);
  const diffTime = curDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays === 1) {
    // Yesterday! Perfect consecutive streak
    const nextStreak = (currentStreak || 0) + 1;
    return {
      newStreak: nextStreak,
      newLongestStreak: Math.max(longestStreak || 0, nextStreak),
      todayStr,
      isStreakContinued: true,
    };
  } else {
    // Missed at least one day: reset streak to 1
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak || 0, 1),
      todayStr,
      isStreakContinued: false,
    };
  }
}

/**
 * Automatic Badge Check
 * Evaluates all badge conditions for a given user and awards newly earned badges.
 * Uses atomic/idempotent document creation with key `${userId}_${badgeId}` to guarantee no duplicate badges.
 */
export async function checkAndAwardBadges(
  userId: string,
  userRank?: number
): Promise<BadgeDocument[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];

    const userData = userSnap.data() as FirestoreUser;

    // 1. Fetch all badges
    const badgesSnap = await getDocs(collection(db, 'badges'));
    const allBadges: BadgeDocument[] = [];
    if (!badgesSnap.empty) {
      badgesSnap.forEach((d) => {
        allBadges.push({ id: d.id, ...d.data() } as BadgeDocument);
      });
    } else {
      // Fallback to static seeds if offline/empty
      allBadges.push(...(SEED_BADGES as BadgeDocument[]));
    }

    // 2. Fetch user's existing badges to prevent duplicate awards
    const userBadgesCol = collection(db, 'userBadges');
    const existingBadgesQuery = query(userBadgesCol, where('userId', '==', userId));
    const existingSnap = await getDocs(existingBadgesQuery);
    const existingBadgeIds = new Set<string>();
    existingSnap.forEach((d) => {
      const data = d.data() as UserBadgeDocument;
      existingBadgeIds.add(data.badgeId);
    });

    // 3. Gather user's metrics
    const completedChallenges = userData.completedChallenges || 0;
    const currentStreak = userData.currentStreak || 0;

    // Count approved submissions by category
    let colorCount = 0;
    let shapeCount = 0;
    let creativeCount = 0;

    try {
      const subQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', userId),
        where('status', '==', 'approved')
      );
      const subSnap = await getDocs(subQuery);
      subSnap.forEach((d) => {
        const sub = d.data();
        const cat = (sub.challengeCategory || sub.challengeTitle || '').toLowerCase();
        if (cat.includes('color') || cat.includes('สี')) colorCount++;
        if (cat.includes('shape') || cat.includes('ทรง') || cat.includes('วงกลม')) shapeCount++;
        if (cat.includes('creative') || cat.includes('สร้างสรรค์')) creativeCount++;
      });
    } catch (err) {
      console.warn('Could not query submission categories for badge check:', err);
    }

    const newlyEarnedBadges: BadgeDocument[] = [];

    // 4. Evaluate each badge
    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) {
        continue; // Already earned
      }

      let isEarned = false;

      switch (badge.id) {
        case 'first-shot':
          isEarned = completedChallenges >= 1;
          break;
        case 'color-explorer':
          isEarned = colorCount >= 5;
          break;
        case 'shape-hunter':
          isEarned = shapeCount >= 10;
          break;
        case 'creative-eye':
          isEarned = creativeCount >= 5;
          break;
        case 'bronze-streak':
          isEarned = currentStreak >= 3;
          break;
        case 'challenge-streak':
          isEarned = currentStreak >= 7;
          break;
        case 'photography-dedication':
          isEarned = currentStreak >= 14;
          break;
        case 'shutter-legend':
          isEarned = currentStreak >= 30;
          break;
        case 'photography-explorer':
          isEarned = completedChallenges >= 20;
          break;
        case 'top-photographer':
          isEarned = typeof userRank === 'number' && userRank > 0 && userRank <= 3;
          break;
        default:
          if (badge.requirementType === 'completedChallenges') {
            isEarned = completedChallenges >= badge.requirementValue;
          } else if (badge.requirementType === 'streak') {
            isEarned = currentStreak >= badge.requirementValue;
          }
          break;
      }

      if (isEarned) {
        // Document ID `${userId}_${badge.id}` strictly prevents race condition duplicates
        const userBadgeDocId = `${userId}_${badge.id}`;
        const userBadgeRef = doc(db, 'userBadges', userBadgeDocId);

        await setDoc(
          userBadgeRef,
          {
            id: userBadgeDocId,
            userId,
            badgeId: badge.id,
            badgeName: badge.name,
            earnedAt: serverTimestamp(),
          },
          { merge: true }
        );

        newlyEarnedBadges.push(badge);
      }
    }

    // 5. Update user badgeCount
    if (newlyEarnedBadges.length > 0) {
      await updateDoc(userRef, {
        badgeCount: increment(newlyEarnedBadges.length),
        updatedAt: serverTimestamp(),
      });
    }

    return newlyEarnedBadges;
  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error);
    return [];
  }
}

/**
 * Real-time listener for user's earned badges
 */
export function subscribeToUserBadges(
  userId: string,
  callback: (userBadges: UserBadgeDocument[]) => void
): () => void {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'userBadges'), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserBadgeDocument[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as UserBadgeDocument);
      });
      callback(list);
    },
    (err) => {
      console.warn('Error listening to user badges:', err);
      callback([]);
    }
  );
}

/**
 * Real-time listener for all available badges
 */
export function subscribeToBadges(callback: (badges: BadgeDocument[]) => void): () => void {
  const colRef = collection(db, 'badges');
  const q = query(colRef, orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: BadgeDocument[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as BadgeDocument);
        });
        callback(list);
      } else {
        callback(SEED_BADGES as BadgeDocument[]);
      }
    },
    (err) => {
      console.warn('Error listening to badges collection, fallback to seeds:', err);
      callback(SEED_BADGES as BadgeDocument[]);
    }
  );
}
