import type { Person, ScheduleRow, Settings } from '../types';
import { BULAN, formatLong, formatShort, fridaysInMonth, parseISO } from '../lib/date';
import { SparkIcon } from './Icons';

type Props = {
  settings: Settings;
  people: Person[];
  rows: ScheduleRow[];
  nextRowId: string | null;
  onSettings: (patch: Partial<Settings>) => void;
  onGenerate: () => void;
  onAddRow: () => void;
  onClear: () => void;
  onUpdateRow: (id: string, patch: Partial<ScheduleRow>) => void;
  onRemoveRow: (id: string) => void;
};

// Pilihan jumlah bulan: 1..11 + pintasan "Setahun penuh" (12).
const MONTH_OPTIONS = [
  ...Array.from({ length: 11 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} bulan`,
  })),
];

// Rentang tahun yang bisa dipilih (±3 tahun dari sekarang).
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 2 + i);

export function ScheduleTab({
  settings, people, rows, nextRowId,
  onSettings, onGenerate, onAddRow, onClear, onUpdateRow, onRemoveRow,
}: Props) {
  const names = people.map((p) => p.name);
  const showMuadzin = rows.some((r) => r.muadzin);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  // Daftar Jumat dalam bulan mulai, untuk menampilkan label "Minggu ke-N".
  const monthFridays = fridaysInMonth(settings.start);
  const weekOptions = Array.from({ length: 5 }, (_, i) => {
    const d = monthFridays[i];
    return {
      value: i + 1,
      label: d
        ? `Minggu ke-${i + 1} · Jumat, ${d.getDate()}/${d.getMonth() + 1}`
        : `Minggu ke-${i + 1} · tidak ada Jumat`,
      disabled: !d,
    };
  });

  // Pecah settings.start (YYYY-MM) menjadi tahun & bulan terpisah.
  const [startYearStr = '', startMonthStr = ''] = String(settings.start).split('-');
  const startYear = Number(startYearStr) || CURRENT_YEAR;
  const startMonthNum = Math.min(12, Math.max(1, Number(startMonthStr) || 1));

  // Setel bulan mulai dari pasangan tahun + bulan.
  const setStart = (year: number, month: number) =>
    onSettings({ start: `${year}-${String(month).padStart(2, '0')}` });

  const confirmNonFriday = (date: string) => {
    const d = parseISO(date);
    if (!d) return true;
    if (d.getDay() === 5) return true;
    return window.confirm(`Tanggal ini hari ${['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][d.getDay()]}, bukan Jumat. Tetap simpan?`);
  };

  return (
    <>
      <section className="card">
        <h2><span className="bar" />Buat Jadwal Otomatis</h2>
        <p className="desc">Sistem membagikan giliran secara merata sesuai jumlah petugas yang tersedia.</p>

        <div className="grid cols-3">
          <div className="field">
            <label htmlFor="startMonth">Bulan Mulai</label>
            <select
              id="startMonth"
              value={startMonthNum}
              onChange={(e) => setStart(startYear, Number(e.target.value))}
            >
              {BULAN.map((name, i) => (
                <option key={name} value={i + 1}>{i + 1}. {name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="startYear">Tahun Mulai</label>
            <select
              id="startYear"
              value={startYear}
              onChange={(e) => setStart(Number(e.target.value), startMonthNum)}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="startWeek">Minggu Mulai</label>
            <select
              id="startWeek"
              value={settings.startWeek}
              onChange={(e) => onSettings({ startWeek: Number(e.target.value) })}
            >
              {weekOptions.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="months">Jumlah Bulan</label>
            <select
              id="months"
              value={settings.months}
              onChange={(e) => onSettings({ months: Number(e.target.value) })}
            >
              {MONTH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
              <option value={12}>Setahun penuh (12 bulan)</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="startIndex">Mulai dari Petugas ke-</label>
            <select
              id="startIndex"
              value={settings.startIndex}
              onChange={(e) => onSettings({ startIndex: Number(e.target.value) })}
            >
              {people.length === 0 && <option value={0}>1 (pertama)</option>}
              {people.map((p, i) => (
                <option key={p.id} value={i}>
                  {i + 1}{i === 0 ? ' (pertama)' : ` — ${p.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="mode">Pola Pembagian</label>
            <select id="mode" value={settings.mode} onChange={(e) => onSettings({ mode: e.target.value as Settings['mode'] })}>
              <option value="sequence">Urut (rotasi teratur)</option>
              <option value="random">Acak (tetap merata)</option>
            </select>
          </div>
        </div>

        <div className="grid cols-2" style={{ marginTop: 14 }}>
          <label className="switch-row">
            <span className="switch-text">
              <span className="lbl">Khatib sama dengan Imam</span>
              <span className="state">{settings.khatibSame ? 'Aktif — khatib mengikuti imam' : 'Nonaktif — khatib digilir terpisah'}</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-checked={settings.khatibSame}
              checked={settings.khatibSame}
              onChange={(e) => onSettings({ khatibSame: e.target.checked })}
            />
            <span className="switch" aria-hidden="true" />
          </label>

          <label className="switch-row">
            <span className="switch-text">
              <span className="lbl">Sertakan Muadzin</span>
              <span className="state">{settings.includeMuadzin ? 'Aktif — muadzin ikut dibagikan' : 'Nonaktif — muadzin tidak ditampilkan'}</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-checked={settings.includeMuadzin}
              checked={settings.includeMuadzin}
              onChange={(e) => onSettings({ includeMuadzin: e.target.checked })}
            />
            <span className="switch" aria-hidden="true" />
          </label>
        </div>

        <label className="auto-toggle">
          <input
            type="checkbox"
            checked={settings.autoSchedule}
            onChange={(e) => onSettings({ autoSchedule: e.target.checked })}
          />
          <span>
            Jadwal otomatis <span className="hint">(jadwal langsung dibuat &amp; dirapikan ulang saat daftar petugas berubah)</span>
          </span>
        </label>

        <div className="actions">
          <button className="btn gold" type="button" onClick={onGenerate}>
            <SparkIcon />
            Buat Jadwal
          </button>
          <button className="btn outline" type="button" onClick={onAddRow}>
            Tambah Baris Manual
          </button>
          <div className="spacer" />
          <button className="btn danger" type="button" onClick={onClear}>
            Kosongkan Jadwal
          </button>
        </div>
      </section>

      <section className="card">
        <h2><span className="bar" />Daftar Jadwal</h2>
        <p className="desc">Ubah petugas langsung lewat menu pilihan pada tiap baris.</p>

        {rows.length === 0 ? (
          <div className="empty">
            <strong>Belum ada jadwal</strong>
            Atur rentang bulan lalu klik <em>Buat Jadwal</em> di atas.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="sched">
              <thead>
                <tr>
                  <th style={{ width: 38 }}>#</th>
                  <th>Tanggal</th>
                  <th>Imam</th>
                  <th>Khatib</th>
                  {showMuadzin && <th>Muadzin</th>}
                  <th>Keterangan</th>
                  <th aria-label="Aksi" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const d = parseISO(r.date);
                  const isPast = d ? d.getTime() < todayMs : false;
                  const cls = r.id === nextRowId ? 'next' : (isPast ? 'past' : '');
                  return (
                    <tr key={r.id} className={cls}>
                      <td className="num">{i + 1}</td>
                      <td className="date-cell">
                        <span className="d">{formatLong(r.date)}</span>
                        {r.id === nextRowId && <span className="badge">Berikutnya</span>}
                        <span className="m">{formatShort(r.date)}</span>
                      </td>
                      <td>
                        <select
                          className="cell-select"
                          name={`imam-${r.id}`}
                          value={r.imam}
                          onChange={(e) => onUpdateRow(r.id, { imam: e.target.value })}
                        >
                          <option value="">— pilih —</option>
                          {names.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </td>
                      <td>
                        <select
                          className="cell-select"
                          name={`khatib-${r.id}`}
                          value={r.khatib}
                          onChange={(e) => onUpdateRow(r.id, { khatib: e.target.value })}
                        >
                          <option value="">sama dgn imam</option>
                          {names.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </td>
                      {showMuadzin && (
                        <td>
                          <select
                            className="cell-select"
                            name={`muadzin-${r.id}`}
                            value={r.muadzin}
                            onChange={(e) => onUpdateRow(r.id, { muadzin: e.target.value })}
                          >
                            <option value="">— pilih —</option>
                            {names.map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </td>
                      )}
                      <td>
                        <input
                          className="cell-input"
                          type="text"
                          name={`note-${r.id}`}
                          value={r.note}
                          maxLength={120}
                          placeholder="Keterangan"
                          onChange={(e) => onUpdateRow(r.id, { note: e.target.value })}
                        />
                      </td>
                      <td>
                        <div className="row-actions">
                          <input
                            className="cell-input date-input"
                            type="date"
                            name={`date-${r.id}`}
                            value={r.date}
                            onChange={(e) => {
                              if (confirmNonFriday(e.target.value)) {
                                onUpdateRow(r.id, { date: e.target.value });
                              }
                            }}
                            title="Ubah tanggal"
                            aria-label="Ubah tanggal"
                          />
                          <button className="btn danger sm" type="button" onClick={() => onRemoveRow(r.id)}>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {rows.length > 0 && <RekapCard rows={rows} />}
    </>
  );
}

function RekapCard({ rows }: { rows: ScheduleRow[] }) {
  const count: Record<string, number> = {};
  for (const r of rows) {
    for (const key of [r.imam, r.khatib, r.muadzin]) {
      const v = (key || '').trim();
      if (v) count[v] = (count[v] ?? 0) + 1;
    }
  }
  const entries = Object.entries(count).sort((a, b) => b[1] - a[1]);

  return (
    <section className="card">
      <h2><span className="bar" />Rekap Giliran</h2>
      <p className="desc">Jumlah kemunculan tiap petugas pada jadwal yang sedang aktif.</p>
      <div className="rekap">
        {entries.map(([name, n]) => (
          <span className="r" key={name}>
            <b>{name}</b>
            <span className="cnt">{n}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
