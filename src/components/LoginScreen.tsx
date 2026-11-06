import { useState } from 'react';
import { CrescentIcon } from './Icons';

type Props = {
  busy: boolean;
  onGoogle: () => Promise<string | null>;
  onAnon: () => Promise<string | null>;
};

export function LoginScreen({ busy, onGoogle, onAnon }: Props) {
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<string | null>) => {
    setError('');
    const msg = await fn();
    if (msg) setError(msg);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <span className="crest login-crest" aria-hidden="true"><CrescentIcon /></span>
        <h1>Jadwal Imam &amp; Khatib Sholat Jumat</h1>
        <p className="desc">Masuk untuk menyimpan jadwal ke akun Anda dan membukanya dari perangkat lain.</p>

        <button className="btn google" type="button" disabled={busy} onClick={() => run(onGoogle)}>
          <GoogleIcon />
          Masuk dengan Google
        </button>

        <button className="btn outline anon" type="button" disabled={busy} onClick={() => run(onAnon)}>
          Lanjut sebagai Tamu (anonim)
        </button>

        {error && <p className="login-error" role="alert">{error}</p>}
        <p className="login-note">Tamu tidak bisa memulihkan jadwal bila data browser dihapus.</p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 01-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0012 24z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 010-4.6V6.6H1.4a12 12 0 000 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 001.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
