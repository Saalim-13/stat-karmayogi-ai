const TOKEN_KEY = "stat-karmayogi-access-token";
const USER_KEY = "stat-karmayogi-auth-user";

export type AuthUser = { id: string; name: string; role_id: string; role: string; preferred_language: string };
export function saveSession(token: string, user: AuthUser) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function token() { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY); }
export function currentUser(): AuthUser | null { if (typeof window === "undefined") return null; try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) as AuthUser : null; } catch { return null; } }
export function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
