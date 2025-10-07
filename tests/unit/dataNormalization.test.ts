import { describe, it, expect } from 'vitest';
import { resolveFirst, formatCidr, dashIfEmpty, localeNumber } from '@/app/tools/wan-ip-analyzer/components/dataNormalization';

describe('dataNormalization utilities', () => {
  it('resolveFirst returns first non-empty match across sources and keys', () => {
    const a = { foo: undefined };
    const b = { bar: '', baz: 0 };
    const c = { foo: 'valueX' };
    expect(resolveFirst([a, b, c], ['foo', 'bar', 'baz'])).toBe('valueX');
  });

  it('formatCidr handles numbers and zero', () => {
    expect(formatCidr(24)).toBe('/24');
    expect(formatCidr(0)).toBe('/0');
    expect(formatCidr(undefined)).toBeUndefined();
  });

  it('dashIfEmpty converts undefined/null/empty to em dash but preserves 0', () => {
    expect(dashIfEmpty(undefined)).toBe('—');
    expect(dashIfEmpty(null)).toBe('—');
    expect(dashIfEmpty('')).toBe('—');
    expect(dashIfEmpty(0)).toBe(0);
    expect(dashIfEmpty('abc')).toBe('abc');
  });

  it('localeNumber formats numbers and falls back for undefined', () => {
    expect(localeNumber(undefined)).toBe('—');
    expect(localeNumber(1234)).toBe('1,234');
    expect(localeNumber('raw')).toBe('raw');
  });
});
