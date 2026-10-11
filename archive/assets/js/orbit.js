/**
 * Ambient Physics Hero
 * Two symbiotic celestial particles in soft gravitational orbit,
 * with restrained cursor influence — cinematic, never aggressive.
 */
(function () {
  const canvas = document.getElementById('orbit-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let time = 0;

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

  const ink = { r: 30, g: 29, b: 27 };
  const terracotta = { r: 182, g: 90, b: 66 };
  const linen = { r: 217, g: 203, b: 188 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function center() {
    return { x: width * 0.52, y: height * 0.46 };
  }

  // Soft two-body system around shared barycenter
  const bodyA = {
    angle: 0,
    radius: 0,
    baseRadius: 0,
    size: 3.2,
    color: terracotta,
  };
  const bodyB = {
    angle: Math.PI,
    radius: 0,
    baseRadius: 0,
    size: 2.4,
    color: ink,
  };

  function layoutBodies() {
    const span = Math.min(width, height);
    bodyA.baseRadius = span * 0.16;
    bodyB.baseRadius = span * 0.22;
    bodyA.radius = bodyA.baseRadius;
    bodyB.radius = bodyB.baseRadius;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function onPointer(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.tx = e.clientX - rect.left;
    mouse.ty = e.clientY - rect.top;
    mouse.active = true;
  }

  function onLeave() {
    mouse.active = false;
  }

  function drawGlow(x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${alpha})`);
    g.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTrail(points, color) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.12)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const trailA = [];
  const trailB = [];
  const TRAIL = 48;

  function step(dt) {
    time += dt;
    const c = center();

    // Gentle orbital drift
    const omegaA = 0.18;
    const omegaB = -0.13;
    bodyA.angle += omegaA * dt;
    bodyB.angle += omegaB * dt;

    // Breathing radius modulation
    bodyA.radius = bodyA.baseRadius * (1 + Math.sin(time * 0.35) * 0.04);
    bodyB.radius = bodyB.baseRadius * (1 + Math.cos(time * 0.28) * 0.05);

    let ax = c.x + Math.cos(bodyA.angle) * bodyA.radius;
    let ay = c.y + Math.sin(bodyA.angle) * bodyA.radius * 0.62;
    let bx = c.x + Math.cos(bodyB.angle) * bodyB.radius;
    let by = c.y + Math.sin(bodyB.angle) * bodyB.radius * 0.62;

    // Soft mutual attraction (visual gravity cue)
    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(8, 120 / dist);
    ax += (dx / dist) * pull * 0.15;
    ay += (dy / dist) * pull * 0.15;
    bx -= (dx / dist) * pull * 0.12;
    by -= (dy / dist) * pull * 0.12;

    // Cursor presence — soft, damped
    mouse.x = lerp(mouse.x, mouse.active ? mouse.tx : c.x, 0.04);
    mouse.y = lerp(mouse.y, mouse.active ? mouse.ty : c.y, 0.04);

    if (mouse.active) {
      const influence = 18;
      const mdxA = mouse.x - ax;
      const mdyA = mouse.y - ay;
      const mdA = Math.hypot(mdxA, mdyA) || 1;
      ax += (mdxA / mdA) * Math.min(influence, 400 / mdA) * 0.08;
      ay += (mdyA / mdA) * Math.min(influence, 400 / mdA) * 0.08;

      const mdxB = mouse.x - bx;
      const mdyB = mouse.y - by;
      const mdB = Math.hypot(mdxB, mdyB) || 1;
      bx += (mdxB / mdB) * Math.min(influence, 400 / mdB) * 0.06;
      by += (mdyB / mdB) * Math.min(influence, 400 / mdB) * 0.06;
    }

    trailA.push({ x: ax, y: ay });
    trailB.push({ x: bx, y: by });
    if (trailA.length > TRAIL) trailA.shift();
    if (trailB.length > TRAIL) trailB.shift();

    ctx.clearRect(0, 0, width, height);

    // Faint orbital path
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, bodyA.baseRadius, bodyA.baseRadius * 0.62, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${linen.r},${linen.g},${linen.b},0.55)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(c.x, c.y, bodyB.baseRadius, bodyB.baseRadius * 0.62, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},0.06)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Connecting filament
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    const mx = (ax + bx) / 2 + Math.sin(time * 0.4) * 12;
    const my = (ay + by) / 2 + Math.cos(time * 0.35) * 8;
    ctx.quadraticCurveTo(mx, my, bx, by);
    ctx.strokeStyle = `rgba(${terracotta.r},${terracotta.g},${terracotta.b},0.18)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    drawTrail(trailA, terracotta);
    drawTrail(trailB, ink);

    drawGlow(ax, ay, 48, terracotta, 0.14);
    drawGlow(bx, by, 40, ink, 0.1);

    // Bodies
    ctx.beginPath();
    ctx.arc(ax, ay, bodyA.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${terracotta.r},${terracotta.g},${terracotta.b},0.9)`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bx, by, bodyB.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},0.75)`;
    ctx.fill();

    // Barycenter tick
    ctx.beginPath();
    ctx.arc(c.x, c.y, 1.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},0.25)`;
    ctx.fill();
  }

  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    raf = requestAnimationFrame(frame);
  }

  function drawStatic() {
    resize();
    layoutBodies();
    const c = center();
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, bodyA.baseRadius, bodyA.baseRadius * 0.62, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${linen.r},${linen.g},${linen.b},0.55)`;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, bodyB.baseRadius, bodyB.baseRadius * 0.62, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},0.06)`;
    ctx.stroke();
    const ax = c.x + bodyA.baseRadius;
    const ay = c.y;
    const bx = c.x - bodyB.baseRadius;
    const by = c.y;
    drawGlow(ax, ay, 48, terracotta, 0.14);
    drawGlow(bx, by, 40, ink, 0.1);
    ctx.beginPath();
    ctx.arc(ax, ay, bodyA.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${terracotta.r},${terracotta.g},${terracotta.b},0.9)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by, bodyB.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},0.75)`;
    ctx.fill();
  }

  resize();
  layoutBodies();
  mouse.x = center().x;
  mouse.y = center().y;
  mouse.tx = mouse.x;
  mouse.ty = mouse.y;

  window.addEventListener('resize', () => {
    resize();
    layoutBodies();
    if (reduced) drawStatic();
  });

  if (reduced) {
    drawStatic();
    return;
  }

  canvas.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('pointerleave', onLeave);
  // Also listen on hero for better UX when veil sits above canvas visually but content is interactive
  const hero = canvas.closest('.hero');
  if (hero) {
    hero.addEventListener('pointermove', onPointer, { passive: true });
    hero.addEventListener('pointerleave', onLeave);
  }

  raf = requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
})();
