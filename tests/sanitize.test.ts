import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizePlain } from '@/lib/sanitize';

describe('sanitize utilities', () => {
  it('strips script tags', () => {
    const dirty = '<p>Hello</p><script>alert(1)</script>';
    const clean = sanitizeHTML(dirty);
    expect(clean).toContain('<p>Hello</p>');
    expect(clean).not.toContain('<script>');
  });

  it('allows basic formatting tags', () => {
    const dirty = '<strong>Bold</strong> and <em>italic</em>';
    const clean = sanitizeHTML(dirty);
    expect(clean).toContain('<strong>Bold</strong>');
    expect(clean).toContain('<em>italic</em>');
  });

  it('sanitizePlain trims and normalizes whitespace', () => {
    const dirty = '  Hello   World  ';
    expect(sanitizePlain(dirty)).toBe('Hello World');
  });
});
