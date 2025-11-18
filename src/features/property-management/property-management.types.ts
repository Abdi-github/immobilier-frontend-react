/**
 * Property Management Types
 * Types for creating and managing properties (agents/owners)
 */

import type { SupportedLanguage } from '@/features/auth/auth.types';

// Property status enum
export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

// Transaction type
export type TransactionType = 'rent' | 'buy';

// Category section
export type CategorySection = 'residential' | 'commercial';

/**
 * Category type
 */
export interface Category {
  id: string;
  name: string | Record<SupportedLanguage, string>;
  slug: string;
  section: CategorySection;
  is_active: boolean;
}

/**
 * Amenity type
 */
export interface Amenity {
  id: string;
  name: string | Record<SupportedLanguage, string>;
  icon?: string;
  category?: string;
  is_active: boolean;
}

/**
 * Canton type
 */
export interface Canton {
  id: string;
  name: string | Record<SupportedLanguage, string>;
  code: string;
}

/**
 * City type
 */
export interface City {
  id: string;
  name: string | Record<SupportedLanguage, string>;
  canton_id: string;
  postal_codes?: string[];
}

/**
 * Property image type
 */
export interface PropertyImage {
  id: string;
  url: string;
  secure_url?: string;
  thumbnail_url?: string;
  alt_text?: string;
  caption?: string;
  sort_order: number;
  is_primary: boolean;
  public_id?: string;
  width?: number;
  height?: number;
}

/**
 * Property translation type
 */
export interface PropertyTranslation {
  id: string;
  property_id: string;
  language: SupportedLanguage;
  title: string;
  description: string;
  source: 'original' | 'deepl' | 'libretranslate' | 'human';
  quality_score?: number;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/**
 * Create property request (Step by step form data)
 */
export interface CreatePropertyRequest {
  // Step 1: Basic Info
  source_language: SupportedLanguage;
  category_id: string;
  transaction_type: TransactionType;
  price: number;
  additional_costs?: number;

  // Step 2: Location (optional for drafts)
  canton_id?: string;
  city_id?: string;
  address?: string;
  postal_code?: string;

  // Step 3: Details
  rooms?: number;
  surface?: number;
  title: string; // Goes to translation
  description: string; // Goes to translation

  // Step 4: Amenities
  amenities?: string[];

  // Step 5: Images (handled separately via upload)
  // Images are uploaded after property creation

  // Auto-set fields
  agency_id?: string;
  owner_id?: string;
  external_id?: string;
  external_url?: string;
  proximity?: Record<string, string>;
}

/**
 * Update property request
 */
export interface UpdatePropertyRequest {
  source_language?: SupportedLanguage;
  category_id?: string;
  transaction_type?: TransactionType;
  price?: number;
  additional_costs?: number;
  canton_id?: string;
  city_id?: string;
  address?: string;
  postal_code?: string;
  rooms?: number;
  surface?: number;
  amenities?: string[];
  proximity?: Record<string, string>;
}

/**
 * Property response (full property with populated fields)
 */
export interface PropertyResponse {
  id: string;
  external_id: string;
  external_url?: string;
  source_language: SupportedLanguage;
  transaction_type: TransactionType;
  price: number;
  currency: 'CHF';
  additional_costs?: number;
  rooms?: number;
  surface?: number;
  address: string;
  postal_code?: string;
  proximity?: Record<string, string>;
  status: PropertyStatus;
  published_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;

  // Translated fields (from current language translation)
  title?: string;
  description?: string;

  // IDs
  category_id: string;
  agency_id?: string;
  owner_id?: string;
  city_id: string;
  canton_id: string;
  amenities: string[];

  // Populated objects
  category?: Category;
  agency?: {
    id: string;
    name: string;
    slug: string;
  };
  city?: City;
  canton?: Canton;
  amenity_list?: Amenity[];
  images?: PropertyImage[];
  translation?: PropertyTranslation;
}

/**
 * My properties list response
 */
export interface MyPropertiesResponse {
  data: PropertyResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Property creation form state (multi-step)
 */
export interface PropertyFormState {
  currentStep: number;
  // Step 1: Basic Info
  source_language: SupportedLanguage;
  category_id: string;
  transaction_type: TransactionType;
  price: string; // String for form input
  additional_costs: string;

  // Step 2: Location
  canton_id: string;
  city_id: string;
  address: string;
  postal_code: string;

  // Step 3: Details
  rooms: string;
  surface: string;
  title: string;
  description: string;

  // Step 4: Amenities
  amenities: string[];

  // Step 5: Images (local state before upload)
  imageFiles: File[];
  imagePreviews: string[];

  // Metadata
  isSubmitting: boolean;
  createdPropertyId?: string;
}

/**
 * Initial form state
 */
export const initialPropertyFormState: PropertyFormState = {
  currentStep: 1,
  source_language: 'en',
  category_id: '',
  transaction_type: 'rent',
  price: '',
  additional_costs: '',
  canton_id: '',
  city_id: '',
  address: '',
  postal_code: '',
  rooms: '',
  surface: '',
  title: '',
  description: '',
  amenities: [],
  imageFiles: [],
  imagePreviews: [],
  isSubmitting: false,
};

/**
 * Form validation errors
 */
export interface PropertyFormErrors {
  category_id?: string;
  transaction_type?: string;
  price?: string;
  canton_id?: string;
  city_id?: string;
  address?: string;
  title?: string;
  description?: string;
  images?: string;
  [key: string]: string | undefined;
}

/**
 * Upload image response
 */
export interface UploadImageResponse {
  id: string;
  url: string;
  secure_url: string;
  thumbnail_url?: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  is_primary: boolean;
  sort_order: number;
}

/**
 * Create translation request
 */
export interface CreateTranslationRequest {
  property_id: string;
  language: SupportedLanguage;
  title: string;
  description: string;
  source?: 'original' | 'human';
}

/**
 * Property statistics
 */
export interface PropertyStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  published: number;
  rejected: number;
  archived: number;
}
