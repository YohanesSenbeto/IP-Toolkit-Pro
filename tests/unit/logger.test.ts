import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, setLogLevel } from '@/lib/logger';

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => { /* noop */ });
    vi.spyOn(console, 'error').mockImplementation(() => { /* noop */ });
    vi.spyOn(console, 'warn').mockImplementation(() => { /* noop */ });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('respects log levels (info ignores debug)', () => {
    setLogLevel('info');
    const l = createLogger('test');
    l.debug('debug message');
    l.info('info message');
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('emits trace when level=trace', () => {
    setLogLevel('trace');
    const l = createLogger('deep');
    l.trace('hello');
    expect(logSpy).toHaveBeenCalled();
    const firstCallArg = logSpy.mock.calls[0][0];
    expect(firstCallArg).toContain('"level":"trace"');
  });

  it('namespaces child logger', () => {
    setLogLevel('debug');
    const root = createLogger('root');
    const child = root.child('sub');
    child.info('msg');
    const arg = logSpy.mock.calls[0][0];
    expect(arg).toContain('"namespace":"root:sub"');
  });
});
