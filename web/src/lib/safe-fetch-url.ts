import { promises as dns } from "dns";
import { isIP } from "net";

function isPrivateOrLoopback(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 127 || // loopback
      a === 10 || // private
      (a === 172 && b >= 16 && b <= 31) || // private
      (a === 192 && b === 168) || // private
      (a === 169 && b === 254) || // link-local
      a === 0
    );
  }
  // IPv6: loopback (::1), unique local (fc00::/7), link-local (fe80::/10)
  const lower = ip.toLowerCase();
  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
}

/** Rejects non-http(s) URLs and anything resolving to a private/loopback address, to avoid the
 * server being used as an SSRF proxy into internal services via a user-pasted link. */
export async function assertSafeUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http/https links are supported");
  }
  if (url.hostname === "localhost") {
    throw new Error("That URL points at a local/internal address");
  }

  const { address } = await dns.lookup(url.hostname);
  if (isPrivateOrLoopback(address)) {
    throw new Error("That URL points at a local/internal address");
  }

  return url;
}
