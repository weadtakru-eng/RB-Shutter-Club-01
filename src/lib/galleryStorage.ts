import { doc, setDoc, getDocs, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { PhotoItem } from '../types';

const LOCAL_STORAGE_KEY = 'rb_shutter_gallery_saved_photos';

/**
 * Compress and resize an image DataURL to max 1280px and JPEG quality 0.82
 * for fast saving into LocalStorage and Firestore.
 */
export async function compressImage(fileOrDataUrl: File | string, maxDimension = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const process = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onload = process;
    img.onerror = () => {
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        reject(new Error('Failed to load image for compression'));
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Triggers downloading/saving an image to the user's device (phone or computer)
 */
export async function downloadImage(imageUrl: string, rawFilename = 'rb-shutter-photo'): Promise<boolean> {
  const cleanName = rawFilename.replace(/[^a-zA-Z0-9_\-\u0E00-\u0E7F]/g, '_').slice(0, 40) || 'rb-photo';
  const safeFilename = cleanName.toLowerCase().endsWith('.jpg') || cleanName.toLowerCase().endsWith('.png')
    ? cleanName
    : `${cleanName}.jpg`;

  try {
    if (imageUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      return true;
    } catch {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.target = '_blank';
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }
  } catch (err) {
    console.warn('Fallback download triggered:', err);
    window.open(imageUrl, '_blank');
    return false;
  }
}

/**
 * Get all stored photos from localStorage
 */
export function getLocalSavedPhotos(): PhotoItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading photos from localStorage:', err);
    return [];
  }
}

/**
 * Save photos to localStorage
 */
export function saveLocalPhotos(photos: PhotoItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
  } catch (err) {
    console.warn('Error saving photos to localStorage (quota exceeded or restricted):', err);
  }
}

/**
 * Save a newly uploaded photo to both LocalStorage and Firestore
 */
export async function persistPhotoToGallery(photo: PhotoItem, authorIdOverride?: string): Promise<void> {
  // 1. Save to LocalStorage immediately
  const existing = getLocalSavedPhotos();
  const updatedList = [photo, ...existing.filter((p) => p.id !== photo.id)];
  saveLocalPhotos(updatedList);

  // 2. If online and Firebase user is available, save to Firestore
  try {
    const user = auth.currentUser;
    const authorId = authorIdOverride || (user ? user.uid : 'guest-student');
    
    // Firestore document data
    const firestoreData = {
      id: photo.id,
      authorId: photo.authorId || authorId,
      authorName: photo.authorName,
      authorGrade: photo.authorGrade,
      title: photo.title,
      imageUrl: photo.imageUrl,
      questTitle: photo.questTitle,
      questCategory: photo.questCategory || 'general',
      likes: photo.likes || 1,
      aspectRatio: photo.aspectRatio,
      visualStory: photo.visualStory || '',
      exif: photo.exif,
      tags: photo.tags || ['#RBShutterClub'],
      createdAt: photo.uploadedAt || new Date().toISOString(),
      isUserUpload: true,
    };

    const photoDocRef = doc(db, 'photos', photo.id);
    await setDoc(photoDocRef, firestoreData, { merge: true });
  } catch (firestoreErr: any) {
    // If permission or offline error, log notice but don't fail because local storage has it
    console.warn('[Gallery Storage] Saved locally. Firestore sync note:', firestoreErr?.message || firestoreErr);
  }
}

/**
 * Real-time listener for Firestore photos, fallback to local storage
 */
export function subscribeToGalleryPhotos(
  initialPhotos: PhotoItem[],
  onPhotosUpdate: (photos: PhotoItem[]) => void
): () => void {
  // First load local saved photos and merge with initial mock photos
  const localSaved = getLocalSavedPhotos();
  if (localSaved.length > 0) {
    const localIds = new Set(localSaved.map((p) => p.id));
    const merged = [...localSaved, ...initialPhotos.filter((p) => !localIds.has(p.id))];
    onPhotosUpdate(merged);
  }

  try {
    const photosCol = collection(db, 'photos');
    const q = query(photosCol, limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestorePhotos: PhotoItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestorePhotos.push({
            id: docSnap.id,
            title: data.title || 'Untitled Photo',
            imageUrl: data.imageUrl,
            authorName: data.authorName || 'สมาชิกชมรม',
            authorGrade: data.authorGrade || 'ม.ปลาย',
            authorInitial: (data.authorName || 'P').charAt(0).toUpperCase(),
            avatarColorClass: 'bg-primary-fixed text-primary',
            questTitle: data.questTitle || 'แกลเลอรีผลงานทั่วไป',
            questCategory: data.questCategory || 'creative',
            likes: data.likes || 1,
            commentsCount: 0,
            aspectRatio: (data.aspectRatio as any) || 'aspect-[4/5]',
            isLiked: false,
            isBookmarked: false,
            isUserUpload: true,
            uploadedAt: data.createdAt,
            exif: data.exif || {
              camera: 'Fujifilm X-T30 II',
              lens: 'XF 27mm f/2.8 R WR',
              focalLength: '27mm',
              aperture: 'f/2.8',
              shutterSpeed: '1/400s',
              iso: 'ISO 160',
            },
            visualStory: data.visualStory,
            tags: data.tags || ['#RBShutterClub'],
          });
        });

        // Merge: Firestore + Local + Initial Photos without duplicates
        const currentLocal = getLocalSavedPhotos();
        const combinedSaved = [...firestorePhotos];
        const seenIds = new Set(combinedSaved.map((p) => p.id));

        for (const loc of currentLocal) {
          if (!seenIds.has(loc.id)) {
            combinedSaved.push(loc);
            seenIds.add(loc.id);
          }
        }

        const fullList = [...combinedSaved, ...initialPhotos.filter((p) => !seenIds.has(p.id))];
        onPhotosUpdate(fullList);
      },
      (error) => {
        console.warn('[Gallery Storage] Firestore real-time listener notice:', error?.message || error);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('[Gallery Storage] Fallback to local storage mode');
    return () => {};
  }
}
