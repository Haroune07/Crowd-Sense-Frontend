import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Small map where you tap to choose a spot (meeting point, announcement pin).
export default function PickMap({ value, onPick, height = 140 }) {
  const box = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: box.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [value.lng, value.lat],
      zoom: 15,
      attributionControl: { compact: true },
    });
    marker.current = new maplibregl.Marker({ color: '#0F172A' }).setLngLat([value.lng, value.lat]).addTo(map);
    map.on('click', (e) => {
      marker.current.setLngLat(e.lngLat);
      onPick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });
    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: 'relative', height, borderRadius: 14, overflow: 'hidden' }}>
      <div ref={box} style={{ position: 'absolute', inset: 0 }} />
      <span className="glass" style={{ position: 'absolute', left: 8, bottom: 8, borderRadius: 10, padding: '3px 9px', fontSize: 12, fontWeight: 500, pointerEvents: 'none' }}>
        Tap the map to move the pin
      </span>
    </div>
  );
}
