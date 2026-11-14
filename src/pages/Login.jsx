import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { api, DEMO } from '../lib/api.js';
import { saveSession } from '../lib/session.js';

export default function Login() {
  const navigate = useNavigate();
  const [signUp, setSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEMO ? 'sam@cegep.qc.ca' : '');
  const [password, setPassword] = useState(DEMO ? 'password' : '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { accessToken } = signUp ? await api.register(name, email, password) : await api.login(email, password);
      saveSession({ token: accessToken });
      const user = await api.me();
      saveSession({ user });
      // Already in a protest? Go straight to the map.
      if (user.manifestationId) {
        saveSession({ manif: await api.currentManif() });
        navigate('/map');
      } else {
        navigate('/start');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mesh in" style={{ margin: 8, height: 380, borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
        <div className="glass" style={{ position: 'absolute', left: 18, top: 40, borderRadius: 20, padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Crowd-Sense" style={{ height: 56, display: 'block' }} />
        </div>
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 30, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 className="disp">Protest safe.<span>Together.</span></h1>
          <p className="copy" style={{ fontSize: 17 }}>See where it is calm. Warn everyone when it is not.</p>
        </div>
      </div>

      <form onSubmit={submit} className="in2" style={{ padding: '12px 20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {signUp && (
          <div>
            <label className="lab" htmlFor="name">Name</label>
            <input className="inp" id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </div>
        )}
        <div>
          <label className="lab" htmlFor="email">Email</label>
          <input className="inp" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className="lab" htmlFor="pw">Password</label>
          <input className="inp" id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            autoComplete={signUp ? 'new-password' : 'current-password'} />
        </div>
        {error && <p className="error">{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button className="btn btn-ink" style={{ flexGrow: 1 }} disabled={busy}>{signUp ? 'Create account' : 'Log in'}</button>
          <button type="button" className="btn btn-line" aria-label="Continue with Google" title="Continue with Google" style={{ width: 54, padding: 0 }}
            onClick={() => setError('Google sign-in is not set up yet.')}>
            <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
          </button>
        </div>
        <p className="copy" style={{ textAlign: 'center', fontSize: 15 }}>
          {signUp ? 'Already have an account? ' : 'No account? '}
          <button type="button" className="link-btn" onClick={() => setSignUp(!signUp)}>{signUp ? 'Log in' : 'Sign up'}</button>
        </p>
        <p className="fine" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="lock" size={16} /> Your location is only sent when you report.
        </p>
        {DEMO && <p className="fine" style={{ textAlign: 'center' }}>Demo mode: fake data, no backend.</p>}
      </form>
    </>
  );
}
