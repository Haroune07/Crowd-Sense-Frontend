import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Nav from '../components/Nav.jsx';
import TopBar, { Avatar } from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { SEVERITIES } from '../lib/levels.js';
import { isOrganizer } from '../lib/session.js';
import { usePolling } from '../lib/usePolling.js';
import { timeAgo } from '../lib/util.js';

// One announcement: a closed row (dot, title, time) that opens on tap.
function Row({ item, open, onToggle }) {
  const navigate = useNavigate();
  const sev = SEVERITIES[item.severity] || SEVERITIES.info;
  return (
    <div className="row-wrap">
      <button type="button" className="row" onClick={onToggle} aria-expanded={open}>
        <span className="dot" style={{ width: 8, height: 8, background: sev.text }} />
        <span style={{ flexGrow: 1, minWidth: 0, fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
        <span className="num" style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(item.createdAt)}</span>
        <Icon name="chev" size={18} stroke={2.2} className={'chev' + (open ? ' open' : '')} />
      </button>
      {open && (
        <div className="fade" style={{ padding: '0 14px 14px 34px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="chip" style={{ background: sev.soft, color: sev.text, alignSelf: 'flex-start', height: 22, fontSize: 11.5 }}>{sev.label}</span>
          <p>{item.message}</p>
          {item.lat && (
            <button type="button" className="link-btn" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              onClick={() => navigate('/map', { state: { focus: { lat: item.lat, lng: item.lng } } })}>
              <Icon name="pin" size={16} stroke={2.2} /> See on map
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function News() {
  const { data, error } = usePolling(api.announcements, 15000);
  const [openId, setOpenId] = useState(null);
  const items = data || [];
  const recent = items.filter((a) => Date.now() - new Date(a.createdAt) < 15 * 60000);
  const earlier = items.filter((a) => !recent.includes(a));
  const shownOpen = openId ?? recent[0]?.id; // the newest one starts open

  const list = (group) => (
    <div className="card" style={{ overflow: 'hidden' }}>
      {group.map((a) => (
        <Row key={a.id} item={a} open={shownOpen === a.id} onToggle={() => setOpenId(shownOpen === a.id ? '' : a.id)} />
      ))}
    </div>
  );

  return (
    <div className="page">
      <TopBar title="News" right={
        <div style={{ display: 'flex', gap: 10 }}>
          {isOrganizer() && <Link to="/news/new" className="icon-btn dark" aria-label="New announcement"><Icon name="plus" size={20} stroke={2.4} /></Link>}
          <Avatar />
        </div>
      } />
      {error && <p className="error">{error}</p>}
      {data && items.length === 0 && <p className="copy" style={{ padding: '24px 4px' }}>No announcements yet.</p>}
      {recent.length > 0 && <div className="in"><p className="section-title">Last 15 minutes</p>{list(recent)}</div>}
      {earlier.length > 0 && <div className="in2"><p className="section-title">Earlier</p>{list(earlier)}</div>}
      <Nav />
    </div>
  );
}
