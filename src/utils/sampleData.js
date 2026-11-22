import { addDaysToDateString, todayString } from './date.js';
import { createBoard, createColumn, createDefaultColumns, createTask } from './factories.js';

/**
 * Data awal yang dimuat saat aplikasi pertama kali dijalankan.
 * Tanggal dibuat dan deadline dihitung relatif terhadap hari ini
 * supaya contoh (termasuk tugas terlambat) selalu terlihat realistis.
 */
export function createSampleState(now = new Date()) {
  const today = todayString(now);
  const deadlineIn = (days) => addDaysToDateString(today, days);
  const createdAgo = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };

  // --- Board 1: Website Perusahaan (kolom bawaan) -------------------------
  const web = createBoard('Website Perusahaan', createDefaultColumns());
  const [webTodo, webProgress, webDone] = web.columns;
  web.createdAt = createdAgo(14);
  web.tasks = [
    createTask({
      title: 'Riset kompetitor dan referensi desain',
      description: 'Kumpulkan minimal 5 website kompetitor dan catat pola navigasi serta gaya visualnya.',
      columnId: webTodo.id,
      priority: 'medium',
      labels: ['Riset'],
      createdAt: createdAgo(2),
      deadline: deadlineIn(5),
    }),
    createTask({
      title: 'Menyusun wireframe halaman utama',
      description: 'Buat wireframe versi desktop dan mobile untuk halaman beranda.',
      columnId: webTodo.id,
      priority: 'high',
      labels: ['Desain', 'UI'],
      createdAt: createdAgo(3),
      deadline: deadlineIn(2),
    }),
    createTask({
      title: 'Menulis konten halaman Tentang Kami',
      description: 'Profil perusahaan, visi misi, dan tim.',
      columnId: webTodo.id,
      priority: 'low',
      labels: ['Konten'],
      createdAt: createdAgo(1),
      deadline: '',
    }),
    createTask({
      title: 'Audit aksesibilitas awal',
      description: 'Periksa kontras warna, navigasi keyboard, dan label formulir.',
      columnId: webTodo.id,
      priority: 'high',
      labels: ['QA'],
      createdAt: createdAgo(0),
      deadline: deadlineIn(7),
    }),
    createTask({
      title: 'Implementasi komponen navigasi',
      description: 'Navbar responsif dengan menu dropdown dan state aktif.',
      columnId: webProgress.id,
      priority: 'high',
      labels: ['Frontend'],
      createdAt: createdAgo(6),
      deadline: deadlineIn(1),
    }),
    createTask({
      title: 'Integrasi form kontak dengan API',
      description: 'Kirim data formulir ke endpoint backend dan tampilkan status berhasil/gagal.',
      columnId: webProgress.id,
      priority: 'medium',
      labels: ['Frontend', 'Backend'],
      createdAt: createdAgo(5),
      deadline: deadlineIn(-1),
    }),
    createTask({
      title: 'Setup repositori dan CI/CD',
      description: 'Konfigurasi pipeline build, lint, dan deploy otomatis.',
      columnId: webDone.id,
      priority: 'medium',
      labels: ['DevOps'],
      createdAt: createdAgo(10),
      deadline: deadlineIn(-4),
    }),
    createTask({
      title: 'Menentukan palet warna dan tipografi',
      description: 'Disepakati bersama tim desain dan pemasaran.',
      columnId: webDone.id,
      priority: 'low',
      labels: ['Desain'],
      createdAt: createdAgo(8),
      deadline: deadlineIn(-5),
    }),
  ];

  // --- Board 2: Kampanye Marketing Q4 (kolom bawaan) ----------------------
  const marketing = createBoard('Kampanye Marketing Q4', createDefaultColumns());
  const [mkTodo, mkProgress, mkDone] = marketing.columns;
  marketing.createdAt = createdAgo(12);
  marketing.tasks = [
    createTask({
      title: 'Desain materi iklan banner',
      description: 'Tiga ukuran banner untuk Google Display dan media sosial.',
      columnId: mkTodo.id,
      priority: 'high',
      labels: ['Desain'],
      createdAt: createdAgo(2),
      deadline: deadlineIn(6),
    }),
    createTask({
      title: 'Koordinasi dengan influencer',
      description: 'Finalisasi brief dan jadwal posting.',
      columnId: mkTodo.id,
      priority: 'medium',
      labels: ['Kemitraan'],
      createdAt: createdAgo(1),
      deadline: deadlineIn(10),
    }),
    createTask({
      title: 'Rencana konten media sosial',
      description: 'Kalender konten 4 minggu untuk Instagram dan LinkedIn.',
      columnId: mkProgress.id,
      priority: 'medium',
      labels: ['Sosial Media'],
      createdAt: createdAgo(4),
      deadline: deadlineIn(3),
    }),
    createTask({
      title: 'Menyiapkan newsletter bulanan',
      description: '',
      columnId: mkProgress.id,
      priority: 'low',
      labels: ['Email'],
      createdAt: createdAgo(3),
      deadline: deadlineIn(4),
    }),
    createTask({
      title: 'Analisis performa kampanye bulan lalu',
      description: 'Ringkasan metrik utama: jangkauan, klik, dan konversi.',
      columnId: mkDone.id,
      priority: 'low',
      labels: ['Analitik'],
      createdAt: createdAgo(12),
      deadline: deadlineIn(-3),
    }),
  ];

  // --- Board 3: Belajar React (kolom kustom) ------------------------------
  const backlog = createColumn('Backlog', 'todo');
  const learning = createColumn('Sedang Dipelajari', 'progress');
  const practice = createColumn('Latihan', 'progress');
  const mastered = createColumn('Dikuasai', 'done');
  const learn = createBoard('Belajar React', [backlog, learning, practice, mastered]);
  learn.createdAt = createdAgo(9);
  learn.tasks = [
    createTask({
      title: 'Memahami Context API dan useReducer',
      description: 'Bangun state global kecil tanpa library tambahan.',
      columnId: learning.id,
      priority: 'high',
      labels: ['React', 'State'],
      createdAt: createdAgo(5),
      deadline: deadlineIn(3),
    }),
    createTask({
      title: 'Latihan membuat aplikasi todo',
      description: '',
      columnId: practice.id,
      priority: 'medium',
      labels: ['Latihan'],
      createdAt: createdAgo(4),
      deadline: '',
    }),
    createTask({
      title: 'Mempelajari React Router',
      description: '',
      columnId: backlog.id,
      priority: 'low',
      labels: ['React'],
      createdAt: createdAgo(2),
      deadline: deadlineIn(14),
    }),
    createTask({
      title: 'Dasar JSX dan komponen',
      description: 'Props, children, dan composition.',
      columnId: mastered.id,
      priority: 'medium',
      labels: ['React'],
      createdAt: createdAgo(9),
      deadline: deadlineIn(-2),
    }),
  ];

  return {
    activeBoardId: web.id,
    view: 'dashboard',
    boards: [web, marketing, learn],
  };
}
