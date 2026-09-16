export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
export const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Parses YYYY-MM-DD into a local Date, rejecting roll-over values (e.g. 2026-02-31). */
export function parseISO(value: string): Date | null {
  if (!value) return null;
  const parts = String(value).split('-');
  if (parts.length !== 3) return null;

  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;

  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) return null;
  return date;
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toMonthValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** "Jumat, 18 September 2026" */
export function formatLong(value: string): string {
  const d = parseISO(value);
  if (!d) return value || '-';
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** "18/09/2026" */
export function formatShort(value: string): string {
  const d = parseISO(value);
  if (!d) return value || '-';
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "September 2026" dari "2026-09" */
export function monthLabel(ym: string): string {
  const parts = String(ym).split('-');
  if (parts.length !== 2) return ym || '-';
  const month = Number(parts[1]);
  return `${BULAN[month - 1] ?? ''} ${parts[0]}`.trim();
}

/** Jumat berikutnya setelah (atau pada) tanggal acuan. */
export function nextFriday(from: Date = new Date()): Date {
  const d = new Date(from.getTime());
  d.setHours(0, 0, 0, 0);
  const diff = (5 - d.getDay() + 7) % 7; // 5 = Jumat
  d.setDate(d.getDate() + diff);
  return d;
}

/** Semua hari Jumat di rentang bulan, mulai dari `ym` sebanyak `monthCount` bulan. */
export function fridaysInRange(ym: string, monthCount: number): Date[] {
  const parts = String(ym).split('-');
  if (parts.length !== 2) return [];

  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!y || !m) return [];

  const end = new Date(y, m - 1 + monthCount, 0); // hari terakhir bulan ke-N
  const cursor = new Date(y, m - 1, 1);
  while (cursor.getDay() !== 5) cursor.setDate(cursor.getDate() + 1);

  const out: Date[] = [];
  while (cursor.getTime() <= end.getTime()) {
    out.push(new Date(cursor.getTime()));
    cursor.setDate(cursor.getDate() + 7);
  }
  return out;
}
