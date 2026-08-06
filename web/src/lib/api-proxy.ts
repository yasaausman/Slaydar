import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

async function forward(path: string, init?: RequestInit) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API_BASE_URL is not configured" }, { status: 500 });
  }
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  const data = await res.json();
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
