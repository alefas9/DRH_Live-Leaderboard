// DRH Leaderboard — UI logic (vanilla JS, no framework)
/* global initData, DATA_URL */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const COLORS = {
  cyan: "#22d3ee", fuchsia: "#e879f9", violet: "#a78bfa", orange: "#fb923c",
  emerald: "#34d399", yellow: "#facc15", amber: "#f59e0b", red: "#ef4444"
};
const LINE_COLORS = ["#22d3ee", "#e879f9", "#facc15", "#34d399", "#fb923c", "#a78bfa"];

const initials = (name) => name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
const fmtTime = (t) => (t == null ? "—" : Number(t).toFixed(3) + "s");
const fmtGap = (d) => (d == null ? "—" : "+" + d.toFixed(3) + "s");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------------------------------------------------------------- hero canvas
function heroCanvas() {
  const cv = $("#bg-canvas"), ctx = cv.getContext("2d");
  let W, H, particles = [], gates = [], mouse = { x: -999, y: -999 };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    W = cv.width = cv.offsetWidth * devicePixelRatio;
    H = cv.height = cv.offsetHeight * devicePixelRatio;
    build();
  }
  function build() {
    // racing "gates" — perspective grid on lower half
    gates = [];
    const rows = 9;
    for (let i = 0; i < rows; i++) gates.push({ z: i / rows });
    // star / dust particles — livelier: faster, with trails
    particles = [];
    const n = Math.min(150, Math.floor(W * H / 15000 / devicePixelRatio));
    for (let i = 0; i < n; i++) particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .85 * devicePixelRatio,
      vy: (Math.random() - .5) * .85 * devicePixelRatio,
      r: Math.random() * 2 + .5,
      c: Math.random() < .18 ? COLORS.fuchsia : (Math.random() < .34 ? COLORS.cyan : "#aab2d0"),
      tw: Math.random() * Math.PI * 2,
      px: null, py: null
    });
  }
  let t = 0;
  function frame() {
    t += .016;
    ctx.clearRect(0, 0, W, H);

    // perspective gates (floor grid)
    const hz = H * .62;
    ctx.lineWidth = 1;
    for (const g of gates) {
      const z = (g.z + t * .12) % 1;
      const y = hz + Math.pow(z, 2.2) * (H - hz) * 1.15;
      const alpha = Math.min(.16, z * .22);
      ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let i = -7; i <= 7; i++) {
      const x = W / 2 + i * (W / 9);
      ctx.strokeStyle = `rgba(34,211,238,${Math.abs(i) > 5 ? .04 : .07})`;
      ctx.beginPath(); ctx.moveTo(W / 2 + i * 30, hz); ctx.lineTo(x, H); ctx.stroke();
    }

    // particles with motion trails (matches the drone light-traces bg)
    for (const p of particles) {
      p.px = p.x; p.py = p.y;
      // gentle wandering so paths curve like flight lines
      p.vx += (Math.random() - .5) * .035 * devicePixelRatio;
      p.vy += (Math.random() - .5) * .035 * devicePixelRatio;
      // clamp speed
      const sp = Math.hypot(p.vx, p.vy), maxSp = 1.15 * devicePixelRatio;
      if (sp > maxSp) { p.vx = p.vx / sp * maxSp; p.vy = p.vy / sp * maxSp; }
      p.x += p.vx; p.y += p.vy;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22000 * devicePixelRatio) { p.vx += dx / Math.max(Math.sqrt(d2), 1) * .5; p.vy += dy / Math.max(Math.sqrt(d2), 1) * .5; }
      let wrapped = false;
      if (p.x < -20) { p.x = W + 20; wrapped = true; } if (p.x > W + 20) { p.x = -20; wrapped = true; }
      if (p.y < -20) { p.y = H + 20; wrapped = true; } if (p.y > H + 20) { p.y = -20; wrapped = true; }
      if (wrapped) { p.px = p.x; p.py = p.y; }
      const tw = .5 + .5 * Math.sin(t * 2 + p.tw);
      // trail line
      if (p.px !== null && !wrapped) {
        ctx.globalAlpha = .22 + .3 * tw;
        ctx.strokeStyle = p.c;
        ctx.lineWidth = Math.max(.6, p.r * .55) * devicePixelRatio;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      // head dot
      ctx.globalAlpha = .45 + .5 * tw;
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  addEventListener("resize", resize);
  addEventListener("mousemove", e => { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * devicePixelRatio; mouse.y = (e.clientY - r.top) * devicePixelRatio; });
  resize();
  if (!reduced) frame(); else { frame(); cancelAnimationFrame(0); }
}

// ------------------------------------------------------------- hero title anim
function heroTitle() {
  const el = $("#hero-title");
  const text = el.dataset.text;
  let i = 0;
  for (const word of text.split(" ")) {
    const w = document.createElement("span");
    w.style.display = "inline-block";
    w.style.whiteSpace = "nowrap";
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "l" + (i >= 11 ? " grad" : ""); // "HELLAS" = letters 11-16, whole word gets gradient
      s.textContent = ch;
      s.style.animationDelay = (0.35 + i * 0.045) + "s";
      w.appendChild(s); i++;
    }
    el.appendChild(w);
    el.appendChild(document.createTextNode(" "));
  }
}

