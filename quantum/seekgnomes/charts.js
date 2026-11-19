/* Historical leaderboard charts. Scores are supplied by the data snapshot;
 * this module only maps values to fixed axes and never re-scores a trial. */
import {t} from './i18n.js?v=20';
const SVG_NS = 'http://www.w3.org/2000/svg';
const FONT = 'Outfit, system-ui, sans-serif';
const INK = '#193640';
const MUTED = '#556b73';
const GRID = '#dbe4e5';
const COLORS = {
  gpt: '#17a584', kimi: '#276bf0', deepseek: '#5480ef',
  mimo: '#ed9337', glm: '#8c66d9',
};
const METRICS = {
  pass_rate: 'metricPass',
  improvement_rate: 'metricImprovement',
  amplitude_mean: 'metricAmplitude',
};
let chartSerial = 0;

function element(tag, attrs = {}, content) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) node.setAttribute(name, String(value));
  }
  if (content !== undefined) node.textContent = String(content);
  return node;
}

function add(parent, tag, attrs, content) {
  const node = element(tag, attrs, content);
  parent.append(node);
  return node;
}

function finite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`A finite ${name} is required for each charted model`);
  }
  return value;
}

function describe(svg, title, description) {
  const id = `sg-chart-${++chartSerial}`;
  svg.setAttribute('aria-labelledby', `${id}-title ${id}-desc`);
  add(svg, 'title', { id: `${id}-title` }, title);
  add(svg, 'desc', { id: `${id}-desc` }, description);
}

function svgFrame(width, height, className) {
  return element('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img', class: className,
    'font-family': FONT, 'font-size': 13,
    width: '100%',
    style: 'display:block;overflow:visible;height:auto',
  });
}

function color(model) {
  // The palette is data, not markup; accept CSS hex colors only.
  return /^#[\da-f]{3,8}$/i.test(model.color || '')
    ? model.color : (COLORS[model.id] || '#477da5');
}

function label(model) {
  return typeof model.label === 'string' && model.label ? model.label : String(model.id);
}

function splitLabel(text) {
  const [family, ...version] = text.split(/\s+/);
  return version.length ? [family, version.join(' ')] : [family];
}

function icon(parent, model, x, y, size) {
  const href = typeof model.icon === 'string' ? model.icon : '';
  if (href && !/^(?:javascript|data|file):/i.test(href)) {
    add(parent, 'image', { href, x, y, width: size, height: size, 'aria-hidden': 'true' });
  } else {
    add(parent, 'circle', {
      cx: x + size / 2, cy: y + size / 2, r: size * .4,
      fill: color(model), 'aria-hidden': 'true',
    });
  }
}

function dispatchSelection(container, model) {
  container.dispatchEvent(new CustomEvent('modelselect', { detail: { id: model.id } }));
}

/** Draw the historical composite score on a fixed 0–60 axis.
 * Models: { id, label, score, ci95:[lower,upper], color?, icon? }.
 * Optional {compact:true} uses a mobile viewBox without changing the data axis.
 * Returns the SVG. Clicking a bar or pressing Enter/Space emits modelselect.
 */
