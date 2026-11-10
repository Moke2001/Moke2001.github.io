import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import worker from '../src/index.mjs';

const ORIGIN = 'https://moke2001.github.io';
const CLIENT_IP = '203.0.113.8';
const NOW = Date.parse('2026-11-10T12:34:20.123Z');
const DAY_MS = 86_400_000;

// This fake captures bindings and models row effects; Wrangler integration verifies SQLite itself.
class FakeD1 {
  calls = [];
  rows = new Map();

  prepare(sql) {
    if (this.prepareError) throw this.prepareError;
    return {
      bind: (...params) => ({
        run: async () => {
          this.calls.push({ sql, params });
          if (this.runError) throw this.runError;
          if (this.unsuccessful) return { success: false, error: 'private database detail' };
          if (sql.trimStart().startsWith('INSERT')) {
            const [ip, path, minute, first, last] = params;
            const key = JSON.stringify([ip, path, minute]);
            const row = this.rows.get(key);
            this.rows.set(key, {
              ip, path, minute_utc: minute,
              first_seen_utc: row && row.first_seen_utc < first ? row.first_seen_utc : first,
              last_seen_utc: row && row.last_seen_utc > last ? row.last_seen_utc : last,
              visit_count: (row?.visit_count ?? 0) + 1
            });
          } else if (sql.startsWith('DELETE FROM visits')) {
            for (const [key, row] of this.rows) {
              if (row.last_seen_utc < params[0]) this.rows.delete(key);
            }
          } else {
            throw new Error('Unexpected SQL; public reads must not reach D1');
          }
          return { success: true };
        }
      })
    };
  }
}

function request({ path = '/', body, origin = ORIGIN, ip = CLIENT_IP, headers = {}, method = 'POST', route = '/visit' } = {}) {
  const requestHeaders = new Headers({ 'Content-Type': 'application/json' });
  if (origin !== null) requestHeaders.set('Origin', origin);
  if (ip !== null) requestHeaders.set('CF-Connecting-IP', ip);
  for (const [name, value] of Object.entries(headers)) {
    if (value === null) requestHeaders.delete(name);
    else requestHeaders.set(name, value);
  }
  const options = { method, headers: requestHeaders };
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    options.body = body === undefined ? JSON.stringify({ path }) : body;
    if (options.body instanceof ReadableStream) options.duplex = 'half';
  }
  return new Request(`https://visitor-log.example${route}`, options);
}

function silenceConsole(t) {
  const calls = [];
  for (const method of ['log', 'warn', 'error']) t.mock.method(console, method, (...args) => calls.push(args));
  return calls;
}

test('POST stores only edge IP, server UTC times, and query-free path with bound SQL', async t => {
  t.mock.method(Date, 'now', () => NOW);
  const db = new FakeD1();
  const result = await worker.fetch(request({
    body: JSON.stringify({ path: '/research/partial-self-correction?token=private', ip: '192.0.2.99', time: '1900-01-01', form: 'private' }),
    headers: { 'X-Forwarded-For': '192.0.2.77', Cookie: 'secret=value', 'User-Agent': 'private-agent' }
  }), { DB: db });

  assert.equal(result.status, 204);
  assert.equal(await result.text(), '');
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.equal(result.headers.get('Access-Control-Allow-Credentials'), null);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.equal(db.calls.length, 1);
  assert.deepEqual(db.calls[0].params, [CLIENT_IP, '/research/partial-self-correction', '2026-11-10T12:34:00.000Z', '2026-11-10T12:34:20.123Z', '2026-11-10T12:34:20.123Z']);
  assert.match(db.calls[0].sql, /VALUES\s*\(\?1, \?2, \?3, \?4, \?5, 1\)/);
  assert.match(db.calls[0].sql, /ON CONFLICT \(ip, path, minute_utc\) DO UPDATE/);
  assert.match(db.calls[0].sql, /first_seen_utc = MIN/);
  assert.match(db.calls[0].sql, /last_seen_utc = MAX/);
  assert.match(db.calls[0].sql, /visit_count = visits\.visit_count \+ 1/);
  assert.ok(!db.calls[0].sql.includes(CLIENT_IP));
  assert.ok(!JSON.stringify(db.calls).includes('private'));
  assert.ok(!JSON.stringify(db.calls).includes('192.0.2.'));
});

