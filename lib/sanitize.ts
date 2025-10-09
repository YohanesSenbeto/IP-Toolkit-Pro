import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

/**
 * HTML sanitization with a conservative whitelist suitable for rich-text fields.
 */
export function sanitizeHTML(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'b','strong','i','em','u','p','br','ul','ol','li','code','pre','blockquote','h1','h2','h3','h4','h5','h6','span','a'
    ],
    allowedAttributes: {
      a: ['href','title','target','rel'],
      span: ['class']
    },
    allowedSchemes: ['http','https','mailto'],
    transformTags: {
      'a': sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
    },
    // Disallow unknown protocols like javascript:
    allowProtocolRelative: false,
    enforceHtmlBoundary: true
  });
}

/**
 * Plain text sanitization: trims, normalizes whitespace, removes control chars.
 */
export function sanitizePlain(input: unknown, opts: { maxLength?: number } = {}): string {
  const { maxLength = 500 } = opts;
  if (typeof input !== 'string') return '';
  let value = input.replace(/[\u0000-\u001F\u007F]/g, '');
  value = value.trim().replace(/\s+/g, ' ');
  if (value.length > maxLength) value = value.slice(0, maxLength);
  return value;
}

/**
 * Deep sanitize object based on a Zod schema and per-field strategies.
 */
export function sanitizeObject<T extends z.ZodRawShape>(schema: z.ZodObject<T>, data: unknown, strategies: Record<string, 'plain' | 'html'> = {}) {
  const parsed = schema.parse(data);
  const result: any = {};
  for (const key of Object.keys(parsed)) {
    const val: any = (parsed as any)[key];
    if (val == null) { result[key] = val; continue; }
    const strategy = strategies[key];
    if (strategy === 'html') {
      result[key] = sanitizeHTML(String(val));
    } else if (strategy === 'plain') {
      result[key] = sanitizePlain(val);
    } else if (typeof val === 'string') {
      result[key] = sanitizePlain(val);
    } else {
      result[key] = val;
    }
  }
  return result as z.infer<typeof schema>;
}

/**
 * Utility to strictly pick allowed keys from an object (defense vs mass assignment).
 */
export function pickAllowed<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out: Partial<Pick<T, K>> = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      (out as any)[k] = (obj as any)[k];
    }
  }
  return out as Pick<T, K>;
}
