/* ------------------------------------------------------------------
   Ambient dynamic graph under continuous anomaly detection.

   Not a generic particle field: nodes drift, edges form between near
   neighbours, and periodically one edge is flagged. When that happens
   the detector "opens" a small rationale — a handful of incident edges
   — which brighten briefly, and the readout prints what was selected.
   That is the page's signature, and it mirrors the research.
------------------------------------------------------------------ */
(function () {
  'use strict';

  var canvas = document.getElementById('graph');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VIOLET = [124, 92, 255];
  var AZURE  = [61, 139, 255];
  var FLAG   = [255, 77, 109];

  var LINK_DIST = 152;     // px at which two nodes are considered adjacent
  var nodes = [];
  var w = 0, h = 0, dpr = 1;

  function rgba(c, a) {
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  function density() {
    var area = w * h;
    return Math.max(30, Math.min(96, Math.round(area / 13500)));
  }

  function build() {
    nodes = [];
    var n = density();
    for (var i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.5 + 0.9,
        lit: 0            // rationale highlight, decays to 0
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  /* ---- detection episode ---------------------------------------- */
  var episode = null;          // {a, b, life, pool, kept}
  var nextAt = 2600;
  var clock = 0;

  var readout = document.getElementById('readout-text');
  var dot = document.querySelector('.readout .dot');

  function say(html, alert) {
    if (!readout) return;
    readout.innerHTML = html;
    if (dot) dot.classList.toggle('alert', !!alert);
  }

  function neighboursOf(i) {
    var out = [];
    for (var j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) out.push(j);
    }
    return out;
  }

  function flag() {
    if (nodes.length < 6) return;
    var a = Math.floor(Math.random() * nodes.length);
    var near = neighboursOf(a);
    if (!near.length) return;
    var b = near[Math.floor(Math.random() * near.length)];

    // evidence pool = union of both endpoints' neighbourhoods
    var pool = {};
    neighboursOf(a).forEach(function (k) { pool[k] = 1; });
    neighboursOf(b).forEach(function (k) { pool[k] = 1; });
    var poolIds = Object.keys(pool).map(Number);

    // rationale: a fixed fraction of the pool
    var keep = Math.max(2, Math.round(poolIds.length * 0.2));
    var shuffled = poolIds.slice().sort(function () { return Math.random() - 0.5; });
    var kept = shuffled.slice(0, keep);

    kept.forEach(function (k) { nodes[k].lit = 1; });
    nodes[a].lit = 1;
    nodes[b].lit = 1;

    episode = { a: a, b: b, life: 1, kept: kept };

    say('edge <span class="hl">(u' + a + ', v' + b + ')</span> ' +
        '<span class="flag">flagged</span> · rationale ' +
        '<span class="hl">' + keep + '/' + poolIds.length + '</span> tokens', true);
  }

  /* ---- draw ------------------------------------------------------ */
  function frame(dt) {
    ctx.clearRect(0, 0, w, h);

    var i, j, n = nodes.length;

    // edges
    for (i = 0; i < n; i++) {
      for (j = i + 1; j < n; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 > LINK_DIST * LINK_DIST) continue;

        var t = 1 - Math.sqrt(d2) / LINK_DIST;
        var lit = Math.max(nodes[i].lit, nodes[j].lit);

        var col = lit > 0.02 ? VIOLET : AZURE;
        var alpha = 0.115 * t + lit * 0.42 * t;

        ctx.strokeStyle = rgba(col, alpha);
        ctx.lineWidth = lit > 0.02 ? 1.1 : 0.75;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }

    // the flagged edge itself
    if (episode) {
      var A = nodes[episode.a], B = nodes[episode.b];
      ctx.strokeStyle = rgba(FLAG, 0.55 * episode.life);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();

      [A, B].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + 9 * (1 - episode.life), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(FLAG, 0.36 * episode.life);
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // nodes
    for (i = 0; i < n; i++) {
      var p = nodes[i];
      var base = 0.5 + p.lit * 0.45;
      ctx.fillStyle = rgba(p.lit > 0.02 ? VIOLET : AZURE, base);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + p.lit * 1.3, 0, Math.PI * 2);
      ctx.fill();

      if (!reduce) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
      }
      p.lit *= 0.985;
      if (p.lit < 0.01) p.lit = 0;
    }

    if (episode) {
      episode.life -= 0.006 * dt;
      if (episode.life <= 0) {
        episode = null;
        say('monitoring stream · <span class="hl">' + nodes.length +
            '</span> nodes, evidence pools fixed at constant size', false);
      }
    }
  }

  /* ---- loop ------------------------------------------------------ */
  var last = 0;
  function loop(ts) {
    var dt = last ? Math.min((ts - last) / 16.67, 3) : 1;
    last = ts;

    clock += dt * 16.67;
    if (!reduce && clock > nextAt && !episode) {
      clock = 0;
      nextAt = 5200 + Math.random() * 4200;
      flag();
    }

    frame(dt);
    requestAnimationFrame(loop);
  }

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(resize, 160);
  });

  resize();
  say('monitoring stream · <span class="hl">' + nodes.length +
      '</span> nodes, evidence pools fixed at constant size', false);

  if (reduce) {
    frame(0);                 // one static composition, no motion
  } else {
    requestAnimationFrame(loop);
  }
})();