test('minute aggregation counts visits and preserves first/last despite completion order', async t => {
  let now = NOW;
  t.mock.method(Date, 'now', () => now);
  const db = new FakeD1();
  for (const offset of [0, 20_000, -10_000]) {
    now = NOW + offset;
    assert.equal((await worker.fetch(request(), { DB: db })).status, 204);
  }
  assert.equal(db.rows.size, 1);
  const row = [...db.rows.values()][0];
  assert.equal(row.visit_count, 3);
  assert.equal(row.first_seen_utc, '2026-11-10T12:34:10.123Z');
  assert.equal(row.last_seen_utc, '2026-11-10T12:34:40.123Z');

  now = NOW + 60_000;
  await worker.fetch(request(), { DB: db });
  await worker.fetch(request({ path: '/projects' }), { DB: db });
  await worker.fetch(request({ ip: '203.0.113.9' }), { DB: db });
  assert.equal(db.rows.size, 4);
});

test('missing and foreign origins are rejected without CORS reflection or D1 access', async () => {
  for (const origin of [null, 'null', 'https://example.org', `${ORIGIN}.evil.example`, `${ORIGIN}/`]) {
    const db = new FakeD1();
    const result = await worker.fetch(request({ origin }), { DB: db });
    assert.equal(result.status, 403, String(origin));
    assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(db.calls.length, 0);
  }
});

test('configured origins match exactly and local HTTP requires an explicit loopback origin', async () => {
  for (const origin of ['https://studio.example', 'http://127.0.0.1:4173', 'http://localhost:4173']) {
    const db = new FakeD1();
    const env = { DB: db, ALLOWED_ORIGIN: origin };
    assert.equal((await worker.fetch(request({ origin }), env)).status, 204);
    assert.equal((await worker.fetch(request(), env)).status, 403);
  }
  for (const origin of ['*', '', 'null', 'http://example.org', 'http://localhost.evil.example:4173', 'http://127.0.0.2:4173', `${ORIGIN}/`]) {
    const db = new FakeD1();
    assert.equal((await worker.fetch(request({ origin }), { DB: db, ALLOWED_ORIGIN: origin })).status, 403, origin);
    assert.equal(db.calls.length, 0);
  }
  assert.equal((await worker.fetch(request({ origin: 'http://127.0.0.1:4173' }), { DB: new FakeD1() })).status, 403);
});

