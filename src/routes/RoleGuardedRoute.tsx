/**
 * Role-Guarded Route Component
 * Restricts access to specific user types
 * Redirects to dashboard home if user doesn't have the required role
 */

import { Navigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { UserType } from '@/features/auth/auth.types';

interface RoleGuardedRouteProps {
  children: React.ReactNode;
  allowedTypes: UserType[];
  /** Where to redirect if not allowed. Defaults to dashboard profile. */
  redirectTo?: string;
}

export function RoleGuardedRoute({ children, allowedTypes, redirectTo }: RoleGuardedRouteProps) {
  const { lang } = useParams<{ lang: string }>();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to={`/${lang || 'en'}/sign-in`} replace />;
  }

  if (!allowedTypes.includes(user.user_type)) {
    return <Navigate to={redirectTo || `/${lang || 'en'}/dashboard/profile`} replace />;
  }

  return <>{children}</>;
}
