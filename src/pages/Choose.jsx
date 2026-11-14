import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { clearSession, getSession } from '../lib/session.js';

function Choice({ to, icon, title, sub, dark }) {
  return (
    <Link to={to} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 16px', textDecoration: 'none', color: 'var(--body)' }}>
      <span style={{ width: 48, height: 48, borderRadius: '50%', background: dark ? 'var(--ink)' : '#EEF2F6', color: dark ? '#fff' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{title}</span>
        <span className="copy" style={{ fontSize: 14.5 }}>{sub}</span>
      </span>
      <Icon name="chev" size={20} style={{ color: 'var(--muted)' }} />
    </Link>
  );
}

export default function Choose() {
  const navigate = useNavigate();
  const name = getSession().user?.displayName || '';

  return (
    <>
      <div className="mesh in" style={{ margin: 8, height: 300, borderRadius: 28, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p className="copy" style={{ fontSize: 17, fontWeight: 500 }}>Hi {name}</p>
          <h1 className="disp" style={{ fontSize: 40 }}>What are you<span>here to do?</span></h1>
        </div>
      </div>
      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="in2"><Choice to="/join" icon="join" title="Join a protest" sub="I have a code from my organizers" /></div>
        <div className="in3"><Choice to="/create" icon="news" title="Create a protest" sub="I am organizing and will share a code" dark /></div>
        <button type="button" className="link-btn" style={{ alignSelf: 'center', marginTop: 24, textDecoration: 'none' }}
          onClick={() => { clearSession(); navigate('/login'); }}>
          Log out
        </button>
      </div>
    </>
  );
}
