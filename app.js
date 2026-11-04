// DRH Leaderboard — UI logic (vanilla JS, no framework)
// Multi-class aware: all season/leaderboard sections follow `activeClass`.
/* global initData, classLabel */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const COLORS = {
  cyan: "#22d3ee", fuchsia: "#e879f9", violet: "#a78bfa", orange: "#fb923c",
  emerald: "#34d399", yellow: "#facc15", amber: "#f59e0b", red: "#ef4444"
};
const LINE_COLORS = ["#22d3ee", "#e879f9", "#facc15", "#34d399", "#fb923c", "#a78bfa"];

const initials = (name) => String(name || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
const fmtTime = (t) => (t == null ? "—" : Number(t).toFixed(3) + "s");
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
    gates = [];
    const rows = 9;
    for (let i = 0; i < rows; i++) gates.push({ z: i / rows });
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

    for (const p of particles) {
      p.px = p.x; p.py = p.y;
      p.vx += (Math.random() - .5) * .035 * devicePixelRatio;
      p.vy += (Math.random() - .5) * .035 * devicePixelRatio;
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
      if (p.px !== null && !wrapped) {
        ctx.globalAlpha = .22 + .3 * tw;
        ctx.strokeStyle = p.c;
        ctx.lineWidth = Math.max(.6, p.r * .55) * devicePixelRatio;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      ctx.globalAlpha = .45 + .5 * tw;
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(frame); // reduced-motion: one static frame only
  }
  addEventListener("resize", () => { resize(); if (reduced) frame(); });
  addEventListener("mousemove", e => { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * devicePixelRatio; mouse.y = (e.clientY - r.top) * devicePixelRatio; });
  resize();
  frame();
}

// ------------------------------------------------------------- hero title anim
function heroTitle() {
  const el = $("#hero-title");
  const text = el.dataset.text;
  const lastWordStart = text.lastIndexOf(" ") + 1; // gradient on the final word ("HELLAS")
  let i = 0;
  for (const word of text.split(" ")) {
    const w = document.createElement("span");
    w.style.display = "inline-block";
    w.style.whiteSpace = "nowrap";
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "l" + (i >= lastWordStart ? " grad" : "");
      s.textContent = ch;
      s.style.animationDelay = (0.35 + i * 0.045) + "s";
      w.appendChild(s); i++;
    }
    el.appendChild(w);
    el.appendChild(document.createTextNode(" "));
  }
}

// ------------------------------------------------------------- class switcher
let activeClass = null; // set in main() from state.classes[0]

function buildClassBar(st) {
  const bar = $("#class-bar");
  const pills = $("#class-pills");
  if (st.classes.length < 2) { bar.style.display = "none"; return; }
  bar.style.display = "flex";
  pills.innerHTML = st.classes.map(c =>
    `<button class="pill cls-pill${c === activeClass ? " on" : ""}" data-cls="${esc(c)}">${esc(classLabel(c))}</button>`
  ).join("");
}

// ------------------------------------------------------------------- ticker
function buildTicker(d, raw) {
  const items = [];
  d.weeks.forEach(w => {
    items.push(`<span class="tick-item"><span class="sep">▸</span> <b>${esc(String(w.track).toUpperCase())}</b> — 🏆 <b class="win">${esc(w.winner)}</b> · best ${fmtTime(w.best)} · ${w.pilots} pilots · ${w.records} records</span>`);
  });
  const tf = d.titleFight;
  if (tf.a) {
    items.push(`<span class="tick-item"><span class="sep">▸</span> 👑 SEASON LEADER (${esc(classLabel(d.cls))}) — <b class="win">${esc(tf.a.pilot)}</b> ${tf.a.points} pts${tf.b ? ` (+${tf.gap} από ${esc(tf.b.pilot)})` : ""}</span>`);
    if (tf.b) items.push(`<span class="tick-item"><span class="sep">▸</span> 🔥 TITLE FIGHT — <b>${esc(tf.a.pilot)}</b> vs <b>${esc(tf.b.pilot)}</b> · ${tf.a.wins}W-${tf.b.wins}W φέτος</span>`);
  }
  if (d.totalRecords) items.push(`<span class="tick-item"><span class="sep">▸</span> ⚡ ${d.totalRecords} RECORDS BROKEN ΑΥΤΗ ΤΗ ΣΕΖΟΝ (${esc(classLabel(d.cls))})</span>`);
  if (!items.length) items.push(`<span class="tick-item"><span class="sep">▸</span> Η σεζόν ξεκινά σύντομα — καλές πτήσεις! 🏁</span>`);
  $("#ticker").innerHTML = items.join("") + items.join("");
}

// ----------------------------------------------------------------- hero stats
function buildHeroStats(d) {
  const totalPilots = new Set(d.weeks.flatMap(w => w.results.map(r => r.pilot))).size;
  const stats = [
    { v: d.totalRecords, k: "Records Broken", c: "e" },
    { v: totalPilots, k: "Πιλότοι", c: "c" },
    { v: d.weeks.length, k: "Εβδομάδες", c: "f" },
    { v: d.seasonBest != null && isFinite(d.seasonBest) ? fmtTime(d.seasonBest) : "—", k: "Season Best", c: "y" }
  ];
  $("#hero-stats").innerHTML = stats.map(x =>
    `<div class="hstat"><div class="v ${x.c}">${x.v}</div><div class="k">${x.k}</div></div>`).join("");
}

