/**
 * Property Map Component
 * Renders a Leaflet map with property location marker.
 * Uses OpenStreetMap tiles (free, no API key needed).
 */

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useTranslation } from 'react-i18next';

// Leaflet CSS is imported in globals.css
import L from 'leaflet';

// Fix Leaflet default icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface PropertyMapProps {
  /** Latitude */
  lat?: number;
  /** Longitude */
  lng?: number;
  /** Address text to display in popup */
  address?: string;
  /** CSS class */
  className?: string;
}

export function PropertyMap({ lat, lng, address, className }: PropertyMapProps) {
  const { t } = useTranslation('properties');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    // Don't recreate if already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14);
      return;
    }

    const map = L.map(mapRef.current).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);
    if (address) {
      marker.bindPopup(`<strong>${address}</strong>`);
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, address]);

  if (!lat || !lng) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('map.title', 'Location')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              {t('map.noLocation', 'Location not available for this property')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t('map.title', 'Location')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="h-72 w-full rounded-lg" />
        {address && <p className="mt-2 text-sm text-muted-foreground">{address}</p>}
      </CardContent>
    </Card>
  );
}
