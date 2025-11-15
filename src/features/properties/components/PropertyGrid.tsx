import { PropertyCard } from './PropertyCard';
import type { Property } from '../properties.types';

interface PropertyGridProps {
  properties: Property[];
  onFavorite?: (id: string) => void;
  favorites?: string[];
}

export function PropertyGrid({ properties, onFavorite, favorites = [] }: PropertyGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          variant="grid"
          onFavorite={onFavorite}
          isFavorite={favorites.includes(property.id)}
        />
      ))}
    </div>
  );
}
