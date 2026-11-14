import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import LevelChip from '../components/LevelChip.jsx';
import Nav from '../components/Nav.jsx';
import TopBar, { Avatar } from '../components/TopBar.jsx';
import { api } from '../lib/api.js';
import { levelOf } from '../lib/levels.js';
import { usePolling } from '../lib/usePolling.js';
import { timeAgo } from '../lib/util.js';

// Small round heat swatch in the zone's color.
function Swatch({ value }) {
  const l = levelOf(value);
  return (
    <span style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `radial-gradient(circle, ${l.color} 0 22%, ${l.color}99 40%, ${l.color}33 62%, #EDF1F6 75%)` }} />
  );
}

// Organizer: all zones waiting for review. Most reports first (the backend sorts them).
export default function Review() {
  const { data, error } = usePolling(api.pendingZones, 5000);
  const zones = data || [];
  const total = zones.reduce((sum, z) => sum + z.count, 0);

  return (
    <div className="page">
      <TopBar title="Review" sub={data ? `${total} reports in ${zones.length} zones` : ' '} right={<Avatar />} />
      {error && <p className="error">{error}</p>}
      {data && zones.length === 0 && (
        <div className="card in" style={{ padding: '26px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
          <Icon name="check" size={28} stroke={2.6} />
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>All caught up</span>
        </div>
      )}
      {zones.map((z, i) => (
        <Link key={z.zoneKey} to={'/review/' + encodeURIComponent(z.zoneKey)} className={'card ' + (i < 2 ? 'in' : 'in2')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, textDecoration: 'none', color: 'var(--body)' }}>
          <Swatch value={z.maxDanger} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4, flexGrow: 1, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {z.place || `Zone ${i + 1}`}
              </span>
              {z.count >= 3 && <span className="chip" style={{ height: 22, background: '#C4252B', color: '#fff', fontSize: 11.5 }}>Hot</span>}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LevelChip value={z.maxDanger} />
              <span className="copy num" style={{ fontSize: 13.5 }}>{z.count} report{z.count > 1 ? 's' : ''} · {timeAgo(z.latestAt)}</span>
            </span>
          </span>
          <Icon name="chev" size={20} style={{ color: 'var(--muted)' }} />
        </Link>
      ))}
      <Nav />
    </div>
  );
}
