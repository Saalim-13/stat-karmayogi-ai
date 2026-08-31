import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { token } from "@/lib/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = token();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
