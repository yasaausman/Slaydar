import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return proxyPost(`/garments/${id}/transfer-owner`, body);
}
