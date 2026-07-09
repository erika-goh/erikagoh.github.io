/* ══════════════════════════════════════
   BINARY TREE - ambient, smooth
═══════════════════════════════════════ */
(function () {
  const canvas = document.getElementById("treeCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const COLORS = [
    "rgba(64,121,20,",
    "rgba(64,121,20,",
    "rgba(180,180,180,",
    "rgba(220,220,220,",
  ];

  let W, H, cx, cy;
  let nodes = [];
  let edges = [];
  let sparks = [];
  let ambientSparks = [];
  let startTime = performance.now();

  // Mouse interaction - nodes push away and brighten when cursor is nearby.
  let mouseX = null;
  let mouseY = null;
  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    },
    { passive: true },
  );
  window.addEventListener("mouseleave", () => {
    mouseX = null;
    mouseY = null;
  });

  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H * 0.32;
    buildTree();
    initAmbientSparks();
  }

  function makeAmbientSpark() {
    const isGreen = Math.random() < 0.55;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.05 - Math.random() * 0.12,
      life: 0,
      maxLife: 4.5 + Math.random() * 4.5,
      size: 0.55 + Math.random() * 1.15,
      color: isGreen ? "rgba(64,121,20," : "rgba(220,220,220,",
      peakAlpha: isGreen
        ? 0.22 + Math.random() * 0.2
        : 0.14 + Math.random() * 0.18,
    };
  }

  function initAmbientSparks() {
    ambientSparks = [];
    const count = W < 700 ? 18 : 32;
    for (let i = 0; i < count; i++) {
      const s = makeAmbientSpark();
      s.life = Math.random() * s.maxLife;
      ambientSparks.push(s);
    }
  }

  function drawAmbientSparks() {
    ambientSparks.forEach((s) => {
      s.life += 0.016;
      s.x += s.vx;
      s.y += s.vy;

      if (
        s.life >= s.maxLife ||
        s.y < -20 ||
        s.x < -20 ||
        s.x > W + 20
      ) {
        Object.assign(s, makeAmbientSpark(), {
          life: 0,
          y: H + 10,
          x: Math.random() * W,
        });
        return;
      }

      const p = s.life / s.maxLife;
      let alpha;
      if (p < 0.25) alpha = (p / 0.25) * s.peakAlpha;
      else if (p > 0.75) alpha = ((1 - p) / 0.25) * s.peakAlpha;
      else alpha = s.peakAlpha;

      if (alpha < 0.01) return;

      ctx.save();
      ctx.globalAlpha = alpha * 0.55;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
      g.addColorStop(0, s.color + "0.85)");
      g.addColorStop(1, s.color + "0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color + "0.9)";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function buildTree() {
    nodes = [];
    edges = [];
    const levels = W < 500 ? 4 : 5;
    const vGap = H * 0.16;
    const hGapBase = W * 0.55;

    function addNode(depth, x, y, parentIdx) {
      if (depth > levels) return;
      const idx = nodes.length;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      nodes.push({
        x,
        y,
        depth,
        r: depth === 1 ? 5 : 3.4 - depth * 0.3,
        color,
        alpha: 0,
        drawTime: (depth - 1) * 0.35 + Math.random() * 0.12,
        pulse: Math.random() * Math.PI * 2,
      });
      if (parentIdx !== null) {
        edges.push({
          from: parentIdx,
          to: idx,
          drawTime: nodes[idx].drawTime - 0.15,
        });
      }
      const hGap = hGapBase / Math.pow(2, depth - 1);
      addNode(depth + 1, x - hGap / 2, y + vGap, idx);
      addNode(depth + 1, x + hGap / 2, y + vGap, idx);
    }
    addNode(1, cx, cy - vGap * 1.5, null);

    sparks = [];
    for (let i = 0; i < 32; i++) sparks.push(makeSpark());
    startTime = performance.now();
  }

  function makeSpark() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * Math.min(W, H) * 0.35;
    return {
      x: cx + Math.cos(angle) * dist * (0.5 + Math.random()),
      y: cy + Math.sin(angle) * dist * (0.5 + Math.random()),
      tx: cx + (Math.random() - 0.5) * 30,
      ty: cy + (Math.random() - 0.5) * 30,
      life: 0,
      maxLife: 0.9 + Math.random() * 1.0,
      size: 1 + Math.random() * 1.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 0.35 + Math.random() * 0.4,
    };
  }

  function draw(now) {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    const t = (now - startTime) / 1000;

    // Ambient drift sparks - always on, very subtle
    drawAmbientSparks();

    const sparkFadeIn = Math.min(t / 0.4, 1);
    const sparkFadeOut = t < 3 ? 1 : Math.max(0, 1 - (t - 3) / 2);
    const sparkGlobal = sparkFadeIn * sparkFadeOut;

    if (sparkGlobal > 0.005) {
      sparks.forEach((s) => {
        s.life += 0.013 * s.speed;
        const p = Math.min(s.life / s.maxLife, 1);
        const pe = easeOutCubic(p);
        const x = s.x + (s.tx - s.x) * pe;
        const y = s.y + (s.ty - s.y) * pe;
        const alpha = (p < 0.5 ? p * 2 : (1 - p) * 2) * sparkGlobal * 0.8;

        if (alpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.7;
          const g = ctx.createRadialGradient(x, y, 0, x, y, s.size * 5);
          g.addColorStop(0, s.color + "0.9)");
          g.addColorStop(1, s.color + "0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, s.size * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color + "1)";
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (s.life >= s.maxLife) Object.assign(s, makeSpark(), { life: 0 });
      });
    }

    const treeStart = 0.4;
    if (t > treeStart) {
      const treeT = t - treeStart;

      /* First pass: update per-node displacement + boost based on cursor.
         Nodes near the mouse get pushed away smoothly with a boost that
         eases in and out - no pop. */
      const pushRadius = 170;
      const maxPush = 22;
      nodes.forEach((n) => {
        let targetDx = 0;
        let targetDy = 0;
        let targetBoost = 0;
        if (mouseX !== null) {
          const distX = n.x - mouseX;
          const distY = n.y - mouseY;
          const dist = Math.hypot(distX, distY);
          if (dist < pushRadius && dist > 0.1) {
            const falloff = 1 - dist / pushRadius;
            const eased = falloff * falloff;
            const force = eased * maxPush;
            targetDx = (distX / dist) * force;
            targetDy = (distY / dist) * force;
            targetBoost = eased * 0.35;
          }
        }
        n.dx = (n.dx || 0) + (targetDx - (n.dx || 0)) * 0.14;
        n.dy = (n.dy || 0) + (targetDy - (n.dy || 0)) * 0.14;
        n.boost = (n.boost || 0) + (targetBoost - (n.boost || 0)) * 0.14;
        n.rx = n.x + n.dx;
        n.ry = n.y + n.dy;
      });

      edges.forEach((e) => {
        if (treeT < e.drawTime) return;
        const growRaw = Math.min((treeT - e.drawTime) / 0.85, 1);
        const grow = easeOutCubic(growRaw);
        const fn = nodes[e.from];
        const tn = nodes[e.to];
        const ex = fn.rx + (tn.rx - fn.rx) * grow;
        const ey = fn.ry + (tn.ry - fn.ry) * grow;

        ctx.save();
        ctx.globalAlpha = grow * 0.5;
        ctx.strokeStyle = fn.color + "0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fn.rx, fn.ry);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();
      });

      nodes.forEach((n) => {
        if (treeT < n.drawTime) return;
        const localT = Math.min((treeT - n.drawTime) / 0.75, 1);
        n.alpha = easeOutCubic(localT);
        n.pulse += 0.028;
        const pulseFactor = 0.9 + 0.1 * Math.sin(n.pulse);
        const boost = n.boost || 0;
        const r = n.r * pulseFactor * (1 + boost * 0.6);
        const a = Math.min(1, n.alpha * (1 + boost));

        ctx.save();
        const g = ctx.createRadialGradient(
          n.rx,
          n.ry,
          0,
          n.rx,
          n.ry,
          r * 6,
        );
        g.addColorStop(0, n.color + a * (0.5 + boost * 0.4) + ")");
        g.addColorStop(0.3, n.color + a * 0.2 + ")");
        g.addColorStop(1, n.color + "0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.rx, n.ry, r * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
        ctx.fillStyle = n.color + "1)";
        ctx.beginPath();
        ctx.arc(n.rx, n.ry, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();

/* ══════════════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════════════ */
(function () {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

/* ══════════════════════════════════════
   ARTICLE TOC - highlights current section
═══════════════════════════════════════ */
(function () {
  const tocLinks = document.querySelectorAll(
    ".article-toc-list a[data-target]",
  );
  if (!tocLinks.length) return;

  const headings = Array.from(tocLinks)
    .map((a) => document.getElementById(a.dataset.target))
    .filter(Boolean);
  if (!headings.length) return;

  let currentId = null;
  const setActive = (id) => {
    if (id === currentId) return;
    currentId = id;
    tocLinks.forEach((a) =>
      a.classList.toggle("active", a.dataset.target === id),
    );
  };

  const spy = () => {
    const threshold = window.scrollY + window.innerHeight * 0.3;
    let active = headings[0].id;
    for (const h of headings) {
      const top = h.getBoundingClientRect().top + window.scrollY - 40;
      if (top <= threshold) active = h.id;
      else break;
    }
    setActive(active);
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          spy();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", spy);
  spy();
})();
