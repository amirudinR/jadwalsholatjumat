import { buildRotation } from './rotation';
import { fridaysInRange, toISO } from './date';
import { uid } from './storage';
import type { ScheduleRow, Settings } from '../types';

/** Membangun seluruh baris jadwal dari daftar nama + pengaturan. */
export function buildScheduleRows(names: string[], settings: Settings): ScheduleRow[] {
  if (names.length === 0) return [];

  const dates = fridaysInRange(settings.start, settings.months, settings.startWeek ?? 1);
  if (dates.length === 0) return [];

  const total = dates.length;
  const { startIndex, mode, khatibSame, includeMuadzin } = settings;

  const imamBag = buildRotation(names, total, startIndex, mode);
  const khatibBag = khatibSame ? imamBag : buildRotation(names, total, startIndex + 1, mode);
  const muadzinBag = includeMuadzin ? buildRotation(names, total, startIndex + 2, mode) : [];

  return dates.map((d, i) => ({
    id: uid(),
    date: toISO(d),
    imam: imamBag[i] ?? '',
    khatib: khatibSame ? '' : (khatibBag[i] ?? ''),
    muadzin: includeMuadzin ? (muadzinBag[i] ?? '') : '',
    note: '',
  }));
}