import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';
import { api, DEMO } from '../lib/api.js';
import { saveSession } from '../lib/session.js';

export default function Join() {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEMO ? 'K7P2QX' : '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function join(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { manifestation, accessToken } = await api.joinManif(code.trim());
      saveSession({ token: accessToken, manif: manifestation });
      saveSession({ user: await api.me() });
      navigate('/map');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Shows the 6 letters in boxes; the real input sits on top, invisible, so the keyboard works.
  const letters = code.padEnd(6, ' ').slice(0, 6).split('');

  return (
    <div className="page">
      <TopBar title="Join a protest" back="/start" />
      <p className="copy in" style={{ fontSize: 16, padding: '0 4px' }}>Enter the code from your organizers.</p>
      <form onSubmit={join} className="mesh in2" style={{ borderRadius: 26, padding: '22px 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label htmlFor="code" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Protest code</label>
        <div style={{ position: 'relative' }}>
          <div className="code-cells" aria-hidden="true">
            {letters.map((l, i) => <span key={i} className="cell glass">{l}</span>)}
          </div>
          <input id="code" value={code} maxLength={6} autoComplete="one-time-code" autoCapitalize="characters" required
            onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
            style={{ position: 'absolute', inset: 0, opacity: 0, fontSize: 16 }} />
        </div>
        <button className="btn btn-ink" disabled={busy || code.length < 6}>Join the protest</button>
      </form>
      {error && <p className="error in">{error}</p>}
    </div>
  );
}
