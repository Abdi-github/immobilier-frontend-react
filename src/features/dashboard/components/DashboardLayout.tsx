/**
 * Dashboard Layout Component
 * Provides sidebar navigation and content area for user dashboard pages
 */

import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Settings,
  Heart,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  Home,
  Building2,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/auth.slice';
import { LanguageSwitcher } from '@/layouts/MainLayout/LanguageSwitcher';
import { useGetDashboardStatsQuery } from '../dashboard.api';
import type { DashboardNavItem } from '../dashboard.types';

// User types that can manage properties
const PROPERTY_MANAGER_TYPES = ['owner', 'agent', 'agency_admin', 'platform_admin', 'super_admin'];

// Navigation items
const getNavItems = (
  lang: string,
  counts?: { favorites: number; alerts: number },
  userType?: string
): DashboardNavItem[] => {
  const baseItems: DashboardNavItem[] = [
    {
      key: 'profile',
      label: 'dashboard.nav.profile',
      icon: User,
      path: `/${lang}/dashboard/profile`,
    },
    {
      key: 'favorites',
      label: 'dashboard.nav.favorites',
      icon: Heart,
      path: `/${lang}/dashboard/favorites`,
      badge: counts?.favorites,
    },
    {
      key: 'alerts',
      label: 'dashboard.nav.alerts',
      icon: Bell,
      path: `/${lang}/dashboard/alerts`,
      badge: counts?.alerts,
    },
    {
      key: 'inquiries',
      label: 'dashboard.nav.inquiries',
      icon: MessageSquare,
      path: `/${lang}/dashboard/inquiries`,
    },
  ];

  // Add property management items for owners, agents, agency admins
  if (userType && PROPERTY_MANAGER_TYPES.includes(userType)) {
    baseItems.push(
      {
        key: 'my-properties',
        label: 'dashboard.nav.myProperties',
        icon: Building2,
        path: `/${lang}/dashboard/properties`,
      },
      {
        key: 'create-property',
        label: 'dashboard.nav.createProperty',
        icon: Plus,
        path: `/${lang}/dashboard/properties/new`,
      }
    );
  }

  // Settings always at the end
  baseItems.push({
    key: 'settings',
    label: 'dashboard.nav.settings',
    icon: Settings,
    path: `/${lang}/dashboard/settings`,
  });

  return baseItems;
};

export function DashboardLayout() {
  const { t } = useTranslation('dashboard');
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const { data: stats } = useGetDashboardStatsQuery(undefined, {
    skip: !user,
  });

  const navItems = getNavItems(
    lang || 'en',
    {
      favorites: stats?.total_favorites ?? 0,
      alerts: stats?.active_alerts ?? 0,
    },
    user?.user_type
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate(`/${lang}/sign-in`);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const userInitials =
    user?.first_name && user?.last_name
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U';

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* User Info */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <li key={item.key}>
                <Link
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{t(item.label)}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant={isActive ? 'secondary' : 'default'}
                      className="h-5 min-w-5 px-1.5"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* Footer Actions */}
      <div className="p-4 space-y-2">
        <Link
          to={`/${lang}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>{t('dashboard.nav.backToSite')}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>{t('dashboard.nav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="flex h-16 items-center px-4 lg:px-8">
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to={`/${lang}`} className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">immobilier</span>
            <span>.ch</span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${lang}`)}
              className="hidden sm:flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('dashboard.nav.backToSite')}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:bg-white">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
