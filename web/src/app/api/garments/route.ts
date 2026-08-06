import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(req: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: "API_BASE_URL is not configured" }, { status: 500 });
  }

  const body = await req.json();

  const res = await fetch(`${API_BASE_URL}/garments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
