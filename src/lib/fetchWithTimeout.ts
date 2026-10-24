export function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 3000) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
