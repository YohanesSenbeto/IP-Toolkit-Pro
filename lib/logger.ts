/**
 * Minimal structured logger.
 * Provides level-based logging with consistent JSON shape.
 */
import util from 'util';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

interface LogRecordBase {
  level: LogLevel;
  time: string; // ISO timestamp
  msg: string;
  namespace?: string;
  [key: string]: any; // extra meta
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 60
};

let currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= 0 && LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel] && currentLevel !== 'silent';
}

function format(record: LogRecordBase): string {
  return JSON.stringify(record);
}

function base(namespace?: string) {
  return function log(level: LogLevel, msg: any, meta?: Record<string, any>) {
    if (!shouldLog(level)) return;
    const record: LogRecordBase = {
      level,
      time: new Date().toISOString(),
      msg: typeof msg === 'string' ? msg : util.inspect(msg, { depth: 4 }),
      namespace,
      ...meta,
    };
    // Map level to console method
    const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    (console as any)[method](format(record));
  };
}

export interface Logger {
  trace: (msg: any, meta?: Record<string, any>) => void;
  debug: (msg: any, meta?: Record<string, any>) => void;
  info: (msg: any, meta?: Record<string, any>) => void;
  warn: (msg: any, meta?: Record<string, any>) => void;
  error: (msg: any, meta?: Record<string, any>) => void;
  child: (ns: string) => Logger;
}

export function createLogger(namespace?: string): Logger {
  const logFn = base(namespace);
  return {
    trace: (m, meta) => logFn('trace', m, meta),
    debug: (m, meta) => logFn('debug', m, meta),
    info: (m, meta) => logFn('info', m, meta),
    warn: (m, meta) => logFn('warn', m, meta),
    error: (m, meta) => logFn('error', m, meta),
    child: (ns: string) => createLogger(namespace ? `${namespace}:${ns}` : ns)
  };
}

export const logger = createLogger();
