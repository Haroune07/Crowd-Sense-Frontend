import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';
import { api } from '../lib/api.js';
import { isOrganizer } from '../lib/session.js';
import { usePolling } from '../lib/usePolling.js';

const noZones = async () => [];

// Floating glass tab bar. Organizers get a 4th tab: Review, with the number of waiting reports.
export default function Nav() {
  const organizer = isOrganizer();
  const { data: zones } = usePolling(organizer ? api.pendingZones : noZones, 10000);
  const waiting = (zones || []).reduce((sum, z) => sum + z.count, 0);

  const tabs = [
    { to: '/map', label: 'Map', icon: 'map' },
    { to: '/news', label: 'News', icon: 'news' },
    { to: '/votes', label: 'Votes', icon: 'votes' },
  ];
  if (organizer) tabs.push({ to: '/review', label: 'Review', icon: 'review' });

  return (
    <nav className="nav glass" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to !== '/review'} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon name={t.icon} />
          {t.label}
          {t.icon === 'review' && waiting > 0 && <span className="badge num">{waiting}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
