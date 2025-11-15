import { PropertyCard } from './PropertyCard';
import type { Property } from '../properties.types';

interface PropertyListProps {
  properties: Property[];
  onFavorite?: (id: string) => void;
  favorites?: string[];
}

export function PropertyList({ properties, onFavorite, favorites = [] }: PropertyListProps) {
  return (
    <div className="flex flex-col gap-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          variant="list"
          onFavorite={onFavorite}
          isFavorite={favorites.includes(property.id)}
        />
      ))}
    </div>
  );
}
