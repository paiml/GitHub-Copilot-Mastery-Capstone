// Structured logging utility
export interface LogContext {
  [key: string]: unknown;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private log(level: string, message: string, meta?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...meta,
    };
    console.log(JSON.stringify(logEntry));
  }

  info(message: string, meta?: LogContext) {
    this.log("INFO", message, meta);
  }

  warn(message: string, meta?: LogContext) {
    this.log("WARN", message, meta);
  }

  error(message: string, error?: Error, meta?: LogContext) {
    this.log("ERROR", message, {
      ...meta,
      error: error?.message,
      stack: error?.stack,
    });
  }

  debug(message: string, meta?: LogContext) {
    this.log("DEBUG", message, meta);
  }

  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }
}

export const logger = new Logger();