// ------------------------------------------------------------------- ticker
function buildTicker(d) {
  const items = [];
  d.weeks.forEach(w => {
    items.push(`<span class="tick-item"><span class="sep">▸</span> <b>${esc(w.track.toUpperCase())}</b> — 🏆 <b class="win">${esc(w.winner)}</b> · best ${fmtTime(w.best)} · ${w.pilots} pilots · ${w.records} records</span>`);
  });
  items.push(`<span class="tick-item"><span class="sep">▸</span> 👑 SEASON LEADER — <b class="win">${esc(d.titleFight.a.pilot)}</b> ${d.titleFight.a.points} pts (+${d.titleFight.gap} από ${esc(d.titleFight.b.pilot)})</span>`);
  items.push(`<span class="tick-item"><span class="sep">▸</span> 🔥 TITLE FIGHT — <b>${esc(d.titleFight.a.pilot)}</b> vs <b>${esc(d.titleFight.b.pilot)}</b> · 2W-4P και τα δύο</span>`);
  items.push(`<span class="tick-item"><span class="sep">▸</span> ⚡ ${d.totalRecords} RECORDS BROKEN ΑΥΤΗ ΤΗ ΣΕΖΟΝ</span>`);
  const track = $("#ticker");
  track.innerHTML = items.join("") + items.join(""); // duplicate for seamless loop
}

// ----------------------------------------------------------------- hero stats
function buildHeroStats(d) {
  const s = d.season_standings["5inch"] || [];
  const totalPilots = new Set(d.weeks.flatMap(w => w.results.map(r => r.pilot))).size;
  const stats = [
    { v: d.totalRecords, k: "Records Broken", c: "e" },
    { v: totalPilots, k: "Πιλότοι", c: "c" },
    { v: d.weeks.length, k: "Εβδομάδες", c: "f" },
    { v: fmtTime(Math.min(...d.weeks.map(w => w.best))), k: "Season Best", c: "y" }
  ];
  $("#hero-stats").innerHTML = stats.map(x =>
    `<div class="hstat"><div class="v ${x.c}">${x.v}</div><div class="k">${x.k}</div></div>`).join("");
}

