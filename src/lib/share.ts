import { toPng } from 'html-to-image';
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

/** Nama file yang aman untuk diunduh. */
export function posterFileName(masjid: string): string {
  const base = (masjid || 'jadwal-jumat').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'jadwal-jumat';
  return `${base}-${formatShort(new Date().toISOString().slice(0, 10)).replace(/\//g, '')}.png`;
}

/**
 * Merender elemen poster (A4) menjadi gambar PNG (blob).
 * offsetWidth/offsetHeight menghasilkan ukuran layout intrinsik (tidak terpengaruh
 * transform: scale pada parent), sehingga hasil render sesuai ukuran asli A4.
 */
export async function posterToBlob(element: HTMLElement): Promise<Blob> {
  const width = Math.round(element.offsetWidth) || undefined;
  const height = Math.round(element.offsetHeight) || undefined;

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#ffffff',
    width,
    height,
    // Pastikan tidak ada sisa transform/efek yang menggeser hasil render.
    style: { transform: 'none', margin: '0', boxShadow: 'none' },
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Memicu unduhan file gambar di perangkat pengguna. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

/**
 * Membagikan gambar via Web Share API (bisa pilih WhatsApp, Telegram, dll).
 * Bila perangkat tidak mendukung berbagi gambar, otomatis mengunduh file.
 */
export async function shareImage(blob: Blob, filename: string, text: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: 'image/png' });

  if (
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: 'Jadwal Sholat Jumat', text });
      return 'shared';
    } catch (err) {
      // Pengguna membatalkan dialog share → jangan fallback ke unduhan.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // Gagal karena alasan lain → fallback unduhan.
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}
