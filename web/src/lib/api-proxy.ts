import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

async function forward(path: string, init?: RequestInit) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API_BASE_URL is not configured" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // ngrok free tier shows an HTML interstitial for browser-looking requests;
      // this header skips it so we always get real JSON back.
      headers: { "ngrok-skip-browser-warning": "true", ...(init?.headers ?? {}) },
    });
  } catch {
    return NextResponse.json({ error: "Backend is unreachable. Is the API tunnel up?" }, { status: 502 });
  }

  const data = await res.json().catch(() => ({ error: `Backend returned a non-JSON ${res.status} response` }));
  return NextResponse.json(data, { status: res.status });
}

export function proxyGet(path: string) {
  return forward(path);
}

export function proxyPost(path: string, body: unknown) {
  return forward(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
