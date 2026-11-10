import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../assets/visitor-tracker.js', import.meta.url), 'utf8');
const endpoint = 'https://visits.example.test/visit';

function browser(options = {}) {
  const location = new URL(options.url ?? 'https://moke2001.github.io/#/');
  const listeners = new Map();
  const requests = [];
  const timers = [];
  const history = [location.href];
  let historyIndex = 0;
  const configuredEndpoint = Object.hasOwn(options, 'endpoint') ? options.endpoint : endpoint;
  const document = {
    currentScript: options.noCurrentScript ? null : { dataset: { endpoint: configuredEndpoint } },
    documentElement: { lang: 'zh-CN' },
    forms: { feedback: { name: 'Private name', message: 'Private message' } },
    cookie: 'private-session=secret',
    referrer: 'https://private.example.test/?token=secret'
  };
  const window = {
    location,
    document,
    STUDIO_CONTENT: options.content ?? {
      publications: [{ id: 'paper-a' }, { id: 'paper-b' }],
      projects: [{ id: 'tool-a' }]
    },
    addEventListener(type, listener) {
      const entries = listeners.get(type) ?? [];
      entries.push(listener);
      listeners.set(type, entries);
    }
  };
  const fetch = (url, init) => {
    requests.push({ url, init });
    return options.fetch ? options.fetch(url, init) : Promise.resolve({ ok: true });
  };
  function dispatch(type) {
    for (const listener of [...(listeners.get(type) ?? [])]) listener.call(window, { type });
  }
  function changeUrl(url) {
    const previousHash = location.hash;
    location.href = url;
    if (location.hash !== previousHash) dispatch('hashchange');
  }
  window.fetch = fetch;
  vm.runInNewContext(source, {
    window,
    document,
    location,
    URL,
    fetch,
    setTimeout: (...args) => timers.push({ type: 'timeout', args }),
    setInterval: (...args) => timers.push({ type: 'interval', args })
  }, { filename: 'visitor-tracker.js', timeout: 1000 });
  return {
    requests, timers, document, location, dispatch,
    paths: () => requests.map(request => JSON.parse(request.init.body).path),
    navigate(hash) {
      const next = new URL(location.href);
      next.hash = hash;
      if (next.href === location.href) return;
      history.splice(++historyIndex);
      history.push(next.href);
      changeUrl(next.href);
    },
    back() {
      if (historyIndex > 0) changeUrl(history[--historyIndex]);
    },
    forward() {
      if (historyIndex + 1 < history.length) changeUrl(history[++historyIndex]);
    }
  };
}

test('missing or invalid endpoints never make requests, including after navigation', async t => {
  const invalid = [
    undefined, '', ' ', 'not a URL', '/visit', '//visits.example.test/visit',
    'http://visits.example.test/visit', 'http://localhost:8787/visit',
    'ftp://visits.example.test/visit', 'javascript:alert(1)',
    'https://user@visits.example.test/visit',
    'https://user:password@visits.example.test/visit',
    'https://visits.example.test/', 'https://visits.example.test/visit/',
    'https://visits.example.test/visit?token=secret',
    'https://visits.example.test/visit#secret'
  ];
  for (const value of invalid) {
    await t.test(String(value), () => {
      const page = browser({ endpoint: value });
      page.navigate('#/research');
      page.navigate('#/projects/tool-a');
      assert.equal(page.requests.length, 0);
    });
  }
  const page = browser({ noCurrentScript: true });
  page.navigate('#/research');
  assert.equal(page.requests.length, 0);
});

test('an HTTPS /visit endpoint records the initial page exactly once', () => {
  const page = browser();
  assert.deepEqual(page.paths(), ['/']);
  assert.equal(page.requests[0].url, endpoint);
  page.dispatch('hashchange');
  page.dispatch('hashchange');
  assert.deepEqual(page.paths(), ['/']);
});

test('loopback previews never send visits to a production HTTPS endpoint', async t => {
  for (const hostname of ['localhost', '127.0.0.1']) {
    await t.test(hostname, () => {
      const page = browser({ url: `http://${hostname}:4173/#/`, endpoint });
      page.navigate('#/research');
      page.navigate('#/projects/tool-a');
      page.back();
      assert.equal(page.requests.length, 0);
    });
  }
});

test('HTTP is accepted only when both the page and endpoint are loopback previews', async t => {
  for (const pageHost of ['localhost', '127.0.0.1']) {
    for (const endpointHost of ['localhost', '127.0.0.1']) {
      await t.test(`${pageHost} to ${endpointHost}`, () => {
        const page = browser({
          url: `http://${pageHost}:4173/#/research`,
          endpoint: `http://${endpointHost}:8787/visit`
        });
        assert.deepEqual(page.paths(), ['/research']);
      });
    }
  }
  for (const [url, configuredEndpoint] of [
    ['http://localhost:4173/#/', 'http://visits.example.test/visit'],
    ['http://127.0.0.1:4173/#/', 'http://192.168.1.2:8787/visit'],
    ['https://moke2001.github.io/#/', 'http://127.0.0.1:8787/visit'],
    ['http://localhost.example.test/#/', 'http://localhost:8787/visit']
  ]) {
    await t.test(`${url} rejects ${configuredEndpoint}`, () => {
      const page = browser({ url, endpoint: configuredEndpoint });
      page.navigate('#/research');
      assert.equal(page.requests.length, 0);
    });
  }
});

