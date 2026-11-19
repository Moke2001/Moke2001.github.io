import {createGravityWorld} from './gravity.js';
import {createSpaceGrid} from './space-grid.js';

// Draw short histories of integrated positions, including the opening frame.
const SAMPLE = 1 / 48;
const HISTORY = 68;
const SPEED = 0.60;

export function setupGravityScene(figure) {
  if (!figure || figure.classList.contains('is-ready')) return;
  const hero = figure.closest('.sg-title-block');
  const canvas = figure.querySelector('canvas');
  if (!canvas.getContext('2d')) return;
  const grid = createSpaceGrid(canvas);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let bounds, world, trails, sampleTime;
  let paused = reduced.matches, visible = true;
  let pointer = null, activeTouch = null;
  let frame = 0, lastTime = null;

  function record() {
    for (const {id, x, y} of world.bodies) {
      trails[id].push({x, y});
      if (trails[id].length > HISTORY) trails[id].shift();
    }
  }

  function restart() {
    world = createGravityWorld(bounds);
    trails = world.bodies.map(() => []);
    for (let i = 0; i < HISTORY; i++) {
      record();
      world.advance(SAMPLE);
    }
    sampleTime = 0;
    pointer = null;
    activeTouch = null;
  }

  function draw() {
    grid.draw(world.bodies, trails, world.source);
  }

  function setSourceAt(x, y) {
    const point = grid.worldAt(x, y);
    world.setCursor(point.x, point.y);
  }

  function aim(x, y) {
    if (!world) return;
    const entering = !pointer;
    pointer = {x, y};
    setSourceAt(x, y);
    if (entering) figure.classList.add('has-gravity-source');
    if (entering || paused) draw();
  }

  function tick(now) {
    frame = 0;
    if (lastTime !== null && now - lastTime < 1000 / 36) {
      frame = requestAnimationFrame(tick);
      return;
    }
    const dt = lastTime === null ? 0 : Math.min(.09, (now - lastTime) / 1000) * SPEED;
    lastTime = now;
    let remaining = dt;
    while (remaining >= SAMPLE - sampleTime) {
      const step = SAMPLE - sampleTime;
      world.advance(step);
      remaining -= step;
      sampleTime = 0;
      record();
    }
    world.advance(remaining);
    sampleTime += remaining;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function updatePlayback() {
    if (!world || paused || document.hidden || !visible) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = null;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    bounds = grid.resize(box.width, box.height);
    if (world) {
      world.setBounds(bounds);
    } else {
      restart();
      figure.classList.add('is-ready');
      updatePlayback();
    }
    if (pointer) {
      if (pointer.x < box.left || pointer.x > box.right || pointer.y < box.top || pointer.y > box.bottom) {
        release();
        return;
      }
      setSourceAt(pointer.x, pointer.y);
    }
    draw();
  }

  resize();

  function release() {
    if (!pointer) return;
    pointer = null;
    activeTouch = null;
    world.clearCursor();
    figure.classList.remove('has-gravity-source');
    draw();
  }
  function pointAtEvent(event) {
    if (!event.isPrimary) return;
    if (event.target.closest('a, button, input, select')) {
      release();
      return;
    }
    if (event.pointerType === 'touch' && activeTouch !== event.pointerId) return;
    aim(event.clientX, event.clientY);
  }
  for (const type of ['pointerenter', 'pointermove']) {
    hero.addEventListener(type, pointAtEvent);
  }
  hero.addEventListener('pointerdown', event => {
    if (!event.isPrimary) return;
    if (event.pointerType === 'touch') activeTouch = event.pointerId;
    pointAtEvent(event);
  });
  hero.addEventListener('pointerup', event => {
    if (event.pointerId === activeTouch) release();
  });
  hero.addEventListener('pointercancel', event => { if (event.isPrimary) release(); });
  hero.addEventListener('pointerleave', event => { if (event.isPrimary) release(); });
  canvas.addEventListener('blur', release);
  window.addEventListener('blur', release);

  canvas.addEventListener('keydown', event => {
    if (event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) {
        paused = !paused;
        updatePlayback();
      }
      return;
    }
    if (event.key === 'Escape') { release(); return; }
    const moves = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const box = canvas.getBoundingClientRect();
    const x = pointer?.x ?? box.left + box.width / 2;
    const y = pointer?.y ?? box.top + box.height / 2;
    const step = event.shiftKey ? 30 : 12;
    if (!box.width || !box.height) return;
    const wrap = (offset, length) => ((offset % length) + length) % length;
    aim(box.left + wrap(x - box.left + step * move[0], box.width),
        box.top + wrap(y - box.top + step * move[1], box.height));
  });

  figure.querySelector('.sg-gravity-reset').addEventListener('click', () => {
    if (!bounds) return;
    restart();
    figure.classList.remove('has-gravity-source');
    lastTime = null;
    draw();
  });
  const motionChanged = () => {
    paused = reduced.matches;
    release();
    updatePlayback();
  };
  if (reduced.addEventListener) reduced.addEventListener('change', motionChanged);
  else reduced.addListener(motionChanged);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) release();
    updatePlayback();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) release();
      updatePlayback();
    }).observe(canvas);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
}
