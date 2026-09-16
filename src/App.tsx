import { useCallback, useMemo, useState } from 'react';
import { useJadwal } from './hooks/useJadwal';
import { PeopleTab } from './components/PeopleTab';
import { ScheduleTab } from './components/ScheduleTab';
import { PreviewTab } from './components/PreviewTab';
import { CrescentIcon, ToastHost } from './components/Icons';
import { buildShareText, copyToClipboard } from './lib/share';

type TabName = 'people' | 'schedule' | 'preview';

const TABS: { id: TabName; label: string }[] = [
  { id: 'people', label: 'Petugas' },
  { id: 'schedule', label: 'Jadwal' },
  { id: 'preview', label: 'Preview & Cetak' },
];

export default function App() {
  const j = useJadwal();
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

  const counts: Record<TabName, string> = {
    people: String(state.people.length),
    schedule: String(state.schedule.length),
    preview: '',
  };

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
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

          {tab === 'preview' && (
            <PreviewTab
              masjid={state.masjid}
              rows={sortedRows}
              onMasjid={(value) => j.patch({ masjid: value })}
              onPrint={handlePrint}
              onShare={handleShare}
            />
          )}
        </main>

        <footer className="foot">Data tersimpan otomatis di browser perangkat ini</footer>
      </div>

      <ToastHost toasts={j.toasts} />
    </>
  );
}
