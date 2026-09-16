import type { RotationMode } from '../types';

/**
 * PRNG deterministik (mulberry32). Dipakai agar urutan "acak" tetap sama
 * untuk seed yang sama — sehingga jadwal tidak berubah-ubah setiap kali
 * daftar petugas diedit (penting saat `autoSchedule` aktif).
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed stabil dari daftar nama + parameter, agar hasil acak dapat direproduksi. */
function seedFrom(names: string[], startIndex: number, total: number): number {
  let h = 0x811c9dc5 ^ (startIndex * 2654435761) ^ (total * 40503);
  for (const name of names) {
    for (let i = 0; i < name.length; i++) {
      h ^= name.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h = Math.imul(h ^ 0x9e3779b9, 0x85ebca6b);
  }
  return h >>> 0;
}

/**
 * Membangun urutan giliran sepanjang `total` slot.
 * - `sequence` : rotasi teratur sesuai urutan daftar.
 * - `random`   : dikocok per putaran (deterministik), tetap merata — tiap
 *                putaran memuat semua nama tepat satu kali.
 */
export function buildRotation(
  names: string[],
  total: number,
  startIndex: number,
  mode: RotationMode,
): string[] {
  const n = names.length;
  if (n === 0 || total <= 0) return [];

  if (mode !== 'random') {
    const out: string[] = [];
    for (let i = 0; i < total; i++) {
      out.push(names[((startIndex % n) + i) % n]);
    }
    return out;
  }

  const rand = mulberry32(seedFrom(names, startIndex, total));
  const offset = startIndex % n;

  // Bangun cukup putaran untuk menutupi offset + total slot.
  const rounds = Math.ceil((total + offset) / n);
  const bag: string[] = [];

  for (let r = 0; r < rounds; r++) {
    const deck = names.slice();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    bag.push(...deck);
  }

  return bag.slice(offset, offset + total);
}