test('preflight allows only POST and Content-Type from the configured origin', async () => {
  const db = new FakeD1();
  const result = await worker.fetch(request({ method: 'OPTIONS', headers: {
    'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'cOnTeNt-TyPe'
  } }), { DB: db });
  assert.equal(result.status, 204);
  assert.equal(await result.text(), '');
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.equal(result.headers.get('Access-Control-Allow-Methods'), 'POST');
  assert.equal(result.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
  assert.equal(result.headers.get('Access-Control-Allow-Credentials'), null);
  assert.match(result.headers.get('Vary'), /Origin/);

  for (const options of [
    { origin: 'https://evil.example', headers: { 'Access-Control-Request-Method': 'POST' } },
    { headers: { 'Access-Control-Request-Method': 'GET' } },
    { headers: { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type, authorization' } },
    { headers: {} }
  ]) {
    assert.equal((await worker.fetch(request({ method: 'OPTIONS', ...options }), { DB: db })).status, 403);
  }
  assert.equal(db.calls.length, 0);
});

test('closed path allowlist accepts public roots and safe detail slugs, discarding queries', async () => {
  const db = new FakeD1();
  for (const path of ['/', '/research', '/projects', '/quantum', '/research/paper-2026', '/projects/extended-stim', '/research?private=secret']) {
    assert.equal((await worker.fetch(request({ path }), { DB: db })).status, 204, path);
    assert.equal(db.calls.at(-1).params[1], path.split('?')[0]);
  }
  assert.ok(!JSON.stringify(db.calls).includes('secret'));
});

test('traversal, encoded paths, control characters, unsafe slugs, and unrelated paths are rejected', async () => {
  const db = new FakeD1();
  for (const path of [
    '/admin', '//research', '/research/', '/research/../projects', '/research/%2e%2e', '/research/a%2fb',
    '/research/a/b', '/projects/a\\b', '/research/a\n', '/research/a\u0000', '/research/Upper',
    '/research/a_b', '/research/-a', '/research/a-', '/research/a--b', '/research/a#private',
    '/quantum/detail', '/research/' + 'a'.repeat(129), 'https://moke2001.github.io/research', '', ' /research'
  ]) {
    assert.equal((await worker.fetch(request({ path }), { DB: db })).status, 400, JSON.stringify(path));
  }
  assert.equal(db.calls.length, 0);
});

test('JSON, UTF-8, object shape, path type, and media type are validated before D1', async () => {
  const db = new FakeD1();
  for (const body of ['', '{', 'null', '[]', '1', '"/research"', '{}', '{"path":null}', '{"path":1}', new Uint8Array([0xff])]) {
    assert.equal((await worker.fetch(request({ body }), { DB: db })).status, 400);
  }
  for (const type of [null, 'text/plain', 'application/x-www-form-urlencoded']) {
    assert.equal((await worker.fetch(request({ headers: { 'Content-Type': type } }), { DB: db })).status, 415);
  }
  assert.equal(db.calls.length, 0);
  assert.equal((await worker.fetch(request({ headers: { 'Content-Type': 'application/json; charset=utf-8' } }), { DB: db })).status, 204);
});

test('CF-Connecting-IP is mandatory, supports IPv6, and never falls back to supplied fake IPs', async () => {
  const db = new FakeD1();
  for (const ip of [null, '', 'unknown', '256.1.1.1', '203.0.113.8, 192.0.2.1', '2001:db8:::1', '2001:db8::1%eth0']) {
    assert.equal((await worker.fetch(request({ ip, body: '{"path":"/","ip":"192.0.2.1"}', headers: {
      'X-Forwarded-For': '192.0.2.2', 'X-Real-IP': '192.0.2.3'
    } }), { DB: db })).status, 400, String(ip));
  }
  assert.equal(db.calls.length, 0);
  assert.equal((await worker.fetch(request({ ip: '2001:db8::1234' }), { DB: db })).status, 204);
  assert.equal(db.calls[0].params[0], '2001:db8::1234');
});

test('body size is enforced in bytes at 1024, independent of a false Content-Length', async () => {
  const db = new FakeD1();
  const exact = '{"path":"/"}'.padEnd(1024, ' ');
  const bytes = new TextEncoder().encode(exact);
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(bytes.slice(0, 512));
    controller.enqueue(bytes.slice(512));
    controller.close();
  } });
  assert.equal((await worker.fetch(request({ body: stream }), { DB: db })).status, 204);
  assert.equal((await worker.fetch(request({ body: exact + ' ', headers: { 'Content-Length': '1' } }), { DB: db })).status, 413);
  assert.equal((await worker.fetch(request({ body: '{"path":"/"}', headers: { 'Content-Length': '1025' } }), { DB: db })).status, 413);
  const unicode = JSON.stringify({ path: '/', padding: '中'.repeat(340) });
  assert.ok(unicode.length < 1024 && new TextEncoder().encode(unicode).length > 1024);
  assert.equal((await worker.fetch(request({ body: unicode }), { DB: db })).status, 413);
  assert.equal(db.calls.length, 1);
});

test('an oversized streaming body is cancelled before subsequent chunks are consumed', async () => {
  let reads = 0;
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      reads += 1;
      controller.enqueue(new Uint8Array(600));
    },
    cancel() { cancelled = true; }
  }, { highWaterMark: 0 });
  const db = new FakeD1();
  assert.equal((await worker.fetch(request({ body: stream }), { DB: db })).status, 413);
  assert.equal(reads, 2);
  assert.equal(cancelled, true);
  assert.equal(db.calls.length, 0);
});

test('a failed body stream returns a generic 400 without touching D1', async () => {
  const stream = new ReadableStream({ pull(controller) { controller.error(new Error('private body failure')); } });
  const db = new FakeD1();
  const result = await worker.fetch(request({ body: stream }), { DB: db });
  assert.equal(result.status, 400);
  assert.equal(await result.text(), 'Invalid request');
  assert.equal(db.calls.length, 0);
});

