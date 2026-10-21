import Anthropic from '@anthropic-ai/sdk';
import { tagImage, TaggingRefused } from '@/lib/tagging/claude';

/**
 * Demo tagging: uses the maintainer's key from server env so the hosted demo
 * works without one. Off unless NEXT_PUBLIC_DEMO_MODE=true. People running
 * their own copy paste a key in Settings instead; that path never hits this route.
 */

const LIMIT_PER_HOUR = 30;
/** Base64 of a ≤1000px JPEG is well under this. */
const MAX_IMAGE_BYTES = 1_500_000;
const HOUR_MS = 60 * 60 * 1000;

// In-memory, per server instance: a light brake on abuse, not a security boundary.
const requests = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requests.get(ip) ?? []).filter((t) => now - t < HOUR_MS);
  if (recent.length >= LIMIT_PER_HOUR) {
    requests.set(ip, recent);
    return true;
  }
  recent.push(now);
  requests.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true' || !apiKey) {
    return Response.json({ error: 'Demo tagging is not enabled on this server.' }, { status: 404 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) {
    return Response.json({ error: 'Demo tagging limit reached. Try again in an hour, or add your own key in Settings.' }, { status: 429 });
  }

  let image: unknown;
  try {
    ({ image } = (await request.json()) as { image?: unknown });
  } catch {
    return Response.json({ error: 'Expected JSON with an image field.' }, { status: 400 });
  }
  if (typeof image !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return Response.json({ error: 'Expected a base64 JPEG in the image field.' }, { status: 400 });
  }
  if (image.length * 0.75 > MAX_IMAGE_BYTES) {
    return Response.json({ error: 'Image too large. Resize to 1000px or less.' }, { status: 413 });
  }

  try {
    const tags = await tagImage(new Anthropic({ apiKey }), image);
    return Response.json(tags);
  } catch (error) {
    if (error instanceof TaggingRefused) return Response.json({ error: error.message }, { status: 422 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: 'Tagging is busy. Try again shortly.' }, { status: 503 });
    if (error instanceof Anthropic.APIError) return Response.json({ error: 'Tagging service error.' }, { status: 502 });
    return Response.json({ error: 'Tagging failed.' }, { status: 500 });
  }
}
