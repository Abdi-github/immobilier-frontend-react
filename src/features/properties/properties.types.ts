import type { Canton, City, Category } from '@/features/locations/locations.api';

export interface PropertyImage {
  id: string;
  _id?: string; // For backward compatibility
  property_id: string;
  url: string;
  cloudinary_public_id?: string;
  is_primary: boolean;
  order: number;
  alt_text?: string;
}

export interface Property {
  id: string;
  _id?: string; // For backward compatibility
  external_id: string;
  external_url?: string;
  source_language: 'en' | 'fr' | 'de' | 'it';
  
  // Content (from translation or source)
  title: string;
  description: string;
  
  // Relations
  category_id: string;
  category?: Category;
  agency_id?: string;
  agency?: {
    id: string;
    _id?: string;
    name: string;
    slug?: string;
    logo_url?: string;
  };
  owner_id?: string;
  
  // Transaction
  transaction_type: 'rent' | 'buy';
  
  // Pricing
  price: number;
  currency: string;
  additional_costs?: number;
  
  // Features
  rooms?: number;
  surface?: number;
  
  // Location
  address: string;
  city_id: string;
  city?: City;
  canton_id: string;
  canton?: Canton;
  postal_code?: string;
  
  // Additional
  proximity?: Record<string, string>;
  amenities?: string[]; // Array of amenity IDs from API
  images?: PropertyImage[];
  
  // Status
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  
  // Timestamps
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyQueryParams {
  // Pagination
  page?: number;
  limit?: number;
  
  // Filters
  transaction_type?: 'rent' | 'buy';
  section?: 'residential' | 'commercial';  // Filter by category section
  category_id?: string;
  canton_id?: string;
  city_id?: string;
  status?: string;
  
  // Price (API uses price_min/price_max format)
  price_min?: number;
  price_max?: number;
  
  // Features (API uses rooms_min/rooms_max format)
  rooms_min?: number;
  rooms_max?: number;
  surface_min?: number;
  surface_max?: number;
  
  // Amenities
  amenities?: string[];
  
  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  
  // Search
  q?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertyListResponse {
  success: boolean;
  message: string;
  data: Property[];
  meta: PaginationMeta;
  // Legacy alias for pagination
  pagination?: PaginationMeta;
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property;
}
