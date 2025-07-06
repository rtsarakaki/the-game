// Logger utility with log levels and .env configuration

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warning: 30,
  error: 40,
  fatal: 50,
};

// Read log level from environment variable, default to 'info'
const envLogLevel =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_LOG_LEVEL
    ? process.env.NEXT_PUBLIC_LOG_LEVEL.toLowerCase()
    : 'debug';

const currentLevel: LogLevel =
  envLogLevel in LOG_LEVELS ? (envLogLevel as LogLevel) : 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, ...args: unknown[]): unknown[] {
  const prefix = `[${level.toUpperCase()}]`;
  return [prefix, message, ...args];
}

export const logger = {
  debug(message: string, ...args: unknown[]) {
    if (shouldLog('debug')) {
       
      console.debug(...formatMessage('debug', message, ...args));
    }
  },
  info(message: string, ...args: unknown[]) {
    if (shouldLog('info')) {
       
      console.info(...formatMessage('info', message, ...args));
    }
  },
  warning(message: string, ...args: unknown[]) {
    if (shouldLog('warning')) {
       
      console.warn(...formatMessage('warning', message, ...args));
    }
  },
  error(message: string, ...args: unknown[]) {
    if (shouldLog('error')) {
       
      console.error(...formatMessage('error', message, ...args));
    }
  },
  fatal(message: string, ...args: unknown[]) {
    if (shouldLog('fatal')) {
       
      console.error(...formatMessage('fatal', message, ...args));
    }
  },
};

/**
 * Usage:
 * logger.debug('Some debug message', variable1, variable2);
 * logger.info('Some info message');
 * logger.warning('Some warning');
 * logger.error('Some error', errorObj);
 * logger.fatal('Fatal error', errorObj);
 *
 * Set NEXT_PUBLIC_LOG_LEVEL in .env to control log output (debug, info, warning, error, fatal)
 */ 