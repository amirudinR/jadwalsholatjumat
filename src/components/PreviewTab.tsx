import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ScheduleRow } from '../types';
import { BULAN, HARI, formatShort, parseISO } from '../lib/date';
import { CrescentIcon, PrintIcon, ShareIcon } from './Icons';

type Props = {
  masjid: string;
  rows: ScheduleRow[];
  onMasjid: (value: string) => void;
  onPrint: () => void;
  onShare: () => void;
};

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.5;

export function PreviewTab({ masjid, rows, onMasjid, onPrint, onShare }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [userZoom, setUserZoom] = useState(1);

  // Hitung skala agar kertas A4 (210mm) muat di layar desktop & mobile.
  useLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const paper = paperRef.current;
      if (!wrap || !paper) return;
      const style = getComputedStyle(wrap);
      const inner =
        wrap.clientWidth - parseFloat(style.paddingLeft || '0') - parseFloat(style.paddingRight || '0');
      const paperW = paper.offsetWidth || 794;
      if (inner > 0 && paperW > 0) {
        setFit(Math.min(1, inner / paperW));
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [rows.length]);

  // Compensation height so scaled paper doesn't leave a blank gap.
  const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fit * userZoom));
  const [paperH, setPaperH] = useState(1123);
  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    // offsetHeight sudah terpengaruh transform scale; bagi dengan scale
    // agar didapat tinggi intrinsik kertas (unscaled).
    const intrinsic = paper.offsetHeight / (scale || 1);
    setPaperH(intrinsic || 1123);
  }, [rows.length, scale]);

  const zoomIn = () => setUserZoom((z) => Math.min(MAX_ZOOM / Math.max(fit, 0.01), z + 0.15));
  const zoomOut = () => setUserZoom((z) => Math.max(0.2, z - 0.15));
  const reset = () => setUserZoom(1);

  return (
    <>
      <div className="preview-bar no-print">
        <span className="lbl">Tampilan siap cetak (A4)</span>
        <span className="zoom-info">{Math.round(scale * 100)}%</span>
        <div className="spacer" />
        <div className="preview-masjid">
          <label htmlFor="previewMasjid">Nama Masjid</label>
          <input
            id="previewMasjid"
            type="text"
            value={masjid}
            placeholder="Misal: Masjid Al-Hidayah"
            maxLength={70}
            onChange={(e) => onMasjid(e.target.value)}
          />
        </div>
        <button className="btn outline sm" type="button" onClick={zoomOut} title="Perkecil">−</button>
        <button className="btn ghost sm" type="button" onClick={reset} title="Reset">Reset</button>
        <button className="btn outline sm" type="button" onClick={zoomIn} title="Perbesar">+</button>
        <button className="btn outline" type="button" onClick={onShare}>
          <ShareIcon />
          Salin WA
        </button>
        <button className="btn" type="button" onClick={onPrint}>
          <PrintIcon />
          Cetak / PDF
        </button>
      </div>

      <div className="paper-wrap" ref={wrapRef}>
        <div
          className="paper"
          ref={paperRef}
          style={{
            transform: `scale(${scale})`,
            marginBottom: `${(scale - 1) * paperH}px`,
          }}
        >
          <PosterSheet masjid={masjid} rows={rows} />
        </div>
      </div>
    </>
  );
}

/** Satu lembar A4 — dipakai di preview dan dicetak/di-export. */
export function PosterSheet({ masjid, rows }: { masjid: string; rows: ScheduleRow[] }) {
  const showMuadzin = rows.some((r) => r.muadzin);
  const first = rows.length ? parseISO(rows[0].date) : null;
  const last = rows.length ? parseISO(rows[rows.length - 1].date) : null;

  const periode = first && last
    ? `Periode: ${BULAN[first.getMonth()]} ${first.getFullYear()} – ${BULAN[last.getMonth()]} ${last.getFullYear()}  •  ${rows.length} kali Jum'at`
    : 'Belum ada jadwal';

  return (
    <div className="poster">
      <div className="poster-head">
        <div className="crest-sm"><CrescentIcon /></div>
        <div className="masjid">{masjid || 'NAMA MASJID'}</div>
        <div className="title">JADWAL IMAM &amp; KHATIB SHOLAT JUM'AT</div>
        <div className="periode">{periode}</div>
      </div>

      <div className="ornament"><span /><i /><span /></div>

      {rows.length === 0 ? (
        <p className="poster-empty">Buat jadwal terlebih dahulu pada tab <strong>Jadwal</strong>.</p>
      ) : (
        <table className="poster-tbl">
          <thead>
            <tr>
              <th style={{ width: '6%' }}>No</th>
              <th style={{ width: '20%' }}>Hari / Tanggal</th>
              <th style={{ width: showMuadzin ? '24%' : '28%' }}>Imam</th>
              <th style={{ width: showMuadzin ? '24%' : '28%' }}>Khatib</th>
              {showMuadzin && <th style={{ width: '18%' }}>Muadzin</th>}
              <th>Ket.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const d = parseISO(r.date);
              return (
                <tr key={r.id}>
                  <td className="c">{i + 1}</td>
                  <td className="date">{d ? `${HARI[d.getDay()]}, ` : ''}{formatShort(r.date)}</td>
                  <td className="nm">{r.imam || '-'}</td>
                  <td>
                    {r.khatib
                      ? <span className="nm">{r.khatib}</span>
                      : <span className="sub">sama dgn imam</span>}
                  </td>
                  {showMuadzin && <td>{r.muadzin || '-'}</td>}
                  <td>{r.note || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="poster-foot">
        <div className="note">
          <strong>Catatan:</strong> Mohon hadir 15 menit sebelum waktu dzuhur. Jika berhalangan,
          silakan menukar giliran dengan petugas lain dan menginformasikan kepada takmir.
        </div>
        <div className="ttd">
          <div className="space" />
          <div className="line">Ketua Takmir</div>
        </div>
      </div>
    </div>
  );
}
