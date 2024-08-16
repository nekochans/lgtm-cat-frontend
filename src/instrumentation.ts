export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // eslint-disable-next-line import/extensions
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // eslint-disable-next-line import/extensions
    await import('../sentry.edge.config');
  }
}
