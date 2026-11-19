// Rectangular periodic cell, G = 1. Each attraction uses the nearest periodic
// image and a Plummer-softened inverse-square law.
export const SOFTENING = 0.052;
const STEP = 1 / 480;
export const SOURCE_MASS = 0.32;

export function minimumImage(delta, period) {
  const offset = delta % period, half = period / 2;
  if (offset > half) return offset - period;
  if (offset < -half) return offset + period;
  return offset;
}

function body(id, mass, x, y, vx, vy) {
  return {id, mass, x, y, vx, vy};
}

export function createGravityWorld(bounds = {width: 8, height: 6}) {
  let width, height;
  function setBounds({width: w, height: h}) {
    if (!(Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0)) {
      throw new RangeError('Expected finite, positive periodic cell dimensions');
    }
    width = w;
    height = h;
  }
  setBounds(bounds);
  // These velocities were shot for the softened equal-mass figure eight
  // (T/3 = 2.111560293325641). It fits when no pair switches nearest image.
  const vx = 0.465983956783297, vy = 0.430517955262865;
  const bodies = [
    body(0, 1, 0.97000436, -0.24308753, vx, vy),
    body(1, 1, -0.97000436, 0.24308753, vx, vy),
    body(2, 1, 0, 0, -2 * vx, -2 * vy),
  ];
  const ax = new Float64Array(bodies.length), ay = new Float64Array(bodies.length);
  let source = null;
  let pendingSteps = 0;

  function addAttraction(i, other, reactingIndex) {
    const a = bodies[i];
    const dx = minimumImage(other.x - a.x, width);
    const dy = minimumImage(other.y - a.y, height);
    const r2 = dx * dx + dy * dy + SOFTENING * SOFTENING;
    const invR3 = 1 / (r2 * Math.sqrt(r2));
    // Opposite images at exactly half a period are equally near. Average
    // their forces on that axis, retaining the true distance in r².
    const fx = Math.abs(dx) === width / 2 ? 0 : dx * invR3;
    const fy = Math.abs(dy) === height / 2 ? 0 : dy * invR3;
    ax[i] += other.mass * fx;
    ay[i] += other.mass * fy;
    if (reactingIndex !== undefined) {
      ax[reactingIndex] -= a.mass * fx;
      ay[reactingIndex] -= a.mass * fy;
    }
  }

  function acceleration() {
    ax.fill(0);
    ay.fill(0);
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        addAttraction(i, bodies[j], j);
      }
      if (source) addAttraction(i, source);
    }
  }

  function step() {
    acceleration();
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      b.vx += ax[i] * STEP / 2;
      b.vy += ay[i] * STEP / 2;
      // Keep trajectories unwrapped. Only relative separations and the
      // renderer need periodic reduction; crossing a seam leaves v unchanged.
      b.x += b.vx * STEP;
      b.y += b.vy * STEP;
    }
    acceleration();
    for (let i = 0; i < bodies.length; i++) {
      bodies[i].vx += ax[i] * STEP / 2;
      bodies[i].vy += ay[i] * STEP / 2;
    }
  }

  return {
    bodies,
    setBounds,
    get source() { return source; },
    advance(dt) {
      if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Expected a nonnegative finite simulation interval');
      pendingSteps += dt / STEP;
      const count = Math.floor(pendingSteps + 1e-12);
      pendingSteps -= count;
      for (let i = 0; i < count; i++) step();
    },
    setCursor(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError('Expected finite cursor coordinates');
      source = {x, y, mass: SOURCE_MASS};
    },
    clearCursor() {
      source = null;
    },
  };
}
