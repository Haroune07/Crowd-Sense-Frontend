import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import HeatMap from '../components/HeatMap.jsx';
import Icon from '../components/Icon.jsx';
import LevelChip from '../components/LevelChip.jsx';
import { api } from '../lib/api.js';
import { usePolling } from '../lib/usePolling.js';
import { timeAgo } from '../lib/util.js';

// Organizer: one zone on the map, zoomed in to street level, with a glass sheet.
export default function ZoneMap() {
  const { zoneKey } = useParams();
  const { data } = usePolling(api.pendingZones, 0);
  const { data: verified } = usePolling(api.heatmap, 0);
  const zone = (data || []).find((z) => z.zoneKey === zoneKey);

  // Show this zone's waiting reports together with the verified ones nearby, for context.
  const points = useMemo(() => [
    ...(verified || []),
    ...(zone ? zone.reports.map((r) => ({ lat: r.lat, lng: r.lng, level: r.dangerLevel })) : []),
  ], [verified, zone]);

  if (!zone) return null;
  const back = '/review/' + encodeURIComponent(zoneKey);

  return (
    <>
      <HeatMap points={points} center={[zone.lng, zone.lat]} zoom={17} showMe={false} />
      <Link to={back} className="icon-btn glass in" aria-label="Back to the zone" style={{ position: 'absolute', left: 16, top: 52, zIndex: 10 }}><Icon name="back" /></Link>

      <div className="glass sheet">
        <span className="handle" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{zone.place || 'This zone'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LevelChip value={zone.maxDanger} />
            <span className="copy num" style={{ fontSize: 13.5 }}>{zone.count} reports · {timeAgo(zone.latestAt)}</span>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <Link to={back} className="btn btn-ink">See the photos</Link>
          <Link to="/review" className="btn btn-line">All zones</Link>
        </div>
      </div>
    </>
  );
}
