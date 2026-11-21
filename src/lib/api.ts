"use client";
import { API_URL } from "./constants";
import { authClient } from "./auth-client";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

let cached: { token: string; exp: number } | null = null;

/** Get a short-lived Better Auth JWT (cached in memory until ~1 minute before expiry) */
async function getToken(force = false): Promise<string | null> {
  if (!force && cached && cached.exp - 60_000 > Date.now()) return cached.token;
  const { data } = await authClient.token();
  if (!data?.token) return null;
  try {
    const payload = JSON.parse(atob(data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    cached = { token: data.token, exp: payload.exp * 1000 };
  } catch {
    cached = { token: data.token, exp: Date.now() + 5 * 60_000 };
  }
  return data.token;
}

export function clearTokenCache() {
  cached = null;
}

type Options = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean };

/** fetch wrapper for the Express API. Sends "Authorization: Bearer <jwt>" for private routes. */
export async function api<T = unknown>(path: string, { body, auth = true, headers, ...init }: Options = {}): Promise<T> {
  const doFetch = async (force = false) => {
    const token = auth ? await getToken(force) : null;
    if (auth && !token) throw new ApiError(401, "Please sign in to continue");
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res: Response;
  try {
    res = await doFetch();
    // token may have expired between cache check and request - retry once with a fresh token
    if (res.status === 401 && auth) res = await doFetch(true);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.message ?? `Request failed (${res.status})`);
  return json as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

/** Upload an image to ImgBB through our own Next.js route (the API key stays on the server) */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5 MB");
  const form = new FormData();
  form.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.message ?? "Image upload failed");
  return json.url as string;
}
