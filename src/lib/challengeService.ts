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
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { addXP, FirestoreUser } from './userService';
import {
  computeStreakUpdate,
  checkAndAwardBadges,
  BadgeDocument,
} from './gamificationService';

export type ChallengeCategory =
  | 'Shape Hunt'
  | 'Color Hunt'
  | 'Nature'
  | 'School Life'
  | 'Creative'
  | 'Portrait'
  | 'Night Photography';

export type ChallengeStatus = 'draft' | 'active' | 'completed' | 'expired';

export interface ChallengeDocument {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory | string;
  categoryKey?: 'shape' | 'color' | 'nature' | 'school' | 'creative' | 'portrait' | 'night';
  categoryLabel?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  coverImage: string;
  rules: string[];
  tips: string[];
  examplePhotos: string[];
  startDate: string;
  deadline: string;
  status: ChallengeStatus;
  participantsCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  challengeId: string;
  status: 'started' | 'submitted' | 'approved' | 'rejected';
  startedAt: any;
  submittedAt?: any;
  completedAt?: any;
}

export interface SubmissionDocument {
  id: string;
  userId: string;
  studentName: string;
  studentGrade?: string;
  studentAvatar?: string | null;
  challengeId: string;
  challengeTitle: string;
  imageURL: string;
  storagePath: string;
  caption: string;
  visibility: 'club' | 'private';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  reviewedAt?: any;
  reviewedBy?: string | null;
  reviewComment?: string | null;
  rewarded?: boolean;
  points: number;
  aspectRatio?: string;
  exif?: Record<string, any>;
}

