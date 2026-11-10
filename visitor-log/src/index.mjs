const DEFAULT_ORIGIN = 'https://moke2001.github.io';
const MAX_BODY_BYTES = 1024;
const DAY_MS = 24 * 60 * 60 * 1000;

const INSERT_VISIT = `
  INSERT INTO visits (ip, path, minute_utc, first_seen_utc, last_seen_utc, visit_count)
  VALUES (?1, ?2, ?3, ?4, ?5, 1)
  ON CONFLICT (ip, path, minute_utc) DO UPDATE SET
    first_seen_utc = MIN(visits.first_seen_utc, excluded.first_seen_utc),
    last_seen_utc = MAX(visits.last_seen_utc, excluded.last_seen_utc),
    visit_count = visits.visit_count + 1
`;

function allowedOrigin(env) {
  const configured = env.ALLOWED_ORIGIN ?? DEFAULT_ORIGIN;
  if (typeof configured !== 'string') return null;
  try {
    const url = new URL(configured);
    const localHttp = env.ALLOWED_ORIGIN !== undefined && url.protocol === 'http:' &&
      ['127.0.0.1', 'localhost'].includes(url.hostname);
    return (url.protocol === 'https:' || localHttp) && url.origin === configured ? configured : null;
  } catch {
    return null;
  }
}

function response(status, body = null, origin = null, extraHeaders = {}) {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    ...extraHeaders
  });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  if (body !== null) headers.set('Content-Type', 'text/plain; charset=utf-8');
  return new Response(body, { status, headers });
}

function isClientIp(ip) {
  if (!ip || ip.length > 45) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split('.').every(part => Number(part) <= 255);
  }
  if (!ip.includes(':') || !/^[0-9a-f:.]+$/i.test(ip)) return false;
  try {
    // The standard URL parser validates IPv6 without a Node-specific dependency.
    new URL(`http://[${ip}]/`);
    return true;
  } catch {
    return false;
  }
}

function routePath(value) {
  if (typeof value !== 'string') return null;
  // Match the supplied path directly; never resolve traversal or decode escapes.
  const path = value.split('?', 1)[0];
  if (['/', '/research', '/projects', '/quantum'].includes(path)) return path;
  const match = /^\/(research|projects)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(path);
  return match && match[0] === path && match[2].length <= 128 ? path : null;
}

async function readJson(request) {
  const length = request.headers.get('Content-Length');
  if (length && /^\d+$/.test(length) && Number(length) > MAX_BODY_BYTES) {
    return { error: 413 };
  }
  if (!request.body) return { error: 400 };

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        return { error: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { error: 400 };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 400 };
    return { data };
  } catch {
    return { error: 400 };
  }
}

function retentionDays(value) {
  if (value === undefined || value === null || String(value).trim() === '') return 30;
  const days = Number(value);
  return Number.isInteger(days) ? Math.min(90, Math.max(1, days)) : 30;
}

async function run(statement) {
  const result = await statement.run();
  if (result?.success === false) throw new Error('Database operation failed');
}

export default {
  async fetch(request, env = {}) {
    const pathname = new URL(request.url).pathname;
    const configuredOrigin = allowedOrigin(env);
    const origin = request.headers.get('Origin') === configuredOrigin ? configuredOrigin : null;

    if (pathname === '/health' && request.method === 'GET') {
      return response(200, 'ok', origin);
    }
    if (pathname !== '/visit') return response(404, 'Not found', origin);
    if (!origin) return response(403, 'Forbidden');

    if (request.method === 'OPTIONS') {
      const method = request.headers.get('Access-Control-Request-Method');
      const headers = (request.headers.get('Access-Control-Request-Headers') ?? '')
        .split(',').map(header => header.trim().toLowerCase()).filter(Boolean);
      if (method !== 'POST' || headers.some(header => header !== 'content-type')) {
        return response(403, 'Forbidden', origin);
      }
      return response(204, null, origin, {
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
      });
    }
    if (request.method !== 'POST') {
      return response(405, 'Method not allowed', origin, { Allow: 'POST, OPTIONS' });
    }
    const mediaType = (request.headers.get('Content-Type') ?? '').split(';', 1)[0].trim().toLowerCase();
    if (mediaType !== 'application/json') return response(415, 'Unsupported media type', origin);

    // Cloudflare supplies this header at its edge; no body or forwarded-header fallback.
    const ip = request.headers.get('CF-Connecting-IP');
    if (!isClientIp(ip)) return response(400, 'Missing or invalid client IP', origin);
    const parsed = await readJson(request);
    if (parsed.error) {
      return response(parsed.error, parsed.error === 413 ? 'Payload too large' : 'Invalid request', origin);
    }
    const path = routePath(parsed.data.path);
    if (!path) return response(400, 'Invalid path', origin);

    try {
      const now = new Date(Date.now()).toISOString();
      const minute = `${now.slice(0, 16)}:00.000Z`;
      await run(env.DB.prepare(INSERT_VISIT).bind(ip, path, minute, now, now));
      return response(204, null, origin);
    } catch {
      // Never return or log the original error, IP address, or request body.
      return response(500, 'Internal server error', origin);
    }
  },

  async scheduled(controller, env = {}) {
    try {
      const now = Number.isFinite(controller?.scheduledTime) ? controller.scheduledTime : Date.now();
      const cutoff = new Date(now - retentionDays(env.RETENTION_DAYS) * DAY_MS).toISOString();
      await run(env.DB.prepare('DELETE FROM visits WHERE last_seen_utc < ?1').bind(cutoff));
    } catch {
      // A generic failure marks the cron invocation as failed without exposing D1 details.
      throw new Error('Visitor log retention cleanup failed');
    }
  }
};
