'use strict';

(() => {
  const configuredEndpoint = document.currentScript?.dataset.endpoint;
  if (!configuredEndpoint) return;

  let endpoint;
  try {
    endpoint = new URL(configuredEndpoint);
    const localPreview = ['127.0.0.1', 'localhost'].includes(location.hostname)
      && ['127.0.0.1', 'localhost'].includes(endpoint.hostname);
    if ((endpoint.protocol !== 'https:' && !(localPreview && endpoint.protocol === 'http:'))
      || endpoint.username || endpoint.password || endpoint.pathname !== '/visit'
      || endpoint.search || endpoint.hash) return;
  } catch (_) { return; }

  let lastPath;

  function currentPath() {
    const hash = location.hash.slice(1);
    const aliases = { home: '/', profile: '/', latest: '/research' };
    const rawPath = Object.hasOwn(aliases, hash) ? aliases[hash] : (hash.split('?')[0] || '/');
    let parts;
    try { parts = rawPath.split('/').filter(Boolean).map(decodeURIComponent); }
    catch (_) { return null; }
    if (!parts.length) return '/';
    const [page, id] = parts;
    if (!['research', 'projects', 'quantum'].includes(page)) return null;
    if (!id) return `/${page}`;
    if (page === 'quantum') return null;
    const items = window.STUDIO_CONTENT?.[page === 'research' ? 'publications' : 'projects'];
    return items?.some(item => item.id === id) ? `/${page}/${encodeURIComponent(id)}` : null;
  }

  function recordVisit() {
    const path = currentPath();
    if (!path) { lastPath = null; return; }
    if (path === lastPath) return;
    lastPath = path;
    try {
      fetch(endpoint.href, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      }).catch(() => {});
    } catch (_) { /* Analytics must not interrupt the website. */ }
  }

  window.addEventListener('hashchange', recordVisit);
  recordVisit();
})();