// Initial challenge seeds matching the user specifications
export const SEED_CHALLENGES: Omit<ChallengeDocument, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'ch-find-the-circle',
    title: 'Find the Circle',
    description: 'ค้นหารูปทรงเรขาคณิตวงกลมในสถาปัตยกรรม ธรรมชาติ หรือสิ่งของรอบโรงเรียนราชินีบน แล้วจัดวางองค์ประกอบให้โดดเด่น',
    category: 'Shape Hunt',
    categoryKey: 'shape',
    categoryLabel: 'ล่ารูปทรง',
    difficulty: 'Easy',
    points: 30,
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA0p1CMhk2ZCP8SDqMEvZXqvLeXxu_RNWvVa3GaLllPv0RBfAmH4RLkp4tJjtJtsb3gBXEbSzzRgPisusYn2JpzhsO3iPmFgMtirMv9-3G0me2IrAoWY6bCSnhDE0xv_oRVcSjGiUOm1gkXyoGzePPjDfwCixZxOvD6rV73HJmSUY7YU7JNwodVcQ2Bw911vLyEtP8ETVy31iSkz94UDO-Bs54p4JQpwAGBqTE0E9GcBBhb25_T-cO7',
    rules: [
      'ค้นหาวัตถุทรงกลมในรั้วโรงเรียนหรือชีวิตประจำวัน',
      'ใช้องค์ประกอบจุดตัด 9 ช่อง หรือจัดกึ่งกลางเพื่อเน้นความสมมาตร',
      'บันทึกภาพด้วยตนเองในโหมดชัตเตอร์ที่ชัดเจน',
    ],
    tips: [
      'มองหานาฬิกาโบราณ ช่องแสงทรงกลม วงแหวนสะท้อนน้ำ หรือล้อจักรยาน',
      'จัดวางให้รูปทรงกลมมี contrast แตกต่างจากฉากหลัง',
    ],
    examplePhotos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA0p1CMhk2ZCP8SDqMEvZXqvLeXxu_RNWvVa3GaLllPv0RBfAmH4RLkp4tJjtJtsb3gBXEbSzzRgPisusYn2JpzhsO3iPmFgMtirMv9-3G0me2IrAoWY6bCSnhDE0xv_oRVcSjGiUOm1gkXyoGzePPjDfwCixZxOvD6rV73HJmSUY7YU7JNwodVcQ2Bw911vLyEtP8ETVy31iSkz94UDO-Bs54p4JQpwAGBqTE0E9GcBBhb25_T-cO7',
    ],
    startDate: '2026-09-01',
    deadline: '2026-09-30',
    status: 'active',
    participantsCount: 24,
    isNew: true,
    createdBy: 'edtech@rajinibon.ac.th',
  },
  {
    id: 'ch-color-hunt-blue',
    title: 'Color Hunt – Blue',
    description: 'ตามหาและบันทึกภาพที่มีแม่สีน้ำเงินหรือเฉดโคบอลต์/พาสเทลเป็นจุดเด่นหลักอย่างน้อย 40% ของเฟรมภาพ',
    category: 'Color Hunt',
    categoryKey: 'color',
    categoryLabel: 'ล่าเฉดสี',
    difficulty: 'Medium',
    points: 50,
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqS4ceHsD4MlaFuGeeFe7LFV4B1do5a2WE0RHLk_x0JhuFsRx85KCX2KdOE-t9-R9RQPtAmEgAdw4kX2-raTo3LiG_3anLG8nEsDUBvwTwh-5z9d7xCUs-CzXJE-fP7_SLsTfXDBUiCs5PAvghzMt3Gzco50gzD4adseXckiN5dmcKxmN-rJccuL7eLspEtbrMkymXzQLaTFljkIWbtpJeLMWX1TwQEBiRtO5YO6o-81ZieKlegGE',
    rules: [
      'วัตถุหรือพื้นหลังสีน้ำเงินต้องครอบคลุมอย่างน้อย 40% ของภาพ',
      'ใช้แสงธรรมชาติหรือแสงเงาเพื่อขับโทนสีให้มีมิติ',
      'ห้ามใช้ฟิลเตอร์ที่เปลี่ยนค่าแม่สีจริงจนผิดเพี้ยน',
    ],
    tips: [
      'ตู้ล็อกเกอร์สีฟ้า ท้องฟ้าแจ่มใส หรือโบว์ริบบิ้นนักเรียน',
      'ลองเปิดรูรับแสงกว้าง f/2.0 - f/2.8 เพื่อละลายฉากหลัง',
    ],
    examplePhotos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqS4ceHsD4MlaFuGeeFe7LFV4B1do5a2WE0RHLk_x0JhuFsRx85KCX2KdOE-t9-R9RQPtAmEgAdw4kX2-raTo3LiG_3anLG8nEsDUBvwTwh-5z9d7xCUs-CzXJE-fP7_SLsTfXDBUiCs5PAvghzMt3Gzco50gzD4adseXckiN5dmcKxmN-rJccuL7eLspEtbrMkymXzQLaTFljkIWbtpJeLMWX1TwQEBiRtO5YO6o-81ZieKlegGE',
    ],
    startDate: '2026-09-01',
    deadline: '2026-09-25',
    status: 'active',
    participantsCount: 38,
    isFeatured: true,
    createdBy: 'edtech@rajinibon.ac.th',
  },
  {
    id: 'ch-one-minute-portrait',
    title: 'One-Minute Portrait',
    description: 'ท้าทายความเร็วในการจัดองค์ประกอบและดึงอารมณ์ ถ่ายภาพพอร์ตเทรตเพื่อนสมาชิกหรือคุณครูภายใน 1 นาที',
    category: 'Portrait',
    categoryKey: 'portrait',
    categoryLabel: 'ภาพบุคคล',
    difficulty: 'Medium',
    points: 70,
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmHihlHKQrIc1OUgOzoMy1PtZz6R8IPe-exHc84gfjZWNjRErDrdCt0PYNQJPVLDqZnfy5vBVjMzITevYYYXsHyy0f1HoKlrp0vmWVKW_562fBBAN8VM8M8TCe-0bTUPTWQ8bjgt8QK-WTEgBc9T3o4hqxtFDKNkcJdD8w2z-zFMfXLomy7_mB6YDu1eousi5IoC7vJaJRQdXnnfHRTER0NZYEfHmx1_LX8ojb173R3wsYKsYZ3c3Z',
    rules: [
      'ถ่ายภาพบุคคลโดยเน้นแววตาและอารมณ์ที่เป็นธรรมชาติ',
      'สื่อสารและจัดท่าทางร่วมกับแบบภายใน 60 วินาที',
      'ขออนุญาตบุคคลในภาพก่อนกดส่งผลงาน',
    ],
    tips: [
      'มองหาทิศทางแสงเฉียง 45 องศา (Rembrandt Lighting) ข้างหน้าต่าง',
      'โฟกัสที่ดวงตาของแบบเสมอ',
    ],
    examplePhotos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmHihlHKQrIc1OUgOzoMy1PtZz6R8IPe-exHc84gfjZWNjRErDrdCt0PYNQJPVLDqZnfy5vBVjMzITevYYYXsHyy0f1HoKlrp0vmWVKW_562fBBAN8VM8M8TCe-0bTUPTWQ8bjgt8QK-WTEgBc9T3o4hqxtFDKNkcJdD8w2z-zFMfXLomy7_mB6YDu1eousi5IoC7vJaJRQdXnnfHRTER0NZYEfHmx1_LX8ojb173R3wsYKsYZ3c3Z',
    ],
    startDate: '2026-09-05',
    deadline: '2026-09-28',
    status: 'active',
    participantsCount: 19,
    createdBy: 'edtech@rajinibon.ac.th',
  },
  {
    id: 'ch-golden-hour',
    title: 'Golden Hour',
    description: 'บันทึกมนต์เสน่ห์ของแสงสีทองยามเย็นก่อนพระอาทิตย์ลับขอบฟ้า ถ่ายทอดความอบอุ่นและเงาพาดผ่าน',
    category: 'Creative',
    categoryKey: 'creative',
    categoryLabel: 'สร้างสรรค์',
    difficulty: 'Hard',
    points: 100,
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqS4ceHsD4MlaFuGeeFe7LFV4B1do5a2WE0RHLk_x0JhuFsRx85KCX2KdOE-t9-R9RQPtAmEgAdw4kX2-raTo3LiG_3anLG8nEsDUBvwTwh-5z9d7xCUs-CzXJE-fP7_SLsTfXDBUiCs5PAvghzMt3Gzco50gzD4adseXckiN5dmcKxmN-rJccuL7eLspEtbrMkymXzQLaTFljkIWbtpJeLMWX1TwQEBiRtO5YO6o-81ZieKlegGE',
    rules: [
      'ถ่ายทำในช่วง Golden Hour (ประมาณ 16:30 – 17:30 น.)',
      'ใช้แสงย้อน (Backlight) หรือ Rim Light เพื่อเน้นขอบเส้นของวัตถุ',
    ],
    tips: [
      'ปรับ White Balance เป็น Cloudy หรือ Shade เพื่อขับโทนอุ่น',
      'ลด Exposure ลงเล็กน้อยเพื่อรักษารายละเอียดในส่วนไฮไลต์ของแสงอาทิตย์',
    ],
    examplePhotos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKqS4ceHsD4MlaFuGeeFe7LFV4B1do5a2WE0RHLk_x0JhuFsRx85KCX2KdOE-t9-R9RQPtAmEgAdw4kX2-raTo3LiG_3anLG8nEsDUBvwTwh-5z9d7xCUs-CzXJE-fP7_SLsTfXDBUiCs5PAvghzMt3Gzco50gzD4adseXckiN5dmcKxmN-rJccuL7eLspEtbrMkymXzQLaTFljkIWbtpJeLMWX1TwQEBiRtO5YO6o-81ZieKlegGE',
    ],
    startDate: '2026-09-01',
    deadline: '2026-09-30',
    status: 'active',
    participantsCount: 42,
    createdBy: 'edtech@rajinibon.ac.th',
  },
];

