import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AppState } from '../types';
import { normalizeState } from './storage';

/** Satu jadwal tersimpan di cloud. */
export type SavedJadwal = {
  id: string;
  title: string;
  data: AppState;
  updatedAt: number;
};

function collRef(uid: string) {
  return collection(db, 'users', uid, 'jadwals');
}

export async function saveJadwal(uid: string, title: string, data: AppState, id?: string): Promise<string> {
  const payload = { title: title.slice(0, 80), data, updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(doc(collRef(uid), id), payload);
    return id;
  }
  const ref = await addDoc(collRef(uid), payload);
  return ref.id;
}

export async function listJadwals(uid: string): Promise<SavedJadwal[]> {
  const snap = await getDocs(query(collRef(uid), orderBy('updatedAt', 'desc')));
  return snap.docs.map((d) => {
    const v = d.data() as { title?: string; data?: unknown; updatedAt?: { toMillis?: () => number } };
    return {
      id: d.id,
      title: String(v.title ?? 'Tanpa judul'),
      data: normalizeState(v.data),
      updatedAt: v.updatedAt?.toMillis?.() ?? 0,
    };
  });
}

export async function loadJadwal(uid: string, id: string): Promise<AppState | null> {
  const snap = await getDoc(doc(collRef(uid), id));
  if (!snap.exists()) return null;
  return normalizeState((snap.data() as { data?: unknown }).data);
}

export function deleteJadwal(uid: string, id: string): Promise<void> {
  return deleteDoc(doc(collRef(uid), id));
}