// ---------------------------------------------------------------- countdown
// Started ONCE; the target is updated on re-renders (no interval stacking).
const countdown = { target: 0, started: false, trackName: "" };
function startCountdown(raw) {
  countdown.target = new Date(raw.__derived0.nextTrackAt).getTime();
  countdown.trackName = (raw.current_track || "").toUpperCase();
  $("#cd-track").textContent = countdown.trackName + " → NEXT";
  if (countdown.started) return;
  countdown.started = true;
  const refreshRing = 2 * 60;
  let refreshT = refreshRing;
  function tick() {
    let ms = countdown.target - Date.now();
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
  const card = $("#tf-grid").closest(".titlefight");
  if (!a) { card.style.display = "none"; return; }
  card.style.display = "";
  $("#tf-weeks").textContent = `SEASON 2026 · ${d.weeks.length} ΕΒΔΟΜΑΔΕΣ · ${classLabel(d.cls).toUpperCase()}`;
  const pilotHtml = (p, side) => `
    <div class="tf-pilot ${side}">
      <div class="tf-avatar">${esc(initials(p.pilot))}</div>
      <div class="tf-name" data-pilot="${esc(p.pilot)}">${esc(p.pilot)}</div>
      <div class="tf-pts">${p.points}<span style="font-size:.5em;color:rgba(255,255,255,.4)"> pts</span></div>
      <div class="tf-meta"><span><b>${p.wins}</b> WINS</span><span><b>${p.podiums}</b> PODIUMS</span><span>BEST <b>${fmtTime(p.best)}</b></span></div>
    </div>`;
  if (!b) {
    // class with a single pilot — no fight yet, show the leader alone
    $("#tf-grid").innerHTML = pilotHtml(a, "a") +
      `<div class="tf-vs"><div class="vs">👑</div><div class="gap">ΠΕΡΙΜΕΝΕΙ ΑΝΤΙΠΑΛΟ</div></div>` +
      `<div class="tf-pilot b" style="opacity:.35"><div class="tf-avatar">?</div><div class="tf-name">—</div><div class="tf-pts">—</div><div class="tf-meta"><span>κανείς ακόμα</span></div></div>`;
    requestAnimationFrame(() => { $("#tf-pa").style.width = "100%"; $("#tf-pb").style.width = "0%"; });
    return;
  }
  $("#tf-grid").innerHTML = pilotHtml(a, "a") +
    `<div class="tf-vs"><div class="vs">VS</div><div class="gap">GAP <b>${gap}</b> PTS</div></div>` +
    pilotHtml(b, "b");
  const tot = a.points + b.points || 1;
  requestAnimationFrame(() => {
    $("#tf-pa").style.width = (a.points / tot * 100) + "%";
    $("#tf-pb").style.width = (b.points / tot * 100) + "%";
  });
}

// ------------------------------------------------------------- leaderboard
let lbMode = "current", lbExpanded = false;
const prevRanksByKey = {}; // per class+mode — movement arrows

function buildLeaderboard(d, raw, isErr) {
  const cur = d.currentLb;
  const sea = d.standings;
  $("#live-track-name").textContent = ((raw.current_track || "") + " · " + classLabel(d.cls)).toUpperCase();
  $("#live-updated").textContent = new Date(raw.generated_at).toLocaleString("el-GR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + (isErr ? " · SNAPSHOT" : "");

  // week progress
  const flown = new Set(cur.map(r => r.pilot)).size, total = sea.length || Math.max(flown, 1);
  const pct = Math.min(100, Math.round(flown / total * 100));
  $("#wp-txt").innerHTML = `ΕΒΔΟΜΑΔΑ ΣΕ ΕΞΕΛΙΞΗ · <b>${flown}/${total}</b> πιλότοι έχουν πετάξει`;
  $("#wp-pct").textContent = pct + "%";
  requestAnimationFrame(() => $("#wp-fill").style.width = pct + "%");

  // rows
  let rows;
  if (lbMode === "current") {
    rows = cur.map((r, i) => {
      const leader = cur[0];
      const ahead = i > 0 ? cur[i - 1] : null;
      // gap από τον ακριβώς μπροστινό (η επόμενη μάχη) + gap από τον πρώτο
      const intv = ahead && ahead.time != null && r.time != null ? r.time - ahead.time : null;
      const tot = i > 0 && leader.time != null && r.time != null ? r.time - leader.time : null;
      return { ...r, rank: i + 1,
        sub: i === 0 ? "leader" : (intv != null ? "+" + intv.toFixed(3) + "s πίσω" : "—"),
        subTop: i > 0 && tot != null && tot !== intv ? `+${tot.toFixed(3)}s από κορυφή` : "",
        tight: intv != null && intv <= 2,
        val: fmtTime(r.time), mode: "current" };
    });
  } else {
    rows = sea.map((r, i) => ({ ...r, rank: i + 1, sub: `${r.wins}W ${r.podiums}P · best ${fmtTime(r.best)}`, val: r.points + " pts", mode: "season" }));
  }

  // movement arrows (current mode): πραγματικές 24h αλλαγές θέσης από insights,
  // fallback στις in-session αλλαγές μεταξύ refreshes
  const ins24 = {};
  if (lbMode === "current" && raw && raw.insights && Array.isArray(raw.insights.pilots)) {
    raw.insights.pilots.forEach(x => { if (x.class === d.cls && x.pos_change_24h != null) ins24[x.pilot] = x.pos_change_24h; });
  }
  const use24 = Object.keys(ins24).length > 0;
  const key = d.cls + ":" + lbMode;
  const prevRanks = prevRanksByKey[key] || null;
  const moves = rows.map(r => {
    if (lbMode !== "current") return "eq";
    if (use24) {
      const c = ins24[r.pilot];
      if (c == null || c === 0) return "eq";
      return c > 0 ? "up" : "dn";
    }
    if (!prevRanks) return "eq";
    const was = prevRanks.indexOf(r.pilot);
    if (was === -1) return "new";
    if (was > r.rank - 1) return "up";
    if (was < r.rank - 1) return "dn";
    return "eq";
  });
  if (lbMode === "current") prevRanksByKey[key] = rows.map(r => r.pilot);

  if (!rows.length) {
    $("#podium-box").innerHTML = "";
    $("#lb-body").innerHTML = `<div class="dr-empty" style="padding:28px 10px;text-align:center">Κανένας χρόνος ακόμα σε αυτή την κατηγορία — το track είναι ανοιχτό! 🏁</div>`;
    $("#lb-more").style.display = "none";
    return;
  }

  // podium (top 3)
  const podiumData = rows.slice(0, 3);
  const medals = ["👑", "🥈", "🥉"];
  const order = [1, 0, 2]; // 2nd, 1st, 3rd visual order
  $("#podium-box").innerHTML = `<div class="podium">` + order.map(oi => {
    const p = podiumData[oi]; if (!p) return "";
    const cls = oi === 0 ? "p1" : oi === 1 ? "p2" : "p3";
    const mv = moves[oi];
    const delta = mv === "up" ? `<span class="delta up">▲</span>` : mv === "dn" ? `<span class="delta dn">▼</span>` : "";
    return `<div class="pod ${cls}">
      ${oi === 0 ? `<div class="crown">👑</div>` : `<div class="medal">${medals[oi]}</div>`}
      <div class="name" data-pilot="${esc(p.pilot)}">${esc(p.pilot)}</div>
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
    const chipBg = "rgba(255,255,255,.06);color:rgba(255,255,255,.55)";
    return `<div class="lb-row r${ri + 1} ${mv === "new" ? "flash-new" : ""}">
      <span class="move ${mvCl}">${mvIc}</span>
      <span class="rk">${r.rank}</span>
      <div class="pl">
        <span class="pilot-chip" style="background:${chipBg.split(";")[0]};${chipBg.split(";")[1]}">${esc(initials(r.pilot))}</span>
        <span class="nm" data-pilot="${esc(r.pilot)}">${esc(r.pilot)}</span>
      </div>
      <span class="qd">${esc(r.quad || "—")}</span>
      <span class="val">${r.val}<span class="sub"${r.tight ? ' style="color:var(--orange);font-weight:700"' : ""}>${r.sub}${r.subTop ? `<span class="sub-top"> · ${r.subTop}</span>` : ""}</span></span>
    </div>`;
  }).join("");

  $("#lb-body").innerHTML = list;
  const more = $("#lb-more");
  if (hidden.length > 5) {
    more.style.display = "block";
    more.textContent = lbExpanded ? "SHOW LESS ▴" : `VIEW FULL RANKINGS (${hidden.length - 5} MORE) ▾`;
  } else more.style.display = "none";
}

// ------------------------------------------------------------- progression chart
// Initialized once (listeners bound a single time); redrawn via chart.update().
const chart = {
  inited: false, hover: -1, names: [], prog: {}, weeks: [], maxX: 1,
  off: new Set(), // legend-hidden pilots
  ctx: null, cv: null, W: 0, H: 0,
  pad: { l: 34, r: 12, t: 16, b: 26 },

  init() {
    if (this.inited) return;
    this.inited = true;
    this.cv = $("#progress-chart");
    this.ctx = this.cv.getContext("2d");
    this.cv.addEventListener("mousemove", e => {
      const r = this.cv.getBoundingClientRect();
      const iw = this.W - this.pad.l - this.pad.r;
      const n = this.weeks.length;
      this.hover = n > 1 ? Math.round((e.clientX - r.left - this.pad.l) / iw * (n - 1)) : 0;
      if (this.hover < 0 || this.hover >= n) this.hover = -1;
      this.draw();
    });
    this.cv.addEventListener("mouseleave", () => { this.hover = -1; this.draw(); });
    $("#chart-legend").addEventListener("click", e => {
      const it = e.target.closest(".lg-item"); if (!it) return;
      const n = it.dataset.n;
      it.classList.toggle("off");
      if (it.classList.contains("off")) this.off.add(n); else this.off.delete(n);
      this.computeMax();
      this.draw();
    });
    addEventListener("resize", () => this.update(this._lastD));
  },

  update(d) {
    this._lastD = d;
    this.init();
    this.weeks = d.weeks.map(w => w.label);
    this.prog = d.progression;
    this.names = d.standings.slice(0, 6).map(s => s.pilot).filter(n => this.prog[n]);
    // drop hidden names that no longer exist
    [...this.off].forEach(n => { if (!this.names.includes(n)) this.off.delete(n); });
    this.computeMax();
    const dpr = devicePixelRatio || 1;
    this.W = this.cv.offsetWidth; this.H = this.cv.offsetHeight;
    this.cv.width = this.W * dpr; this.cv.height = this.H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // legend
    $("#chart-legend").innerHTML = this.names.map((n, i) =>
      `<span class="lg-item${this.off.has(n) ? " off" : ""}" data-n="${esc(n)}"><span class="sw" style="background:${LINE_COLORS[i]}"></span>${esc(n)}</span>`).join("");
    // empty state
    if (!this.weeks.length || !this.names.length) {
      this.ctx.clearRect(0, 0, this.W, this.H);
      this.ctx.fillStyle = "rgba(255,255,255,.35)";
      this.ctx.font = "13px Inter";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Θα εμφανιστεί μετά την πρώτη εβδομάδα της κατηγορίας", this.W / 2, this.H / 2);
      this.ctx.textAlign = "left";
      return;
    }
    this.animate();
  },

  computeMax() {
    const vis = this.names.filter(n => !this.off.has(n));
    this.maxX = Math.max(1, ...vis.flatMap(n => this.prog[n] || [0]));
  },

  draw() {
    const { ctx, W, H, pad } = this;
    if (!this.weeks.length || !this.names.length) return;
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const x = (i) => pad.l + (this.weeks.length === 1 ? iw / 2 : i / (this.weeks.length - 1) * iw);
    const y = (v) => pad.t + ih - (v / this.maxX) * ih;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.font = "10px 'JetBrains Mono'";
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + ih - g / 4 * ih;
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
      ctx.fillText(Math.round(this.maxX * g / 4), 4, gy + 3);
    }
    this.weeks.forEach((w, i) => { ctx.fillText(w, x(i) - 8, H - 8); });

    const shown = Math.max(1, Math.ceil(this.anim * this.weeks.length));
    this.names.forEach((n, ni) => {
      if (this.off.has(n)) return;
      const pts = this.prog[n];
      const col = LINE_COLORS[ni];
      ctx.strokeStyle = col; ctx.lineWidth = ni === 0 ? 2.6 : 2;
      ctx.globalAlpha = ni > 2 ? .8 : 1;
      ctx.shadowColor = col; ctx.shadowBlur = ni < 2 ? 8 : 0;
      ctx.beginPath();
      pts.slice(0, shown).forEach((v, i) => { const px = x(i), py = y(v); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
      ctx.stroke(); ctx.shadowBlur = 0;
      pts.slice(0, shown).forEach((v, i) => {
        ctx.fillStyle = "#0a0a0f"; ctx.beginPath(); ctx.arc(x(i), y(v), 3.4, 0, 7); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x(i), y(v), 2.6, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
    });

    if (this.hover >= 0 && this.hover < this.weeks.length) {
      ctx.strokeStyle = "rgba(255,255,255,.18)";
      ctx.beginPath(); ctx.moveTo(x(this.hover), pad.t); ctx.lineTo(x(this.hover), pad.t + ih); ctx.stroke();
      this.names.forEach((n, ni) => {
        if (this.off.has(n)) return;
        const v = this.prog[n][this.hover];
        if (v == null) return;
        ctx.fillStyle = LINE_COLORS[ni];
        ctx.beginPath(); ctx.arc(x(this.hover), y(v), 4.2, 0, 7); ctx.fill();
      });
    }
  },

  animate() {
    this.anim = 0;
    const step = () => {
      this.anim = Math.min(1, this.anim + .04);
      this.draw();
      if (this.anim < 1) requestAnimationFrame(step);
    };
    step();
  }
};

// ------------------------------------------------------------------ improvement feed
let feedExpanded = false;
function buildFeed(d) {
  const box = $("#feed-list");
  if (!box) return;
  // μόνο βελτιώσεις της ΤΡΕΧΟΥΣΑΣ εβδομάδας (τρέχον track)
  const all = d.feed || [];
  const wk = d.currentTrack ? all.filter(r => r.track === d.currentTrack) : all;
  const feed = wk
    .filter(r => r.delta != null && r.delta > 0)
    .sort((a, b) => b.delta - a.delta)   // τις μεγαλύτερες βελτιώσεις πρώτες
    .slice(0, 6);
  $("#feed-count").textContent = "TOP " + feed.length;
  if (!feed.length) {
    box.innerHTML = `<div class="dr-empty" style="padding:20px 6px">Καμία βελτίωση ακόμα αυτή την εβδομάδα — το track είναι ανοιχτό.</div>`;
    $("#feed-more").style.display = "none";
    return;
  }
  box.innerHTML = feed.map((r, i) => `
    <div class="feed-row">
      <span class="fr-rank">${["🥇","🥈","🥉"][i] || (i + 1) + "."}</span>
      <span class="nm" data-pilot="${esc(r.pilot)}">${esc(r.pilot)}</span>
      <span class="fr-track">${esc(r.track || "")}</span>
      <span class="fr-delta">−${Number(r.delta).toFixed(3)}s</span>
      <span class="t mono">${fmtTime(r.time)}</span>
      <span class="fr-date">${r.date ? new Date(r.date).toLocaleDateString("el-GR", { day: "numeric", month: "short" }) : ""}</span>
    </div>`).join("");
  $("#feed-more").style.display = "none";
}

// ------------------------------------------------------------------ pilot of the week
function buildPotw(d) {
  const card = $("#potw-card");
  if (!card) return;
  const p = d.potw;
  if (!p) { card.style.display = "none"; return; }
  card.style.display = "";
  $("#potw-body").innerHTML = `
    <div style="display:flex;align-items:center;gap:16px">
      <div class="tf-avatar" style="width:56px;height:56px;border-radius:16px;font-size:22px;
        background:linear-gradient(135deg,rgba(52,211,153,.25),rgba(52,211,153,.05));
        border:1.5px solid rgba(52,211,153,.5);color:var(--emerald);box-shadow:0 0 34px rgba(52,211,153,.18)">${esc(initials(p.pilot))}</div>
      <div style="flex:1;min-width:0">
        <div class="tf-name nm" data-pilot="${esc(p.pilot)}" style="font-size:1.25rem;cursor:pointer">${esc(p.pilot)}</div>
        <div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:3px">
          <span class="mono" style="color:rgba(255,255,255,.4)">${fmtTime(p.first_time)}</span>
          → <b class="mono" style="color:var(--emerald)">${fmtTime(p.best_time)}</b> στο ${esc(p.track)}
        </div>
      </div>
      <div style="text-align:center;flex-shrink:0">
        <div class="display" style="font-weight:900;font-size:1.9rem;color:var(--emerald)">−${Number(p.improvement_pct).toFixed(1)}%</div>
        <div style="font-size:9px;letter-spacing:.18em;color:rgba(255,255,255,.4);text-transform:uppercase">βελτίωση</div>
      </div>
    </div>`;
}

// ------------------------------------------------------------------ duels
function duelWinner(p) {
  const ta = p.best_time_a, tb = p.best_time_b;
  if (ta == null && tb == null) return null;
  if (ta == null) return p.pilot_b;
  if (tb == null) return p.pilot_a;
  return ta < tb ? p.pilot_a : p.pilot_b;
}

function buildDuels(raw, d) {
  const box = $("#duels");
  // δύο σχήματα: παλιό array [...] ή νέο {active:[...], recent_resolved:[...]}
  const du = raw.duels;
  const all = Array.isArray(du) ? du : [...((du && du.active) || []), ...((du && du.recent_resolved) || [])];
  const active = all.filter(p => !p.resolved);
  const resolved = all.filter(p => p.resolved).slice(-3).reverse(); // τελευταία 3 λυμένα
  const battles = (d && d.hotBattles) || [];
  const count = $("#duels-count");
  count.textContent = active.length + " LIVE";
  count.style.background = active.length ? "rgba(239,68,68,.12)" : "rgba(251,146,60,.12)";
  count.style.color = active.length ? "var(--red)" : "var(--orange)";

  let html = "";

  // hot battles: κλειστές μάχες στην τρέχουσα πίστα (πριν γίνουν duels)
  if (battles.length) {
    html += `<div class="duel-sep">🔥 ΚΑΥΤΑ ΝΤΕΡΜΠΙ</div>
      <div class="duel-sub">🎲 Ποιους θα ρίξει ο race director στην Arena — αυτά τα ζευγάρια είναι ένα challenge μακριά.</div>`;
    html += battles.map(b => `
      <div class="duel">
        <div class="who"><div class="n">${esc(b.leader)}</div><div class="s">κρατάει</div></div>
        <div class="mid">
          <div class="score" style="background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25)"><b>+${Number(b.gap).toFixed(3)}s</b></div>
          <div class="duel-track">${b.days > 0 ? b.days + (b.days === 1 ? " μέρα" : " μέρες") + " κοντά" : "από σήμερα"}</div>
        </div>
        <div class="who"><div class="n">${esc(b.chaser)}</div><div class="s">κυνηγάει</div></div>
      </div>`).join("");
  }

  if (active.length) {
    html += `<div class="duel-sep">⚡ ΕΝΕΡΓΑ</div>`;
    html += active.map(p => {
      const ta = p.best_time_a, tb = p.best_time_b;
      const lead = duelWinner(p);
      let dl = "";
      if (p.deadline) {
        const hrs = (new Date(p.deadline) - Date.now()) / 36e5;
        dl = hrs >= 0 && hrs < 24
          ? ` · <span style="color:var(--red);font-weight:700">⏱ λήγει σε ${Math.max(1, Math.ceil(hrs))}h</span>`
          : " · λήγει " + new Date(p.deadline).toLocaleDateString("el-GR", { day: "numeric", month: "short" });
      }
      return `
      <div class="duel">
        <div class="who">
          <div class="n${lead === p.pilot_a ? " w" : ""}">${esc(p.pilot_a)}</div>
          <div class="s">${ta != null ? Number(ta).toFixed(3) + "s" : "— ακόμα χρόνο"}</div>
        </div>
        <div class="mid"><div class="score"><b>${ta != null ? Number(ta).toFixed(3) : "—"}</b><span class="d">vs</span><b>${tb != null ? Number(tb).toFixed(3) : "—"}</b></div>
          <div class="duel-track">${esc(p.track || "")}${dl}</div>
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
      const walkover = w && (p.best_time_a == null || p.best_time_b == null);
      return `
      <div class="duel done">
        <div class="who">
          <div class="n${w === p.pilot_a ? " w" : ""}">${esc(p.pilot_a)}</div>
          <div class="s">${p.best_time_a != null ? Number(p.best_time_a).toFixed(3) + "s" : "—"}</div>
        </div>
        <div class="mid">
          <div class="score"><b>${p.best_time_a != null ? Number(p.best_time_a).toFixed(3) : "—"}</b><span class="d">—</span><b>${p.best_time_b != null ? Number(p.best_time_b).toFixed(3) : "—"}</b></div>
          <div class="duel-track">${w ? "🏆 " + esc(w) + (walkover ? " · walkover" : "") : "άκυρο"}</div>
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
  $("#archive-list").innerHTML = weeks.length ? weeks.map((w, i) => `
    <div class="acc-item" data-w="${i}">
      <button class="acc-btn">
        <span class="tn">${esc(String(w.track).toUpperCase())}</span>
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
    </div>`).join("")
    : `<div class="dr-empty" style="padding:24px 6px">Κανένα ολοκληρωμένο track ακόμα σε αυτή την κατηγορία.</div>`;

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
function buildSeasonStats(d, st) {
  const totalPilots = new Set(d.weeks.flatMap(w => w.results.map(r => r.pilot))).size;
  const stats = [
    { v: d.totalPoints, k: "Points", c: "c" },
    { v: totalPilots, k: "Pilots", c: "f" },
    { v: d.totalRecords, k: "Records Broken", c: "e" },
    { v: String(st.classes.length), k: "Classes", c: "" }
  ];
  const leader = d.titleFight.a;
  $("#season-stats").innerHTML = stats.map(x =>
    `<div class="hstat"><div class="v ${x.c}">${x.v}</div><div class="k">${x.k}</div></div>`).join("") +
    `<div style="flex-basis:100%;height:1px;background:var(--line);margin:10px 0"></div>
     <div class="hstat" style="text-align:left">
       <div style="font-size:11px;letter-spacing:.2em;color:var(--yellow);font-weight:700">👑 SEASON LEADER · ${esc(classLabel(d.cls).toUpperCase())}</div>
       <div class="v" style="font-size:26px">${leader ? esc(leader.pilot) : "—"}</div>
       <div class="k">${leader ? `${leader.points} pts • ${leader.wins}W ${leader.podiums}P` : "κανείς ακόμα"}</div>
     </div>`;
}

// ------------------------------------------------------------------ drawer
function openDrawer(pilotName, d, raw) {
  const p = d.profiles[pilotName];
  if (!p) return; // pilot unknown in this class — don't open an empty drawer
  const cur = d.currentLb.find(r => r.pilot === pilotName);
  const rankIdx = d.standings.findIndex(s => s.pilot === pilotName);
  const rank = rankIdx >= 0 ? rankIdx + 1 : null;
  const rankCol = rank === 1 ? "var(--yellow)" : rank === 2 ? "#cbd5e1" : rank === 3 ? "var(--amber)" : "var(--cyan)";
  const rankGlow = rank === 1 ? "rgba(250,204,21,.3)" : rank === 2 ? "rgba(203,213,225,.22)" : rank === 3 ? "rgba(251,146,60,.26)" : "rgba(34,211,238,.22)";

  // --- hero (χρώμα ανάλογα με τη θέση στη σεζόν) ---
  const hero = $("#dr-hero");
  hero.style.setProperty("--dr-glow", rankGlow);
  const av = $("#dr-av");
  av.textContent = initials(pilotName);
  av.style.borderColor = rankCol;
  av.style.color = rankCol;
  av.style.boxShadow = `0 0 36px ${rankGlow}`;
  $("#dr-nm").textContent = pilotName;
  $("#dr-qd").textContent = (p.quads && p.quads.length ? p.quads.join(" · ") : "—");

  // chips: θέση σεζόν + τάση φόρμας + on-track-τώρα
  const chips = [];
  if (rank) chips.push(`<span class="dr-chip" style="background:rgba(255,255,255,.07);color:${rankCol}">#${rank} στη σεζόν</span>`);
  const ranksDone = (p.weeks || []).filter(Boolean).map(w => w.rank);
  if (ranksDone.length >= 3) {
    const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
    const diff = avg(ranksDone.slice(-4, -2)) - avg(ranksDone.slice(-2)); // >0 = βελτίωση θέσης
    if (diff >= 0.5) chips.push(`<span class="dr-chip" style="background:rgba(52,211,153,.12);color:var(--emerald)">↗ σε άνοδο</span>`);
    else if (diff <= -0.5) chips.push(`<span class="dr-chip" style="background:rgba(239,68,68,.12);color:var(--red)">↘ σε πτώση</span>`);
    else chips.push(`<span class="dr-chip" style="background:rgba(255,255,255,.06);color:rgba(255,255,255,.55)">→ σταθερός</span>`);
  }
  if (cur) chips.push(`<span class="dr-chip" style="background:rgba(34,211,238,.12);color:var(--cyan)">● on track τώρα</span>`);
  $("#dr-chips").innerHTML = chips.join("");

  // insights row του πιλότου για την τρέχουσα εβδομάδα (χρήση σε badge + καμπύλη)
  const ins = raw && raw.insights && Array.isArray(raw.insights.pilots)
    ? raw.insights.pilots.find(x => x.pilot === pilotName && x.class === d.cls) || null
    : null;

  // --- badges: μόνο όσα έχουν κερδηθεί πραγματικά ---
  const badges = [];
  if (ins && ins.improvements >= 2) badges.push(["🔁", `${ins.improvements} PBs αυτή την εβδομάδα`, "rgba(34,211,238,.1)", "var(--cyan)"]);
  if (p.wins > 0) badges.push(["🏆", `${p.wins} ${p.wins === 1 ? "νίκη" : "νίκες"}`, "rgba(250,204,21,.12)", "var(--yellow)"]);
  if (p.podiums > p.wins) badges.push(["🥉", `${p.podiums} podiums`, "rgba(251,146,60,.1)", "var(--amber)"]);
  if ((p.pbs || 0) > 0) badges.push(["📈", `${p.pbs} PBs στη σεζόν`, "rgba(52,211,153,.1)", "var(--emerald)"]);
  if (p.bestImprovementPct) badges.push(["💥", `−${Number(p.bestImprovementPct).toFixed(1)}% σε μία βελτίωση`, "rgba(52,211,153,.07)", "var(--emerald)"]);
  const hb = (d.hotBattles || []).find(b => b.leader === pilotName || b.chaser === pilotName);
  if (hb) badges.push(["🔥", hb.leader === pilotName ? `κρατάει από ${esc(hb.chaser)}` : `κυνηγάει ${esc(hb.leader)}`, "rgba(239,68,68,.1)", "var(--red)"]);
  $("#dr-badges").innerHTML = badges.length
    ? badges.map(b => `<span class="dr-badge" style="background:${b[2]};color:${b[3]}">${b[0]} ${b[1]}</span>`).join("")
    : `<div class="dr-empty">Κανένα badge ακόμα — το πρώτο PB ή podium σε περιμένει.</div>`;

  // --- ενεργή μονομαχία του πιλότου (αν υπάρχει) ---
  const duelBox = $("#dr-duel");
  let myDuel = null;
  if (raw) {
    const du = raw.duels;
    const activeD = Array.isArray(du) ? du : ((du && du.active) || []);
    myDuel = activeD.find(x => !x.resolved && (x.pilot_a === pilotName || x.pilot_b === pilotName)) || null;
  }
  if (myDuel) {
    const opp = myDuel.pilot_a === pilotName ? myDuel.pilot_b : myDuel.pilot_a;
    const myT = myDuel.pilot_a === pilotName ? myDuel.best_time_a : myDuel.best_time_b;
    const opT = myDuel.pilot_a === pilotName ? myDuel.best_time_b : myDuel.best_time_a;
    const lead = duelWinner(myDuel);
    const gap = (myT != null && opT != null) ? Math.abs(myT - opT) : null;
    const status = lead == null ? "Κανείς δεν έχει χρόνο ακόμα — όλα ανοιχτά."
      : lead === pilotName ? `<b style="color:var(--emerald)">Προηγείσαι</b> κατά <b class="mono">${gap.toFixed(3)}s</b> — κράτα το!`
      : `Υστερείς κατά <b class="mono" style="color:var(--orange)">${gap.toFixed(3)}s</b> — ώρα για flying laps.`;
    duelBox.innerHTML = `
      <div class="dr-duel">
        <div class="dd-head">⚔️ Μονομαχία σε εξέλιξη</div>
        <div class="dd-pilots">
          <div class="dd-p">
            <div class="dd-n${lead === pilotName ? " lead" : ""}">${esc(pilotName)}</div>
            <div class="dd-t">${myT != null ? Number(myT).toFixed(3) + "s" : "— ακόμα χρόνο"}</div>
          </div>
          <div class="dd-mid">
            ${gap != null ? `<div class="dd-gap">${gap.toFixed(3)}s</div>` : ""}
            <div class="dd-vs">VS</div>
          </div>
          <div class="dd-p">
            <div class="dd-n${lead === opp ? " lead" : ""}">${esc(opp)}</div>
            <div class="dd-t">${opT != null ? Number(opT).toFixed(3) + "s" : "— ακόμα χρόνο"}</div>
          </div>
        </div>
        <div class="dd-status">${status}${myDuel.track ? ` · ${esc(myDuel.track)}` : ""}${myDuel.deadline ? ` · λήγει ${new Date(myDuel.deadline).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}` : ""}</div>
      </div>`;
  } else duelBox.innerHTML = "";

  // --- sparkline χρόνων ανά εβδομάδα (η βελτίωση πάει προς τα πάνω) ---
  drawSpark(p);

  // --- καμπύλη εκμάθησης στο τρέχον track (από insights) ---
  const learnBox = $("#dr-learn");
  if (ins && ins.first_time != null && ins.time != null && ins.first_time > ins.time) {
    const lpct = (ins.first_time - ins.time) / ins.first_time * 100;
    learnBox.innerHTML = `
      <div class="dr-learn">
        <div class="dl-head">📉 Καμπύλη εκμάθησης${d.currentTrack ? " · " + esc(d.currentTrack) : ""}</div>
        <div class="dl-row">
          <span class="dl-from">${Number(ins.first_time).toFixed(3)}s</span>
          <span style="color:rgba(255,255,255,.4)">→</span>
          <span class="dl-to">${Number(ins.time).toFixed(3)}s</span>
          <span class="dl-pct">−${lpct.toFixed(1)}%</span>
        </div>
        <div class="dl-sub">${ins.improvements > 0 ? `${ins.improvements} ${ins.improvements === 1 ? "βελτίωση" : "βελτιώσεις"} αυτή την εβδομάδα` : "πρώτος χρόνος της εβδομάδας"}${ins.pos ? ` · P${ins.pos} στο track` : ""}</div>
      </div>`;
  } else learnBox.innerHTML = "";

  // --- μάχη με την κορυφή (μόνο όταν είναι κοντά — έως 30 pts) ---
  const race = $("#dr-race");
  const leader = d.standings[0];
  const raceGap = leader ? leader.points - (p.points || 0) : null;
  if (leader && leader.points > 0 && leader.pilot !== pilotName && raceGap <= 30) {
    const gap = leader.points - (p.points || 0);
    const pct = Math.max(0, Math.min(100, (p.points || 0) / leader.points * 100));
    race.style.display = "";
    race.innerHTML = `
      <div class="rr-head"><span>🎯 Μάχη με την κορυφή</span><span class="mono" style="color:var(--fuchsia)">−${gap} pts</span></div>
      <div class="rr-bar"><div class="rr-fill" style="width:${pct}%"></div></div>
      <div class="rr-sub">${p.points || 0} pts έναντι <b style="color:#fff">${leader.points}</b> του <b style="color:var(--yellow)">${esc(leader.pilot)}</b></div>`;
  } else if (leader && leader.pilot === pilotName && d.standings[1]) {
    race.style.display = "";
    race.innerHTML = `
      <div class="rr-head"><span>👑 Πρωτοπόρος σεζόν</span><span class="mono" style="color:var(--yellow)">+${leader.points - d.standings[1].points} pts</span></div>
      <div class="rr-bar"><div class="rr-fill" style="width:100%;background:linear-gradient(90deg,var(--yellow),var(--amber))"></div></div>
      <div class="rr-sub">Οδηγείς με διαφορά από <b style="color:#fff">${esc(d.standings[1].pilot)}</b> — κράτα το!</div>`;
  } else race.style.display = "none";

  const stats = [
    { v: p.points, k: "Points" }, { v: p.wins, k: "Wins" }, { v: p.podiums, k: "Podiums" },
    { v: p.best != null ? Number(p.best).toFixed(3) : "—", k: "Best (s)" },
    { v: p.appearances, k: "Weeks" }, { v: p.avgRank, k: "Avg Rank" },
    { v: p.pbs || 0, k: "PBs" },
    { v: p.bestImprovementPct ? "−" + Number(p.bestImprovementPct).toFixed(1) + "%" : "—", k: "Best PB %" }
  ];
  $("#dr-stats").innerHTML = stats.map(s => `<div class="dr-stat"><div class="v">${s.v}</div><div class="k">${s.k}</div></div>`).join("");
  // form chips
  const form = p.form || [];
  $("#dr-form").innerHTML = form.length ? form.map(r =>
    `<div class="form-chip ${r === 1 ? "y" : r <= 3 ? "g" : "o"}">${r === 1 ? "🏆" : "#" + r}<span class="w">${r === 1 ? "WIN" : "RANK"}</span></div>`).join("")
    : `<div class="dr-empty">Καμία συμμετοχή ακόμα.</div>`;
  // weeks list — με % πίσω από τον νικητή της εβδομάδας (συγκρίνιμο μεταξύ tracks)
  $("#dr-weeks").innerHTML = p.weeks && p.weeks.some(Boolean) ? p.weeks.map((w, i) => {
    if (!w) return "";
    const winBest = d.weeks[i] && d.weeks[i].best;
    const pctBehind = (w.rank > 1 && winBest && w.time != null) ? ((w.time - winBest) / winBest * 100) : null;
    return `<div class="dr-week">
      <span class="w">W${i + 1}</span>
      <span class="pos p${w.rank <= 3 ? w.rank : ""}">${w.rank === 1 ? "🏆" : w.rank}</span>
      <span style="color:rgba(255,255,255,.65)">${esc(d.weeks[i].track)}</span>
      ${pctBehind != null ? `<span class="mono" style="font-size:11px;color:rgba(255,255,255,.4);width:52px;text-align:right;flex-shrink:0">+${pctBehind.toFixed(1)}%</span>` : ""}
      <span class="t">${fmtTime(w.time)}</span>
      <span class="pt">+${w.points || 0}p</span>
    </div>`;
  }).join("") : `<div class="dr-empty">Ακόμα χωρίς εμφανίσεις στη σεζόν.</div>`;

  $("#drawer").scrollTop = 0;
  $("#overlay").classList.add("on");
  $("#drawer").classList.add("on");
  document.body.style.overflow = "hidden";
}
function drawSpark(p) {
  const cv = $("#dr-spark"), meta = $("#dr-spark-meta");
  const pts = (p.weeks || []).map((w, i) => (w && w.time != null) ? { i: i + 1, v: w.time } : null).filter(Boolean);
  if (pts.length < 2) {
    cv.style.display = "none";
    meta.innerHTML = `<span style="color:rgba(255,255,255,.35)">Χρειάζονται 2+ εβδομάδες για γράφημα πορείας.</span>`;
    return;
  }
  cv.style.display = "";
  const dpr = devicePixelRatio || 1;
  const W = cv.offsetWidth || 380, H = 88;
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const pad = { l: 8, r: 8, t: 10, b: 16 };
  const lo = Math.min(...pts.map(q => q.v)), hi = Math.max(...pts.map(q => q.v));
  const span = Math.max(hi - lo, 0.001);
  const x = k => pad.l + (pts.length === 1 ? 0 : k / (pts.length - 1)) * (W - pad.l - pad.r);
  // inverted: καλύτερος (μικρότερος) χρόνος πιο ψηλά — η βελτίωση «ανεβαίνει»
  const y = v => pad.t + (v - lo) / span * (H - pad.t - pad.b);
  // area fill
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#22d3ee"); grad.addColorStop(1, "#34d399");
  ctx.beginPath();
  pts.forEach((q, k) => { k === 0 ? ctx.moveTo(x(k), y(q.v)) : ctx.lineTo(x(k), y(q.v)); });
  ctx.strokeStyle = grad; ctx.lineWidth = 2.4; ctx.lineJoin = "round"; ctx.stroke();
  ctx.lineTo(x(pts.length - 1), H - pad.b); ctx.lineTo(x(0), H - pad.b); ctx.closePath();
  const fill = ctx.createLinearGradient(0, 0, 0, H);
  fill.addColorStop(0, "rgba(52,211,153,.22)"); fill.addColorStop(1, "rgba(52,211,153,0)");
  ctx.fillStyle = fill; ctx.fill();
  // dots — το PB (καλύτερος χρόνος) τονισμένο
  pts.forEach((q, k) => {
    const isBest = q.v === lo;
    ctx.fillStyle = isBest ? "#34d399" : "rgba(255,255,255,.55)";
    ctx.beginPath(); ctx.arc(x(k), y(q.v), isBest ? 4 : 2.6, 0, 7); ctx.fill();
    if (isBest) { ctx.strokeStyle = "rgba(52,211,153,.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x(k), y(q.v), 7, 0, 7); ctx.stroke(); }
  });
  // week labels
  ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.font = "9px 'JetBrains Mono'"; ctx.textAlign = "center";
  pts.forEach((q, k) => { if (pts.length <= 10 || k % 2 === 0) ctx.fillText("W" + q.i, x(k), H - 4); });
  ctx.textAlign = "left";
  const first = pts[0].v, best = lo;
  const imp = first > 0 ? (first - best) / first * 100 : 0;
  meta.innerHTML = `<span>W${pts[0].i} ${Number(first).toFixed(3)}s</span>
    <span style="color:var(--emerald);font-weight:700">PB ${Number(best).toFixed(3)}s · −${imp.toFixed(1)}%</span>
    <span>W${pts[pts.length - 1].i} ${Number(pts[pts.length - 1].v).toFixed(3)}s</span>`;
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

// ------------------------------------------------------------------ card glow (bound once)
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
  cardGlow();

  let state = await initData();
  activeClass = state.classes[0];
  let lastGenerated = state.data.generated_at;

  function renderAll() {
    const d = state.derivedByClass[activeClass];
    state.data.__derived0 = state.derivedByClass[state.classes[0]];
    buildClassBar(state);
    buildTicker(d, state.data);
    buildHeroStats(d);
    startCountdown(state.data);
    buildTitleFight(d);
    buildLeaderboard(d, state.data, state.error);
    buildFeed(d);
    chart.update(d);
    buildDuels(state.data, d);
    buildPotw(d);
    buildArchive(d);
    buildSeasonStats(d, state);
    $("#err-banner").classList.toggle("on", state.error);
  }

  renderAll();

  // re-render when fresh data arrives (κάθε 2' — με cache-buster στο fetch παίρνουμε
  // το νέο JSON σχεδόν αμέσως μετά το push του bot)
  setInterval(async () => {
    state = await initData();
    const changed = state.data.generated_at !== lastGenerated;
    lastGenerated = state.data.generated_at;
    renderAll();
    if (changed && !state.error) toast("Live data ανανεώθηκε", "⟳");
  }, 2 * 60 * 1000);

  // class switcher (delegated — pills are re-rendered)
  $("#class-pills").addEventListener("click", e => {
    const b = e.target.closest(".cls-pill"); if (!b) return;
    if (b.dataset.cls === activeClass) return;
    activeClass = b.dataset.cls;
    lbExpanded = false;
    renderAll();
  });

  // tabs (current / season)
  $$(".pill[data-lb]").forEach(p => p.addEventListener("click", () => {
    $$(".pill[data-lb]").forEach(x => { x.classList.remove("on"); x.classList.remove("f"); });
    p.classList.add("on");
    if (p.dataset.lb === "season") p.classList.add("f");
    lbMode = p.dataset.lb; lbExpanded = false;
    buildLeaderboard(state.derivedByClass[activeClass], state.data, state.error);
  }));

  // show more
  $("#lb-more").addEventListener("click", () => { lbExpanded = !lbExpanded; buildLeaderboard(state.derivedByClass[activeClass], state.data, state.error); });
  const feedMore = $("#feed-more");
  if (feedMore) feedMore.addEventListener("click", () => { feedExpanded = !feedExpanded; buildFeed(state.derivedByClass[activeClass]); });

  // pilot drawer (delegate)
  document.addEventListener("click", e => {
    const nm = e.target.closest(".nm[data-pilot], .tf-name[data-pilot], .pod .name[data-pilot]");
    if (nm) {
      const name = nm.dataset.pilot;
      const d = state.derivedByClass[activeClass];
      if (name && d.profiles[name]) { e.preventDefault(); openDrawer(name, d, state.data); }
    }
  });
  $("#dr-close").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);
  addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

  // retry
  $("#retry-btn").addEventListener("click", async () => {
    state = await initData();
    lastGenerated = state.data.generated_at;
    renderAll();
    toast(state.error ? "Ακόμα offline — δείχνουμε snapshot" : "Επανασύνδεση επιτυχής", state.error ? "⚠" : "✓");
  });
})();
