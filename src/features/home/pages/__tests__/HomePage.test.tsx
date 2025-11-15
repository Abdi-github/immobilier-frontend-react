/**
 * HomePage Tests
 * Verifies all homepage sections render correctly
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import '@/i18n';

// Mock child components to isolate HomePage structure
vi.mock('@/features/home/components/HeroSearch', () => ({
  HeroSearch: () => <div data-testid="hero-search">HeroSearch</div>,
}));

vi.mock('@/features/home/components/CityListings', () => ({
  CityListings: () => <div data-testid="city-listings">CityListings</div>,
}));

vi.mock('@/features/home/components/BuyOrRentSection', () => ({
  BuyOrRentSection: () => <div data-testid="buy-or-rent">BuyOrRentSection</div>,
}));

vi.mock('@/features/home/components/FeaturedProperties', () => ({
  FeaturedProperties: () => <div data-testid="featured-properties">FeaturedProperties</div>,
}));

vi.mock('@/shared/components/SEO', () => ({
  SEO: () => null,
}));

// Import after mocks
import { HomePage } from '@/features/home/pages/HomePage';

describe('HomePage', () => {
  it('renders all main sections', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByTestId('hero-search')).toBeInTheDocument();
    expect(screen.getByTestId('city-listings')).toBeInTheDocument();
    expect(screen.getByTestId('buy-or-rent')).toBeInTheDocument();
    expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
  });

  it('renders the info section with text', () => {
    renderWithProviders(<HomePage />);

    // Info section heading
    expect(screen.getByText(/keys to a successful real estate experience/i)).toBeInTheDocument();
  });

  it('renders info section paragraphs', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText(/Buying a house, renting an apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/Your dream home is waiting/i)).toBeInTheDocument();
  });

  it('renders in correct order: Hero → Cities → BuyOrRent → Featured → Info', () => {
    const { container } = renderWithProviders(<HomePage />);

    const sections = container.querySelectorAll('[data-testid], section');
    const testIds = Array.from(sections)
      .map((el) => el.getAttribute('data-testid'))
      .filter(Boolean);

    expect(testIds[0]).toBe('hero-search');
    expect(testIds[1]).toBe('city-listings');
    expect(testIds[2]).toBe('buy-or-rent');
    expect(testIds[3]).toBe('featured-properties');
  });
});
