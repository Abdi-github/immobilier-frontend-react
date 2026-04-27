import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';

// Leaflet CSS is imported in globals.css
import L from 'leaflet';

const redMarkerIcon = L.divIcon({
  className: 'property-map-marker-icon',
  html: [
    '<span class="property-map-marker">',
    '<span class="property-map-marker__pin">',
    '<span class="property-map-marker__dot"></span>',
    '</span>',
    '</span>',
  ].join(''),
  iconSize: [24, 32],
  iconAnchor: [12, 30],
  popupAnchor: [0, -28],
});

interface PropertyMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  height?: string;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    price?: string;
  }>;
  address?: string;
  className?: string;
}

export function PropertyMap({
  lat,
  lng,
  zoom = 14,
  height = '320px',
  markers = [],
  address,
  className,
}: PropertyMapProps) {
  const { t } = useTranslation('properties');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.FeatureGroup | null>(null);
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number';
  const markersToRender =
    markers.length > 0 ? markers : hasCoordinates ? [{ lat, lng, title: address }] : [];

  useEffect(() => {
    if (!mapRef.current) return;

    if (markersToRender.length === 0) {
      markerLayerRef.current?.remove();
      markerLayerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      return;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([markersToRender[0].lat, markersToRender[0].lng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerLayerRef.current = L.featureGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;

    if (!map || !markerLayer) return;

    markerLayer.clearLayers();

    markersToRender.forEach((markerConfig) => {
      const marker = L.marker([markerConfig.lat, markerConfig.lng], { icon: redMarkerIcon });
      if (markerConfig.title || markerConfig.price) {
        marker.bindPopup(
          `<strong>${markerConfig.title ?? ''}</strong>${markerConfig.price ? `<br>${markerConfig.price}` : ''}`
        );
      }
      marker.addTo(markerLayer);
    });

    if (markersToRender.length > 1) {
      map.fitBounds(markerLayer.getBounds(), {
        padding: [24, 24],
        maxZoom: zoom,
      });
    } else {
      map.setView([markersToRender[0].lat, markersToRender[0].lng], zoom);
    }

    setTimeout(() => map.invalidateSize(), 0);
  }, [address, markersToRender, zoom]);

  useEffect(() => {
    return () => {
      markerLayerRef.current?.remove();
      markerLayerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  if (markersToRender.length === 0) {
    return (
      <div className={cn('flex h-48 items-center justify-center rounded-xl bg-muted', className)}>
        <p className="text-sm text-muted-foreground">
          {t('map.noLocation', 'Location not available for this property')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-hidden rounded-xl', className)}>
      <div ref={mapRef} data-testid="property-map" className="w-full rounded-xl" style={{ height }} />
      {address && markers.length <= 1 && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{address}</span>
        </div>
      )}
    </div>
  );
}
