import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from './Icon.jsx';
import { getPosition } from '../lib/util.js';

// Photon: free address search built on OpenStreetMap data (no key needed).
const PHOTON = 'https://photon.komoot.io';

// Turns a Photon result into a short readable line: "Concordia University, 1455 Boulevard De Maisonneuve O, Montréal".
function label(p) {
  const street = [p.housenumber, p.street].filter(Boolean).join(' ');
  return [p.name, street, p.city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
}

// Small map to choose a spot: search an address, tap the map, or use your location.
// `place` / `onPlace` (optional) keep the place name in sync with the pin.
export default function PickMap({ value, onPick, place, onPlace, height = 140 }) {
  const box = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [big, setBig] = useState(false);
  const [query, setQuery] = useState(place || '');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const picked = useRef(false); // true when the text was filled by us, not typed: then don't search

  // Moves the pin (and the map) to a spot, and tells the form.
  function moveTo(lat, lng, name, fly = true) {
    marker.current.setLngLat([lng, lat]);
    if (fly) map.current.flyTo({ center: [lng, lat], zoom: 16 });
    onPick({ lat, lng });
    if (name !== undefined) {
      picked.current = true;
      setQuery(name);
      onPlace?.(name);
    }
  }

  // Finds the address of a spot (used after tapping the map or "my location").
  async function nameOf(lat, lng) {
    try {
      const res = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lng}&lang=fr`);
      const feature = (await res.json()).features?.[0];
      return feature ? label(feature.properties) : '';
    } catch {
      return '';
    }
  }

  useEffect(() => {
    const m = new maplibregl.Map({
      container: box.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [value.lng, value.lat],
      zoom: 15,
      attributionControl: { compact: true },
    });
    map.current = m;
    marker.current = new maplibregl.Marker({ color: '#0F172A' }).setLngLat([value.lng, value.lat]).addTo(m);
    m.on('click', async (e) => {
      moveTo(e.lngLat.lat, e.lngLat.lng, undefined, false);
      const name = await nameOf(e.lngLat.lat, e.lngLat.lng);
      if (name) moveTo(e.lngLat.lat, e.lngLat.lng, name, false);
    });
    return () => m.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The map must redraw at its new size after going full screen and back.
  useEffect(() => {
    setTimeout(() => map.current?.resize(), 50);
  }, [big]);

  // Suggestions while typing (waits 300 ms after the last key so we don't spam the service).
  useEffect(() => {
    if (query.trim().length < 3 || picked.current) {
      picked.current = false;
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const c = map.current.getCenter();
        const res = await fetch(`${PHOTON}/api/?q=${encodeURIComponent(query)}&lat=${c.lat}&lon=${c.lng}&limit=5&lang=fr`);
        setResults((await res.json()).features || []);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function useMyLocation() {
    setError('');
    try {
      const { lat, lng } = await getPosition();
      moveTo(lat, lng, undefined);
      const name = await nameOf(lat, lng);
      if (name) moveTo(lat, lng, name, false);
    } catch (e) {
      setError(e.message);
    }
  }

  const frame = big
    ? { position: 'fixed', inset: 0, zIndex: 50, background: 'var(--bg)', padding: '52px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }
    : { position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 };

  return (
    <div style={frame}>
      {/* Address search */}
      <div style={{ position: 'relative' }}>
        <input className="inp" value={query} onChange={(e) => { setQuery(e.target.value); onPlace?.(e.target.value); }}
          placeholder="Search an address or a place" aria-label="Search an address" autoComplete="off" enterKeyHint="search"
          style={{ background: '#F1F5F9', borderColor: 'transparent', height: 46 }} />
        {results.length > 0 && (
          <div className="card" role="listbox" style={{ position: 'absolute', left: 0, right: 0, top: 50, zIndex: 5, overflow: 'hidden' }}>
            {results.map((r, i) => (
              <button key={i} type="button" className="row" role="option" style={{ minHeight: 48, fontSize: 14.5 }}
                onClick={() => {
                  const [lng, lat] = r.geometry.coordinates;
                  setResults([]);
                  moveTo(lat, lng, label(r.properties));
                }}>
                <Icon name="pin" size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label(r.properties)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* The map */}
      <div style={{ position: 'relative', height: big ? 'auto' : height, flexGrow: big ? 1 : 0, borderRadius: 14, overflow: 'hidden' }}>
        <div ref={box} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', right: 8, top: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button type="button" className="icon-btn glass" onClick={() => setBig(!big)} aria-label={big ? 'Make the map smaller' : 'Make the map bigger'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {big
                ? <><path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="M14 10l7-7" /><path d="M3 21l7-7" /></>
                : <><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></>}
            </svg>
          </button>
          <button type="button" className="icon-btn glass" onClick={useMyLocation} aria-label="Use my location">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          </button>
        </div>
        <span className="glass" style={{ position: 'absolute', left: 8, bottom: 8, borderRadius: 10, padding: '3px 9px', fontSize: 12, fontWeight: 500, pointerEvents: 'none' }}>
          Tap the map to move the pin
        </span>
      </div>
      {error && <p className="error">{error}</p>}
      {big && <button type="button" className="btn btn-ink" onClick={() => setBig(false)}>Use this spot</button>}
    </div>
  );
}
