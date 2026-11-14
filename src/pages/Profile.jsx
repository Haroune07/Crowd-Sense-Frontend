import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import TopBar from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { clearSession, getSession, isOrganizer, saveSession } from '../lib/session.js';

export default function Profile() {
  const navigate = useNavigate();
  const { user, manif } = getSession();
  const organizer = isOrganizer();
  const [copied, setCopied] = useState(false);
  const when = new Date(manif.startsAt);

  async function leave() {
    await api.leaveManif().catch(() => {});
    saveSession({ manif: null, user: { ...user, role: 'protester' } });
    navigate('/start');
  }

  function logout() {
    clearSession();
    navigate('/login');
  }

  return (
    <div className="page with-actionbar">
      <TopBar title="Profile" back="/map" />
      <div className="in" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 4px' }}>
        <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 600, boxShadow: '0 0 0 4px #fff, 0 0 0 5px var(--line)' }}>
          {user.displayName[0].toUpperCase()}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{user.displayName}</span>
          <span className={'chip ' + (organizer ? 'chip-ink' : 'chip-quiet')} style={{ alignSelf: 'flex-start' }}>{organizer ? 'Organizer' : 'Protester'}</span>
        </span>
      </div>
      <div className="card in2" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="copy" style={{ fontSize: 13.5 }}>Protest</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{manif.name}</span>
        </div>
        <div style={{ height: 1, background: 'var(--line)' }} />
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="copy" style={{ fontSize: 13.5 }}>When</span>
          <span className="num" style={{ fontSize: 15, fontWeight: 500 }}>
            {when.toLocaleDateString([], { day: 'numeric', month: 'long' })} · {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {organizer && manif.code && (
          <>
            <div style={{ height: 1, background: 'var(--line)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px' }}>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="copy" style={{ fontSize: 13.5 }}>Code to share</span>
                <span className="num" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '.14em', color: 'var(--ink)' }}>{manif.code}</span>
              </span>
              <button type="button" className="btn btn-line btn-sm" onClick={() => navigator.clipboard.writeText(manif.code).then(() => setCopied(true))}>
                <Icon name={copied ? 'check' : 'copy'} size={18} />{copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="actionbar">
        <button type="button" className="btn btn-line" style={{ color: '#C4252B' }} onClick={leave}>Leave the protest</button>
        <button type="button" className="btn btn-line" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
