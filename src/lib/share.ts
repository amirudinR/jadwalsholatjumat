import { formatShort } from './date';
import type { ScheduleRow } from '../types';

/** Teks ringkas siap tempel ke WhatsApp / grup. */
export function buildShareText(masjid: string, rows: ScheduleRow[]): string {
  if (rows.length === 0) return '';

  const lines: string[] = [];
  lines.push("*JADWAL IMAM & KHATIB SHOLAT JUM'AT*");
  lines.push(masjid || 'Masjid');
  lines.push(`(${formatShort(rows[0].date)} s/d ${formatShort(rows[rows.length - 1].date)})`);
  lines.push('');

  rows.forEach((r, i) => {
    lines.push(`${i + 1}. ${formatShort(r.date)}`);
    lines.push(`   Imam   : ${r.imam || '-'}`);
    lines.push(`   Khatib : ${r.khatib || r.imam || '-'}`);
    if (r.muadzin) lines.push(`   Muadzin: ${r.muadzin}`);
    if (r.note) lines.push(`   Ket.   : ${r.note}`);
    lines.push('');
  });

  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // lanjut ke fallback
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
