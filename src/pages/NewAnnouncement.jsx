import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import PickMap from '../components/PickMap.jsx';
import TopBar from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { SEVERITIES } from '../lib/levels.js';
import { getSession } from '../lib/session.js';

export default function NewAnnouncement() {
  const navigate = useNavigate();
  const manif = getSession().manif;
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [pinned, setPinned] = useState(false);
  const [point, setPoint] = useState({ lat: manif.meetingLat, lng: manif.meetingLng });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function post(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createAnnouncement({ title, message, severity, ...(pinned ? point : {}) });
      navigate('/news');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={post} className="page with-actionbar">
      <TopBar title="New announcement" right={<button type="button" className="icon-btn glass" aria-label="Cancel" onClick={() => navigate('/news')}><Icon name="close" /></button>} />
      <div className="in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="lab" htmlFor="ti">Title</label><input className="inp" id="ti" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={60} /></div>
        <div><label className="lab" htmlFor="me">Message</label><textarea className="inp" id="me" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={280} /></div>
        <div>
          <span className="lab">How important?</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {Object.entries(SEVERITIES).map(([key, s]) => {
              const on = severity === key;
              return (
                <button key={key} type="button" aria-pressed={on} onClick={() => setSeverity(key)}
                  style={{ minHeight: 48, borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', background: on ? s.soft : '#fff', border: on ? `2px solid ${s.text}` : '1px solid var(--line)', color: on ? s.text : 'var(--ink)' }}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="card" style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button type="button" aria-pressed={pinned} onClick={() => setPinned(!pinned)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, padding: '0 10px', background: 'none', border: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>
            Pin on the map
            <span style={{ width: 48, height: 30, borderRadius: 15, padding: 3, display: 'flex', justifyContent: pinned ? 'flex-end' : 'flex-start', background: pinned ? 'var(--ink)' : 'var(--line)', transition: 'background-color 180ms' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,23,42,.35)' }} />
            </span>
          </button>
          {pinned && <div className="fade"><PickMap value={point} onPick={setPoint} height={240} /></div>}
        </div>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="actionbar"><button className="btn btn-ink" disabled={busy}>Post to everyone</button></div>
    </form>
  );
}
