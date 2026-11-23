const lastRun = new Map();
const chains = new Map();

/**
 * Serialises calls per external provider and keeps them below that provider's
 * documented request rate. OSMF Nominatim's public API allows at most 1 req/s.
 */
export function schedule(provider, minIntervalMs, task) {
  const previous = chains.get(provider) ?? Promise.resolve();
  const next = previous.then(async () => {
    const elapsed = Date.now() - (lastRun.get(provider) ?? 0);
    const wait = Math.max(0, minIntervalMs - elapsed);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRun.set(provider, Date.now());
    return task();
  });
  chains.set(
    provider,
    next.catch(() => undefined),
  );
  return next;
}
