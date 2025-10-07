import { randomUUID } from 'crypto';

export function getRequestId(headers: Headers): string {
  return headers.get('x-request-id') || randomUUID();
}
