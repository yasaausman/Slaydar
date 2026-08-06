import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyPost("/garments", body);
}
