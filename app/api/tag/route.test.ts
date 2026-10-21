import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/tagging/claude', () => ({
  TaggingRefused: class extends Error {},
  tagImage: vi.fn(async () => ({ name: 'Navy Chinos', category: 'bottom' })),
}));

const request = (body: unknown, ip = '1.2.3.4') =>
  new Request('http://localhost/api/tag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

async function loadRoute() {
  vi.resetModules(); // fresh in-memory rate limiter per test
  return import('./route');
}

describe('POST /api/tag', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('is off unless demo mode and a key are both set', async () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
    const { POST } = await loadRoute();
    expect((await POST(request({ image: 'abc' }))).status).toBe(404);
  });

  it('tags a valid image', async () => {
    const { POST } = await loadRoute();
    const res = await POST(request({ image: 'aGVsbG8=' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ name: 'Navy Chinos' });
  });

  it('rejects bad input', async () => {
    const { POST } = await loadRoute();
    expect((await POST(request('not json'))).status).toBe(400);
    expect((await POST(request({ image: 42 }))).status).toBe(400);
    expect((await POST(request({ image: 'data:image/jpeg;base64,abc' }))).status).toBe(400);
  });

  it('rejects oversized images', async () => {
    const { POST } = await loadRoute();
    expect((await POST(request({ image: 'A'.repeat(2_100_000) }))).status).toBe(413);
  });

  it('rate limits each address to 30 an hour', async () => {
    const { POST } = await loadRoute();
    for (let i = 0; i < 30; i++) expect((await POST(request({ image: 'aGVsbG8=' }, '9.9.9.9'))).status).toBe(200);
    expect((await POST(request({ image: 'aGVsbG8=' }, '9.9.9.9'))).status).toBe(429);
    expect((await POST(request({ image: 'aGVsbG8=' }, '8.8.8.8'))).status).toBe(200);
  });
});
