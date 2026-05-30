/**
 * Token + user helpers — thin wrappers around localStorage.
 * Always guard with typeof window check for SSR safety.
 */

const TOKEN_KEY = "ns_token";
const USER_KEY = "ns_user";

export function setToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function setUser(user: object): void {
  if (typeof window !== "undefined")
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
