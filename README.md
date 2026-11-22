# KanbanFlow

Aplikasi papan Kanban berbasis React + Vite. Data tersimpan otomatis di LocalStorage.

## Menjalankan

Membutuhkan Node.js 20.19+ (atau 22.12+).

```bash
npm install
npm run dev       # mode pengembangan  -> http://localhost:5173
npm run build     # build produksi ke folder dist/
npm run preview   # pratinjau hasil build
npm test          # tes logika (reducer, storage, filter, statistik) - tanpa dependensi tambahan
```

## Fitur

- **Dashboard**: logo & nama aplikasi, sidebar, total tugas, belum/sedang dikerjakan/selesai, persentase penyelesaian, daftar proyek, dan deadline terdekat.
- **Kanban Board**: kolom To Do / In Progress / Done, drag & drop (HTML5 native), tambah / ganti nama / hapus kolom (tugas di dalamnya dipindahkan atau ikut dihapus), jumlah tugas per kolom.
- **Tugas**: tambah, detail, edit, hapus, pindah kolom, ubah prioritas (Low/Medium/High), deadline di kartu, label. Form memakai dialog.
- **Pencarian & filter**: judul, prioritas, label, status, dan urutan (tanggal dibuat / deadline) — semuanya bisa dipakai bersamaan.
- **Proyek**: buat, ganti nama, hapus, dan pindah antar board; tiap board punya kolom & tugas sendiri.
- **LocalStorage**: simpan otomatis tiap perubahan, data contoh saat pertama kali, data rusak/tidak valid/storage tidak tersedia ditangani tanpa crash.

## Struktur

```
src/
  main.jsx, App.jsx
  context/KanbanContext.jsx     provider: state (useReducer) + actions + penyimpanan otomatis
  state/kanbanReducer.js        reducer murni untuk semua operasi board/kolom/tugas
  state/initialState.js         memuat state awal dari LocalStorage (atau data contoh)
  hooks/                        useKanban, useTaskFilters, useDragAndDrop
  utils/storage.js              readFromStorage / saveToStorage / removeFromStorage
  utils/normalizeState.js       validasi & perbaikan data hasil JSON.parse
  utils/                        constants, date, labels, filters, stats, validators, factories, sampleData
  components/
    ui/        Modal, Button, ConfirmDialog, Banner, Icon, Logo, ErrorBoundary, ...
    layout/    Sidebar
    dashboard/ Dashboard, StatCard, ProgressRing, BoardCard, UpcomingList
    board/     BoardView, Column, TaskCard, FilterBar, ColumnFormModal, DeleteColumnModal
    tasks/     TaskFormModal, TaskDetailModal, LabelInput
    projects/  BoardFormModal, BoardDialogs
  styles/      base, layout, components, dashboard, board
tests/         tes node:test untuk lapisan logika
```

## Catatan desain

- Setiap kolom punya **tipe** (Belum dikerjakan / Sedang dikerjakan / Selesai) agar Dashboard tetap menghitung benar walau pengguna membuat kolom sendiri. Tipe dipilih saat menambah atau mengubah kolom.
- Saat pengurutan (tanggal dibuat / deadline) aktif, urutan kartu mengikuti pengurutan; pilih "Urutan manual" untuk mengatur posisi kartu lewat drag & drop.
- Drag & drop HTML5 tidak selalu tersedia di layar sentuh. Di perangkat sentuh gunakan dialog detail tugas untuk mengganti status dan prioritas.
- Data tersimpan pada key `kanbanflow:data`. Menu "Reset ke data contoh" di sidebar menghapusnya dan memuat ulang data contoh.