/**
 * Seed initial challenges into Firestore if collection is empty
 */
export async function ensureInitialChallengesSeeded(): Promise<void> {
  try {
    const colRef = collection(db, 'challenges');
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      for (const item of SEED_CHALLENGES) {
        const itemDoc = doc(db, 'challenges', item.id);
        await setDoc(itemDoc, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.warn('Could not seed challenges (might be offline or permissions):', err);
  }
}

/**
 * Subscribe to real-time challenges list
 */
export function subscribeToChallenges(
  callback: (challenges: ChallengeDocument[]) => void
): () => void {
  ensureInitialChallengesSeeded();

  const colRef = collection(db, 'challenges');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(
          SEED_CHALLENGES.map((c) => ({
            ...c,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
        return;
      }
      const list: ChallengeDocument[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ChallengeDocument);
      });
      callback(list);
    },
    (err) => {
      console.warn('Error subscribing to challenges, using seed fallback:', err);
      callback(
        SEED_CHALLENGES.map((c) => ({
          ...c,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      );
    }
  );
}

/**
 * Start a challenge mission for a user
 * Prevents duplicate participant documents by using `${userId}_${challengeId}`
 */
export async function startChallengeMission(
  userId: string,
  challengeId: string
): Promise<ChallengeParticipant> {
  if (!userId || !challengeId) {
    throw new Error('Missing userId or challengeId');
  }

  const docId = `${userId}_${challengeId}`;
  const participantRef = doc(db, 'challengeParticipants', docId);

  // Atomic check and set
  const existing = await getDoc(participantRef);
  if (existing.exists()) {
    return existing.data() as ChallengeParticipant;
  }

  const newParticipant: ChallengeParticipant = {
    id: docId,
    userId,
    challengeId,
    status: 'started',
    startedAt: serverTimestamp(),
  };

  await setDoc(participantRef, newParticipant);

  // Safely increment challenge participantsCount
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      participantsCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Could not increment challenge participant count:', e);
  }

  return newParticipant;
}

/**
 * Subscribe to user's challenge participants
 */
export function subscribeToUserParticipants(
  userId: string,
  callback: (participants: Record<string, ChallengeParticipant>) => void
): () => void {
  if (!userId) {
    callback({});
    return () => {};
  }

  const colRef = collection(db, 'challengeParticipants');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snap) => {
      const map: Record<string, ChallengeParticipant> = {};
      snap.forEach((d) => {
        const item = d.data() as ChallengeParticipant;
        map[item.challengeId] = item;
      });
      callback(map);
    },
    (err) => {
      console.warn('Participant subscription error:', err);
    }
  );
}

/**
 * Upload photo to Firebase Storage
 * Path format: submissions/{userId}/{challengeId}/{submissionId}
 */
export async function uploadSubmissionPhoto(
  userId: string,
  challengeId: string,
  submissionId: string,
  imageData: string | Blob
): Promise<{ downloadURL: string; storagePath: string }> {
  const storagePath = `submissions/${userId}/${challengeId}/${submissionId}.jpg`;

  try {
    const fileRef = ref(storage, storagePath);

    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      await uploadString(fileRef, imageData, 'data_url');
    } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
      // Remote image or already hosted URL, return as-is
      return { downloadURL: imageData, storagePath };
    } else {
      await uploadBytes(fileRef, imageData as Blob);
    }

    const downloadURL = await getDownloadURL(fileRef);
    return { downloadURL, storagePath };
  } catch (err) {
    console.warn('Firebase Storage upload failed or restricted, using fallback storage:', err);
    // Safe graceful fallback: if image was a data URL, use it directly so user experience never breaks
    const fallbackURL = typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
    return { downloadURL: fallbackURL, storagePath };
  }
}

