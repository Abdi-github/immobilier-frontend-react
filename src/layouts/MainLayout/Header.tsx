import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  User,
  Heart,
  Bell,
  Search,
  LogOut,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMobileMenuOpen } from '@/shared/state/ui.slice';
import { logout } from '@/features/auth/auth.slice';
import { useLogoutMutation } from '@/features/auth/auth.api';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/shared/lib/utils';

export function Header() {
  const { t, i18n } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { mobileMenuOpen } = useAppSelector((state) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const lang = i18n.language;
  const location = useLocation();
  const [logoutMutation] = useLogoutMutation();

  const toggleMobileMenu = () => {
    dispatch(setMobileMenuOpen(!mobileMenuOpen));
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Still logout on client side even if API fails
    }
    dispatch(logout());
  };

  // Navigation items - matching immobilier.ch
  const navItems = [
    {
      key: 'residential',
      label: t('navigation.residential', 'Residential'),
      href: `/${lang}/properties?section=residential`,
    },
    {
      key: 'commercial',
      label: t('navigation.commercial', 'Commercial'),
      href: `/${lang}/properties?section=commercial`,
    },
    { key: 'agencies', label: t('navigation.agencies', 'Agencies'), href: `/${lang}/agencies` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo - matching immobilier.ch style */}
        <Link to={`/${lang}`} className="flex shrink-0 items-center">
          <svg width="160" height="32" viewBox="0 0 160 32" className="h-8">
            <text
              x="0"
              y="24"
              className="fill-[#1a1a2e] text-xl font-bold"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              immobilier
            </text>
            <text
              x="95"
              y="24"
              className="fill-primary text-xl font-bold"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              .ch
            </text>
          </svg>
        </Link>

        {/* Center Navigation - main nav items like immobilier.ch */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors hover:text-primary',
                location.pathname.includes(item.key) || location.search.includes(item.key)
                  ? 'text-primary'
                  : 'text-gray-700'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Search icon */}
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link to={`/${lang}/properties`}>
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {/* Favorites */}
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link to={isAuthenticated ? `/${lang}/dashboard/favorites` : `/${lang}/sign-in`}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>

          {/* Alerts */}
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link to={isAuthenticated ? `/${lang}/dashboard/alerts` : `/${lang}/sign-in`}>
              <Bell className="h-5 w-5" />
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isAuthenticated && user ? (
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.first_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated && user ? (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${lang}/dashboard`} className="w-full cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('navigation.dashboard', 'Dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${lang}/dashboard/profile`} className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {t('navigation.profile', 'My Profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${lang}/dashboard/favorites`} className="w-full cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      {t('navigation.favorites')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${lang}/dashboard/alerts`} className="w-full cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      {t('navigation.alerts')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${lang}/dashboard/settings`} className="w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('navigation.settings', 'Settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('navigation.logout', 'Log out')}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to={`/${lang}/sign-in`} className="w-full cursor-pointer">
                      {t('navigation.login', 'Log in')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${lang}/create-an-account`} className="w-full cursor-pointer">
                      {t('navigation.register', 'Register')}
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'overflow-hidden border-t bg-white md:hidden transition-all duration-200',
          mobileMenuOpen ? 'max-h-[400px]' : 'max-h-0'
        )}
      >
        <nav className="container mx-auto flex flex-col px-4 py-4">
          <Link
            to={`/${lang}/properties?section=residential`}
            className="py-3 text-sm font-medium border-b border-gray-100"
            onClick={toggleMobileMenu}
          >
            {t('navigation.residential', 'Residential')}
          </Link>
          <Link
            to={`/${lang}/properties?section=commercial`}
            className="py-3 text-sm font-medium border-b border-gray-100"
            onClick={toggleMobileMenu}
          >
            {t('navigation.commercial', 'Commercial')}
          </Link>
          <Link
            to={`/${lang}/agencies`}
            className="py-3 text-sm font-medium border-b border-gray-100"
            onClick={toggleMobileMenu}
          >
            {t('navigation.agencies')}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={`/${lang}/dashboard`}
                className="py-3 text-sm font-medium border-b border-gray-100 flex items-center gap-2"
                onClick={toggleMobileMenu}
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('navigation.dashboard', 'Dashboard')}
              </Link>
              <Link
                to={`/${lang}/dashboard/favorites`}
                className="py-3 text-sm font-medium border-b border-gray-100 flex items-center gap-2"
                onClick={toggleMobileMenu}
              >
                <Heart className="h-4 w-4" />
                {t('navigation.favorites')}
              </Link>
              <Link
                to={`/${lang}/dashboard/alerts`}
                className="py-3 text-sm font-medium flex items-center gap-2"
                onClick={toggleMobileMenu}
              >
                <Bell className="h-4 w-4" />
                {t('navigation.alerts')}
              </Link>
            </>
          ) : (
            <Link
              to={`/${lang}/sign-in`}
              className="py-3 text-sm font-medium flex items-center gap-2"
              onClick={toggleMobileMenu}
            >
              <User className="h-4 w-4" />
              {t('navigation.login', 'Log in')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
