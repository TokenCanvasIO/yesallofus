/**
 * Safe sessionStorage wrapper that handles:
 * - Safari private browsing (throws on access)
 * - Storage quota exceeded
 * - SSR (no window object)
 * - Any other storage errors
 */

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    window.sessionStorage.setItem(test, test);
    window.sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Cache the availability check
let storageAvailable: boolean | null = null;

function checkStorage(): boolean {
  if (storageAvailable === null) {
    storageAvailable = isStorageAvailable();
  }
  return storageAvailable;
}

// In-memory fallback for when sessionStorage is unavailable
const memoryStorage: Map<string, string> = new Map();

/**
 * Safely get an item from sessionStorage
 * Returns null if storage is unavailable or item doesn't exist
 */
export function safeGetItem(key: string): string | null {
  if (!checkStorage()) {
    return memoryStorage.get(key) ?? null;
  }
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

/**
 * Safely set an item in sessionStorage
 * Silently falls back to memory storage if unavailable
 */
export function safeSetItem(key: string, value: string): void {
  if (!checkStorage()) {
    memoryStorage.set(key, value);
    return;
  }
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Fallback to memory storage (e.g., quota exceeded)
    memoryStorage.set(key, value);
  }
}

/**
 * Safely remove an item from sessionStorage
 */
export function safeRemoveItem(key: string): void {
  memoryStorage.delete(key);
  if (!checkStorage()) return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

/**
 * Safely clear all sessionStorage
 */
export function safeClear(): void {
  memoryStorage.clear();
  if (!checkStorage()) return;
  try {
    window.sessionStorage.clear();
  } catch {
    // Ignore errors
  }
}

/**
 * Get and parse JSON from sessionStorage
 * Returns null if parsing fails or item doesn't exist
 */
export function safeGetJSON<T>(key: string): T | null {
  const value = safeGetItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Stringify and set JSON to sessionStorage
 */
export function safeSetJSON(key: string, value: unknown): void {
  try {
    safeSetItem(key, JSON.stringify(value));
  } catch {
    // JSON stringify failed - ignore
  }
}
