(() => {
  const canvas = document.getElementById("particle-field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const GREEN = "17, 87, 64";

  let width = 0;
  let height = 0;
  let ratio = 1;
  let particles = [];
  let currentPage = 0;
  let layoutSeed = 1;
  let transitionUntil = 0;
  const startTime = performance.now();
  const mouse = { x: 0, y: 0, active: false };

  function pointerInsideViewport(event) {
    return event.clientX >= 0 && event.clientX <= width && event.clientY >= 0 && event.clientY <= height;
  }

  function deactivateMouse() {
    mouse.active = false;
  }

  function updateMouse(event) {
    if (!pointerInsideViewport(event)) {
      deactivateMouse();
      return;
    }

    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  }

  function randomFor(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function particleCount() {
    return Math.max(86, Math.min(150, Math.floor((width * height) / 9800)));
  }

  function anchorFor(index) {
    const rand = randomFor(9109 + index * 6151 + currentPage * 7919 + layoutSeed * 104729);
    return {
      x: width * (0.08 + rand() * 0.84),
      y: height * (0.16 + rand() * 0.72),
    };
  }

  function createParticle(index, previous) {
    const rand = randomFor(17389 + index * 7919);
    const anchor = anchorFor(index);
    return {
      x: previous ? previous.x : anchor.x + (rand() - 0.5) * 120,
      y: previous ? previous.y : anchor.y + (rand() - 0.5) * 120,
      vx: previous ? previous.vx : (rand() - 0.5) * 0.5,
      vy: previous ? previous.vy : (rand() - 0.5) * 0.5,
      ax: anchor.x,
      ay: anchor.y,
      phase: rand() * Math.PI * 2,
      radius: index % 9 === 0 ? 2.8 : 1.85 + rand() * 0.55,
    };
  }

  function resetParticles() {
    const count = particleCount();
    particles = Array.from({ length: count }, (_, index) => createParticle(index, particles[index]));
  }

  function retargetParticles() {
    const count = particleCount();
    particles = Array.from({ length: count }, (_, index) => {
      const particle = particles[index] || createParticle(index);
      const anchor = anchorFor(index);
      particle.ax = anchor.x;
      particle.ay = anchor.y;

      if (!reducedMotion.matches) {
        particle.vx += (particle.ax - particle.x) * 0.014;
        particle.vy += (particle.ay - particle.y) * 0.014;
      }

      return particle;
    });
  }

  function applyParticleRepulsion() {
    const repulsionRadius = Math.min(126, Math.max(76, width * 0.085));

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq < 0.01 || distanceSq > repulsionRadius * repulsionRadius) continue;

        const distance = Math.sqrt(distanceSq);
        const nx = dx / distance;
        const ny = dy / distance;
        const force = Math.pow(1 - distance / repulsionRadius, 2) * 0.13;
        a.vx -= nx * force;
        a.vy -= ny * force;
        b.vx += nx * force;
        b.vy += ny * force;
      }
    }
  }

  function applyMouseAttraction(particle) {
    if (!mouse.active || reducedMotion.matches) return;
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distanceSq = dx * dx + dy * dy;
    const radius = Math.min(560, Math.max(320, width * 0.38));
    if (distanceSq < 0.01 || distanceSq > radius * radius) return;

    const distance = Math.sqrt(distanceSq);
    const force = Math.pow(1 - distance / radius, 1.5) * 0.82;
    particle.vx += (dx / distance) * force;
    particle.vy += (dy / distance) * force;
  }

  function updateParticle(particle, time, transitionActive) {
    const spring = transitionActive && !reducedMotion.matches ? 0.0065 : 0.0009;
    particle.vx += (particle.ax - particle.x) * spring;
    particle.vy += (particle.ay - particle.y) * spring;

    if (!reducedMotion.matches) {
      particle.vx += Math.sin(time * 1.2 + particle.phase) * 0.004;
      particle.vy += Math.cos(time * 1.1 + particle.phase) * 0.004;
    }

    applyMouseAttraction(particle);

    particle.vx *= 0.92;
    particle.vy *= 0.92;
    const speed = Math.hypot(particle.vx, particle.vy);
    if (speed > 7) {
      particle.vx = (particle.vx / speed) * 7;
      particle.vy = (particle.vy / speed) * 7;
    }
    particle.x += particle.vx;
    particle.y += particle.vy;

    const margin = 28;
    if (particle.x < -margin) {
      particle.x = -margin;
      particle.vx = Math.abs(particle.vx) * 0.7;
    } else if (particle.x > width + margin) {
      particle.x = width + margin;
      particle.vx = -Math.abs(particle.vx) * 0.7;
    }

    if (particle.y < -margin) {
      particle.y = -margin;
      particle.vy = Math.abs(particle.vy) * 0.7;
    } else if (particle.y > height + margin) {
      particle.y = height + margin;
      particle.vy = -Math.abs(particle.vy) * 0.7;
    }
  }

  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    resetParticles();
  }

  function setPage(page) {
    const nextPage = Number.isFinite(page) ? Math.max(0, Math.floor(page)) : 0;
    if (nextPage === currentPage) return;

    currentPage = nextPage;
    layoutSeed += 1;
    transitionUntil = performance.now() + 1400;
    retargetParticles();
  }

  function draw() {
    const time = (performance.now() - startTime) / 1000;
    const transitionActive = performance.now() < transitionUntil;
    ctx.clearRect(0, 0, width, height);

    if (!reducedMotion.matches) applyParticleRepulsion();

    for (const particle of particles) {
      updateParticle(particle, time, transitionActive);
      ctx.fillStyle = `rgba(${GREEN}, 0.72)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.EurekaParticles = { setPage };
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", updateMouse);
  window.addEventListener("pointerout", event => {
    if (!event.relatedTarget) deactivateMouse();
  });
  window.addEventListener("mouseout", event => {
    if (!event.relatedTarget) deactivateMouse();
  });
  document.addEventListener("pointerout", event => {
    if (!event.relatedTarget) deactivateMouse();
  });
  document.addEventListener("mouseout", event => {
    if (!event.relatedTarget) deactivateMouse();
  });
  document.addEventListener("pointerleave", deactivateMouse);
  document.documentElement.addEventListener("mouseleave", deactivateMouse);
  window.addEventListener("pointerleave", deactivateMouse);
  window.addEventListener("blur", deactivateMouse);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) deactivateMouse();
  });
  window.addEventListener("eureka:pagechange", event => setPage(event.detail?.index || 0));

  resize();
  draw();
})();