test('normal pages and known publication/project details are tracked on hash navigation', () => {
  const page = browser({ url: 'https://moke2001.github.io/' });
  for (const hash of ['#/research', '#/research/paper-a', '#/projects', '#/projects/tool-a', '#/quantum']) {
    page.navigate(hash);
  }
  assert.deepEqual(page.paths(), ['/', '/research', '/research/paper-a', '/projects', '/projects/tool-a', '/quantum']);
});

test('back and forward navigation records revisits rather than deduplicating the entire session', () => {
  const page = browser();
  page.navigate('#/research');
  page.navigate('#/projects/tool-a');
  page.back();
  page.back();
  page.forward();
  page.forward();
  assert.deepEqual(page.paths(), ['/', '/research', '/projects/tool-a', '/research', '/', '/research', '/projects/tool-a']);
});

test('section/query changes and a language change without a new hash do not create duplicate visits', () => {
  const page = browser();
  page.navigate('#/?section=vision');
  page.navigate('#/?section=contact&email=private@example.test');
  page.document.documentElement.lang = 'en';
  page.dispatch('click');
  assert.deepEqual(page.paths(), ['/']);
  page.navigate('#/research?search=private');
  page.navigate('#/research?search=another-private-query');
  page.dispatch('hashchange');
  assert.deepEqual(page.paths(), ['/', '/research']);
  page.navigate('#/research/paper-a?source=private');
  page.navigate('#/research/paper-a?source=different-private-value');
  assert.deepEqual(page.paths(), ['/', '/research', '/research/paper-a']);
});

test('legacy home/profile/latest hashes normalize to the same canonical page paths', async t => {
  for (const [hash, expected] of [['#home', '/'], ['#profile', '/'], ['#latest', '/research']]) {
    await t.test(hash, () => {
      const page = browser({ url: `https://moke2001.github.io/${hash}` });
      assert.deepEqual(page.paths(), [expected]);
    });
  }
  const page = browser({ url: 'https://moke2001.github.io/#home' });
  page.navigate('#profile');
  page.navigate('#/');
  page.navigate('#latest');
  page.navigate('#/research');
  assert.deepEqual(page.paths(), ['/', '/research']);
});

test('unknown routes and malformed encoded IDs are not sent', async t => {
  for (const hash of [
    '#unknown', '#/unknown', '#/research/missing', '#/projects/missing',
    '#/quantum/unknown', '#/research/%E0%A4%A', '#/projects/%ZZ'
  ]) {
    await t.test(hash, () => {
      const page = browser({ url: `https://moke2001.github.io/${hash}` });
      assert.equal(page.requests.length, 0);
      page.navigate('#/research/paper-a');
      page.navigate(hash);
      page.navigate('#/research/paper-a');
      assert.deepEqual(page.paths(), ['/research/paper-a', '/research/paper-a']);
    });
  }
});

test('missing content metadata does not turn an arbitrary detail ID into a tracked route', () => {
  const page = browser({ url: 'https://moke2001.github.io/#/research/paper-a', content: {} });
  page.navigate('#/projects/tool-a');
  assert.equal(page.requests.length, 0);
  page.navigate('#/research');
  assert.deepEqual(page.paths(), ['/research']);
});

test('the request sends only the canonical path with no IP, query, form, cookie, or referrer data', () => {
  const page = browser({
    url: 'https://moke2001.github.io/?ip=203.0.113.9&token=private#/research/paper-a?message=private'
  });
  assert.equal(page.requests.length, 1);
  const request = page.requests[0];
  assert.equal(request.url, endpoint);
  assert.deepEqual(JSON.parse(request.init.body), { path: '/research/paper-a' });
  assert.deepEqual(JSON.parse(JSON.stringify(request.init)), {
    method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
    referrerPolicy: 'no-referrer', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: '{"path":"/research/paper-a"}'
  });
});

for (const [failure, fetch] of [
  ['a rejected fetch promise', () => Promise.reject(new Error('offline'))],
  ['a synchronous fetch exception', () => { throw new Error('blocked'); }]
]) {
  test(`${failure} does not escape, retry, or disable tracking of later pages`, async () => {
    let page;
    assert.doesNotThrow(() => { page = browser({ fetch }); });
    await setImmediate();
    assert.deepEqual(page.paths(), ['/']);
    assert.deepEqual(page.timers, []);
    assert.doesNotThrow(() => {
      page.dispatch('hashchange');
      page.navigate('#/?section=contact');
    });
    await setImmediate();
    assert.deepEqual(page.paths(), ['/']);
    assert.doesNotThrow(() => page.navigate('#/research'));
    await setImmediate();
    assert.deepEqual(page.paths(), ['/', '/research']);
    assert.deepEqual(page.timers, []);
  });
}
