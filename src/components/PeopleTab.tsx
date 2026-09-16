import { useState } from 'react';
import type { Person } from '../types';
import { PlusIcon } from './Icons';

type Props = {
  people: Person[];
  scheduleCount: number;
  onAdd: (name: string) => boolean;
  onAddMany: (raw: string) => void;
  onRemove: (id: string) => void;
};

export function PeopleTab({ people, scheduleCount, onAdd, onAddMany, onRemove }: Props) {
  const [name, setName] = useState('');
  const [bulk, setBulk] = useState('');

  const submit = () => {
    if (onAdd(name)) setName('');
  };

  const avg = people.length ? (scheduleCount / people.length).toFixed(1) : '0';

  return (
    <>
      <section className="card">
        <h2><span className="bar" />Daftar Petugas</h2>
        <p className="desc">Masukkan nama-nama yang akan digilir menjadi imam, khatib, dan muadzin.</p>

        <div className="input-row">
          <div className="field">
            <label htmlFor="namaInput">Nama Petugas</label>
            <input
              id="namaInput"
              type="text"
              value={name}
              placeholder="Misal: Ustadz Ahmad"
              maxLength={60}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </div>
          <button className="btn" type="button" onClick={submit}>
            <PlusIcon />
            Tambah
          </button>
        </div>

        <details className="disclosure">
          <summary>Tambah banyak sekaligus</summary>
          <div className="body">
            <div className="field">
              <label htmlFor="bulkInput">
                Tempel daftar nama <span className="hint">(pisahkan koma atau baris baru)</span>
              </label>
              <textarea
                id="bulkInput"
                value={bulk}
                placeholder={'Ustadz Ahmad, Ustadz Budi, Pak Slamet\nUstadz Rizki\nPak Joko'}
                onChange={(e) => setBulk(e.target.value)}
              />
            </div>
            <div className="actions">
              <button
                className="btn outline sm"
                type="button"
                onClick={() => {
                  onAddMany(bulk);
                  setBulk('');
                }}
              >
                Tambahkan Semua
              </button>
            </div>
          </div>
        </details>

        <div id="peopleBox">
          {people.length === 0 ? (
            <div className="empty">
              <strong>Belum ada petugas</strong>
              Tambahkan nama di atas untuk mulai menyusun jadwal.
            </div>
          ) : (
            <div className="chips">
              {people.map((p, i) => (
                <span className="chip" key={p.id}>
                  <span className="idx">{i + 1}</span>
                  {p.name}
                  <button type="button" onClick={() => onRemove(p.id)} title={`Hapus ${p.name}`} aria-label={`Hapus ${p.name}`}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <h2><span className="bar" />Ringkasan</h2>
        <div className="grid cols-3">
          <div className="field">
            <span className="lbl">Total Petugas</span>
            <strong className="stat-num">{people.length}</strong>
          </div>
          <div className="field">
            <span className="lbl">Total Jadwal Dibuat</span>
            <strong className="stat-num">{scheduleCount}</strong>
          </div>
          <div className="field">
            <span className="lbl">Rata-rata Giliran</span>
            <strong className="stat-num">{avg}</strong>
          </div>
        </div>
      </section>
    </>
  );
}
