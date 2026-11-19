import {minimumImage} from './gravity.js';

// Draw each illustration on the same 40-unit disc. All three use the same
// on-screen radius, independent of their orbital coordinates and masses.
const planets = [
  {
    name: 'Earth', surface: '#60b7dd', rim: '#335c70', trail: '#5293ae',
    details: [
      // North and South America seen from the Atlantic.
      ['#76af73', 'M-22 -14 Q-15 -17 -10 -16 L-7 -14 -4 -15 -3 -12 0 -12 -1 -8 -5 -6 -6 -3 -10 -3 -10 0 -7 2 -6 5 -10 3 -13 0 -15 -1 -18 -5 -21 -6Z M-7 2 Q-2 0 0 4 L4 5 3 8 0 11 -1 15 -4 19 -5 15 -5 10 -8 7 -8 4Z'],
      // A sliver of Eurasia and the African coast on the eastern limb.
      ['#76af73', 'M14 -16 L19 -14 22 -7 20 -4 16 -4 15 -7 11 -7 11 -9 14 -10Z M12 -4 L17 -5 23 -1 21 6 16 11 14 9 14 5 12 3 9 2 9 -1Z'],
      ['#b2d88a', 'M-16 -12 L-10 -14 -7 -13 -6 -11 -10 -10 -11 -8 -14 -8Z M-6 3 L-1 3 1 5 -2 7 -6 6Z M10 -2 L14 -4 18 -3 17 -1 12 0Z'],
      ['#effaf9', 'M-14 -15 Q-11 -17 -8 -16 Q-6 -19 -3 -17 Q0 -17 1 -16 Q-5 -13 -14 -15Z M1 -4 Q3 -6 5 -5 Q7 -7 9 -5 L12 -5 Q7 -2 1 -4Z M-18 5 Q-15 3 -13 5 Q-10 4 -8 6 Q-13 8 -18 5Z']
    ]
  },
  {
    name: 'Venus', surface: '#f1bd69', rim: '#87643f', trail: '#bb8b4c',
    details: [
      ['#d79353', 'M-23 -3 Q-16 2 -10 0 Q-2 -2 3 -9 Q8 -16 20 -14 L23 -5 Q14 -9 7 -4 Q2 1 -7 4 Q-15 7 -23 3Z M-19 15 Q-8 15 0 9 Q8 2 14 4 Q20 6 22 2 L22 12 Q16 11 12 9 Q7 7 3 13 Q-6 22 -17 20Z'],
      ['#ffdd92', 'M-24 -12 Q-12 -3 -4 -9 Q4 -16 6 -21 L12 -21 Q8 -12 3 -8 Q-6 1 -16 -4 L-23 -7Z M-22 6 Q-15 11 -5 6 Q0 3 4 0 Q10 -6 15 -5 Q18 -5 21 -2 Q14 -5 9 -1 Q5 3 -1 7 Q-10 14 -20 11Z'],
      ['#fff0b9', 'M-21 -13 Q-13 -7 -8 -9 Q-2 -10 2 -16 Q-2 -6 -10 -6 Q-16 -6 -21 -10Z M5 7 Q11 0 16 3 Q20 6 23 4 Q21 8 17 7 Q12 3 5 7Z'],
      ['#d69a59', 'M-12 -20 Q-9 -15 -2 -18 L-4 -16 Q-9 -12 -17 -18Z']
    ]
  },
  {
    name: 'Mars', surface: '#df8866', rim: '#895245', trail: '#bd7862',
    details: [
      ['#bd6551', 'M-23 4 Q-17 1 -13 4 Q-9 7 -5 5 Q0 2 4 5 L9 9 Q11 11 16 10 Q11 16 5 12 Q2 8 -4 10 Q-12 13 -18 8Z M14 -14 Q19 -16 22 -13 L22 -6 Q17 -5 16 -8Z'],
      ['#f5ccb2', 'M-12 -17 Q-8 -22 1 -21 L6 -20 Q4 -17 0 -16 Q-6 -17 -8 -15Z'],
      // Lit crater floor and darker upper rim.
      ['#efaf85', 'M-11 -8 C-10 -13 -2 -12 -1 -7 C0 -2 -8 1 -11 -4 Q-12 -6 -11 -8Z M7 0 C7 -3 12 -4 13 -1 C15 3 8 5 7 1Z'],
      ['#ad6551', 'M-11 -7 C-10 -12 -2 -12 -1 -7 Q-3 -10 -7 -8 Q-10 -7 -9 -4 Q-11 -4 -11 -7Z M7 0 C7 -3 12 -4 13 -1 Q9 -3 8 1Z M-12 12 Q-10 10 -8 12 Q-10 14 -12 12Z'],
      ['#f2b392', 'M2 -12 Q4 -14 6 -12 Q5 -10 2 -11Z']
    ]
  }
];