test('health reveals no database state and no HTTP route exposes log reads', async () => {
  const health = await worker.fetch(new Request('https://visitor-log.example/health'), {});
  assert.equal(health.status, 200);
  assert.equal(await health.text(), 'ok');
  const db = new FakeD1();
  db.prepareError = new Error('Health must not query D1');
  assert.equal((await worker.fetch(request({ method: 'GET', route: '/health' }), { DB: db })).status, 200);
  for (const method of ['GET', 'HEAD', 'PUT', 'DELETE', 'PATCH']) {
    assert.equal((await worker.fetch(request({ method }), { DB: db })).status, 405, method);
  }
  for (const route of ['/visits', '/logs', '/visit/list', '/admin', '/']) {
    assert.equal((await worker.fetch(request({ method: 'GET', route }), { DB: db })).status, 404, route);
  }
  assert.equal(db.calls.length, 0);
});

test('D1 failures produce a redacted 500 and never log IPs, bodies, or raw errors', async t => {
  const logs = silenceConsole(t);
  for (const failure of ['prepareError', 'runError', 'unsuccessful', 'missingBinding']) {
    const db = new FakeD1();
    if (failure === 'unsuccessful') db.unsuccessful = true;
    else if (failure !== 'missingBinding') db[failure] = new Error(`${CLIENT_IP} private-request private-schema`);
    const result = await worker.fetch(request({ body: '{"path":"/","extra":"private-request"}' }), failure === 'missingBinding' ? {} : { DB: db });
    assert.equal(result.status, 500);
    assert.equal(await result.text(), 'Internal server error');
    assert.equal(result.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  }
  assert.deepEqual(logs, []);
});

test('scheduled cleanup binds the 30-day UTC cutoff and retains the boundary row', async () => {
  const db = new FakeD1();
  const cutoff = new Date(NOW - 30 * DAY_MS).toISOString();
  db.rows.set('old', { last_seen_utc: new Date(NOW - 30 * DAY_MS - 1).toISOString() });
  db.rows.set('boundary', { last_seen_utc: cutoff });
  db.rows.set('recent', { last_seen_utc: new Date(NOW).toISOString() });
  await worker.scheduled({ scheduledTime: NOW }, { DB: db });
  assert.deepEqual(db.calls, [{ sql: 'DELETE FROM visits WHERE last_seen_utc < ?1', params: [cutoff] }]);
  assert.deepEqual([...db.rows.keys()], ['boundary', 'recent']);
});

test('retention configuration defaults safely and is restricted to 1 through 90 days', async t => {
  t.mock.method(Date, 'now', () => NOW);
  for (const [value, days] of [[undefined, 30], ['', 30], ['bad', 30], ['2.5', 30], ['Infinity', 30], ['1', 1], ['90', 90], ['0', 1], ['-3', 1], ['91', 90], ['365', 90]]) {
    const db = new FakeD1();
    await worker.scheduled({}, { DB: db, RETENTION_DAYS: value });
    assert.deepEqual(db.calls[0].params, [new Date(NOW - days * DAY_MS).toISOString()], String(value));
  }
});

test('failed cron invocations expose only a fixed generic error and no sensitive logs', async t => {
  const logs = silenceConsole(t);
  const db = new FakeD1();
  db.runError = new Error(`${CLIENT_IP} private database detail`);
  await assert.rejects(worker.scheduled({ scheduledTime: NOW }, { DB: db }), error => {
    assert.equal(error.message, 'Visitor log retention cleanup failed');
    assert.equal(error.cause, undefined);
    return true;
  });
  assert.deepEqual(logs, []);
});

test('migration contains only the agreed visitor columns and a retention index', async () => {
  const sql = await readFile(new URL('../migrations/0001_visits.sql', import.meta.url), 'utf8');
  const columns = [...sql.matchAll(/^  ([a-z_]+) (?:TEXT|INTEGER)/gm)].map(match => match[1]);
  assert.deepEqual(columns, ['ip', 'path', 'minute_utc', 'first_seen_utc', 'last_seen_utc', 'visit_count']);
  assert.match(sql, /PRIMARY KEY \(ip, path, minute_utc\)/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS visits_last_seen_utc ON visits \(last_seen_utc\)/);
});
