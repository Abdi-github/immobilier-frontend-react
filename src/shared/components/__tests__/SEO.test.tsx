/**
 * SEO Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { SEO } from '@/shared/components/SEO';
import { createTestStore } from '@/test/test-utils';
import '@/i18n';

function renderSEO(props: React.ComponentProps<typeof SEO>) {
  const store = createTestStore();
  const helmetContext = {} as { helmet?: { title?: { toString: () => string } } };
  const result = render(
    <Provider store={store}>
      <MemoryRouter>
        <HelmetProvider context={helmetContext}>
          <SEO {...props} />
        </HelmetProvider>
      </MemoryRouter>
    </Provider>
  );
  return { ...result, helmetContext };
}

describe('SEO', () => {
  it('renders with default title', async () => {
    renderSEO({});
    await waitFor(() => {
      expect(document.title).toBe('Immobilier.ch');
    });
  });

  it('appends page title to site name', async () => {
    renderSEO({ title: 'Properties' });
    await waitFor(() => {
      expect(document.title).toBe('Properties | Immobilier.ch');
    });
  });

  it('uses full title override when provided', async () => {
    renderSEO({ titleFull: 'My Custom Title' });
    await waitFor(() => {
      expect(document.title).toBe('My Custom Title');
    });
  });

  it('sets meta description', async () => {
    renderSEO({ description: 'Test description' });
    await waitFor(() => {
      const meta = document.querySelector('meta[name="description"]');
      expect(meta?.getAttribute('content')).toBe('Test description');
    });
  });

  it('sets noindex when specified', async () => {
    renderSEO({ noindex: true });
    await waitFor(() => {
      const meta = document.querySelector('meta[name="robots"]');
      expect(meta?.getAttribute('content')).toBe('noindex, nofollow');
    });
  });
});
