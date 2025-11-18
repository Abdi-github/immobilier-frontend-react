import { baseApi } from '@/shared/api/baseApi';

export interface Agency {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  address: string;
  postal_code: string;
  website?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  logo?: string;
  is_verified?: boolean;
  verified?: boolean;
  status?: string;
  total_properties: number;
  canton_id?: string;
  city_id?: string;
  city?: {
    id: string;
    name: Record<string, string>;
  };
  canton?: {
    id: string;
    name: Record<string, string>;
    code: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AgencyListResponse {
  success: boolean;
  data: Agency[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AgencyQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  canton_id?: string;
  city_id?: string;
}

export const agenciesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgencies: builder.query<AgencyListResponse, AgencyQueryParams | void>({
      query: (params) => ({
        url: '/public/agencies',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Agency' as const, id })),
              { type: 'Agency', id: 'LIST' },
            ]
          : [{ type: 'Agency', id: 'LIST' }],
    }),

    getAgency: builder.query<{ success: boolean; data: Agency }, string>({
      query: (id) => `/public/agencies/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Agency', id }],
    }),

    getAgenciesByCanton: builder.query<
      AgencyListResponse,
      { cantonId: string; page?: number; limit?: number }
    >({
      query: ({ cantonId, ...params }) => ({
        url: `/public/agencies/canton/${cantonId}`,
        params,
      }),
      providesTags: (_result, _error, { cantonId }) => [
        { type: 'Agency', id: `canton-${cantonId}` },
      ],
    }),

    getAgenciesByCity: builder.query<
      AgencyListResponse,
      { cityId: string; page?: number; limit?: number }
    >({
      query: ({ cityId, ...params }) => ({
        url: `/public/agencies/city/${cityId}`,
        params,
      }),
      providesTags: (_result, _error, { cityId }) => [{ type: 'Agency', id: `city-${cityId}` }],
    }),
  }),
});

export const {
  useGetAgenciesQuery,
  useGetAgencyQuery,
  useGetAgenciesByCantonQuery,
  useGetAgenciesByCityQuery,
} = agenciesApi;
