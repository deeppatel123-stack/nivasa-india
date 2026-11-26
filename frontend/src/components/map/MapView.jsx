import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

const ATTRIBUTION = '© OpenStreetMap contributors';
const UNAVAILABLE_MESSAGE = 'Map unavailable in this environment';
const FALLBACK_CENTER = { lat: 22, lng: 79 };
const MARKER_SIZE = [104, 44];
const MARKER_ANCHOR = [52, 22];

function canMountLeaflet() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  // Test DOMs have no map renderer; never substitute a fake map for the real thing.
  return !/jsdom|happy-dom/i.test(navigator.userAgent);
}

function createMarkerIcon(marker) {
  // Build the label as DOM nodes so record text is never parsed as HTML.
  const label = document.createElement('div');
  label.className = `nivasa-marker${marker.isActive ? ' is-active' : ''}`;
  label.textContent = String(marker.priceLabel ?? 'Not available');
  return L.divIcon({
    className: 'nivasa-marker-wrap',
    html: label,
    iconSize: MARKER_SIZE,
    iconAnchor: MARKER_ANCHOR,
    popupAnchor: [0, -18],
  });
}

function createPopupContent(marker) {
  const content = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = String(marker.label ?? 'Accommodation name not available');
  const detail = document.createElement('div');
  detail.textContent = `${marker.priceLabel ?? 'Not available'}${marker.note ? ` · ${marker.note}` : ''}`;
  content.append(title, detail);
  return content;
}

function MapUnavailable({ className }) {
  return (<div className={cn('flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-ink-100 bg-ink-50 p-6 text-center', className)} role="status">
    <p className="text-sm font-semibold text-ink-800">{UNAVAILABLE_MESSAGE}</p>
    <p className="max-w-sm text-xs leading-relaxed text-ink-500">
      The map could not be displayed here. You can still browse the places in the list view.
    </p>
    <p className="text-[10px] text-ink-400">{ATTRIBUTION}</p>
  </div>);
}

function LeafletMapView({ scene, className, onUnavailable }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;

  useEffect(() => {
    if (!containerRef.current || mapRef.current)
      return undefined;
    let map;
    try {
      const center = scene.center ?? FALLBACK_CENTER;
      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        // The visible banner below carries the full attribution.
        attributionControl: false,
      }).setView([center.lat, center.lng], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }
    catch {
      try {
        map?.remove?.();
      }
      catch {
        // Nothing else to clean up if Leaflet failed to initialise.
      }
      mapRef.current = null;
      layerRef.current = null;
      onUnavailableRef.current?.();
      return undefined;
    }
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // The map instance is intentionally created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer)
      return;
    layer.clearLayers();
    const center = scene.center ?? FALLBACK_CENTER;
    const radiusKm = Number.isFinite(scene.radiusKm) ? scene.radiusKm : 5;
    const zoom = Math.max(9, Math.min(15, Math.round(14 - Math.log2(radiusKm))));
    map.setView([center.lat, center.lng], zoom);

    // showRadius is true only when the search centre has been resolved.
    if (scene.showRadius === true) {
      L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: '#148b75',
        weight: 2,
        fillColor: '#1eae90',
        fillOpacity: 0.07,
      }).addTo(layer);
      const centreContent = document.createElement('strong');
      centreContent.textContent = 'Search centre';
      L.circleMarker([center.lat, center.lng], {
        radius: 7,
        color: '#ffffff',
        weight: 3,
        fillColor: '#0b161e',
        fillOpacity: 1,
      })
        .bindPopup(centreContent)
        .addTo(layer);
    }

    (scene.markers ?? []).forEach((marker) => {
      const { lat, lng } = marker.coordinates ?? {};
      if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return;
      L.marker([lat, lng], { icon: createMarkerIcon(marker) })
        .bindPopup(createPopupContent(marker))
        .on('click', () => scene.onSelect?.(marker.id))
        .addTo(layer);
    });
  }, [scene]);

  return (<div className={cn('relative h-full w-full overflow-hidden rounded-2xl bg-ink-50', className)}>
    <div ref={containerRef} className="h-full w-full" aria-label="Map of places near the selected location"/>
    <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-ink-600 shadow-soft">
      {ATTRIBUTION}
    </div>
  </div>);
}

export function MapView({ scene, className }) {
  const [unavailable, setUnavailable] = useState(() => !canMountLeaflet());
  if (unavailable)
    return <MapUnavailable className={className}/>;
  return <LeafletMapView scene={scene} className={className} onUnavailable={() => setUnavailable(true)}/>;
}