/**
 * Submit a photo for a challenge
 */
export async function submitChallengePhoto(params: {
  userId: string;
  studentName: string;
  studentGrade?: string;
  studentAvatar?: string | null;
  challengeId: string;
  challengeTitle: string;
  imageData: string | Blob;
  caption: string;
  visibility: 'club' | 'private';
  aspectRatio?: string;
  exif?: Record<string, any>;
}): Promise<SubmissionDocument> {
  const {
    userId,
    studentName,
    studentGrade = 'ม.5',
    studentAvatar = null,
    challengeId,
    challengeTitle,
    imageData,
    caption,
    visibility,
    aspectRatio = 'aspect-[4/5]',
    exif = {},
  } = params;

  if (!userId) {
    throw new Error('กรุณาเข้าสู่ระบบก่อนส่งผลงาน');
  }

  // 1. Verify challenge is active and read points from Firestore
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);
  let challengePoints = 50;

  if (challengeSnap.exists()) {
    const chData = challengeSnap.data();
    if (chData.status !== 'active') {
      throw new Error('ภารกิจนี้ปิดรับผลงานแล้ว');
    }
    if (chData.deadline && new Date(chData.deadline).getTime() < Date.now() - 86400000) {
      throw new Error('ภารกิจนี้หมดกำหนดเวลาแล้ว');
    }
    challengePoints = Number(chData.points) || 50;
  }

  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 2. Upload photo to Firebase Storage
  const { downloadURL, storagePath } = await uploadSubmissionPhoto(
    userId,
    challengeId,
    submissionId,
    imageData
  );

  // 3. Create submission document in 'submissions' collection
  const submissionDocRef = doc(db, 'submissions', submissionId);
  const submission: SubmissionDocument = {
    id: submissionId,
    userId,
    studentName,
    studentGrade,
    studentAvatar,
    challengeId,
    challengeTitle,
    imageURL: downloadURL,
    storagePath,
    caption,
    visibility,
    status: 'pending',
    submittedAt: serverTimestamp(),
    rewarded: false,
    points: challengePoints,
    aspectRatio,
    exif,
  };

  await setDoc(submissionDocRef, submission);

  // 4. Update participant status to 'submitted'
  const participantDocId = `${userId}_${challengeId}`;
  const participantRef = doc(db, 'challengeParticipants', participantDocId);
  await setDoc(
    participantRef,
    {
      id: participantDocId,
      userId,
      challengeId,
      status: 'submitted',
      submittedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return submission;
}

/**
 * Subscribe to Submissions
 * - If userId provided: returns submissions belonging to that user
 * - If userId is null: returns all submissions for Teacher/Admin review
 */
export function subscribeToSubmissions(
  userId: string | null,
  callback: (submissions: SubmissionDocument[]) => void
): () => void {
  const colRef = collection(db, 'submissions');
  const q = userId
    ? query(colRef, where('userId', '==', userId), orderBy('submittedAt', 'desc'))
    : query(colRef, orderBy('submittedAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const list: SubmissionDocument[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SubmissionDocument);
      });
      callback(list);
    },
    (err) => {
      console.warn('Submissions subscription error:', err);
      callback([]);
    }
  );
}

