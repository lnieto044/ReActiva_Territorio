import localforage from 'localforage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// Firestore document writes queue automatically while offline (see lib/firebase.ts),
// but Cloud Storage uploads do not. Photos attached to an offline report are held
// here in IndexedDB and flushed to Storage once the browser is back online.

export interface PendingUpload {
  id: string;
  caseId: string;
  fileName: string;
  contentType: string;
  blob: Blob;
  createdAt: number;
}

const store = localforage.createInstance({
  name: 'reactiva-territorio',
  storeName: 'pendingUploads',
});

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  for (const listener of listeners) listener();
}

export function subscribePendingUploads(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getPendingCount(): Promise<number> {
  return store.length();
}

export async function enqueuePhoto(caseId: string, file: File): Promise<void> {
  const id = crypto.randomUUID();
  const item: PendingUpload = {
    id,
    caseId,
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    blob: file,
    createdAt: Date.now(),
  };
  await store.setItem(id, item);
  notifyListeners();
}

let isFlushing = false;

export async function flushPendingUploads(): Promise<void> {
  if (isFlushing || typeof navigator !== 'undefined' && !navigator.onLine) return;
  isFlushing = true;
  try {
    const keys = await store.keys();
    for (const key of keys) {
      const item = await store.getItem<PendingUpload>(key);
      if (!item) continue;
      try {
        const storageRef = ref(storage, `cases/${item.caseId}/${item.id}-${item.fileName}`);
        await uploadBytes(storageRef, item.blob, { contentType: item.contentType });
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'cases', item.caseId), { fotos: arrayUnion(url) });
        await store.removeItem(key);
      } catch (err) {
        console.warn('Pending upload will be retried later', key, err);
      }
    }
  } finally {
    isFlushing = false;
    notifyListeners();
  }
}

export function initOfflineQueue(): void {
  window.addEventListener('online', () => void flushPendingUploads());
  void flushPendingUploads();
  // 'online' does not always fire reliably (e.g. some browsers/OS combos), so
  // also poll periodically as a fallback.
  setInterval(() => void flushPendingUploads(), 30_000);
}
