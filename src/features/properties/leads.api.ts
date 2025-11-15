/**
 * Leads API - RTK Query Endpoints
 * For public contact form submissions
 */

import { baseApi } from '@/shared/api/baseApi';

// Lead creation for public (unauthenticated) users
interface CreatePublicLeadRequest {
  property_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  inquiry_type?:
    | 'general_inquiry'
    | 'viewing_request'
    | 'price_inquiry'
    | 'availability_check'
    | 'documentation_request'
    | 'other';
  message?: string;
  preferred_contact_method?: 'email' | 'phone' | 'both';
}

// Lead creation for authenticated users
interface CreateAuthenticatedLeadRequest {
  property_id: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  inquiry_type?:
    | 'general_inquiry'
    | 'viewing_request'
    | 'price_inquiry'
    | 'availability_check'
    | 'documentation_request'
    | 'other';
  message?: string;
  preferred_contact_method?: 'email' | 'phone' | 'both';
}

interface LeadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    property_id: string;
    status: string;
    created_at: string;
  };
}

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Create lead from public contact form (unauthenticated)
     * POST /api/v1/public/leads
     */
    createPublicLead: builder.mutation<LeadResponse, CreatePublicLeadRequest>({
      query: (body) => ({
        url: '/public/leads',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inquiry'],
    }),

    /**
     * Create lead from authenticated user
     * POST /api/v1/public/leads/authenticated
     */
    createAuthenticatedLead: builder.mutation<LeadResponse, CreateAuthenticatedLeadRequest>({
      query: (body) => ({
        url: '/public/leads/authenticated',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inquiry'],
    }),
  }),
});

export const { useCreatePublicLeadMutation, useCreateAuthenticatedLeadMutation } = leadsApi;
