import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_ATTRIBUTION, mapProvider, type MapSceneModel } from '@/features/map/provider';
import { cn } from '@/lib/utils';

function LeafletMapView({ scene, className }: { scene: MapSceneModel; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true }).setView(
      [scene.center.lat, scene.center.lng],
      12,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: MAP_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // Map instance is intentionally created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const zoom = Math.max(9, Math.min(15, Math.round(14 - Math.log2(scene.radiusKm))));
    map.setView([scene.center.lat, scene.center.lng], zoom);

    L.circle([scene.center.lat, scene.center.lng], {
      radius: scene.radiusKm * 1000,
      color: '#148b75',
      weight: 2,
      fillColor: '#1eae90',
      fillOpacity: 0.07,
    }).addTo(layer);

    L.circleMarker([scene.center.lat, scene.center.lng], {
      radius: 7,
      color: '#ffffff',
      weight: 3,
      fillColor: '#0b161e',
      fillOpacity: 1,
    })
      .bindPopup('<strong>Search centre</strong>')
      .addTo(layer);

    scene.markers.forEach((marker, index) => {
      // Stagger nearby labels vertically so their tap targets do not overlap.
      const stagger = index % 2 === 0 ? -14 : 14;
      const icon = L.divIcon({
        className: 'nivasa-marker-wrap',
        html: `<div class="nivasa-marker${marker.isActive ? ' is-active' : ''}">${marker.priceLabel}</div>`,
        iconSize: [104, 44],
        iconAnchor: [52, 22 + stagger],
      });
      L.marker([marker.coordinates.lat, marker.coordinates.lng], { icon })
        .bindPopup(`<strong>${marker.label}</strong><br/>${marker.priceLabel} · illustrative demo`)
        .on('click', () => scene.onSelect(marker.id))
        .addTo(layer);
    });
  }, [scene]);

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-2xl bg-ink-50', className)}>
      <div ref={containerRef} className="h-full w-full" aria-label="Map of illustrative accommodation locations" />
      <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-ink-600 shadow-soft">
        OpenStreetMap · illustrative demo locations
      </div>
    </div>
  );
}

function SchematicMapView({ scene, className }: { scene: MapSceneModel; className?: string }) {
  const width = 600;
  const height = 400;
  const centre = { x: width / 2, y: height / 2 };
  const maxPixels = 155;
  const scale = maxPixels / scene.radiusKm;
  const project = (lat: number, lng: number) => {
    const dxKm = (lng - scene.center.lng) * Math.cos((scene.center.lat * Math.PI) / 180) * 111.32;
    const dyKm = (scene.center.lat - lat) * 110.57;
    return { x: centre.x + dxKm * scale, y: centre.y + dyKm * scale };
  };

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-2xl bg-teal-50/40', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Schematic demo map">
        <defs>
          <pattern id="demo-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#c8d5dd" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#demo-grid)" />
        <circle cx={centre.x} cy={centre.y} r={maxPixels} fill="#1eae90" fillOpacity="0.07" stroke="#148b75" strokeWidth="2" strokeDasharray="6 5" />
        <circle cx={centre.x} cy={centre.y} r={maxPixels / 2} fill="none" stroke="#148b75" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx={centre.x} cy={centre.y} r={10} fill="#0b161e" stroke="#fff" strokeWidth="3" />
        <text x={centre.x + 16} y={centre.y + 4} className="fill-ink-700 text-[12px] font-bold">
          Search centre
        </text>
        {scene.markers.map((marker) => {
          const point = project(marker.coordinates.lat, marker.coordinates.lng);
          return (
            <g key={marker.id} onClick={() => scene.onSelect(marker.id)} className="cursor-pointer" role="button" tabIndex={0}>
              <rect
                x={point.x - 42}
                y={point.y - 13}
                width="84"
                height="26"
                rx="13"
                fill={marker.isActive ? '#ea580c' : '#0b161e'}
                stroke="#fff"
                strokeWidth="2"
              />
              <text x={point.x} y={point.y + 4} textAnchor="middle" fill="#fff" className="text-[11px] font-bold">
                {marker.priceLabel}
              </text>
              <title>{marker.label}</title>
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-ink-600 shadow-soft">
        Schematic preview · no external map service
      </div>
    </div>
  );
}

export function MapView({ scene, className }: { scene: MapSceneModel; className?: string }) {
  return mapProvider === 'osm' ? <LeafletMapView scene={scene} className={className} /> : <SchematicMapView scene={scene} className={className} />;
}
