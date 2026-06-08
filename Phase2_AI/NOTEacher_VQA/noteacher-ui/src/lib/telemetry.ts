// src/lib/telemetry.ts

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface TelemetryEvent {
  eventId: string;
  timestamp: string;
  level: LogLevel;
  subsystem: 'FRONTEND_UI' | 'WEB_WORKER' | 'ONNX_ENGINE' | 'SUPABASE_DB';
  message: string;
  metadata?: Record<string, any>;
}

class TelemetryEngine {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'production';
    this.setupGlobalInterceptors();
  }

  // 1. STANDARDIZED LOGGING FORMAT
  public log(
    level: LogLevel,
    subsystem: TelemetryEvent['subsystem'],
    message: string,
    metadata?: Record<string, any>
  ): TelemetryEvent {
    const event: TelemetryEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      subsystem,
      message,
      metadata: {
        ...metadata,
        env: this.environment,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      },
    };

    // In a live production configuration, you stream this JSON block to an 
    // aggregation service like Sentry, Logflare, or Datadog via an asynchronous HTTP POST.
    if (this.environment === 'development') {
      const format = `[${event.timestamp}] [${level}] [${subsystem}] -> ${message}`;
      if (level === 'ERROR' || level === 'CRITICAL') console.error(format, metadata);
      else if (level === 'WARN') console.warn(format, metadata);
      else console.log(format);
    }

    return event;
  }

  // 2. AUTOMATIC UNHANDLED EXCEPTION TRAPPING
  private setupGlobalInterceptors() {
    if (typeof window === 'undefined') return;

    // Capture unhandled javascript runtime exceptions
    window.addEventListener('error', (event) => {
      this.log('CRITICAL', 'FRONTEND_UI', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Capture unhandled async promise rejections (e.g., failed network fetches)
    window.addEventListener('unhandledrejection', (event) => {
      this.log('ERROR', 'FRONTEND_UI', 'Unhandled Promise Rejection', {
        reason: String(event.reason),
      });
    });
  }
}

export const telemetry = new TelemetryEngine();