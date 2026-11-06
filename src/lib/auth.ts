import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export type { User };

export function watchUser(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

export function loginGoogle(): Promise<User> {
  return signInWithPopup(auth, googleProvider).then((cred) => cred.user);
}

export function loginAnon(): Promise<User> {
  return signInAnonymously(auth).then((cred) => cred.user);
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Jendela login ditutup sebelum selesai.';
    case 'auth/popup-blocked':
      return 'Popup diblokir browser. Izinkan popup lalu coba lagi.';
    case 'auth/unauthorized-domain':
      return 'Domain ini belum diizinkan di Firebase Auth.';
    case 'auth/operation-not-allowed':
      return 'Metode login ini belum diaktifkan di Firebase Console.';
    case 'auth/network-request-failed':
      return 'Koneksi gagal. Periksa internet lalu coba lagi.';
    default:
      return 'Gagal login. Silakan coba lagi.';
  }
}
