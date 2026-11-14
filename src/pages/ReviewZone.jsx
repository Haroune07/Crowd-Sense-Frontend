import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import LevelChip from '../components/LevelChip.jsx';
import TopBar from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { usePolling } from '../lib/usePolling.js';
import { timeAgo } from '../lib/util.js';

// Organizer: one zone. Look at the photos one by one, then verify or dismiss the whole zone.
export default function ReviewZone() {
  const { zoneKey } = useParams();
  const navigate = useNavigate();
  const { data } = usePolling(api.pendingZones, 0);
  const [index, setIndex] = useState(0);
  const [decision, setDecision] = useState(null); // 'verified' or 'dismissed', waiting for Undo
  const timer = useRef(null);
  const zone = (data || []).find((z) => z.zoneKey === zoneKey);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (data && !zone) {
    return (
      <div className="page">
        <TopBar title="Zone" back="/review" />
        <p className="copy">This zone was already reviewed.</p>
      </div>
    );
  }
  if (!zone) return <div className="page"><TopBar title="Zone" back="/review" /></div>;

  const report = zone.reports[index];
  const n = zone.reports.length;

  // Act after 5 seconds, so there is time to Undo (no "are you sure?" popup).
  function decide(status) {
    setDecision(status);
    timer.current = setTimeout(async () => {
      await api.decideZone(zone.reports.map((r) => r.id), status);
      navigate('/review');
    }, 5000);
  }

  function undo() {
    clearTimeout(timer.current);
    setDecision(null);
  }

  return (
    <div className="page with-actionbar">
      <TopBar title={zone.place || 'Zone'} back="/review" sub={`${n} report${n > 1 ? 's' : ''} · latest ${timeAgo(zone.latestAt)}`} />

      <div className="photo in" style={{ height: 300 }}>
        {report.photoUrl ? <img src={report.photoUrl} alt={`Photo ${index + 1} of ${n}`} /> : (
          <><Icon name="camera" size={40} stroke={1.6} /><span style={{ fontSize: 14, fontWeight: 500 }}>No photo</span></>
        )}
        <span className="chip glass num" style={{ position: 'absolute', right: 12, top: 12, color: 'var(--ink)' }}>{index + 1} / {n}</span>
        {n > 1 && (
          <>
            <button type="button" className="icon-btn glass" aria-label="Previous photo" onClick={() => setIndex((index + n - 1) % n)} style={{ position: 'absolute', left: 10, top: 128 }}><Icon name="back" /></button>
            <button type="button" className="icon-btn glass" aria-label="Next photo" onClick={() => setIndex((index + 1) % n)} style={{ position: 'absolute', right: 10, top: 128 }}><Icon name="chev" /></button>
          </>
        )}
      </div>

      <div className="card in2" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LevelChip value={report.dangerLevel} />
          <span className="copy num" style={{ fontSize: 13.5 }}>{timeAgo(report.createdAt)}</span>
        </span>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{report.description ? `"${report.description}"` : 'No note'}</span>
      </div>

      <Link to={`/review/${encodeURIComponent(zoneKey)}/map`} className="btn btn-line in3"><Icon name="map" size={20} />Show on map</Link>

      <div className="actionbar">
        {decision ? (
          <div className="fade" style={{ minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px 0 14px', borderRadius: 16, background: 'var(--ink)', color: '#fff', fontSize: 14.5, fontWeight: 500 }}>
            {decision === 'verified' ? 'Zone verified. It goes on the map.' : 'Zone dismissed. Photos deleted.'}
            <button type="button" onClick={undo} style={{ minHeight: 44, padding: '0 12px', borderRadius: 12, background: 'rgba(255,255,255,.12)', border: 0, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Undo</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <button type="button" className="btn btn-ink" onClick={() => decide('verified')}>Verify zone</button>
            <button type="button" className="btn btn-line" onClick={() => decide('dismissed')}>Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
}
