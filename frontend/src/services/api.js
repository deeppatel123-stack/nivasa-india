import { authToken } from './authToken';

const configuredBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, options = {}) {
  let response;
  const token = authToken.get();
  try {
    response = await fetch(`${configuredBase}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Could not reach the Nivasa API. Check your connection and try again.', 0);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) authToken.clear();
    throw new ApiError(
      payload?.error || `Request failed with status ${response.status}`,
      response.status,
      payload?.details,
    );
  }
  return payload;
}

export const apiBaseUrl = configuredBase;
