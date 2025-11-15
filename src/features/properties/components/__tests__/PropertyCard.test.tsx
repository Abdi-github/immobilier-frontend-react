/**
 * PropertyCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import type { Property } from '@/features/properties/properties.types';
import '@/i18n';

const mockProperty: Property = {
  id: 'prop-1',
  title: 'Beautiful Apartment',
  description: 'A wonderful place to live',
  price: 2500,
  currency: 'CHF',
  additional_costs: 200,
  rooms: 3.5,
  surface: 95,
  address: 'Bahnhofstrasse 10',
  transaction_type: 'rent',
  status: 'PUBLISHED',
  category: {
    id: 'cat-1',
    name: { en: 'Apartment', fr: 'Appartement', de: 'Wohnung', it: 'Appartamento' },
    slug: 'apartment',
    section: 'residential',
    is_active: true,
  },
  city: {
    id: 'city-1',
    name: { en: 'Zurich', fr: 'Zurich', de: 'Zürich', it: 'Zurigo' },
  },
  canton: {
    id: 'canton-1',
    name: { en: 'Zurich', fr: 'Zurich', de: 'Zürich', it: 'Zurigo' },
    code: 'ZH',
  },
  images: [
    {
      id: 'img-1',
      property_id: 'prop-1',
      url: 'https://example.com/image.jpg',
      is_primary: true,
      order: 0,
    },
    {
      id: 'img-2',
      property_id: 'prop-1',
      url: 'https://example.com/image2.jpg',
      is_primary: false,
      order: 1,
    },
  ],
  amenities: [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('PropertyCard', () => {
  it('renders property price in Swiss format', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    // CHF 2'500.- or similar Swiss format
    expect(screen.getByText(/CHF/)).toBeInTheDocument();
    expect(screen.getByText(/2.*500/)).toBeInTheDocument();
  });

  it('shows /month for rental properties', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    expect(screen.getByText(/\/month/)).toBeInTheDocument();
  });

  it('does not show /month for buy properties', () => {
    const buyProperty = { ...mockProperty, transaction_type: 'buy' as const };
    renderWithProviders(<PropertyCard property={buyProperty} />);
    expect(screen.queryByText(/\/month/)).not.toBeInTheDocument();
  });

  it('renders property image', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    const img = screen.getByAltText('Beautiful Apartment');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows image count when multiple images', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('renders city and address', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    expect(screen.getByText(/Zurich/)).toBeInTheDocument();
    expect(screen.getByText(/Bahnhofstrasse 10/)).toBeInTheDocument();
  });

  it('renders rooms count', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('3.5')).toBeInTheDocument();
  });

  it('renders surface', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('95 m²')).toBeInTheDocument();
  });

  it('renders additional costs', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    expect(screen.getByText(/\+200.*costs/)).toBeInTheDocument();
  });

  it('calls onFavorite when favorite button is clicked', async () => {
    const onFavorite = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<PropertyCard property={mockProperty} onFavorite={onFavorite} />);

    const favButton = screen.getByRole('button');
    await user.click(favButton);
    expect(onFavorite).toHaveBeenCalledWith('prop-1');
  });

  it('shows NEW badge when isNew is true', () => {
    renderWithProviders(<PropertyCard property={mockProperty} isNew />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('shows TOP badge when isTop is true', () => {
    renderWithProviders(<PropertyCard property={mockProperty} isTop />);
    expect(screen.getByText('TOP')).toBeInTheDocument();
  });

  it('does not show badges by default', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    expect(screen.queryByText('TOP')).not.toBeInTheDocument();
  });

  it('shows "Price on request" when price is missing', () => {
    const noPrice = { ...mockProperty, price: undefined };
    renderWithProviders(<PropertyCard property={noPrice as Property} />);
    expect(screen.getByText(/Price on request/)).toBeInTheDocument();
  });

  it('renders link to property detail page', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);
    const links = screen.getAllByRole('link');
    const detailLink = links.find((l) => l.getAttribute('href')?.includes('/properties/prop-1'));
    expect(detailLink).toBeInTheDocument();
  });

  it('applies list variant classes when variant is list', () => {
    const { container } = renderWithProviders(
      <PropertyCard property={mockProperty} variant="list" />
    );
    const article = container.querySelector('article');
    expect(article?.className).toContain('flex-row');
  });
});