for (const planet of planets) {
  planet.details = planet.details.map(([colour, outline]) => [colour, new Path2D(outline)]);
}
const disc = new Path2D();
disc.arc(0, 0, 20, 0, 2*Math.PI);
const terminator = new Path2D('M8 -20 C23 -3 12 18 -5 21 L22 22 22 -21Z');

function drawPlanet(ctx, x, y, radius, planet) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(radius/20, radius/20);
  ctx.fillStyle = planet.surface;
  ctx.fill(disc);
  ctx.save();
  ctx.clip(disc);
  for (const [colour, shape] of planet.details) {
    ctx.fillStyle = colour;
    ctx.fill(shape);
  }
  ctx.fillStyle = 'rgba(38,42,53,.14)';
  ctx.fill(terminator);
  ctx.restore();
  ctx.strokeStyle = planet.rim;
  ctx.lineWidth = 1.05;
  ctx.stroke(disc);
  ctx.restore();
}

export function createSpaceGrid(canvas) {
  const ctx = canvas.getContext('2d');
  let width = 1, height = 1, ratio = 1;
  let scale = 1, ox = 0, oy = 0, planetRadius = 13.6;

  function resize(w, h) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const wide = width >= 1000;
    ox = width * (wide ? .824 : .5);
    oy = height * (wide ? .49 : .743);
    planetRadius = .85 * Math.max(16, Math.min(22, width * .019));
    // The initial figure eight is wider than it is tall. Keep its nearest
    // neighbours unambiguous even on a narrow display.
    scale = Math.min(width * (wide ? .14 : 1/4.4), height * (wide ? 1/2.25 : .35));
    return {width: width / scale, height: height / scale};
  }

  const wrap = (value, period) => value - period * Math.floor(value / period);
  const px = x => wrap(ox + x * scale, width);
  const py = y => wrap(oy - y * scale, height);

  // Paint each image whose bounds intersect the viewport, including a
  // diagonally opposite image when an illustration straddles a corner.
  function visibleImages(left, right, top, bottom, paint) {
    for (let i = Math.ceil(-right/width); i <= Math.floor((width-left)/width); i++)
      for (let j = Math.ceil(-bottom/height); j <= Math.floor((height-top)/height); j++)
        paint(i * width, j * height);
  }

  function drawGrid(bodies, source) {
    const ideal = width < 620 ? 15 : 19;
    // Fit whole groups of four lines per period so even the major strokes
    // and the sampled deformations match at opposite edges.
    const columns = 4 * Math.max(1, Math.round(width / (4 * ideal)));
    const rows = 4 * Math.max(1, Math.round(height / (4 * ideal)));
    const stepX = width / columns, stepY = height / rows;
    const centers = source ? [...bodies, source] : bodies;
    const wells = centers.map(({x, y, mass}) => {
      // Compact display profiles localize the distortion to each well.
      const size = Math.cbrt(mass);
      const radius = Math.max(4.8*ideal, Math.min(180, .82*scale)) * size;
      return {x: px(x), y: py(y), radius, weight: size};
    });

    function relief(x, y) {
      let shiftX = 0, shiftY = 0, depth = 0, lightSlope = 0;
      for (const well of wells) {
        const dx = minimumImage(x - well.x, width), dy = minimumImage(y - well.y, height);
        const q = 1 - (dx*dx + dy*dy)/(well.radius*well.radius);
        if (q <= 0) continue;
        const profile = well.weight*q*q*q;
        // Pull the coordinate strokes inward. Foreshortening inside the lip
        // gives the well a recessed floor, while pinning its centre and rim.
        shiftX -= .82 * dx * profile;
        shiftY -= .82 * dy * profile;
        shiftY += .40 * well.radius * profile * (1-q);
        depth += profile;
        // Directional derivative of the bowl height along the upper-left
        // light. The near wall is in shade, and the opposite inner wall lit.
        lightSlope += well.weight * q*q * (.64*dx + .77*dy)/well.radius;
      }
      const blend = Math.max(1, depth);
      const ink = Math.min(1, Math.max(0, .15 + .45*Math.min(1,depth) - 1.75*lightSlope));
      return {x: x+shiftX/blend, y: y+shiftY/blend, ink};
    }

    // Bin only the stroke ink. The paper between grid lines stays uniform.
    const bands = 16;
    const paths = Array.from({length:2*bands}, () => new Path2D());
    const margin = Math.max(...wells.map(well => well.radius)) * .5;
    function gridLine(isRow, fixed, major) {
      const intervals = (isRow ? columns : rows) * 4;
      const spacing = (isRow ? stepX : stepY) / 4;
      const padding = Math.ceil(margin / spacing);
      let previous = null, previousTone = -1;
      for (let k = -padding; k <= intervals + padding; k++) {
        const along = k * spacing;
        const point = isRow ? relief(along, fixed) : relief(fixed, along);
        if (previous) {
          const tone = Math.round(.5*(previous.ink+point.ink)*(bands-1));
          const path = paths[tone + (major ? bands : 0)];
          if (tone !== previousTone) path.moveTo(previous.x, previous.y);
          path.lineTo(point.x, point.y);
          previousTone = tone;
        }
        previous = point;
      }
    }
    const padX = Math.ceil(margin/stepX), padY = Math.ceil(margin/stepY);
    for (let i = -padX; i <= columns+padX; i++)
      gridLine(false, i*stepX, i%4===0);
    for (let i = -padY; i <= rows+padY; i++)
      gridLine(true, i*stepY, i%4===0);
    ctx.lineCap = 'round';
    for (let i = 0; i < paths.length; i++) {
      const ink = (i%bands)/(bands-1), major = i >= bands;
      ctx.strokeStyle = 'rgba(60,60,60,'+(.07+.68*ink+(major ? .045 : 0))+')';
      ctx.lineWidth = .62+.92*ink+(major ? .22 : 0);
      ctx.stroke(paths[i]);
    }
  }

  function trailSegment(a, b) {
    // Keep the displacement in the unwrapped plane. Only wrap the start of
    // each short segment; wrapping both endpoints would draw a false chord.
    const dx = (b.x-a.x)*scale, dy = (a.y-b.y)*scale;
    const pieces = Math.max(1, Math.ceil(Math.max(Math.abs(dx)/width, Math.abs(dy)/height)));
    const startX = px(a.x), startY = py(a.y);
    for (let i = 0; i < pieces; i++) {
      const x = wrap(startX + dx*i/pieces, width), y = wrap(startY + dy*i/pieces, height);
      const ex = x + dx/pieces, ey = y + dy/pieces;
      visibleImages(Math.min(x,ex)-1, Math.max(x,ex)+1, Math.min(y,ey)-1, Math.max(y,ey)+1, (tx,ty) => {
        ctx.moveTo(x+tx, y+ty);
        ctx.lineTo(ex+tx, ey+ty);
      });
    }
  }

  function drawTrail(body, path, material) {
    if (!path?.length) return;
    ctx.strokeStyle = material.trail;
    ctx.lineWidth = width < 620 ? 1.3 : 1.6;
    ctx.lineCap = 'round';
    for (let start = 0; start < path.length; start += 6) {
      const end = Math.min(start + 6, path.length);
      ctx.globalAlpha = .08 + .7 * end / path.length;
      ctx.beginPath();
      for (let i = start; i < end; i++) trailSegment(path[i], path[i+1] || body);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function draw(bodies, trails = [], source = null) {
    if (!bodies.length) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    drawGrid(bodies, source);
    for (const b of bodies) drawTrail(b, trails[b.id], planets[b.id]);
    for (const b of bodies) {
      const x = px(b.x), y = py(b.y), edge = planetRadius * 1.03;
      visibleImages(x-edge, x+edge, y-edge, y+edge, (tx,ty) => {
        drawPlanet(ctx, x+tx, y+ty, planetRadius, planets[b.id]);
      });
    }
  }

  function worldAt(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    const x = (clientX - box.left) * width / (box.width || 1);
    const y = (clientY - box.top) * height / (box.height || 1);
    return {x: (x - ox) / scale, y: (oy - y) / scale};
  }

  return {resize, draw, worldAt};
}
