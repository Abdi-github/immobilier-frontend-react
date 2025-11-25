/**
 * cn() utility tests — Tailwind CSS class merge
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/shared/lib/utils';

describe('cn', () => {
  it('merges class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });

  it('handles arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('p-4', 'p-6');
    expect(result).toBe('p-6');
  });

  it('resolves color conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('handles undefined and null values', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('handles object notation', () => {
    const result = cn({ hidden: false, block: true, 'text-red-500': true });
    expect(result).toContain('block');
    expect(result).toContain('text-red-500');
    expect(result).not.toContain('hidden');
  });
});
