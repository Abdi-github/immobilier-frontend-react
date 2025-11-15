/**
 * Dashboard Feature Types
 */

import type { SupportedLanguage } from '@/features/auth/auth.types';

/**
 * User profile update request
 */
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_language?: SupportedLanguage;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email_new_properties: boolean;
  email_price_changes: boolean;
  email_favorites_updates: boolean;
  email_newsletter: boolean;
  push_enabled: boolean;
}

/**
 * User settings
 */
export interface UserSettings {
  notifications: NotificationPreferences;
  language: SupportedLanguage;
  currency: 'CHF';
}

/**
 * Favorite property
 */
export interface Favorite {
  id: string;
  property_id: string;
  user_id: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    rooms?: number;
    surface?: number;
    address: string;
    transaction_type: 'rent' | 'buy';
    status: string;
    primary_image_url?: string;
    city?: {
      id: string;
      name: string;
    };
    canton?: {
      id: string;
      code: string;
      name: string;
    };
    category?: {
      id: string;
      slug: string;
      name: string;
    };
  };
}

/**
 * Property alert
 */
export interface PropertyAlert {
  id: string;
  user_id: string;
  name: string;
  criteria: AlertFilters;
  is_active: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
  match_count?: number;
}

/**
 * Alert filters
 */
export interface AlertFilters {
  transaction_type?: 'rent' | 'buy';
  category_id?: string;
  canton_id?: string;
  city_id?: string;
  price_min?: number;
  price_max?: number;
  rooms_min?: number;
  rooms_max?: number;
  surface_min?: number;
  surface_max?: number;
}

/**
 * Create alert request
 */
export interface CreateAlertRequest {
  name: string;
  criteria: AlertFilters;
  frequency: 'instant' | 'daily' | 'weekly';
}

/**
 * Update alert request
 */
export interface UpdateAlertRequest {
  name?: string;
  criteria?: AlertFilters;
  frequency?: 'instant' | 'daily' | 'weekly';
  is_active?: boolean;
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  favorites_count: number;
  alerts_count: number;
  recent_views_count: number;
}

/**
 * Dashboard sidebar navigation item
 */
export interface DashboardNavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

/**
 * Inquiry (lead) - user's property inquiry
 */
export interface Inquiry {
  id: string;
  property_id: string;
  status: string;
  inquiry_type: string;
  message: string;
  first_response_at?: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
    images?: { url: string }[];
  };
}