export function renderTotalChart(container, models, { compact = false } = {}) {
  if (!container || !Array.isArray(models)) throw new TypeError('A container and model array are required');
  const svg = svgFrame(compact ? 400 : 640, compact ? 297 : 386, 'sg-chart sg-total-chart');
  svg.setAttribute('role', 'group');
  describe(svg, t('rankChartTitle'), t('rankTotalDescription'));
  const plot = compact
    ? { left: 28, right: 397, top: 32, bottom: 221 }
    : { left: 35, right: 635, top: 37, bottom: 300 };
  const y = value => plot.bottom - value / 60 * (plot.bottom - plot.top);
  add(svg, 'text', { x: plot.left, y: 13, fill: MUTED, 'font-size': 12 }, t('scoreAxis'));
  for (let tick = 0; tick <= 60; tick += 10) {
    add(svg, 'line', {
      x1: plot.left, x2: plot.right, y1: y(tick), y2: y(tick),
      stroke: tick ? GRID : '#a7b9bc', 'stroke-width': 1,
      'stroke-dasharray': tick ? '2 4' : undefined,
    });
    add(svg, 'text', {
      x: plot.left - (compact ? 8 : 12), y: y(tick) + 4, fill: MUTED,
      'text-anchor': 'end', 'font-size': 12,
    }, tick);
  }
  const band = (plot.right - plot.left) / Math.max(1, models.length);
  for (const [index, model] of models.entries()) {
    const value = finite(model.score, 'score');
    if (value < 0 || value > 60) throw new RangeError('The historical 0–60 score axis would clip a score');
    const ci = model.ci95;
    if (!Array.isArray(ci) || ci.length !== 2) throw new TypeError('A two-ended ci95 is required');
    const low = finite(ci[0], 'confidence interval lower bound');
    const high = finite(ci[1], 'confidence interval upper bound');
    if (low < 0 || high > 60 || low > value || high < value) {
      throw new RangeError('The score interval is invalid or would be clipped by the historical axis');
    }
    const cx = plot.left + band * (index + .5);
    const barWidth = Math.min(compact ? 38 : 62, band * .54);
    const group = add(svg, 'g', {
      class: 'sg-chart-model', 'data-model': model.id,
      role: 'button', tabindex: 0, style: 'cursor:pointer;outline-offset:5px',
      'aria-label': t('modelChartLabel',{model:label(model),score:value.toFixed(1),low:low.toFixed(1),high:high.toFixed(1)}),
    });
    add(group, 'title', {}, `${label(model)}\n${t('scoreAxis')}: ${value.toFixed(3)}\n${t('intervalLabel')}: ${low.toFixed(3)}–${high.toFixed(3)}`);
    // A transparent hit area keeps short bars easy to use without changing their height.
    add(group, 'rect', {
      x: cx - band * .46, y: plot.top, width: band * .92, height: compact ? 261 : 344,
      fill: 'transparent',
    });
    add(group, 'rect', {
      class: 'sg-score-bar', x: cx - barWidth / 2, y: y(value),
      width: barWidth, height: Math.max(0, plot.bottom - y(value)), rx: 1.5,
      fill: color(model),
    });
    add(group, 'line', { x1: cx, x2: cx, y1: y(low), y2: y(high), stroke: INK, 'stroke-width': 1.4 });
    for (const endpoint of [low, high]) {
      add(group, 'line', {
        x1: cx - 7, x2: cx + 7, y1: y(endpoint), y2: y(endpoint),
        stroke: INK, 'stroke-width': 1.4,
      });
    }
    add(group, 'text', {
      x: cx, y: y(high) - 10, fill: INK, 'text-anchor': 'middle',
      'font-size': compact ? 18 : 23, 'font-weight': 580,
    }, value.toFixed(1));
    const iconSize = compact ? 20 : 22;
    icon(group, model, cx - iconSize / 2, plot.bottom + 11, iconSize);
    const lines = splitLabel(label(model));
    const text = add(group, 'text', {
      x: cx, y: plot.bottom + (compact ? 48 : 52), fill: INK, 'text-anchor': 'middle',
      'font-size': compact ? 12 : 14, 'font-weight': 550,
    });
    lines.forEach((line, lineIndex) => add(text, 'tspan', {
      x: cx, dy: lineIndex ? 16 : 0, fill: lineIndex ? MUTED : INK,
      'font-weight': lineIndex ? 400 : 550,
    }, line));
    group.addEventListener('click', () => dispatchSelection(container, model));
    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        dispatchSelection(container, model);
      }
    });
  }
  container.replaceChildren(svg);
  return svg;
}

/** Draw P, R or A as percentages, each on the same fixed 0–100 axis. */
export function renderMetricChart(container, models, key) {
  if (!container || !Array.isArray(models)) throw new TypeError('A container and model array are required');
  if (!Object.hasOwn(METRICS, key)) throw new RangeError('Unknown historical leaderboard metric');
  const svg = svgFrame(330, 105, 'sg-chart sg-metric-chart');
  describe(svg, t(METRICS[key]), t('metricDescription',{metric:t(METRICS[key])}));
  const plot = { left: 20, right: 326, top: 23, bottom: 78 };
  const y = value => plot.bottom - value * (plot.bottom - plot.top);
  for (const tick of [0, .5, 1]) {
    add(svg, 'line', {
      x1: plot.left, x2: plot.right, y1: y(tick), y2: y(tick),
      stroke: tick ? GRID : '#a7b9bc', 'stroke-width': 1,
      'stroke-dasharray': tick ? '2 4' : undefined,
    });
  }
  add(svg, 'text', { x: 16, y: 26, fill: MUTED, 'text-anchor': 'end', 'font-size': 10 }, '100');
  add(svg, 'text', { x: 16, y: 81, fill: MUTED, 'text-anchor': 'end', 'font-size': 10 }, '0');
  const band = (plot.right - plot.left) / Math.max(1, models.length);
  for (const [index, model] of models.entries()) {
    const value = finite(model[key], key);
    if (value < 0 || value > 1) throw new RangeError('Percentage chart inputs must be fractions from 0 to 1');
    const cx = plot.left + band * (index + .5);
    const group = add(svg, 'g', {
      'data-model': model.id,
      'aria-label': `${label(model)}: ${(value * 100).toFixed(1)}%`,
    });
    add(group, 'title', {}, `${label(model)}: ${(value * 100).toFixed(3)}%`);
    add(group, 'rect', {
      x: cx - 14, y: value ? y(value) : plot.bottom - .65,
      width: 28, height: value ? plot.bottom - y(value) : 1.3,
      rx: 1, fill: color(model),
    });
    add(group, 'text', {
      x: cx, y: y(value) - 5, fill: INK,
      'text-anchor': 'middle', 'font-size': 13, 'font-weight': 550,
    }, `${(value * 100).toFixed(1)}`);
    icon(group, model, cx - 7, 87, 14);
  }
  container.replaceChildren(svg);
  return svg;
}
