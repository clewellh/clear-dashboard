// web/src/lib/log.ts

export function logError(error: unknown, context?: string) {
  // Keep it simple for now; later we can send to Sentry/Logtail.
  console.error('[CLEAR ERROR]', context ?? '', error);
}

export function logInfo(message: string, meta?: unknown) {
  console.log('[CLEAR]', message, meta ?? '');
}
