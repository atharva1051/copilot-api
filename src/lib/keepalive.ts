const KEEPALIVE_INTERVAL_MS = 5000

/** Calls `write` on an interval so idle streams are not closed. Returns a stop function. */
export const startKeepAlive = (
  write: () => Promise<unknown>,
  intervalMs: number = KEEPALIVE_INTERVAL_MS,
): (() => void) => {
  const timer = setInterval(() => {
    write().catch(() => {
      clearInterval(timer)
    })
  }, intervalMs)
  return () => {
    clearInterval(timer)
  }
}