// ---------------------------------------------------------------- countdown
function startCountdown(d) {
  const target = new Date(d.nextTrackAt).getTime();
  const refreshRing = 5 * 60;
  let refreshT = refreshRing;
  $("#cd-track").textContent = d.current_track.toUpperCase() + " → NEXT";
  function tick() {
    let ms = target - Date.now();
    if (ms < 0) ms = 0;
    const dd = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5), mm = Math.floor(ms % 36e5 / 6e4), ss = Math.floor(ms % 6e4 / 1e3);
    const units = [[dd, "ημέρες"], [hh, "ώρες"], [mm, "λεπτά"], [ss, "δευτ."]];
    $("#cd-digits").innerHTML = units.map((u, i) =>
      `<div class="cd-unit"><div class="cd-num">${String(u[0]).padStart(2, "0")}</div><div class="cd-cap">${u[1]}</div></div>${i < 3 ? '<div class="cd-sep">:</div>' : ""}`).join("");
    refreshT--;
    if (refreshT <= 0) refreshT = refreshRing;
    const off = 31.4 * (1 - refreshT / refreshRing);
    $("#cd-refresh").innerHTML = `<div class="ring"><svg width="14" height="14"><circle class="bg" cx="7" cy="7" r="5"></circle><circle class="fg" cx="7" cy="7" r="5" style="stroke-dashoffset:${off}"></circle></svg></div> refresh σε ${Math.floor(refreshT / 60)}:${String(refreshT % 60).padStart(2, "0")}`;
  }
  tick(); setInterval(tick, 1000);
}

// --------------------------------------------------------------- title fight
function buildTitleFight(d) {
  const { a, b, gap } = d.titleFight;
  $("#tf-weeks").textContent = `SEASON 2026 · ${d.weeks.length} ΕΒΔΟΜΑΔΕΣ`;
  $("#tf-grid").innerHTML = `
    <div class="tf-pilot a">
      <div class="tf-avatar">${esc(initials(a.pilot))}</div>
      <div class="tf-name">${esc(a.pilot)}</div>
      <div class="tf-pts">${a.points}<span style="font-size:.5em;color:rgba(255,255,255,.4)"> pts</span></div>
      <div class="tf-meta"><span><b>${a.wins}</b> WINS</span><span><b>${a.podiums}</b> PODIUMS</span><span>BEST <b>${fmtTime(a.best)}</b></span></div>
    </div>
    <div class="tf-vs">
      <div class="vs">VS</div>
      <div class="gap">GAP <b>${gap}</b> PTS</div>
    </div>
    <div class="tf-pilot b">
      <div class="tf-avatar">${esc(initials(b.pilot))}</div>
      <div class="tf-name">${esc(b.pilot)}</div>
      <div class="tf-pts">${b.points}<span style="font-size:.5em;color:rgba(255,255,255,.4)"> pts</span></div>
      <div class="tf-meta"><span><b>${b.wins}</b> WINS</span><span><b>${b.podiums}</b> PODIUMS</span><span>BEST <b>${fmtTime(b.best)}</b></span></div>
    </div>`;
  const tot = a.points + b.points || 1;
  requestAnimationFrame(() => {
    $("#tf-pa").style.width = (a.points / tot * 100) + "%";
    $("#tf-pb").style.width = (b.points / tot * 100) + "%";
  });
}

// ------------------------------------------------------------- leaderboard
let lbMode = "current", lbExpanded = false, prevRanks = null;

