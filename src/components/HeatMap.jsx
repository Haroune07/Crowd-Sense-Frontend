import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LEVELS } from '../lib/levels.js';

// Free map: MapLibre + OpenFreeMap tiles (no account, no key).
const STYLE = 'https://tiles.openfreemap.org/styles/positron';

function toGeoJSON(points) {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      properties: { level: p.level },
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    })),
  };
}

// Adds the heat layers. One heat layer per level, so a color always means a level.
// Zoomed out: soft zones. Zoomed in: the heat tightens and each report becomes a dot.
function addHeatLayers(map) {
  for (const l of LEVELS) {
    const rgb = l.color.match(/\w\w/g).map((h) => parseInt(h, 16)).join(',');
    map.addLayer({
      id: 'heat-' + l.id,
      type: 'heatmap',
      source: 'reports',
      filter: ['==', ['get', 'level'], l.value],
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 13, 1.6, 15, 1.8, 18, 1.6],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 13, 26, 15, 48, 16.5, 34, 18, 22],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0.95, 17, 0.5],
        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
          0, `rgba(${rgb},0)`, 0.15, `rgba(${rgb},0.25)`, 0.45, `rgba(${rgb},0.55)`, 1, `rgba(${rgb},0.8)`],
      },
    });
  }
  map.addLayer({
    id: 'report-dots',
    type: 'circle',
    source: 'reports',
    minzoom: 16,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 16, 2.5, 18, 6],
      'circle-color': ['match', ['get', 'level'], 1, LEVELS[0].color, 2, LEVELS[1].color, 3, LEVELS[2].color, LEVELS[3].color],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 16, 0, 16.6, 1],
      'circle-stroke-opacity': ['interpolate', ['linear'], ['zoom'], 16, 0, 16.6, 1],
    },
  });
}

function pinElement(html, className = '') {
  const el = document.createElement('div');
  el.className = className;
  el.innerHTML = html;
  return el;
}

const HeatMap = forwardRef(function HeatMap({ points = [], center, zoom = 15, meeting, pins = [], onPinClick, showMe = true, onZoom }, ref) {
  const box = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  // Lets the page call zoomIn() / zoomOut() / flyTo() from its own glass buttons.
  useImperativeHandle(ref, () => ({
    zoomIn: () => map.current?.zoomIn(),
    zoomOut: () => map.current?.zoomOut(),
    flyTo: (lng, lat, z = 17) => map.current?.flyTo({ center: [lng, lat], zoom: z }),
  }));

  // Create the map once.
  useEffect(() => {
    const m = new maplibregl.Map({ container: box.current, style: STYLE, center, zoom, attributionControl: { compact: true } });
    map.current = m;
    m.on('load', () => {
      m.addSource('reports', { type: 'geojson', data: toGeoJSON(points) });
      addHeatLayers(m);
    });
    m.on('zoomend', () => onZoom?.(m.getZoom()));

    let watch;
    if (showMe && navigator.geolocation) {
      const me = new maplibregl.Marker({ element: pinElement('<span></span>', 'me-dot') });
      watch = navigator.geolocation.watchPosition((p) => me.setLngLat([p.coords.longitude, p.coords.latitude]).addTo(m), () => {});
    }
    return () => {
      if (watch !== undefined) navigator.geolocation.clearWatch(watch);
      m.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the heat when new reports arrive (every few seconds).
  useEffect(() => {
    const source = map.current?.getSource('reports');
    if (source) source.setData(toGeoJSON(points));
    else map.current?.once('load', () => map.current.getSource('reports')?.setData(toGeoJSON(points)));
  }, [points]);

  // Meeting point and pinned announcements.
  useEffect(() => {
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];
    if (!map.current) return;
    if (meeting) {
      const el = pinElement('<svg width="28" height="34" viewBox="0 0 34 40"><path d="M17 39s14-13 14-23A14 14 0 0 0 3 16c0 10 14 23 14 23z" fill="#0F172A"/><path d="M12 10v13M12 10h9l-2 3 2 3h-9" stroke="#fff" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>');
      el.setAttribute('aria-label', 'Meeting point');
      markers.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([meeting.lng, meeting.lat]).addTo(map.current));
    }
    for (const pin of pins) {
      const el = pinElement(`<span class="pin-alert">!</span><span>${pin.title.replace(/</g, '&lt;')}</span>`, 'map-pin glass');
      el.addEventListener('click', () => onPinClick?.(pin));
      markers.current.push(new maplibregl.Marker({ element: el, anchor: 'left' }).setLngLat([pin.lng, pin.lat]).addTo(map.current));
    }
  }, [meeting, pins, onPinClick]);

  return <div ref={box} className="map-full" />;
});

export default HeatMap;
