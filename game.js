(() => {
  'use strict';

  const cabinet = document.querySelector('[data-run-cabinet]');
  const canvas = document.querySelector('[data-run-canvas]');
  const ctx = canvas?.getContext('2d');
  const scoreNode = document.querySelector('[data-run-score]');
  const bestNode = document.querySelector('[data-run-best]');
  const stateNode = document.querySelector('[data-run-state]');
  const overlay = document.querySelector('[data-run-overlay]');
  const startButton = document.querySelector('[data-run-start]');
  const pauseButton = document.querySelector('[data-run-pause]');
  const jumpButton = document.querySelector('[data-run-jump]');

  if (!cabinet || !canvas || !ctx) return;

  const storageKey = 'existential-crisis-fun-zone:run-best';
  const world = {
    width: 800,
    height: 260,
    ground: 214,
    playerX: 92,
    playerHeight: 58,
    gravity: 1850,
    jumpVelocity: -610,
    holdGravityBoost: -1040,
    maxHold: 0.19,
  };

  const groundTypes = [
    { type: 'ink', w: 34, h: 42, safeGap: 330 },
    { type: 'books', w: 50, h: 44, safeGap: 360 },
    { type: 'mask', w: 42, h: 36, safeGap: 340 },
    { type: 'quill', w: 30, h: 58, safeGap: 390 },
  ];
  const airTypes = [
    { type: 'folio', w: 56, h: 26, y: 151, safeGap: 375 },
    { type: 'sonnet', w: 50, h: 24, y: 114, safeGap: 345 },
    { type: 'cloudMask', w: 48, h: 28, y: 137, safeGap: 365 },
  ];
  const colors = {
    ink: '#202044',
    cobalt: '#4545ff',
    pink: '#ff66b3',
    lime: '#dfff58',
    orange: '#ff964a',
    vanilla: '#fffdf4',
    blue: '#c7d4ff',
    blush: '#f2b28e',
  };

  let state = 'READY';
  let active = false;
  let frame = 0;
  let previous = 0;
  let score = 0;
  let best = 0;
  let velocity = 0;
  let playerY = world.ground - world.playerHeight;
  let obstacles = [];
  let particles = [];
  let nextSpawnDistance = 220;
  let distance = 0;
  let jumpHeld = false;
  let jumpHoldTime = 0;
  let jumpCutUsed = false;
  let milestone = 0;
  let celebrationTime = 0;

  try {
    best = Number(localStorage.getItem(storageKey)) || 0;
  } catch {
    best = 0;
  }

  const random = (min, max) => min + Math.random() * (max - min);
  const pad = number => String(Math.floor(number)).padStart(4, '0');
  const setText = (node, value) => { node.textContent = value; };
  const isGrounded = () => playerY >= world.ground - world.playerHeight - 0.5;
  const getSpeed = () => 245 + Math.min(190, score * 2.35);

  const saveBest = () => {
    try {
      localStorage.setItem(storageKey, String(Math.floor(best)));
    } catch {
      /* High score remains available for this visit. */
    }
  };

  const updateHud = () => {
    setText(scoreNode, pad(score));
    setText(bestNode, pad(best));
    setText(stateNode, state.replace('_', ' '));
  };

  const setOverlay = (title, text) => {
    overlay.replaceChildren();
    const strong = document.createElement('strong');
    const span = document.createElement('span');
    strong.textContent = title;
    span.textContent = text;
    overlay.append(strong, span);
    overlay.hidden = false;
  };

  const clearOverlay = () => { overlay.hidden = true; };

  const drawRoundRect = (x, y, w, h, r, fill, stroke = colors.ink, line = 4) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = line;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.restore();
  };

  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  const circle = (x, y, radius, color, stroke = colors.ink, line = 3) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = line;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.restore();
  };

  const reset = () => {
    score = 0;
    velocity = 0;
    playerY = world.ground - world.playerHeight;
    obstacles = [];
    particles = [];
    nextSpawnDistance = 260;
    distance = 0;
    jumpHeld = false;
    jumpHoldTime = 0;
    jumpCutUsed = false;
    milestone = 0;
    celebrationTime = 0;
    updateHud();
  };

  const start = () => {
    if (!active) return;
    cancelAnimationFrame(frame);
    reset();
    state = 'RUNNING';
    startButton.textContent = 'RESTART RUN';
    pauseButton.disabled = false;
    pauseButton.textContent = 'PAUSE';
    jumpButton.disabled = false;
    clearOverlay();
    previous = performance.now();
    frame = requestAnimationFrame(loop);
  };

  const pause = () => {
    if (state !== 'RUNNING') return;
    state = 'PAUSED';
    cancelAnimationFrame(frame);
    pauseButton.textContent = 'RESUME';
    jumpButton.disabled = true;
    jumpHeld = false;
    setOverlay('PAUSED', 'P to resume. The quills can wait.');
    updateHud();
  };

  const resume = () => {
    if (state !== 'PAUSED') return;
    state = 'RUNNING';
    pauseButton.textContent = 'PAUSE';
    jumpButton.disabled = false;
    clearOverlay();
    previous = performance.now();
    frame = requestAnimationFrame(loop);
  };

  const beginJump = () => {
    if (state === 'READY' || state === 'GAME_OVER') {
      start();
      return;
    }
    if (state !== 'RUNNING' || !isGrounded()) return;
    velocity = world.jumpVelocity;
    jumpHeld = true;
    jumpHoldTime = 0;
    jumpCutUsed = false;
    for (let i = 0; i < 7; i += 1) {
      particles.push({
        x: world.playerX + 16 + random(-5, 14),
        y: world.ground - 5,
        vx: random(-70, 10),
        vy: random(-80, -20),
        life: random(0.25, 0.45),
        color: i % 2 ? colors.orange : colors.pink,
      });
    }
  };

  const endJump = () => {
    jumpHeld = false;
    if (state === 'RUNNING' && velocity < -245 && !jumpCutUsed) {
      velocity *= 0.48;
      jumpCutUsed = true;
    }
  };

  const gameOver = () => {
    state = 'GAME_OVER';
    cancelAnimationFrame(frame);
    best = Math.max(best, Math.floor(score));
    saveBest();
    updateHud();
    pauseButton.disabled = true;
    jumpButton.disabled = true;
    jumpHeld = false;
    setOverlay('ALAS, POOR PLAYER!', `Final score ${Math.floor(score)}. Press SPACE or START to try again.`);
  };

  const makeObstacle = () => {
    const useAir = score > 10 && Math.random() < Math.min(0.42, 0.18 + score / 180);
    const pool = useAir ? airTypes : groundTypes;
    const template = pool[Math.floor(Math.random() * pool.length)];
    const y = template.y ?? world.ground - template.h;
    return {
      ...template,
      x: world.width + 24,
      y,
      wobble: random(0, Math.PI * 2),
      airborne: useAir,
    };
  };

  const scheduleNextObstacle = obstacle => {
    const speed = getSpeed();
    const recovery = obstacle.airborne ? 0.82 : 1.02;
    nextSpawnDistance = distance + speed * recovery + obstacle.safeGap + random(40, 110);
  };

  const maybeSpawnObstacle = () => {
    if (distance < nextSpawnDistance) return;
    const rightmost = obstacles.reduce((max, item) => Math.max(max, item.x + item.w), 0);
    if (rightmost > world.width - 70) return;
    const obstacle = makeObstacle();
    obstacles.push(obstacle);
    scheduleNextObstacle(obstacle);
  };

  const hit = obstacle => {
    const px = world.playerX + 10;
    const py = playerY + 8;
    const pw = 34;
    const ph = 45;
    const ox = obstacle.x + 5;
    const oy = obstacle.y + 5;
    const ow = obstacle.w - 10;
    const oh = obstacle.h - 10;
    return px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy;
  };

  const drawCastle = (offset, palette) => {
    const baseX = 545 - offset;
    rect(baseX, 150, 150, 47, palette.castle);
    rect(baseX + 20, 116, 34, 81, palette.castle);
    rect(baseX + 95, 126, 36, 71, palette.castle);
    rect(baseX + 36, 104, 76, 93, palette.castle);
    rect(baseX + 38, 94, 12, 12, palette.castleTop);
    rect(baseX + 68, 94, 12, 12, palette.castleTop);
    rect(baseX + 98, 94, 12, 12, palette.castleTop);
    rect(baseX + 63, 170, 24, 27, palette.skyBottom);
  };

  const getDayPalette = () => {
    const cycle = (distance / 2100) % 2;
    const night = cycle > 1 ? 2 - cycle : cycle;
    if (night > 0.52) {
      return {
        skyTop: '#202044',
        skyBottom: '#4545ff',
        sun: '#fffdf4',
        sunStroke: colors.lime,
        cloud: '#c7d4ff',
        castle: '#2d2d66',
        castleTop: '#ff66b3',
        ground: colors.lime,
        tile: colors.pink,
        stars: true,
      };
    }
    return {
      skyTop: '#fffdf4',
      skyBottom: '#c7d4ff',
      sun: colors.orange,
      sunStroke: colors.ink,
      cloud: colors.vanilla,
      castle: colors.pink,
      castleTop: colors.orange,
      ground: colors.ink,
      tile: colors.orange,
      stars: false,
    };
  };

  const drawBackground = () => {
    const palette = getDayPalette();
    const gradient = ctx.createLinearGradient(0, 0, 0, world.height);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, world.width, world.height);

    circle(650, 62, 30, palette.sun, palette.sunStroke, 4);
    if (palette.stars) {
      ctx.fillStyle = colors.lime;
      for (let i = 0; i < 22; i += 1) {
        const x = (i * 71 + 24 - distance * 0.06) % world.width;
        const y = 24 + ((i * 23) % 86);
        ctx.fillRect(x, y, i % 3 === 0 ? 10 : 5, 4);
      }
    }

    for (let i = 0; i < 5; i += 1) {
      const x = (i * 205 - distance * 0.14) % (world.width + 120) - 70;
      const y = 50 + (i % 3) * 24;
      drawRoundRect(x, y, 78, 18, 9, palette.cloud, colors.ink, 2);
      drawRoundRect(x + 30, y - 13, 42, 23, 12, palette.cloud, colors.ink, 2);
    }

    drawCastle((distance * 0.07) % 260, palette);
    rect(0, world.ground, world.width, 7, palette.ground);
    rect(0, world.ground + 7, world.width, world.height - world.ground - 7, colors.vanilla);
    for (let i = 0; i < 18; i += 1) {
      rect(i * 52 - (distance % 52), world.ground + 15, 30, 5, palette.tile);
    }
    for (let i = 0; i < 26; i += 1) {
      rect(i * 34 - (distance * 1.35 % 34), world.ground - 5, 15, 5, colors.ink);
    }
  };

  const drawPlayer = () => {
    const jumping = !isGrounded();
    const failed = state === 'GAME_OVER';
    const stride = Math.floor(distance / 24) % 2;
    ctx.save();
    ctx.translate(world.playerX, playerY);
    if (failed) ctx.rotate(0.3);

    drawRoundRect(9, 23, 36, 31, 7, colors.ink, colors.ink, 3);
    rect(16, 32, 22, 10, colors.cobalt);
    ctx.fillStyle = colors.vanilla;
    ctx.beginPath();
    ctx.moveTo(7, 23);
    ctx.lineTo(47, 23);
    ctx.lineTo(39, 35);
    ctx.lineTo(15, 35);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors.ink;
    ctx.stroke();

    circle(27, 15, 15, colors.blush, colors.ink, 3);
    rect(10, 3, 14, 15, '#39234d');
    rect(31, 3, 14, 15, '#39234d');
    rect(14, 2, 26, 7, '#39234d');
    rect(19, 17, 16, 3, '#39234d');
    rect(24, 21, 8, 3, '#39234d');
    rect(18, 12, 4, 3, colors.ink);
    rect(32, 12, 4, 3, colors.ink);

    const leftLeg = jumping ? 6 : stride ? 15 : 8;
    const rightLeg = jumping ? 7 : stride ? 8 : 15;
    rect(13, 53, 9, leftLeg, colors.ink);
    rect(34, 53, 9, rightLeg, colors.ink);
    rect(5, jumping ? 34 : 39, 11, 5, colors.pink);
    rect(41, jumping ? 36 : 39, 10, 5, colors.lime);
    if (jumping) rect(0, 47, 10, 5, colors.orange);
    ctx.restore();
  };

  const drawObstacle = obstacle => {
    const t = distance / 30 + obstacle.wobble;
    ctx.save();
    ctx.translate(obstacle.x, obstacle.y + (obstacle.airborne ? Math.sin(t) * 4 : 0));
    if (obstacle.type === 'ink') {
      drawRoundRect(5, 8, 24, 31, 6, colors.cobalt);
      rect(10, 1, 14, 10, colors.ink);
      rect(11, 20, 12, 8, colors.lime);
      rect(25, 3, 7, 7, colors.pink);
    } else if (obstacle.type === 'books') {
      drawRoundRect(1, 30, 46, 12, 4, colors.orange);
      drawRoundRect(7, 17, 39, 13, 4, colors.pink);
      drawRoundRect(2, 3, 42, 14, 4, colors.lime);
      rect(10, 7, 22, 3, colors.ink);
    } else if (obstacle.type === 'mask') {
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.ellipse(21, 18, 18, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = colors.ink;
      ctx.stroke();
      rect(12, 14, 6, 4, colors.ink);
      rect(25, 14, 6, 4, colors.ink);
      ctx.beginPath();
      ctx.arc(22, 23, 8, 0, Math.PI);
      ctx.stroke();
    } else if (obstacle.type === 'quill') {
      ctx.fillStyle = colors.vanilla;
      ctx.beginPath();
      ctx.ellipse(15, 27, 12, 26, -0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.ink;
      ctx.stroke();
      rect(15, 2, 4, 55, colors.ink);
      rect(1, 42, 24, 6, colors.pink);
    } else if (obstacle.type === 'folio') {
      drawRoundRect(4, 4, 46, 19, 5, colors.vanilla);
      rect(9, 9, 12, 3, colors.cobalt);
      rect(26, 9, 14, 3, colors.pink);
      rect(8, 15, 31, 3, colors.ink);
      ctx.fillStyle = colors.lime;
      ctx.beginPath();
      ctx.moveTo(3, 9);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-3, 19);
      ctx.fill();
    } else if (obstacle.type === 'sonnet') {
      ctx.save();
      ctx.rotate(Math.sin(t) * 0.12);
      drawRoundRect(0, 0, 38, 24, 4, colors.lime);
      rect(7, 7, 23, 3, colors.ink);
      rect(7, 14, 19, 3, colors.pink);
      ctx.restore();
    } else if (obstacle.type === 'cloudMask') {
      circle(16, 15, 14, colors.orange, colors.ink, 3);
      rect(10, 12, 5, 4, colors.ink);
      rect(21, 12, 5, 4, colors.ink);
      rect(15, 21, 11, 3, colors.ink);
      rect(-2, 14, 8, 4, colors.cobalt);
      rect(36, 14, 10, 4, colors.cobalt);
    }
    ctx.restore();
  };

  const drawParticles = dt => {
    particles.forEach(particle => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 230 * dt;
      ctx.globalAlpha = Math.max(0, particle.life * 2.4);
      rect(particle.x, particle.y, 5, 5, particle.color);
      ctx.globalAlpha = 1;
    });
    particles = particles.filter(particle => particle.life > 0);
  };

  const drawCelebration = () => {
    if (celebrationTime <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, celebrationTime * 2.5);
    ctx.translate(572, 32);
    ctx.rotate(distance / 120);
    for (let i = 0; i < 12; i += 1) {
      ctx.rotate(Math.PI / 6);
      rect(16, -2, 28, 4, i % 2 ? colors.pink : colors.lime);
    }
    ctx.restore();
  };

  const draw = (dt = 0) => {
    ctx.clearRect(0, 0, world.width, world.height);
    drawBackground();
    obstacles.forEach(drawObstacle);
    drawParticles(dt);
    drawPlayer();
    drawCelebration();
  };

  const updateBestLive = () => {
    const current = Math.floor(score);
    if (current > best) {
      best = current;
      saveBest();
    }
  };

  const loop = now => {
    if (state !== 'RUNNING') return;
    const dt = Math.min(0.035, (now - previous) / 1000);
    previous = now;

    const speed = getSpeed();
    score += dt * 9.2;
    updateBestLive();
    const currentMilestone = Math.floor(score / 100);
    if (currentMilestone > milestone) {
      milestone = currentMilestone;
      celebrationTime = 1.1;
    }
    celebrationTime = Math.max(0, celebrationTime - dt);

    distance += speed * dt;
    if (jumpHeld && jumpHoldTime < world.maxHold && velocity < -80) {
      velocity += world.holdGravityBoost * dt;
      jumpHoldTime += dt;
    }
    velocity += world.gravity * dt;
    playerY += velocity * dt;
    if (playerY >= world.ground - world.playerHeight) {
      playerY = world.ground - world.playerHeight;
      velocity = 0;
      jumpHeld = false;
    }

    maybeSpawnObstacle();
    obstacles.forEach(obstacle => {
      obstacle.x -= speed * dt;
    });
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.w > -30);

    if (obstacles.some(hit)) {
      draw(dt);
      gameOver();
      return;
    }

    draw(dt);
    updateHud();
    frame = requestAnimationFrame(loop);
  };

  const consumesGameKey = event => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return false;
    return target === document.body || target === canvas || cabinet.contains(target);
  };

  document.addEventListener('keydown', event => {
    if (!active || !consumesGameKey(event)) return;
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      if (!event.repeat) beginJump();
    } else if (event.code === 'KeyP' && !event.repeat && (state === 'RUNNING' || state === 'PAUSED')) {
      event.preventDefault();
      state === 'RUNNING' ? pause() : resume();
    }
  });

  document.addEventListener('keyup', event => {
    if (!active) return;
    if (event.code === 'Space' || event.code === 'ArrowUp') endJump();
  });

  startButton.addEventListener('click', start);
  pauseButton.addEventListener('click', () => state === 'PAUSED' ? resume() : pause());
  jumpButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    beginJump();
  });
  jumpButton.addEventListener('pointerup', endJump);
  jumpButton.addEventListener('pointercancel', endJump);
  jumpButton.addEventListener('pointerleave', endJump);
  jumpButton.addEventListener('click', event => {
    event.preventDefault();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });

  window.ShakespeareRun = {
    activate() {
      active = true;
      cabinet.hidden = false;
      state = 'READY';
      reset();
      pauseButton.disabled = true;
      pauseButton.textContent = 'PAUSE';
      jumpButton.disabled = false;
      startButton.textContent = 'START GAME';
      setOverlay('TO BE OR NOT TO BE: THE RUN', 'Press SPACE or START GAME, then jump the drama.');
      draw();
    },
    deactivate() {
      active = false;
      cancelAnimationFrame(frame);
      obstacles = [];
      particles = [];
      state = 'READY';
      jumpHeld = false;
      cabinet.hidden = true;
      updateHud();
    },
    pause,
  };
})();