function buildLeaderboard(d) {
  const cur = d.current_leaderboard["5inch"] || [];
  const sea = d.season_standings["5inch"] || [];
  $("#live-track-name").textContent = (d.current_track || "").toUpperCase();
  $("#live-updated").textContent = new Date(d.generated_at).toLocaleString("el-GR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  // week progress
  const flown = new Set(cur.map(r => r.pilot)).size, total = sea.length || 1;
  const pct = Math.round(flown / total * 100);
  $("#wp-txt").innerHTML = `ΕΒΔΟΜΑΡΑ ΣΕ ΕΞΕΛΙΞΗ · <b>${flown}/${total}</b> πιλότοι έχουν πετάξει`;
  $("#wp-pct").textContent = pct + "%";
  requestAnimationFrame(() => $("#wp-fill").style.width = pct + "%");

  // rows
  let rows, podiumData;
  if (lbMode === "current") {
    rows = cur.map((r, i) => ({ ...r, rank: i + 1, sub: i > 0 && cur[0].time != null && r.time != null ? "+" + (r.time - cur[0].time).toFixed(3) + "s" : "leader", val: fmtTime(r.time), mode: "current" }));
  } else {
    rows = sea.map((r, i) => ({ ...r, rank: i + 1, sub: `${r.wins}W ${r.podiums}P · best ${fmtTime(r.best)}`, val: r.points + " pts", mode: "season" }));
  }

  // movement arrows (current mode, vs previous snapshot in-session)
  const moves = rows.map(r => {
    if (lbMode !== "current" || !prevRanks) return "eq";
    const was = prevRanks.indexOf(r.pilot);
    if (was === -1) return "new";
    if (was > r.rank - 1) return "up";
    if (was < r.rank - 1) return "dn";
    return "eq";
  });
  if (lbMode === "current") prevRanks = rows.map(r => r.pilot);

  // podium (top 3)
  podiumData = rows.slice(0, 3);
  const medals = ["👑", "🥈", "🥉"];
  const order = [1, 0, 2]; // 2nd, 1st, 3rd visual order
  $("#podium-box").innerHTML = `<div class="podium">` + order.map(oi => {
    const p = podiumData[oi]; if (!p) return "";
    const cls = oi === 0 ? "p1" : oi === 1 ? "p2" : "p3";
    const mv = moves[oi];
    const delta = mv === "up" ? `<span class="delta up">▲</span>` : mv === "dn" ? `<span class="delta dn">▼</span>` : "";
    return `<div class="pod ${cls}">
      ${oi === 0 ? `<div class="crown">👑</div>` : `<div class="medal">${medals[oi]}</div>`}
      <div class="name">${esc(p.pilot)}</div>
      <div class="time mono">${lbMode === "current" ? fmtTime(p.time) : p.points + " pts"}</div>
      ${delta}
      <div class="block"><div class="rk">${oi + 1}</div><div class="shine"></div></div>
    </div>`;
  }).join("") + `</div>`;

  // list (rank 4+)
  const hidden = rows.slice(3);
  const showN = lbExpanded ? 999 : 5;
  const list = hidden.slice(0, showN).map((r, i) => {
    const ri = i + 3;
    const mv = moves[ri];
    const mvIc = mv === "up" ? "▲" : mv === "dn" ? "▼" : mv === "new" ? "✦" : "·";
    const mvCl = mv === "up" ? "up" : mv === "dn" ? "dn" : mv === "new" ? "up flash-new" : "eq";
    const chipBg = ri === 0 ? "rgba(250,204,21,.18);color:var(--yellow)" : ri === 1 ? "rgba(203,213,225,.16);color:#cbd5e1" : ri === 2 ? "rgba(245,158,11,.16);color:var(--amber)" : "rgba(255,255,255,.06);color:rgba(255,255,255,.55)";
    return `<div class="lb-row r${ri + 1} ${mv === "new" ? "flash-new" : ""}">
      <span class="move ${mvCl}">${mvIc}</span>
      <span class="rk">${r.rank}</span>
      <div class="pl">
        <span class="pilot-chip" style="background:${chipBg.split(";")[0]};${chipBg.split(";")[1]}">${esc(initials(r.pilot))}</span>
        <span class="nm" data-pilot="${esc(r.pilot)}">${esc(r.pilot)}</span>
      </div>
      <span class="qd">${esc(r.quad || "—")}</span>
      <span class="val">${r.val}<span class="sub">${r.sub}</span></span>
    </div>`;
  }).join("");

  $("#lb-body").innerHTML = list + (hidden.length > 5 && !lbExpanded ? "" : "");
  const more = $("#lb-more");
  if (hidden.length > 5) {
    more.style.display = "block";
    more.textContent = lbExpanded ? "SHOW LESS ▴" : `VIEW FULL RANKINGS (${hidden.length - 5} MORE) ▾`;
  } else more.style.display = "none";
}

// ------------------------------------------------------------- progression chart
function drawChart(d) {
  const cv = $("#progress-chart"), ctx = cv.getContext("2d");
  const dpr = devicePixelRatio || 1;
  const W = cv.offsetWidth, H = cv.offsetHeight;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);

  const sea = (d.season_standings["5inch"] || []).slice(0, 6);
  const names = sea.map(s => s.pilot);
  const weeks = d.weeks.map(w => w.label);
  const prog = d.progression;

  const pad = { l: 34, r: 12, t: 16, b: 26 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const maxX = Math.max(...names.map(n => Math.max(...prog[n], 1)));
  const x = (i) => pad.l + (weeks.length === 1 ? iw / 2 : i / (weeks.length - 1) * iw);
  const y = (v) => pad.t + ih - (v / maxX) * ih;

  let hover = -1, anim = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // grid
    ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.font = "10px 'JetBrains Mono'";
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + ih - g / 4 * ih;
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
      ctx.fillText(Math.round(maxX * g / 4), 4, gy + 3);
    }
    weeks.forEach((w, i) => { ctx.fillText(w, x(i) - 8, H - 8); });

    // lines
    names.forEach((n, ni) => {
      const pts = prog[n];
      const col = LINE_COLORS[ni];
      ctx.strokeStyle = col; ctx.lineWidth = ni === 0 ? 2.6 : 2;
      ctx.globalAlpha = ni > 2 ? .8 : 1;
      ctx.shadowColor = col; ctx.shadowBlur = ni < 2 ? 8 : 0;
      ctx.beginPath();
      const shown = pts.map((v, i) => ({ v, i })).slice(0, Math.ceil(anim * weeks.length));
      shown.forEach((p, k) => { const px = x(p.i), py = y(p.v); k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
      ctx.stroke(); ctx.shadowBlur = 0;
      // dots
      shown.forEach(p => {
        ctx.fillStyle = "#0a0a0f"; ctx.beginPath(); ctx.arc(x(p.i), y(p.v), 3.4, 0, 7); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x(p.i), y(p.v), 2.6, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
    });

    // hover crosshair
    if (hover >= 0) {
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.beginPath(); ctx.moveTo(x(hover), pad.t); ctx.lineTo(x(hover), pad.t + ih); ctx.stroke();
      names.forEach((n, ni) => {
        const v = prog[n][hover];
        ctx.fillStyle = LINE_COLORS[ni];
        ctx.beginPath(); ctx.arc(x(hover), y(v), 4.2, 0, 7); ctx.fill();
      });
    }
  }

  function animate() {
    anim = Math.min(1, anim + .04); draw();
    if (anim < 1) requestAnimationFrame(animate);
    else draw();
  }
  animate();

  cv.addEventListener("mousemove", e => {
    const r = cv.getBoundingClientRect();
    const mx = e.clientX - r.left;
    hover = Math.round((mx - pad.l) / iw * (weeks.length - 1));
    if (hover < 0 || hover >= weeks.length) hover = -1;
    draw();
  });
  cv.addEventListener("mouseleave", () => { hover = -1; draw(); });

  // legend with toggle
  const leg = $("#chart-legend");
  leg.innerHTML = names.map((n, i) =>
    `<span class="lg-item" data-n="${i}"><span class="sw" style="background:${LINE_COLORS[i]}"></span>${esc(n)}</span>`).join("");
  const visible = new Set(names);
  leg.addEventListener("click", e => {
    const it = e.target.closest(".lg-item"); if (!it) return;
    const n = names[+it.dataset.n];
    it.classList.toggle("off");
    if (it.classList.contains("off")) visible.delete(n); else visible.add(n);
    // re-filter by hiding via alpha in a redraw: simplest is full re-render
    const off = [...leg.querySelectorAll(".lg-item.off")].map(x => names[+x.dataset.n]);
    names.forEach((nn, ni) => { ctx; });
    drawFiltered(off);
  });
  function drawFiltered(offNames) {
    // temporarily swap prog for hidden names
    const backup = {};
    offNames.forEach(n => { backup[n] = prog[n]; prog[n] = prog[n].map(() => 0); });
    const maxXb = maxX; draw();
    offNames.forEach(n => { prog[n] = backup[n]; });
  }
}

// ------------------------------------------------------------------ duels (real ones from the bot: active + recently resolved)
function duelWinner(p) {
  const ta = p.best_time_a, tb = p.best_time_b;
  if (ta == null && tb == null) return null;
  if (ta == null) return p.pilot_b;
  if (tb == null) return p.pilot_a;
  return ta < tb ? p.pilot_a : p.pilot_b;
}

function buildDuels(d) {
  const box = $("#duels");
  const all = d.duels || [];
  const active = all.filter(p => !p.resolved);
  const resolved = all.filter(p => p.resolved).slice(-3).reverse(); // τελευταία 3 λυμένα
  const count = $("#duels-count");
  count.textContent = active.length + " LIVE";
  count.style.background = active.length ? "rgba(239,68,68,.12)" : "rgba(251,146,60,.12)";
  count.style.color = active.length ? "var(--red)" : "var(--orange)";

  let html = "";

  if (active.length) {
    html += `<div class="duel-sep">⚡ ΕΝΕΡΓΑ</div>`;
    html += active.map(p => {
      const ta = p.best_time_a, tb = p.best_time_b;
      const lead = duelWinner(p);
      return `
      <div class="duel">
        <div class="who">
          <div class="n${lead === p.pilot_a ? " w" : ""}">${esc(p.pilot_a)}</div>
          <div class="s">${ta != null ? Number(ta).toFixed(3) + "s" : "— ακόμα χρόνο"}</div>
        </div>
        <div class="mid"><div class="score"><b>${ta != null ? Number(ta).toFixed(3) : "—"}</b><span class="d">vs</span><b>${tb != null ? Number(tb).toFixed(3) : "—"}</b></div>
          <div class="duel-track">${esc(p.track || "")}${p.deadline ? " · λήγει " + new Date(p.deadline).toLocaleDateString("el-GR", { day: "numeric", month: "short" }) : ""}</div>
        </div>
        <div class="who">
          <div class="n${lead === p.pilot_b ? " w" : ""}">${esc(p.pilot_b)}</div>
          <div class="s">${tb != null ? Number(tb).toFixed(3) + "s" : "— ακόμα χρόνο"}</div>
        </div>
      </div>`;
    }).join("");
  }

  if (resolved.length) {
    html += `<div class="duel-sep">🏁 ΟΛΟΚΛΗΡΩΜΕΝΑ</div>`;
    html += resolved.map(p => {
      const w = duelWinner(p);
      return `
      <div class="duel done">
        <div class="who">
          <div class="n${w === p.pilot_a ? " w" : ""}">${esc(p.pilot_a)}</div>
          <div class="s">${p.best_time_a != null ? Number(p.best_time_a).toFixed(3) + "s" : "—"}</div>
        </div>
        <div class="mid">
          <div class="score"><b>${p.best_time_a != null ? Number(p.best_time_a).toFixed(3) : "—"}</b><span class="d">—</span><b>${p.best_time_b != null ? Number(p.best_time_b).toFixed(3) : "—"}</b></div>
          <div class="duel-track">${w ? "🏆 " + esc(w) : "άκυρο"}</div>
        </div>
        <div class="who">
          <div class="n${w === p.pilot_b ? " w" : ""}">${esc(p.pilot_b)}</div>
          <div class="s">${p.best_time_b != null ? Number(p.best_time_b).toFixed(3) + "s" : "—"}</div>
        </div>
      </div>`;
    }).join("");
  }

  if (!html) {
    html = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 12px;gap:8px">
        <div style="font-size:32px">⚔️</div>
        <div style="color:rgba(255,255,255,.6);font-size:14px;font-weight:700">Καμία μονομαχία ακόμα</div>
        <div style="color:rgba(255,255,255,.4);font-size:12px">Όταν οριστούν duels, θα εμφανιστούν εδώ αυτόματα.</div>
      </div>`;
  }

  box.innerHTML = html;
}



// ------------------------------------------------------------------ archive
function buildArchive(d) {
  const weeks = [...d.weeks].reverse(); // newest first
  $("#arc-count").textContent = weeks.length + " TRACKS";
  $("#archive-list").innerHTML = weeks.map((w, i) => `
    <div class="acc-item" data-w="${i}">
      <button class="acc-btn">
        <span class="tn">${esc(w.track.toUpperCase())}</span>
        <span class="meta">
          <span>🏆 <b>${esc(w.winner)}</b></span>
          <span class="mono">${new Date(w.date).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}</span>
          <span class="arrow">▼</span>
        </span>
      </button>
      <div class="acc-body"><div class="acc-inner">
        <div class="acc-win"><span class="crown">👑</span> Νικητής: <b>${esc(w.winner)}</b> · ${fmtTime(w.best)} · ${w.records} records · ${w.pilots} πιλότοι</div>
        ${w.results.map((r, j) => `
          <div class="mini-row">
            <span class="r">${j + 1}</span>
            <span class="n">${esc(r.pilot)}</span>
            <span class="q">${esc(w.quads[r.pilot] || "—")}</span>
            <span class="t">${fmtTime(r.time)}</span>
            <span class="pt mono" style="color:rgba(255,255,255,.4);width:34px;text-align:right">${r.points}p</span>
          </div>`).join("")}
      </div></div>
    </div>`).join("");

  // accordion
  $$(".acc-item").forEach(item => {
    item.querySelector(".acc-btn").addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".acc-item.open").forEach(o => { o.classList.remove("open"); o.querySelector(".acc-body").style.maxHeight = "0"; });
      if (!open) {
        item.classList.add("open");
        const b = item.querySelector(".acc-body");
        b.style.maxHeight = b.scrollHeight + "px";
      }
    });
  });
}

// ------------------------------------------------------------------ season stats
function buildSeasonStats(d) {
  const sea = d.season_standings["5inch"] || [];
  const totalPilots = new Set(d.weeks.flatMap(w => w.results.map(r => r.pilot))).size;
  const stats = [
    { v: d.totalPoints, k: "Points", c: "c" },
    { v: totalPilots, k: "Pilots", c: "f" },
    { v: d.totalRecords, k: "Records Broken", c: "e" },
    { v: "1", k: "Classes", c: "" }
  ];
  $("#season-stats").innerHTML = stats.map(x =>
    `<div class="hstat"><div class="v ${x.c}">${x.v}</div><div class="k">${x.k}</div></div>`).join("") +
    `<div style="flex-basis:100%;height:1px;background:var(--line);margin:10px 0"></div>
     <div class="hstat" style="text-align:left">
       <div style="font-size:11px;letter-spacing:.2em;color:var(--yellow);font-weight:700">👑 SEASON LEADER</div>
       <div class="v" style="font-size:26px">${esc(d.titleFight.a.pilot)}</div>
       <div class="k">${d.titleFight.a.points} pts • ${d.titleFight.a.wins}W ${d.titleFight.a.podiums}P</div>
     </div>`;
}

// ------------------------------------------------------------------ drawer
function openDrawer(pilotName, d) {
  const p = d.profiles[pilotName];
  const cur = (d.current_leaderboard["5inch"] || []).find(r => r.pilot === pilotName);
  $("#dr-av").textContent = initials(pilotName);
  $("#dr-nm").textContent = pilotName;
  $("#dr-qd").textContent = (p.quads && p.quads.length ? p.quads.join(" · ") : "—") + (cur ? " · NOW ON TRACK" : "");
  const stats = [
    { v: p.points, k: "Points" }, { v: p.wins, k: "Wins" }, { v: p.podiums, k: "Podiums" },
    { v: p.best != null ? p.best.toFixed(3) : "—", k: "Best (s)" },
    { v: p.appearances, k: "Weeks" }, { v: p.avgRank, k: "Avg Rank" }
  ];
  $("#dr-stats").innerHTML = stats.map(s => `<div class="dr-stat"><div class="v">${s.v}</div><div class="k">${s.k}</div></div>`).join("");
  // form chips
  const form = p.form || [];
  $("#dr-form").innerHTML = form.length ? form.map(r =>
    `<div class="form-chip ${r === 1 ? "y" : r <= 3 ? "g" : "o"}">${r === 1 ? "🏆" : "#" + r}<span class="w">${r === 1 ? "WIN" : "RANK"}</span></div>`).join("")
    : `<div class="dr-empty">Καμία συμμετοχή ακόμα.</div>`;
  // weeks list
  $("#dr-weeks").innerHTML = p.weeks && p.weeks.some(Boolean) ? p.weeks.map((w, i) => {
    if (!w) return "";
    return `<div class="dr-week">
      <span class="w">W${i + 1}</span>
      <span class="pos p${w.rank <= 3 ? w.rank : ""}">${w.rank === 1 ? "🏆" : w.rank}</span>
      <span style="color:rgba(255,255,255,.65)">${esc(d.weeks[i].track)}</span>
      <span class="t">${fmtTime(w.time)}</span>
      <span class="pt">+${w.points || 0}p</span>
    </div>`;
  }).join("") : `<div class="dr-empty">Ακόμα χωρίς εμφανίσεις στη σεζόν.</div>`;

  $("#overlay").classList.add("on");
  $("#drawer").classList.add("on");
  document.body.style.overflow = "hidden";
}
function closeDrawer() {
  $("#overlay").classList.remove("on");
  $("#drawer").classList.remove("on");
  document.body.style.overflow = "";
}

// ------------------------------------------------------------------ toast
let toastTimer;
function toast(msg, ic = "✓") {
  $("#toast-ic").textContent = ic;
  $("#toast-tx").textContent = msg;
  $("#toast").classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("on"), 4000);
}

// ------------------------------------------------------------------ reveal on scroll
function revealInit() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));
}

// ------------------------------------------------------------------ card glow
function cardGlow() {
  $$(".card").forEach(c => {
    c.addEventListener("mousemove", e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
}

// ------------------------------------------------------------------ main
(async function main() {
  heroCanvas();
  heroTitle();
  revealInit();

  const state = await initData();
  let d = state.derived;

  function renderAll(d) {
    buildTicker(d);
    buildHeroStats(d);
    startCountdown(d);
    buildTitleFight(d);
    buildLeaderboard(d);
    drawChart(d);
    buildDuels(d);
    buildArchive(d);
    buildSeasonStats(d);
    cardGlow();
    $("#err-banner").classList.toggle("on", state.error);
  }

  renderAll(d);

  // re-render when fresh data arrives (poll the shared state)
  setInterval(async () => {
    const st = await initData();
    if (st.derived !== d) { d = st.derived; renderAll(d); toast("Live data ανανεώθηκε", "⟳"); }
  }, 5 * 60 * 1000 + 2000);

  // tabs
  $$(".pill[data-lb]").forEach(p => p.addEventListener("click", () => {
    $$(".pill[data-lb]").forEach(x => { x.classList.remove("on"); x.classList.remove("f"); });
    p.classList.add("on");
    if (p.dataset.lb === "season") p.classList.add("f");
    lbMode = p.dataset.lb; lbExpanded = false;
    buildLeaderboard(d);
  }));

  // show more
  $("#lb-more").addEventListener("click", () => { lbExpanded = !lbExpanded; buildLeaderboard(d); });

  // pilot drawer (delegate)
  document.addEventListener("click", e => {
    const nm = e.target.closest(".nm[data-pilot], .tf-name, .pod .name");
    if (nm) {
      const name = nm.dataset.pilot || nm.textContent.trim();
      if (d.profiles[name]) { e.preventDefault(); openDrawer(name, d); }
    }
  });
  $("#dr-close").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);
  addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

  // retry
  $("#retry-btn").addEventListener("click", async () => {
    const st = await initData();
    d = st.derived; renderAll(d);
    toast(state.error ? "Ακόμα offline — δείχνουμε snapshot" : "Επανασύνδεση επιτυχής", state.error ? "⚠" : "✓");
  });
})();
