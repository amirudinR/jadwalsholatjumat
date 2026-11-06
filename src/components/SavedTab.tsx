import { useCallback, useEffect, useState } from 'react';
import type { AppState } from '../types';
import { deleteJadwal, listJadwals, saveJadwal, type SavedJadwal } from '../lib/cloud';
import { SparkIcon } from './Icons';

type Props = {
  uid: string;
  current: AppState;
  onLoad: (state: AppState) => void;
  toast: (text: string, kind?: 'ok' | 'error' | 'info') => void;
};

function formatWhen(ms: number): string {
  if (!ms) return 'baru saja';
  return new Date(ms).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function SavedTab({ uid, current, onLoad, toast }: Props) {
  const [items, setItems] = useState<SavedJadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setItems(await listJadwals(uid));
      setError('');
    } catch {
      setError('Gagal memuat daftar jadwal. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // eslint-disable-next-line react/set-state-in-effect -- memuat data dari Firestore (sistem eksternal) saat mount
  useEffect(() => { void refresh(); }, [refresh]);

  const handleSave = async () => {
    const fallback = current.masjid || 'Jadwal saya';
    const title = window.prompt('Nama untuk jadwal ini:', fallback);
    if (title === null) return;
    const clean = title.trim() || fallback;
    setSaving(true);
    try {
      await saveJadwal(uid, clean, current);
      toast('Jadwal disimpan ke akun.', 'ok');
      await refresh();
    } catch {
      toast('Gagal menyimpan jadwal.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (item: SavedJadwal) => {
    if (!window.confirm(`Muat "${item.title}"? Jadwal yang sedang dibuka akan diganti.`)) return;
    setBusyId(item.id);
    try {
      onLoad(item.data);
      toast(`"${item.title}" dimuat.`, 'ok');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: SavedJadwal) => {
    if (!window.confirm(`Hapus "${item.title}" dari akun?`)) return;
    setBusyId(item.id);
    try {
      await deleteJadwal(uid, item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      toast('Jadwal dihapus.', 'ok');
    } catch {
      toast('Gagal menghapus jadwal.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="card">
      <h2><span className="bar" />Jadwal Tersimpan</h2>
      <p className="desc">Simpan jadwal ke akun Anda, lalu pilih dan muat kembali kapan saja dari perangkat mana pun.</p>

      <div className="actions" style={{ marginTop: 0 }}>
        <button className="btn" type="button" disabled={saving} onClick={() => void handleSave()}>
          <SparkIcon />
          {saving ? 'Menyimpan…' : 'Simpan jadwal saat ini'}
        </button>
      </div>

      {loading && <p className="hint" style={{ marginTop: 16 }}>Memuat…</p>}
      {error && <p className="login-error" role="alert" style={{ marginTop: 16 }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="hint" style={{ marginTop: 16 }}>Belum ada jadwal tersimpan. Buat jadwal dulu lalu simpan di sini.</p>
      )}

      {items.length > 0 && (
        <div className="saved-list">
          {items.map((item) => (
            <div className="saved-item" key={item.id}>
              <div className="saved-info">
                <strong>{item.title}</strong>
                <span className="hint">
                  {item.data.masjid || 'Tanpa nama masjid'} · {item.data.schedule.length} jadwal · {formatWhen(item.updatedAt)}
                </span>
              </div>
              <div className="row-actions">
                <button
                  className="btn sm outline"
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void handleLoad(item)}
                >
                  Muat
                </button>
                <button
                  className="btn sm danger"
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void handleDelete(item)}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="hint" style={{ marginTop: 18 }}>Jadwal hanya terlihat oleh akun Anda.</p>
    </section>
  );
}
