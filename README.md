# Jadwal Imam & Khatib Sholat Jumat

Aplikasi web untuk menyusun **jadwal imam, khatib, dan muadzin sholat Jumat** secara otomatis, adil (giliran merata), dan siap cetak (A4) atau dibagikan ke WhatsApp.

Dibangun dengan **React 19 + TypeScript + Vite**.

## Fitur

- **Kelola petugas** — tambah satu per satu atau banyak sekaligus (paste daftar dipisah koma/baris baru).
- **Buat jadwal otomatis** — rotasi giliran merata untuk semua petugas, berdasarkan rentang bulan (1 / 2 / 3 / 6 / 12 bulan).
- **Pola pembagian** — *Urut* (rotasi teratur) atau *Acak* (tetap merata & deterministik).
- **Toggle Khatib** — khatib bisa disamakan dengan imam atau digilir terpisah.
- **Toggle Muadzin** — sertakan atau sembunyikan kolom muadzin.
- **Jadwal otomatis** — jadwal langsung dibuat & dirapikan ulang saat daftar petugas berubah.
- **Edit manual** — ubah tanggal/petugas per baris, dengan peringatan bila tanggal bukan hari Jumat.
- **Rekap giliran** — ringkasan jumlah giliran tiap petugas.
- **Preview & cetak** — tampilan poster A4 siap cetak/PDF, dengan zoom.
- **Salin ke WhatsApp** — salin jadwal sebagai teks siap tempel.
- **Nama masjid bisa diubah** dari header maupun langsung di tab Preview.
- **Data tersimpan otomatis** di browser (localStorage) — tanpa server.

## Menjalankan

```bash
pnpm install
pnpm dev      # jalankan dev server
pnpm build    # build produksi (tsc + vite build)
pnpm preview  # pratinjau hasil build
pnpm lint     # jalankan oxlint
```

## Struktur

```
src/
  App.tsx                 # Shell aplikasi + navigasi tab
  components/
    PeopleTab.tsx         # Tab 1: kelola petugas
    ScheduleTab.tsx       # Tab 2: buat & kelola jadwal
    PreviewTab.tsx        # Tab 3: preview & cetak A4
    Icons.tsx             # Ikon SVG + Toast
  hooks/
    useJadwal.ts          # State utama, persistensi, aksi jadwal
  lib/
    date.ts               # Helper tanggal (parse, format, Jumat dalam rentang)
    rotation.ts           # Algoritma rotasi giliran (urut/acak deterministik)
    schedule.ts           # Perakitan baris jadwal
    share.ts              # Teks share WhatsApp + clipboard
    storage.ts            # Baca/tulis localStorage + normalisasi data
  types.ts
```

## Lisensi

Bebas digunakan untuk keperluan masjid dan komunitas.
