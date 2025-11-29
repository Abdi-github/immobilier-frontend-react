/**
 * ErrorBoundary Tests
 */

import { describe, it, expect, vi, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Component that throws on purpose
function BrokenComponent(): JSX.Element {
  throw new Error('Test error');
}

function WorkingComponent() {
  return <div>Working content</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors in tests
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  afterAll(() => consoleSpy.mockRestore());

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child component throws', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  it('recovers when Try Again is clicked', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function ConditionallyBroken() {
      if (shouldThrow) {
        throw new Error('Conditional error');
      }
      return <div>Recovered!</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionallyBroken />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByText('Try Again'));

    expect(screen.getByText('Recovered!')).toBeInTheDocument();
  });
});
