import { useCallback, useMemo, useState } from 'react';
import { useJadwal } from './hooks/useJadwal';
import { useAuth } from './hooks/useAuth';
import { PeopleTab } from './components/PeopleTab';
import { ScheduleTab } from './components/ScheduleTab';
import { PreviewTab } from './components/PreviewTab';
import { SavedTab } from './components/SavedTab';
import { LoginScreen } from './components/LoginScreen';
import { CrescentIcon, ToastHost } from './components/Icons';
import { buildShareText, copyToClipboard, downloadBlob, posterFileName, posterToBlob, shareImage } from './lib/share';

type TabName = 'people' | 'schedule' | 'saved' | 'preview';

const TABS: { id: TabName; label: string }[] = [
  { id: 'people', label: 'Petugas' },
  { id: 'schedule', label: 'Jadwal' },
  { id: 'saved', label: 'Tersimpan' },
  { id: 'preview', label: 'Preview & Cetak' },
];

export default function App() {
  const j = useJadwal();
  const session = useAuth();
  const [tab, setTab] = useState<TabName>('people');
  const { state } = j;

  const sortedRows = useMemo(() => j.sortedSchedule, [j.sortedSchedule]);

  const handleGenerate = useCallback(() => {
    if (state.schedule.length > 0) {
      if (!window.confirm('Jadwal lama akan diganti dengan yang baru. Lanjutkan?')) return;
    }
    if (j.generateSchedule()) setTab('schedule');
  }, [j, state.schedule.length]);

  const handleClear = useCallback(() => {
    if (state.schedule.length === 0) {
      j.toast('Jadwal sudah kosong.');
      return;
    }
    if (!window.confirm('Hapus seluruh jadwal?')) return;
    j.clearSchedule();
  }, [j, state.schedule.length]);

  const handlePrint = useCallback(() => {
    if (sortedRows.length === 0) {
      j.toast('Belum ada jadwal untuk dicetak.', 'error');
      return;
    }
    if (tab !== 'preview') {
      setTab('preview');
      window.setTimeout(() => window.print(), 160);
      return;
    }
    window.print();
  }, [j, sortedRows.length, tab]);

  const handleShare = useCallback(async () => {
    if (sortedRows.length === 0) {
      j.toast('Belum ada jadwal untuk dibagikan.', 'error');
      return;
    }
    const ok = await copyToClipboard(buildShareText(state.masjid, sortedRows));
    j.toast(ok ? 'Jadwal disalin. Tempel di WhatsApp/grup.' : 'Gagal menyalin otomatis.', ok ? 'ok' : 'error');
  }, [j, sortedRows, state.masjid]);

  const handleShareImage = useCallback(async () => {
    if (sortedRows.length === 0) {
      j.toast('Belum ada jadwal untuk dibagikan.', 'error');
      return;
    }
    if (tab !== 'preview') {
      j.toast('Buka tab Preview untuk membagikan gambar.', 'error');
      return;
    }

    const poster = document.querySelector<HTMLElement>('.poster');
    if (!poster) {
      j.toast('Poster tidak ditemukan. Coba muat ulang halaman.', 'error');
      return;
    }

    j.toast('Menyiapkan gambar…', 'info');
    try {
      const blob = await posterToBlob(poster);
      const filename = posterFileName(state.masjid);
      const text = `Jadwal Imam & Khatib Sholat Jum'at${state.masjid ? ` — ${state.masjid}` : ''}`;
      const result = await shareImage(blob, filename, text);

      if (result === 'shared') {
        j.toast('Gambar jadwal dibagikan.', 'ok');
      } else if (result === 'downloaded') {
        j.toast('Gambar diunduh. Kirim manual ke WhatsApp/grup.', 'ok');
      }
      // 'cancelled' → dibatalkan pengguna, tidak perlu notifikasi.
    } catch {
      // Fallback terakhir: unduh langsung bila render gagal.
      try {
        const blob = await posterToBlob(poster);
        downloadBlob(blob, posterFileName(state.masjid));
        j.toast('Gambar diunduh. Kirim manual ke WhatsApp/grup.', 'ok');
      } catch {
        j.toast('Gagal membuat gambar jadwal.', 'error');
      }
    }
  }, [j, sortedRows.length, state.masjid, tab]);

  const counts: Record<TabName, string> = {
    people: String(state.people.length),
    schedule: String(state.schedule.length),
    saved: '',
    preview: '',
  };

  if (!session.ready) {
    return <div className="boot">Memuat…</div>;
  }

  if (!session.user) {
    return <LoginScreen busy={session.busy} onGoogle={session.loginGoogle} onAnon={session.loginAnon} />;
  }

  const user = session.user;

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="account">
            <span className="who" title={user.email ?? 'Tamu'}>
              {user.email ?? 'Tamu (anonim)'}
            </span>
            <button className="link-btn" type="button" disabled={session.busy} onClick={() => void session.logout()}>
              Keluar
            </button>
          </div>
          <div className="brand">
            <span className="crest" aria-hidden="true"><CrescentIcon /></span>
            <h1>Jadwal Imam &amp; Khatib Sholat Jumat</h1>
          </div>
          <p className="tagline">Atur giliran secara otomatis, adil, dan siap cetak</p>
          <div className="masjid-field">
            <label htmlFor="masjid">Nama Masjid</label>
            <input
              id="masjid"
              type="text"
              value={state.masjid}
              placeholder="Misal: Masjid Al-Hidayah"
              maxLength={70}
              onChange={(e) => j.patch({ masjid: e.target.value })}
            />
          </div>
        </div>
      </header>

      <div className="shell">
        <nav className="tabs" role="tablist" aria-label="Navigasi">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {i + 1}
              {counts[t.id] && <span className="num">{counts[t.id]}</span>}
              <span className="lbl-text">{t.label}</span>
            </button>
          ))}
        </nav>

        <main>
          {tab === 'people' && (
            <PeopleTab
              people={state.people}
              scheduleCount={state.schedule.length}
              onAdd={j.addPerson}
              onAddMany={j.addManyPeople}
              onRemove={j.removePerson}
            />
          )}

          {tab === 'schedule' && (
            <ScheduleTab
              settings={state.settings}
              people={state.people}
              rows={sortedRows}
              nextRowId={j.nextRowId}
              onSettings={j.patchSettings}
              onGenerate={handleGenerate}
              onAddRow={j.addRow}
              onClear={handleClear}
              onUpdateRow={j.updateRow}
              onRemoveRow={j.removeRow}
            />
          )}

          {tab === 'saved' && (
            <SavedTab
              uid={user.uid}
              current={state}
              onLoad={j.replaceState}
              toast={j.toast}
            />
          )}

          {tab === 'preview' && (
            <PreviewTab
              masjid={state.masjid}
              rows={sortedRows}
              onMasjid={(value) => j.patch({ masjid: value })}
              onPrint={handlePrint}
              onShare={handleShare}
              onShareImage={handleShareImage}
            />
          )}
        </main>

        <footer className="foot">Data tersimpan otomatis di browser perangkat ini</footer>
      </div>

      <ToastHost toasts={j.toasts} />
    </>
  );
}
