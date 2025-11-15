/**
 * Dashboard Feature Exports
 */

// Components
export { DashboardLayout } from './components/DashboardLayout';
export { CreateAlertForm } from './components/CreateAlertForm';

// Pages
export { ProfilePage } from './pages/ProfilePage';
export { AccountSettingsPage } from './pages/AccountSettingsPage';
export { FavoritesPage } from './pages/FavoritesPage';
export { AlertsPage } from './pages/AlertsPage';
export { InquiriesPage } from './pages/InquiriesPage';

// API
export {
  dashboardApi,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useCheckFavoriteQuery,
  useGetAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
  useToggleAlertMutation,
  useGetDashboardStatsQuery,
  useGetFavoriteIdsQuery,
  useGetMyInquiriesQuery,
} from './dashboard.api';

// Types
export type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationPreferences,
  UserSettings,
  Favorite,
  PropertyAlert,
  AlertFilters,
  CreateAlertRequest,
  UpdateAlertRequest,
  DashboardStats,
  DashboardNavItem,
  Inquiry,
} from './dashboard.types';
