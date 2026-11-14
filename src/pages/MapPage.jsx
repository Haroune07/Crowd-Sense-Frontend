import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HeatMap from '../components/HeatMap.jsx';
import Icon from '../components/Icon.jsx';
import Nav from '../components/Nav.jsx';
import { Avatar } from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { LEVELS } from '../lib/levels.js';
import { getSession, isOrganizer } from '../lib/session.js';
import { usePolling } from '../lib/usePolling.js';

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const manif = getSession().manif;
  const map = useRef(null);
  const [toast, setToast] = useState(location.state?.toast || '');
  const [updated, setUpdated] = useState(new Date());

  // Verified reports refresh every 5 seconds; announcements every 15.
  const { data: points } = usePolling(api.heatmap, 5000);
  const { data: news } = usePolling(api.announcements, 15000);
  const { data: zones } = usePolling(isOrganizer() ? api.pendingZones : noZones, 10000);
  const waiting = (zones || []).reduce((sum, z) => sum + z.count, 0);

  useEffect(() => setUpdated(new Date()), [points]);
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // "See on map" from the news screen sends us a spot to fly to.
  const focus = location.state?.focus;
  useEffect(() => {
    if (focus) setTimeout(() => map.current?.flyTo(focus.lng, focus.lat, 16.5), 400);
  }, [focus]);

  // Only urgent and warning announcements that have a place become pins on the map.
  const pins = useMemo(() => (news || []).filter((a) => a.lat && a.severity !== 'info').slice(0, 3), [news]);
  const meeting = useMemo(() => ({ lat: manif.meetingLat, lng: manif.meetingLng }), [manif.meetingLat, manif.meetingLng]);
  const openNews = useCallback(() => navigate('/news'), [navigate]);
  const seconds = Math.round((Date.now() - updated.getTime()) / 1000);

  return (
    <>
      <HeatMap ref={map} points={points || []} center={[manif.meetingLng, manif.meetingLat]} zoom={15} meeting={meeting} pins={pins} onPinClick={openNews} />

      <div className="map-top in">
        <div className="glass" style={{ flexGrow: 1, minWidth: 0, borderRadius: 18, padding: '8px 14px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{manif.name}</span>
          <span className="num" style={{ fontSize: 12.5, color: 'var(--copy)' }}>Updated {seconds} s ago</span>
        </div>
        <Avatar size={48} style={{ border: '3px solid rgba(255,255,255,.9)' }} />
      </div>

      <div className="legend glass in2" style={{ width: isOrganizer() ? 200 : 230 }}>
        <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
          {LEVELS.map((l) => <span key={l.id} style={{ flex: 1, height: 8, background: l.color }} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
          {LEVELS.map((l) => <span key={l.id}>{l.label}</span>)}
        </div>
      </div>

      {isOrganizer() && waiting > 0 && (
        <Link to="/review" className="glass in2" style={{ position: 'absolute', right: 16, top: 120, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px 0 8px', textDecoration: 'none', fontSize: 14, fontWeight: 600, zIndex: 10 }}>
          <span className="num" style={{ minWidth: 28, height: 28, borderRadius: 14, background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{waiting}</span>
          to review <Icon name="chev" size={16} stroke={2.4} />
        </Link>
      )}

      <div className="zoomctl glass" style={{ top: 196 }}>
        <button type="button" aria-label="Zoom in" onClick={() => map.current?.zoomIn()}><Icon name="plus" size={20} stroke={2.4} /></button>
        <span style={{ height: 1, background: 'rgba(15,23,42,.08)' }} />
        <button type="button" aria-label="Zoom out" onClick={() => map.current?.zoomOut()}><Icon name="minus" size={20} stroke={2.4} /></button>
      </div>

      {toast && <div className="toast fade" role="status">{toast}</div>}

      <Link to="/report" className="btn btn-red in3"
        style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 80px)', minHeight: 58, borderRadius: 18, fontSize: 17, zIndex: 20 }}>
        <Icon name="camera" />Report an urgence
      </Link>
      <Nav />
    </>
  );
}

const noZones = async () => [];
