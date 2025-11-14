/**
 * LanguageSwitcher Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { LanguageSwitcher } from '@/layouts/MainLayout/LanguageSwitcher';
import '@/i18n';

// Mock i18next changeLanguage
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...(actual as Record<string, unknown>),
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        changeLanguage: vi.fn(),
        language: 'en',
      },
    }),
  };
});

describe('LanguageSwitcher', () => {
  it('renders the language trigger button', () => {
    renderWithProviders(<LanguageSwitcher />);
    // Should show current language code in trigger
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/EN/)).toBeInTheDocument();
  });

  it('shows all 4 language options when opened', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    // Click the trigger button
    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Should show all 4 menu items
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(4);

    // Verify language names appear (flag + name are in same span)
    expect(screen.getByText(/English/)).toBeInTheDocument();
    expect(screen.getByText(/Français/)).toBeInTheDocument();
    expect(screen.getByText(/Deutsch/)).toBeInTheDocument();
    expect(screen.getByText(/Italiano/)).toBeInTheDocument();
  });

  it('shows language flags', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Flags are rendered (use getAllByText since flag appears in trigger + menu)
    expect(screen.getAllByText(/🇬🇧/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/🇫🇷/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/🇩🇪/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/🇮🇹/).length).toBeGreaterThanOrEqual(1);
  });

  it('dispatches setLanguage when a language is selected', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<LanguageSwitcher />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Click French menu item
    const frOption = screen.getByText(/Français/);
    await user.click(frOption);

    expect(store.getState().language.current).toBe('fr');
  });
});
