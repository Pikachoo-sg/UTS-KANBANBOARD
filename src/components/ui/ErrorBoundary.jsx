import { Component } from 'react';
import { removeFromStorage } from '../../utils/storage.js';

/**
 * Jaring pengaman terakhir: bila terjadi error tak terduga saat render,
 * tampilkan pesan yang jelas dan sediakan cara memulihkan aplikasi.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Terjadi kesalahan pada aplikasi:', error, info);
  }

  handleReload = () => window.location.reload();

  handleResetData = () => {
    removeFromStorage();
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash">
        <div className="crash__card" role="alert">
          <h1>Terjadi kesalahan</h1>
          <p>Aplikasi mengalami masalah tak terduga. Coba muat ulang halaman.</p>
          <p className="crash__hint">
            Jika masalah berlanjut, data tersimpan mungkin bermasalah. Menghapusnya akan memulihkan aplikasi dengan data contoh.
          </p>
          <div className="crash__actions">
            <button type="button" className="btn btn--primary" onClick={this.handleReload}>
              Muat ulang
            </button>
            <button type="button" className="btn btn--danger" onClick={this.handleResetData}>
              Hapus data tersimpan &amp; muat ulang
            </button>
          </div>
        </div>
      </div>
    );
  }
}