/**
 * Review Submission: Approve
 * - Strictly prevents duplicate XP by checking submission.rewarded
 * - Reads authoritative points from challenges collection
 * - Calls atomic addXP
 * - Increments users.photoCount and completedChallenges (if first approval)
 * - Publishes to Community Gallery if visibility == 'club'
 */
export async function approveSubmission(
  submissionId: string,
  reviewerUid: string,
  reviewerName: string = 'อาจารย์ที่ปรึกษา'
): Promise<{
  success: boolean;
  xpAwarded: number;
  message: string;
  unlockedBadges?: BadgeDocument[];
  newStreak?: number;
}> {
  const submissionRef = doc(db, 'submissions', submissionId);

  // 1. Fetch submission data
  const subSnap = await getDoc(submissionRef);
  if (!subSnap.exists()) {
    throw new Error('ไม่พบข้อมูลผลงานภาพถ่ายนี้');
  }

  const sub = subSnap.data() as SubmissionDocument;

  // Duplicate XP Protection Check
  if (sub.status === 'approved' || sub.rewarded) {
    return {
      success: false,
      xpAwarded: 0,
      message: 'ผลงานนี้ได้รับการอนุมัติและรับ XP เรียบร้อยแล้ว (ไม่สามารถรับ XP ซ้ำได้)',
    };
  }

  // 2. Read authoritative points from challenge document
  const challengeRef = doc(db, 'challenges', sub.challengeId);
  const challengeSnap = await getDoc(challengeRef);
  let pointsToAward = sub.points || 50;
  if (challengeSnap.exists()) {
    pointsToAward = Number(challengeSnap.data().points) || pointsToAward;
  }

  // 3. Mark submission as approved
  await updateDoc(submissionRef, {
    status: 'approved',
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerUid,
    reviewComment: 'ผลงานยอดเยี่ยม! องค์ประกอบและแสงเงาผ่านเกณฑ์การประเมิน',
    rewarded: true,
  });

  // 4. Update participant status
  const participantDocId = `${sub.userId}_${sub.challengeId}`;
  const participantRef = doc(db, 'challengeParticipants', participantDocId);
  await setDoc(
    participantRef,
    {
      status: 'approved',
      completedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 5. Award XP through atomic transaction
  await addXP(
    sub.userId,
    pointsToAward,
    `พิชิตภารกิจ: ${sub.challengeTitle}`,
    'challenge_submission'
  );

  // 6. Update user stats: photoCount, completedChallenges, streak & longestStreak
  let currentStreakResult = 1;
  try {
    const userDocRef = doc(db, 'users', sub.userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as FirestoreUser;

      // Check if user has already completed this challenge before
      const completedQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', sub.userId),
        where('challengeId', '==', sub.challengeId),
        where('status', '==', 'approved')
      );
      const completedSnap = await getDocs(completedQuery);
      const isFirstCompletion = completedSnap.size <= 1; // including current one

      // Compute streak update
      const streakInfo = computeStreakUpdate(
        userData.lastChallengeDate,
        userData.currentStreak || 0,
        userData.longestStreak || 0
      );
      currentStreakResult = streakInfo.newStreak;

      await updateDoc(userDocRef, {
        photoCount: increment(1),
        completedChallenges: isFirstCompletion ? increment(1) : increment(0),
        currentStreak: streakInfo.newStreak,
        longestStreak: streakInfo.newLongestStreak,
        lastChallengeDate: streakInfo.todayStr,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn('Could not update user stats & streak:', e);
  }

  // 7. Check and award any earned badges automatically
  let newlyEarnedBadges: BadgeDocument[] = [];
  try {
    newlyEarnedBadges = await checkAndAwardBadges(sub.userId);
  } catch (e) {
    console.warn('Could not check and award badges:', e);
  }

  // 8. If visibility is 'club', publish to photos collection (Community Gallery)
  if (sub.visibility === 'club') {
    try {
      const photoDocRef = doc(db, 'photos', `approved_${sub.id}`);
      await setDoc(photoDocRef, {
        id: `approved_${sub.id}`,
        title: sub.caption || sub.challengeTitle,
        imageUrl: sub.imageURL,
        authorName: sub.studentName,
        authorGrade: sub.studentGrade || 'ม.5',
        authorAvatar: sub.studentAvatar || undefined,
        authorInitial: (sub.studentName || 'S').charAt(0).toUpperCase(),
        authorId: sub.userId,
        avatarColorClass: 'bg-purple-100 text-purple-700',
        questTitle: sub.challengeTitle,
        isVerified: true,
        isUserUpload: true,
        likes: 1,
        commentsCount: 0,
        aspectRatio: sub.aspectRatio || 'aspect-[4/5]',
        uploadedAt: new Date().toISOString(),
        tags: ['#RBShutterClub', `#${sub.challengeTitle.replace(/\s+/g, '')}`],
        exif: sub.exif || {
          camera: 'Fujifilm X-T30 II',
          lens: 'XF 27mm f/2.8 R WR',
          focalLength: '27mm',
          aperture: 'f/2.8',
          shutterSpeed: '1/400s',
          iso: 'ISO 160',
        },
      });
    } catch (e) {
      console.warn('Could not mirror approved photo into gallery collection:', e);
    }
  }

  let badgeMsg = '';
  if (newlyEarnedBadges.length > 0) {
    badgeMsg = ` พร้อมปลดล็อก ${newlyEarnedBadges.map((b) => b.nameEn).join(', ')} 🏆`;
  }

  return {
    success: true,
    xpAwarded: pointsToAward,
    message: `อนุมัติผลงานเรียบร้อยแล้ว (+${pointsToAward} XP • สตรีค ${currentStreakResult} วัน)${badgeMsg}`,
    unlockedBadges: newlyEarnedBadges,
    newStreak: currentStreakResult,
  };
}

/**
 * Review Submission: Reject
 */
export async function rejectSubmission(
  submissionId: string,
  reviewerUid: string,
  reviewComment: string
): Promise<void> {
  const submissionRef = doc(db, 'submissions', submissionId);
  const subSnap = await getDoc(submissionRef);

  if (!subSnap.exists()) {
    throw new Error('ไม่พบข้อมูลผลงานนี้');
  }

  const sub = subSnap.data() as SubmissionDocument;

  await updateDoc(submissionRef, {
    status: 'rejected',
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerUid,
    reviewComment: reviewComment || 'ภาพยังไม่ตรงตามเกณฑ์โจทย์ สามารถถ่ายส่งใหม่ได้',
  });

  const participantDocId = `${sub.userId}_${sub.challengeId}`;
  const participantRef = doc(db, 'challengeParticipants', participantDocId);
  await setDoc(
    participantRef,
    {
      status: 'rejected',
    },
    { merge: true }
  );
}
