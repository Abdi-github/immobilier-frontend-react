import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TransactionType = 'rent' | 'buy';
export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rooms_asc' | 'rooms_desc';

interface SearchFilters {
  query: string;
  transactionType: TransactionType;
  categoryId: string | null;
  cantonId: string | null;
  cityId: string | null;
  priceMin: number | null;
  priceMax: number | null;
  roomsMin: number | null;
  roomsMax: number | null;
  surfaceMin: number | null;
  surfaceMax: number | null;
  amenities: string[];
}

interface SearchState {
  filters: SearchFilters;
  sort: SortOption;
  page: number;
  limit: number;
  isFiltersOpen: boolean;
}

const initialState: SearchState = {
  filters: {
    query: '',
    transactionType: 'rent',
    categoryId: null,
    cantonId: null,
    cityId: null,
    priceMin: null,
    priceMax: null,
    roomsMin: null,
    roomsMax: null,
    surfaceMin: null,
    surfaceMax: null,
    amenities: [],
  },
  sort: 'newest',
  page: 1,
  limit: 20,
  isFiltersOpen: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setTransactionType: (state, action: PayloadAction<TransactionType>) => {
      state.filters.transactionType = action.payload;
      state.page = 1;
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.filters.query = action.payload;
      state.page = 1;
    },
    setCategoryId: (state, action: PayloadAction<string | null>) => {
      state.filters.categoryId = action.payload;
      state.page = 1;
    },
    setCantonId: (state, action: PayloadAction<string | null>) => {
      state.filters.cantonId = action.payload;
      state.filters.cityId = null; // Reset city when canton changes
      state.page = 1;
    },
    setCityId: (state, action: PayloadAction<string | null>) => {
      state.filters.cityId = action.payload;
      state.page = 1;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.filters.priceMin = action.payload.min;
      state.filters.priceMax = action.payload.max;
      state.page = 1;
    },
    setRoomsRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.filters.roomsMin = action.payload.min;
      state.filters.roomsMax = action.payload.max;
      state.page = 1;
    },
    setSurfaceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.filters.surfaceMin = action.payload.min;
      state.filters.surfaceMax = action.payload.max;
      state.page = 1;
    },
    toggleAmenity: (state, action: PayloadAction<string>) => {
      const index = state.filters.amenities.indexOf(action.payload);
      if (index === -1) {
        state.filters.amenities.push(action.payload);
      } else {
        state.filters.amenities.splice(index, 1);
      }
      state.page = 1;
    },
    setAmenities: (state, action: PayloadAction<string[]>) => {
      state.filters.amenities = action.payload;
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<SortOption>) => {
      state.sort = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    toggleFiltersPanel: (state) => {
      state.isFiltersOpen = !state.isFiltersOpen;
    },
    setFiltersOpen: (state, action: PayloadAction<boolean>) => {
      state.isFiltersOpen = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.sort = initialState.sort;
      state.page = 1;
    },
    setAllFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
  },
});

export const {
  setTransactionType,
  setQuery,
  setCategoryId,
  setCantonId,
  setCityId,
  setPriceRange,
  setRoomsRange,
  setSurfaceRange,
  toggleAmenity,
  setAmenities,
  setSort,
  setPage,
  setLimit,
  toggleFiltersPanel,
  setFiltersOpen,
  resetFilters,
  setAllFilters,
} = searchSlice.actions;

export default searchSlice.reducer;
