// src/lib/telemetry.ts

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface TelemetryEvent {
  eventId: string;
  timestamp: string;
  level: LogLevel;
  subsystem: 'FRONTEND_UI' | 'WEB_WORKER' | 'ONNX_ENGINE' | 'SUPABASE_DB' | 'NETWORK' | 'AI_ENGINE';
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

    // In production, stream to Datadog/Sentry. In dev, print cleanly.
    if (this.environment === 'development') {
      const format = `[${event.timestamp}] [${level}] [${subsystem}] -> ${message}`;
      if (level === 'ERROR' || level === 'CRITICAL') console.error(format, metadata);
      else if (level === 'WARN') console.warn(format, metadata);
      else console.log(format);
    }

    return event;
  }

  // 2. DURATION METRICS TRACING (TTFT, Inter-Token Latency)
  public startTrace(traceName: string): string {
    const measureId = `${traceName}-${crypto.randomUUID()}`;
    if (typeof window !== 'undefined') {
      window.performance.mark(`${measureId}-start`);
    }
    return measureId;
  }

  public endTrace(
    measureId: string, 
    subsystem: TelemetryEvent['subsystem'], 
    metadata?: Record<string, any>
  ) {
    if (typeof window === 'undefined') return;
    
    const traceName = measureId.split('-')[0];
    const startMark = `${measureId}-start`;
    const endMark = `${measureId}-end`;

    window.performance.mark(endMark);
    
    try {
      const measure = window.performance.measure(measureId, startMark, endMark);
      const durationMs = measure.duration;

      this.log('INFO', subsystem, `Performance Trace: ${traceName} complete.`, {
        ...metadata,
        durationMs,
        traceType: 'DURATION'
      });
      
      window.performance.clearMarks(startMark);
      window.performance.clearMarks(endMark);
      window.performance.clearMeasures(measureId);
    } catch (e) {
      console.warn(`Telemetry: Failed to complete trace for ${measureId}`, e);
    }
  }

  // 3. AUTOMATIC UNHANDLED EXCEPTION TRAPPING
  private setupGlobalInterceptors() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.log('CRITICAL', 'FRONTEND_UI', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log('ERROR', 'FRONTEND_UI', 'Unhandled Promise Rejection', {
        reason: String(event.reason),
      });
    });
  }
}

export const telemetry = new TelemetryEngine();