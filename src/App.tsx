import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/shared/components/ui/sonner';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/features/home/pages/HomePage';
import { PropertiesPage } from '@/features/properties/pages/PropertiesPage';
import { PropertyDetailPage } from '@/features/properties/pages/PropertyDetailPage';
import { AgenciesPage } from '@/features/agencies/pages/AgenciesPage';
import {
  SignInPage,
  RegisterPage,
  RegistrationPendingPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/features/auth';
import {
  DashboardLayout,
  ProfilePage,
  AccountSettingsPage,
  FavoritesPage as DashboardFavoritesPage,
  AlertsPage as DashboardAlertsPage,
  InquiriesPage,
} from '@/features/dashboard';
import {
  CreatePropertyPage,
  EditPropertyPage,
  MyPropertiesPage,
} from '@/features/property-management';
import { AboutPage, ContactPage, TermsPage, PrivacyPage, NewsletterPage } from '@/features/static';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleGuardedRoute } from '@/routes/RoleGuardedRoute';
import { NotFoundPage } from '@/features/shared/pages/NotFoundPage';
import { AgencyDetailPage } from '@/features/agencies/pages/AgencyDetailPage';
import { useAppSelector } from '@/app/hooks';

function App() {
  const currentLanguage = useAppSelector((state) => state.language.current);

  return (
    <>
      <Routes>
        {/* Redirect root to default language */}
        <Route path="/" element={<Navigate to={`/${currentLanguage}`} replace />} />

        {/* Language-prefixed routes */}
        <Route path="/:lang" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/:id" element={<PropertyDetailPage />} />
          <Route path="agencies" element={<AgenciesPage />} />
          <Route path="agencies/:id" element={<AgencyDetailPage />} />
          {/* Static pages */}
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dashboard routes (protected) */}
        <Route
          path="/:lang/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="favorites" element={<DashboardFavoritesPage />} />
          <Route path="alerts" element={<DashboardAlertsPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route
            path="properties"
            element={
              <RoleGuardedRoute
                allowedTypes={['owner', 'agent', 'agency_admin', 'platform_admin', 'super_admin']}
              >
                <MyPropertiesPage />
              </RoleGuardedRoute>
            }
          />
          <Route
            path="properties/new"
            element={
              <RoleGuardedRoute
                allowedTypes={['owner', 'agent', 'agency_admin', 'platform_admin', 'super_admin']}
              >
                <CreatePropertyPage />
              </RoleGuardedRoute>
            }
          />
          <Route
            path="properties/:id/edit"
            element={
              <RoleGuardedRoute
                allowedTypes={['owner', 'agent', 'agency_admin', 'platform_admin', 'super_admin']}
              >
                <EditPropertyPage />
              </RoleGuardedRoute>
            }
          />
        </Route>

        {/* Auth routes (without MainLayout - they have their own layout) */}
        <Route path="/:lang/sign-in" element={<SignInPage />} />
        <Route path="/:lang/create-an-account" element={<RegisterPage />} />
        <Route path="/:lang/registration-pending" element={<RegistrationPendingPage />} />
        <Route path="/:lang/reset-password" element={<ResetPasswordPage />} />
        <Route path="/:lang/verify-email" element={<VerifyEmailPage />} />

        {/* Fallback for non-language routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
