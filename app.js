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
const countdown = { target: 0, started: false };
function startCountdown(raw) {
  countdown.target = new Date(raw.__derived0.nextTrackAt).getTime();
  const nextName = $("#hof-next-name");
  if (nextName) nextName.textContent = (raw.track_reveal && raw.track_reveal.track) ? String(raw.track_reveal.track).toUpperCase() : "—";
  if (countdown.started) return;
  countdown.started = true;
  function tick() {
    let ms = countdown.target - Date.now();
    if (ms < 0) ms = 0;
    const dd = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5), mm = Math.floor(ms % 36e5 / 6e4), ss = Math.floor(ms % 6e4 / 1e3);
    $("#cd-digits").textContent = `${String(dd).padStart(2, "0")}η ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
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
      <div class="tf-pts">${p.points}<span style="font-size:.5em;color:rgba(255,255,255,.55)"> pts</span></div>
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
  const subTrack = $("#live-sub-track");
  if (subTrack) subTrack.textContent = (raw.current_track || "").toUpperCase();
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
      <div class="name" data-pilot="${esc(p.pilot)}">${esc(p.pilot)}${delta}</div>
      <div class="time mono">${lbMode === "current" ? fmtTime(p.time) : p.points + " pts"}</div>
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
    const title = pilotTitle(r.pilot, d, raw);
    return `<div class="lb-row r${ri + 1} ${mv === "new" ? "flash-new" : ""}">
      <span class="move ${mvCl}">${mvIc}</span>
      <span class="rk">${r.rank}</span>
      <div class="pl">
        <span class="pilot-chip" style="background:${chipBg.split(";")[0]};${chipBg.split(";")[1]}">${esc(initials(r.pilot))}</span>
        <span class="nm" data-pilot="${esc(r.pilot)}">${esc(r.pilot)}</span>
        ${title ? `<span class="pilot-title" style="color:${title.color}">${esc(title.label)}</span>` : ""}
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
  pad: { l: 10, r: 12, t: 16, b: 10 },

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
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + ih - g / 4 * ih;
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
    }

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

// ------------------------------------------------------------------ race director intelligence
function dayKey(v) {
  const dt = new Date(v);
  return isNaN(dt) ? null : dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
}

function pilotStreak(pilot, d) {
  const days = [...new Set((d.feed || [])
    .filter(r => r.pilot === pilot && r.date)
    .map(r => dayKey(r.date))
    .filter(Boolean))].sort();
  if (!days.length) return 0;
  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    const cur = new Date(days[i] + "T00:00:00");
    const prev = new Date(days[i - 1] + "T00:00:00");
    if ((cur - prev) / 864e5 === 1) streak++;
    else break;
  }
  return streak;
}

function pilotInsight(pilot, d, raw) {
  const rows = raw && raw.insights && Array.isArray(raw.insights.pilots) ? raw.insights.pilots : [];
  return rows.find(x => x.pilot === pilot && (!x.class || x.class === d.cls)) || null;
}

const TITLE_ORDER = ["Season Leader", "PB Machine", "Rising Star", "Streak Hunter", "Gatekeeper", "Close Hunter", "Consistent Threat"];

function pilotTitleCandidates(pilot, d, raw) {
  const p = d.profiles[pilot] || {};
  const ins = pilotInsight(pilot, d, raw);
  const streak = pilotStreak(pilot, d);
  const seasonRank = d.standings.findIndex(x => x.pilot === pilot) + 1;
  const hb = (d.hotBattles || []).find(b => b.leader === pilot || b.chaser === pilot);
  const c = [];
  if (seasonRank === 1) c.push({ label: "Season Leader", color: "var(--yellow)", score: 1000 });
  if ((ins && ins.improvements >= 5) || (p.pbs || 0) >= 8)
    c.push({ label: "PB Machine", color: "var(--emerald)", score: (p.pbs || 0) + (ins ? (ins.improvements || 0) : 0) });
  if ((p.bestImprovementPct || 0) >= 15)
    c.push({ label: "Rising Star", color: "var(--cyan)", score: p.bestImprovementPct });
  if (streak >= 3) c.push({ label: "Streak Hunter", color: "var(--orange)", score: streak * 10 });
  if (hb && hb.leader === pilot) c.push({ label: "Gatekeeper", color: "var(--red)", score: 100 - Number(hb.gap || 0) });
  if (hb && hb.chaser === pilot) c.push({ label: "Close Hunter", color: "var(--fuchsia)", score: 100 - Number(hb.gap || 0) });
  if ((p.appearances || 0) >= 3 && Number(p.avgRank) <= 3)
    c.push({ label: "Consistent Threat", color: "var(--violet)", score: (10 - Number(p.avgRank)) * (p.appearances || 1) });
  return c;
}

// κάθε τίτλος ανήκει σε ΕΝΑΝ πιλότο — τον πιο δυνατό υποψήφιο
function titleMapFor(d, raw) {
  if (!d || !d.profiles) return new Map();
  if (d._titleMap) return d._titleMap;
  const pool = [];
  Object.keys(d.profiles).forEach(name => {
    pilotTitleCandidates(name, d, raw).forEach(t =>
      pool.push({ name, label: t.label, color: t.color, score: t.score }));
  });
  pool.sort((a, b) => TITLE_ORDER.indexOf(a.label) - TITLE_ORDER.indexOf(b.label) || b.score - a.score);
  const usedLabels = new Set(), usedPilots = new Set(), map = new Map();
  for (const e of pool) {
    if (usedLabels.has(e.label) || usedPilots.has(e.name)) continue;
    usedLabels.add(e.label); usedPilots.add(e.name);
    map.set(e.name, { label: e.label, color: e.color });
  }
  d._titleMap = map;
  return map;
}

function pilotTitle(pilot, d, raw) {
  return titleMapFor(d, raw).get(pilot) || null;
}

function rivalInfo(pilot, d) {
  const rows = d.currentLb || [];
  const idx = rows.findIndex(r => r.pilot === pilot);
  if (idx < 0) {
    const sIdx = d.standings.findIndex(r => r.pilot === pilot);
    if (sIdx < 0) return null;
    return { mode: "season", seasonRank: sIdx + 1, seasonAhead: d.standings[sIdx - 1] || null, seasonBehind: d.standings[sIdx + 1] || null };
  }
  const cur = rows[idx];
  const ahead = rows[idx - 1] || null;
  const behind = rows[idx + 1] || null;
  return {
    mode: "track", rank: idx + 1, cur,
    ahead, behind,
    gapAhead: ahead && cur.time != null && ahead.time != null ? cur.time - ahead.time : null,
    gapBehind: behind && behind.time != null && cur.time != null ? behind.time - cur.time : null
  };
}

function pilotQuests(pilot, d, raw) {
  const ins = pilotInsight(pilot, d, raw);
  const quests = [];
  const weeklyPbs = ins ? (ins.improvements || 0) : 0;
  if (!ins || !ins.time) {
    quests.push({ label: "Καταγραφή πρώτου χρόνου στο τρέχον track", done: 0, target: 1, note: "ο αγώνας ξεκινά από τον πρώτο γύρο" });
  } else {
    quests.push({ label: "3 βελτιώσεις αυτή την εβδομάδα", done: Math.min(3, weeklyPbs), target: 3, note: `${weeklyPbs}/3 ολοκληρώθηκαν` });
    if (ins.first_time != null && ins.first_time > 0) {
      const targetDrop = ins.first_time * 0.02;
      const dropped = Math.max(0, ins.first_time - ins.time);
      quests.push({ label: "Μείωση χρόνου κατά 2%", done: Math.min(targetDrop, dropped), target: targetDrop, note: dropped >= targetDrop ? "ολοκληρώθηκε" : `λείπουν ${(targetDrop - dropped).toFixed(3)}s` });
    }
  }
  const sIdx = d.standings.findIndex(x => x.pilot === pilot);
  if (sIdx > 0) {
    const ahead = d.standings[sIdx - 1];
    const gap = Math.max(0, (ahead.points || 0) - (d.standings[sIdx].points || 0)) + 1;
    quests.push({ label: `Προσπέρασε τον ${ahead.pilot} στη σεζόν`, done: 0, target: 1, note: `${gap} pts διαφορά` });
  } else if (sIdx === 0 && d.standings[1]) {
    quests.push({ label: "Κράτησε την κορυφή της σεζόν", done: 0, target: 1, note: `${d.standings[0].points - d.standings[1].points} pts μαξιλάρι` });
  }
  return quests.slice(0, 3);
}

function weeklyDigest(pilot, d, raw) {
  const p = d.profiles[pilot] || {};
  const ins = pilotInsight(pilot, d, raw);
  const title = pilotTitle(pilot, d, raw);
  const streak = pilotStreak(pilot, d);
  const parts = [];
  if (ins && ins.first_time != null && ins.time != null && ins.first_time > ins.time) {
    parts.push(`Ξεκίνησε στα ${Number(ins.first_time).toFixed(3)}s και βρίσκεται στα ${Number(ins.time).toFixed(3)}s`);
  } else if (ins && ins.time != null) {
    parts.push(`Έχει καταγράψει ${Number(ins.time).toFixed(3)}s στο τρέχον track`);
  }
  if (ins && ins.pos_change_24h > 0) parts.push(`κέρδισε ${ins.pos_change_24h} ${ins.pos_change_24h === 1 ? "θέση" : "θέσεις"} στο 24ωρο`);
  if (ins && ins.improvements > 0) parts.push(`μετράει ${ins.improvements} ${ins.improvements === 1 ? "βελτίωση" : "βελτιώσεις"} αυτή την εβδομάδα`);
  if (streak >= 2) parts.push(`κρατάει streak ${streak} ημερών`);
  if (!parts.length && p.appearances) parts.push(`έχει ${p.appearances} εμφανίσεις και ${p.podiums || 0} podium finishes στη σεζόν`);
  if (!parts.length) return null;
  return { text: parts.join(" · ") + ".", title };
}

function renderDirectorBlock(pilot, d, raw) {
  const info = rivalInfo(pilot, d);
  const title = pilotTitle(pilot, d, raw);
  if (!info && !title) return "";
  let rows = "";
  if (info && info.mode === "track") {
    if (info.ahead) rows += `<div class="rd-line"><span>Επόμενος στόχος</span><b>${esc(info.ahead.pilot)}</b><span class="mono">−${info.gapAhead.toFixed(3)}s</span></div>`;
    else rows += `<div class="rd-line"><span>Κατάσταση</span><b>Leader στο track</b><span class="mono">P1</span></div>`;
    if (info.behind) rows += `<div class="rd-line"><span>Σε κυνηγάει</span><b>${esc(info.behind.pilot)}</b><span class="mono">+${info.gapBehind.toFixed(3)}s</span></div>`;
    if (info.rank > 3) rows += `<div class="rd-line"><span>Επόμενο milestone</span><b>Top ${info.rank <= 5 ? 3 : info.rank <= 10 ? 5 : 10}</b><span class="mono">P${info.rank}</span></div>`;
  } else if (info && info.mode === "season") {
    if (info.seasonAhead) rows += `<div class="rd-line"><span>Επόμενος στόχος</span><b>${esc(info.seasonAhead.pilot)}</b><span class="mono">+${Math.max(0, info.seasonAhead.points - (d.profiles[pilot].points || 0)) + 1} pts</span></div>`;
    rows += `<div class="rd-line"><span>Κατάσταση</span><b>Ακόμα χωρίς χρόνο αυτή την εβδομάδα</b><span class="mono">—</span></div>`;
  }
  return `<div class="rd-block">
    <div class="rd-head"><span>RACE DIRECTOR · NEXT TARGET</span>${title ? `<span style="color:${title.color}">${esc(title.label)}</span>` : ""}</div>
    ${rows}
    <div class="rd-note">Η επόμενη μάχη δεν είναι η κορυφή — είναι ο πιλότος ακριβώς μπροστά σου.</div>
  </div>`;
}

function renderQuestsBlock(pilot, d, raw) {
  const quests = pilotQuests(pilot, d, raw);
  if (!quests.length) return "";
  return `<div class="rd-block">
    <div class="rd-head"><span>RACE DIRECTOR · QUESTS</span><span>${quests.filter(q => q.done >= q.target).length}/${quests.length}</span></div>
    ${quests.map(q => {
      const pct = q.target > 0 ? Math.min(100, q.done / q.target * 100) : 0;
      const done = q.done >= q.target;
      return `<div class="quest${done ? " done" : ""}">
        <div class="quest-top"><b>${esc(q.label)}</b><span class="mono">${esc(q.note)}</span></div>
        <div class="quest-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join("")}
  </div>`;
}

function renderDigestBlock(pilot, d, raw) {
  const digest = weeklyDigest(pilot, d, raw);
  if (!digest) return "";
  return `<div class="rd-block">
    <div class="rd-head"><span>RACE DIRECTOR · WEEKLY DIGEST</span>${digest.title ? `<span style="color:${digest.title.color}">${esc(digest.title.label)}</span>` : ""}</div>
    <div class="rd-note">${esc(digest.text)}</div>
  </div>`;
}

function raceAwards(d) {
  const profiles = Object.values(d.profiles || {});
  const awards = [];
  if (d.potw) awards.push({ icon: "📈", label: "Pilot of the Week", pilot: d.potw.pilot, value: "−" + Number(d.potw.improvement_pct).toFixed(1) + "%" });
  const byBestImp = profiles.filter(p => p.bestImprovementPct > 0).sort((a, b) => b.bestImprovementPct - a.bestImprovementPct)[0];
  if (byBestImp) awards.push({ icon: "💥", label: "Most Improved", pilot: byBestImp.pilot, value: "−" + Number(byBestImp.bestImprovementPct).toFixed(1) + "%" });
  const byPbs = profiles.filter(p => (p.pbs || 0) > 0).sort((a, b) => (b.pbs || 0) - (a.pbs || 0))[0];
  if (byPbs) awards.push({ icon: "🔁", label: "PB Machine", pilot: byPbs.pilot, value: byPbs.pbs + " PBs" });
  const comebacks = profiles.map(p => {
    const weeks = (p.weeks || []).filter(Boolean);
    if (weeks.length < 2) return null;
    const prev = weeks[weeks.length - 2], last = weeks[weeks.length - 1];
    return { pilot: p.pilot, gain: prev.rank - last.rank };
  }).filter(x => x && x.gain > 0).sort((a, b) => b.gain - a.gain)[0];
  if (comebacks) awards.push({ icon: "↗", label: "Best Comeback", pilot: comebacks.pilot, value: "+" + comebacks.gain + " θέσεις" });
  const battle = (d.hotBattles || [])[0];
  if (battle) awards.push({ icon: "⚔️", label: "Closest Battle", pilot: battle.leader + " vs " + battle.chaser, value: "+" + Number(battle.gap).toFixed(3) + "s", pair: true });
  return awards.slice(0, 5);
}

function buildSpotlight(d, raw) {
  const box = $("#spotlight-list");
  if (!box) return;
  const items = [];
  const weekFeed = (d.feed || []).filter(r => !d.currentTrack || r.track === d.currentTrack);
  const biggest = weekFeed.filter(r => r.delta != null && r.delta > 0).sort((a, b) => b.delta - a.delta)[0];
  const newest = weekFeed.filter(r => r.delta == null).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  const battle = (d.hotBattles || [])[0];
  if (d.potw) items.push({ k: "PILOT OF THE WEEK", v: d.potw.pilot, s: `Βελτίωση ${Number(d.potw.improvement_pct).toFixed(1)}% στο ${d.potw.track}. Ο Race Director σημειώνει την ταχύτερη καμπύλη μάθησης της εβδομάδας.` });
  if (battle) items.push({ k: "HOT BATTLE", v: battle.leader + " vs " + battle.chaser, s: `Διαφορά μόλις ${Number(battle.gap).toFixed(3)}s. Το επόμενο lap μπορεί να αλλάξει την ιστορία.` });
  if (biggest) items.push({ k: "BIGGEST JUMP", v: biggest.pilot, s: `Έκοψε ${Number(biggest.delta).toFixed(3)}s και έκανε το μεγαλύτερο βήμα της εβδομάδας.` });
  if (newest && items.length < 3) items.push({ k: "NEW ENTRY", v: newest.pilot, s: `Πρώτη καταγραφή στο ${newest.track}. Καλωσήρθες στο grid.` });
  const titlePilot = Object.keys(d.profiles || {}).map(name => ({ name, title: pilotTitle(name, d, raw) })).find(x => x.title);
  if (titlePilot && items.length < 3) items.push({ k: "TITLE WATCH", v: titlePilot.title.label, s: `${titlePilot.name} κερδίζει τον χαρακτηρισμό του Race Director αυτή την εβδομάδα.` });
  box.innerHTML = items.length ? items.slice(0, 3).map(x => `
    <div class="spot-item">
      <div class="spot-k">${esc(x.k)}</div>
      ${(d.profiles || {})[x.v] ? `<div class="spot-v nm" data-pilot="${esc(x.v)}">${esc(x.v)}</div>` : `<div class="spot-v">${esc(x.v)}</div>`}
      <div class="spot-s">${esc(x.s)}</div>
    </div>`).join("")
    : `<div class="dr-empty" style="padding:20px 6px">Η εβδομάδα μόλις ξεκίνησε — το πρώτο spotlight θα εμφανιστεί αυτόματα.</div>`;

  // τα weekly awards ως badge strip στην ίδια κάρτα
  const awBox = $("#spotlight-awards");
  if (awBox) {
    const aw = raceAwards(d);
    awBox.innerHTML = aw.map(a => `
      <div class="spot-award">
        <span>${a.icon}</span>
        <span class="sa-label">${esc(a.label)}</span>
        <b${a.pair ? "" : ` class="nm" data-pilot="${esc(a.pilot)}"`}>${esc(a.pilot)}</b>
        <span class="mono">${esc(a.value)}</span>
      </div>`).join("");
  }
}

function buildHallOfFame(d) {
  const box = $("#hall-fame");
  if (!box) return;
  // νίκες με tie-handling: όλοι όσοι ισοβαθμούν στο max
  const maxWins = Math.max(0, ...(d.standings || []).map(s => s.wins || 0));
  const winTied = maxWins > 0 ? (d.standings || []).filter(s => (s.wins || 0) === maxWins) : [];
  const mostRecordsWeek = [...(d.weeks || [])].sort((a, b) => (b.records || 0) - (a.records || 0))[0];
  const mostAppearances = Object.values(d.profiles || {}).sort((a, b) => (b.appearances || 0) - (a.appearances || 0))[0];
  const bestImp = Object.values(d.profiles || {}).filter(p => p.bestImprovementPct > 0).sort((a, b) => b.bestImprovementPct - a.bestImprovementPct)[0];
  // ποιος κρατάει το season best (το χρόνο τον έχουμε — βρίσκουμε τον πιλότο)
  let sbPilot = "";
  if (d.seasonBest != null && isFinite(d.seasonBest)) {
    outer: for (const w of d.weeks || []) {
      for (const r of w.results || []) {
        if (r.time === d.seasonBest) { sbPilot = r.pilot; break outer; }
      }
    }
  }
  const rows = [
    winTied.length ? ["👑", "Περισσότερες νίκες", winTied.map(s => s.pilot).join(" · "), `${maxWins} wins`] : null,
    d.seasonBest != null && isFinite(d.seasonBest) ? ["⚡", "Season best", sbPilot, fmtTime(d.seasonBest)] : null,
    mostRecordsWeek ? ["📈", "Περισσότερα records σε track", mostRecordsWeek.track, `${mostRecordsWeek.records} records`] : null,
    mostAppearances ? ["🗓", "Περισσότερες εμφανίσεις", mostAppearances.pilot, `${mostAppearances.appearances} weeks`] : null,
    bestImp ? ["💥", "Μεγαλύτερη βελτίωση", bestImp.pilot, `−${Number(bestImp.bestImprovementPct).toFixed(1)}%`] : null
  ].filter(Boolean);
  box.innerHTML = rows.length ? rows.map(r => `
    <div class="hof-row"><span>${r[0]} ${esc(r[1])}</span><b>${esc(r[2])}</b><span class="mono">${esc(r[3])}</span></div>`).join("")
    : `<div class="dr-empty">Το Hall of Fame θα γεμίσει μετά τις πρώτες ολοκληρωμένες εβδομάδες.</div>`;
}

// ------------------------------------------------------------------ improvement feed
let feedExpanded = false;
let feedFilter = "ALL";
const FEED_FILTERS = [
  { id: "ALL", label: "Όλα", color: "#ffffff" },
  { id: "NOTE", label: "📣 RD Notes", color: "var(--violet)" },
  { id: "PB", label: "📈 PBs", color: "var(--emerald)" },
  { id: "DUEL", label: "🥊 Duels", color: "var(--orange)" }
];
function buildFeed(d, raw) {
  const box = $("#feed-list");
  if (!box) return;
  const generated = raw && raw.generated_at ? raw.generated_at : null;
  const events = [];
  const currentTrack = d.currentTrack;

  (d.feed || []).filter(r => !currentTrack || r.track === currentTrack).forEach(r => {
    if (r.delta != null && r.delta > 0) {
      events.push({ type: "PB", icon: "📈", color: "var(--emerald)", pilot: r.pilot,
        text: `έκοψε ${Number(r.delta).toFixed(3)}s στο ${r.track || "track"}`,
        meta: fmtTime(r.time), date: r.date || generated });
    } else {
      events.push({ type: "NEW", icon: "🆕", color: "var(--cyan)", pilot: r.pilot,
        text: `πρώτη καταγραφή στο ${r.track || "track"}`,
        meta: fmtTime(r.time), date: r.date || generated });
    }
  });

  (d.hotBattles || []).forEach(b => events.push({ type: "BATTLE", icon: "⚔️", color: "var(--red)", pilot: null,
    text: `${b.leader} κρατάει από ${b.chaser} — διαφορά ${Number(b.gap).toFixed(3)}s`,
    meta: "hot battle", date: generated }));

  const du = raw && raw.duels;
  const activeDuels = Array.isArray(du) ? du.filter(x => !x.resolved) : (((du && du.active) || []).filter(x => !x.resolved));
  activeDuels.forEach(x => events.push({ type: "DUEL", icon: "🥊", color: "var(--orange)", pilot: null,
    text: `${x.pilot_a} vs ${x.pilot_b}${x.track ? " στο " + x.track : ""}`,
    meta: "duel live", date: x.started_at || generated }));

  if (d.potw) events.push({ type: "AWARD", icon: "🏅", color: "var(--yellow)", pilot: d.potw.pilot,
    text: `Pilot of the Week με βελτίωση ${Number(d.potw.improvement_pct).toFixed(1)}%`,
    meta: d.potw.track || "", date: generated });

  // Race Director notes (από το Discord log του bot) — μόνο στο feed, φίλτρο «RD Notes»
  const rdMsgs = raw && Array.isArray(raw.race_director_messages) ? raw.race_director_messages : [];

  rdMsgs.forEach(m => events.push({ type: "NOTE", icon: "📣", color: "var(--violet)", pilot: null,
    text: m.text || "", meta: m.tag || "race director", date: m.date || generated }));
  if (!rdMsgs.length) events.push({ type: "NOTE", icon: "📣", color: "var(--violet)", pilot: null, ph: true,
    text: "Καμία ανακοίνωση ακόμα — οι σημειώσεις που στέλνει ο Race Director στο Discord θα καρφιτσώνονται εδώ αυτόματα.",
    meta: "σύντομα", date: generated });

  Object.keys(d.profiles || {}).forEach(name => {
    const streak = pilotStreak(name, d);
    if (streak >= 3) events.push({ type: "STREAK", icon: "🔥", color: "var(--orange)", pilot: name,
      text: `κρατάει streak ${streak} ημερών πτήσης`,
      meta: "streak", date: generated });
  });

  events.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  // φίλτρα: δείχνουμε μόνο τους τύπους που υπάρχουν στο feed
  const presentTypes = new Set(events.map(e => e.type));
  const filtersBox = $("#feed-filters");
  if (filtersBox) {
    if (feedFilter !== "ALL" && !presentTypes.has(feedFilter)) feedFilter = "ALL";
    const avail = FEED_FILTERS.filter(f => f.id === "ALL" || presentTypes.has(f.id));
    filtersBox.innerHTML = avail.map(f => {
      const n = f.id === "ALL" ? events.length : events.filter(e => e.type === f.id).length;
      return `<button class="ff ${feedFilter === f.id ? "on" : ""}" data-ff="${f.id}" style="--ff-c:${f.color}">${f.label} · ${n}</button>`;
    }).join("");
  }
  const filtered = feedFilter === "ALL" ? events : events.filter(e => e.type === feedFilter);

  // expanded view: cap και προτεραιότητα στα σπάνια events, όχι χαμός από PBs
  const FEED_CAP = 16;
  const RARE = { NOTE: -1, AWARD: 0, DUEL: 1, BATTLE: 2, STREAK: 3 };
  const expandedList = filtered.slice().sort((a, b) => (RARE[a.type] ?? 4) - (RARE[b.type] ?? 4)).slice(0, FEED_CAP);
  let visible = feedExpanded ? expandedList : filtered.slice(0, 8);
  // pin: το νεότερο RD note πάντα πρώτο (αν υπάρχει στο τρέχον φίλτρο)
  const pinnedNote = filtered.find(e => e.type === "NOTE");
  if (pinnedNote && !visible.includes(pinnedNote)) visible = [pinnedNote, ...visible.slice(0, -1)];
  else if (pinnedNote) visible = [pinnedNote, ...visible.filter(e => e !== pinnedNote)];
  $("#feed-count").textContent = filtered.length + " EVENTS";
  if (!visible.length) {
    box.innerHTML = `<div class="dr-empty" style="padding:20px 6px">Η εβδομάδα μόλις ξεκίνησε — το πρώτο event θα εμφανιστεί εδώ αυτόματα.</div>`;
    $("#feed-more").style.display = "none";
    return;
  }
  box.innerHTML = visible.map(ev => `
    <div class="feed-row"${ev === pinnedNote ? ' style="background:rgba(167,139,250,.05);border-radius:10px"' : ""}${ev.ph ? ' style="opacity:.55"' : ""}>
      <span class="feed-icon" style="color:${ev.color}">${ev.icon}</span>
      <div class="feed-main">
        ${ev.type === "NOTE" ? `<b style="color:var(--violet);letter-spacing:.06em;font-size:11px;text-transform:uppercase">Race Director${ev === pinnedNote ? " · 📌" : ""}</b>` : ev.pilot ? `<span class="nm" data-pilot="${esc(ev.pilot)}">${esc(ev.pilot)}</span>` : `<b>${esc(ev.type)}</b>`}
        <div class="feed-copy">${esc(ev.text)}</div>
      </div>
      <span class="feed-type" style="color:${ev.color};background:rgba(255,255,255,.05)">${esc(ev.type)}</span>
      <span class="t mono">${esc(ev.meta || "")}</span>
      <span class="fr-date">${ev.date ? new Date(ev.date).toLocaleDateString("el-GR", { day: "numeric", month: "short" }) : ""}</span>
    </div>`).join("");
  const more = $("#feed-more");
  if (filtered.length > 8) {
    more.style.display = "block";
    more.textContent = feedExpanded ? `SHOW LESS ▴ · top ${visible.length} από ${filtered.length}` : `VIEW ALL EVENTS (${filtered.length - 8} MORE) ▾`;
  } else more.style.display = "none";
}

// ------------------------------------------------------------------ track reveal
function ytId(v) {
  if (!v) return null;
  const m = String(v).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (m) return m[1];
  return /^[\w-]{6,15}$/.test(String(v).trim()) ? String(v).trim() : null;
}
function buildReveal(raw, d) {
  const box = $("#reveal-body");
  if (!box) return;
  const rv = raw && raw.track_reveal;
  const id = rv && ytId(rv.youtube || rv.url || rv.id);
  const track = (rv && rv.track) || "";
  const sec = box.closest("section");
  // χωρίς βίντεο → όλο το section κρυφό (κανένα νεκρό placeholder)
  if (!id) { if (sec) sec.style.display = "none"; return; }
  if (sec) sec.style.display = "";
  {
    box.innerHTML = `
      ${track ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <span style="font-weight:800;letter-spacing:.04em">${esc(rv.title || ("TRACK REVEAL · " + track))}</span>
        <span class="tag" style="background:rgba(239,68,68,.12);color:var(--red)">${esc(track)}</span>
      </div>` : ""}
      <div class="reveal-vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}" title="Track reveal" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
}



// ------------------------------------------------------------------ duels
function duelWinner(p) {
  const ta = p.best_time_a, tb = p.best_time_b;
  if (ta == null && tb == null) return null;
  if (ta == null) return p.pilot_b;
  if (tb == null) return p.pilot_a;
  return ta < tb ? p.pilot_a : p.pilot_b;
}

let duelsExpanded = false;
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
  const hotNow = battles.filter(b => !b.opened);
  const hotOpened = battles.filter(b => b.opened);
  if (hotNow.length) {
    html += `<div class="duel-sep">🔥 ΚΑΥΤΑ ΝΤΕΡΜΠΙ</div>
      <div class="duel-sub">🎲 Ποιους θα ρίξει ο race director στην Arena — αυτά τα ζευγάρια είναι ένα challenge μακριά.</div>`;
    html += hotNow.map(b => `
      <div class="duel">
        <div class="who"><div class="n">${esc(b.leader)}</div><div class="s">κρατάει</div></div>
        <div class="mid">
          <div class="score" style="background:rgba(239,68,68,.08)"><b>+${Number(b.gap).toFixed(3)}s</b></div>
          <div class="duel-track">${b.days > 0 ? b.days + (b.days === 1 ? " μέρα" : " μέρες") + " κοντά" : "από σήμερα"}</div>
        </div>
        <div class="who"><div class="n">${esc(b.chaser)}</div><div class="s">κυνηγάει</div></div>
      </div>`).join("");
  }
  if (hotOpened.length) {
    html += `<div class="duel-sep" style="opacity:.55">💨 ΑΝΟΙΞΑΝ ΠΡΟΣΦΑΤΑ</div>`;
    html += hotOpened.map(b => `
      <div class="duel done" style="opacity:.55">
        <div class="who"><div class="n">${esc(b.leader)}</div><div class="s">ξέφυγε</div></div>
        <div class="mid">
          <div class="score"><b>+${b.gap != null ? Number(b.gap).toFixed(3) + "s" : "—"}</b></div>
          <div class="duel-track">${b.was_gap != null ? "ήταν +" + Number(b.was_gap).toFixed(3) + "s" : "άνοιξε"}</div>
        </div>
        <div class="who"><div class="n">${esc(b.chaser)}</div><div class="s">έμεινε πίσω</div></div>
      </div>`).join("");
  }

  const actShow = duelsExpanded ? active : active.slice(0, 3);
  if (active.length) {
    html += `<div class="duel-sep">⚡ ΕΝΕΡΓΑ</div>`;
    html += actShow.map(p => {
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

  const resShow = duelsExpanded ? resolved : resolved.slice(0, 2);
  if (resolved.length) {
    html += `<div class="duel-sep">🏁 ΟΛΟΚΛΗΡΩΜΕΝΑ</div>`;
    html += resShow.map(p => {
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
        <div style="color:rgba(255,255,255,.55);font-size:12px">Όταν οριστούν duels, θα εμφανιστούν εδώ αυτόματα.</div>
      </div>`;
  }

  const hiddenCount = (active.length - actShow.length) + (resolved.length - resShow.length);
  if (hiddenCount > 0) html += `<button class="show-more" id="duels-more" style="display:block">ΔΕΣ ΟΛΑ ΤΑ DUELS (+${hiddenCount}) ▾</button>`;
  else if (duelsExpanded && (active.length > 3 || resolved.length > 2)) html += `<button class="show-more" id="duels-more" style="display:block">SHOW LESS ▴</button>`;

  box.innerHTML = html;
  const dm = $("#duels-more");
  if (dm) dm.addEventListener("click", () => { duelsExpanded = !duelsExpanded; buildDuels(raw, d); });
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
            <span class="pt mono" style="color:rgba(255,255,255,.55);width:34px;text-align:right">${r.points}p</span>
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

// ------------------------------------------------------------------ shareable pilot card
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function shareCurrentPilot() {
  if (!activeDrawer) return;
  const { pilot, d, raw } = activeDrawer;
  const p = d.profiles[pilot] || {};
  const title = pilotTitle(pilot, d, raw);
  const ins = pilotInsight(pilot, d, raw);
  const info = rivalInfo(pilot, d);
  const seasonRank = d.standings.findIndex(x => x.pilot === pilot) + 1;
  const trackRank = info && info.mode === "track" ? info.rank : null;

  await document.fonts.ready;
  const cv = document.createElement("canvas");
  cv.width = 1080; cv.height = 1080;
  const ctx = cv.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
  bg.addColorStop(0, "#08080d"); bg.addColorStop(.55, "#111119"); bg.addColorStop(1, "#0b1b22");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1080);
  ctx.strokeStyle = "rgba(34,211,238,.18)"; ctx.lineWidth = 2;
  for (let i = -8; i < 16; i++) {
    ctx.beginPath(); ctx.moveTo(i * 110, 1080); ctx.lineTo(i * 110 + 520, 0); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(232,121,249,.28)"; ctx.lineWidth = 4;
  rr(ctx, 34, 34, 1012, 1012, 44); ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(34,211,238,.9)";
  ctx.font = "700 24px 'JetBrains Mono'";
  ctx.fillText("DRH · RACE DIRECTOR CARD", 540, 96);

  ctx.fillStyle = "rgba(34,211,238,.12)";
  rr(ctx, 390, 140, 300, 300, 72); ctx.fill();
  ctx.strokeStyle = "rgba(34,211,238,.6)"; ctx.lineWidth = 5; rr(ctx, 390, 140, 300, 300, 72); ctx.stroke();
  ctx.fillStyle = "#22d3ee";
  ctx.font = "900 132px Archivo";
  ctx.fillText(initials(pilot), 540, 338);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 66px Archivo";
  ctx.fillText(pilot, 540, 535);
  if (title) {
    ctx.fillStyle = title.color.startsWith("var(--") ? "#a78bfa" : title.color;
    ctx.font = "700 28px 'JetBrains Mono'";
    ctx.fillText(title.label.toUpperCase(), 540, 584);
  }

  const stats = [
    ["TRACK", trackRank ? "#" + trackRank : "—"],
    ["SEASON", seasonRank ? "#" + seasonRank : "—"],
    ["POINTS", String(p.points || 0)],
    ["PBS", String(p.pbs || 0)]
  ];
  stats.forEach((s, i) => {
    const x = 100 + i * 225;
    ctx.fillStyle = "rgba(255,255,255,.055)";
    rr(ctx, x, 650, 185, 132, 24); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.42)";
    ctx.font = "700 18px 'JetBrains Mono'";
    ctx.fillText(s[0], x + 92, 694);
    ctx.fillStyle = i === 0 ? "#22d3ee" : i === 1 ? "#e879f9" : i === 2 ? "#facc15" : "#34d399";
    ctx.font = "900 42px Archivo";
    ctx.fillText(s[1], x + 92, 748);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,.42)";
  ctx.font = "700 20px 'JetBrains Mono'";
  ctx.fillText("WEEKLY VERDICT", 100, 850);
  ctx.fillStyle = "rgba(255,255,255,.86)";
  ctx.font = "600 28px Inter";
  let verdict = "Το grid σε περιμένει για τον επόμενο γύρο.";
  if (ins && ins.first_time != null && ins.time != null && ins.first_time > ins.time) {
    verdict = `Από ${Number(ins.first_time).toFixed(3)}s στα ${Number(ins.time).toFixed(3)}s αυτή την εβδομάδα.`;
  } else if (info && info.mode === "track" && info.ahead) {
    verdict = `${info.gapAhead.toFixed(3)}s μακριά από τον ${info.ahead.pilot}.`;
  }
  ctx.fillText(verdict, 100, 898, 880);
  ctx.fillStyle = "rgba(255,255,255,.38)";
  ctx.font = "700 18px 'JetBrains Mono'";
  ctx.fillText("DRONE RACING HELLAS · SIMRUSH SERIES", 100, 984);

  cv.toBlob(blob => {
    if (!blob) { toast("Δεν δημιουργήθηκε η κάρτα", "⚠"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `drh-${pilot.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-card.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("Η pilot card κατέβηκε", "✓");
  }, "image/png");
}

// ------------------------------------------------------------------ drawer
let activeDrawer = null;
function openDrawer(pilotName, d, raw) {
  const p = d.profiles[pilotName];
  if (!p) return; // pilot unknown in this class — don't open an empty drawer
  activeDrawer = { pilot: pilotName, d, raw };
  const title = pilotTitle(pilotName, d, raw);
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
  av.classList.remove("has-img");
  // manual εικόνα πιλότου: avatars/<callsign>.png — αλλιώς μένουν τα initials
  const avImg = new Image();
  avImg.alt = pilotName;
  avImg.onload = () => {
    if (!activeDrawer || activeDrawer.pilot !== pilotName) return;
    av.textContent = "";
    av.appendChild(avImg);
    av.classList.add("has-img");
  };
  avImg.src = "avatars/" + encodeURIComponent(pilotName) + ".png";
  av.style.borderColor = rankCol;
  av.style.color = rankCol;
  av.style.boxShadow = `0 0 36px ${rankGlow}`;
  $("#dr-nm").textContent = pilotName;
  $("#dr-title").innerHTML = title ? `<span style="color:${title.color}">RACE DIRECTOR · ${esc(title.label)}</span>` : "";
  $("#dr-qd").textContent = (p.quads && p.quads.length ? p.quads.join(" · ") : "—");

  // chips: θέση σεζόν + τάση φόρμας
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

  // --- Race Director: προσωπικός επόμενος στόχος + auto-quests ---
  $("#dr-director").innerHTML = renderDirectorBlock(pilotName, d, raw);
  $("#dr-quests").innerHTML = renderQuestsBlock(pilotName, d, raw);

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
          <span style="color:rgba(255,255,255,.55)">→</span>
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
    { v: p.points, k: "Points", tip: "Βαθμοί στη βαθμολογία της σεζόν — μαζεύονται από κάθε εβδομαδιαίο track" },
    { v: p.wins, k: "Wins", tip: "Εβδομαδιαίες νίκες — 1η θέση σε track" },
    { v: p.podiums, k: "Podiums", tip: "Τερματισμοί σε top-3 θέση σε εβδομαδιαίο track" },
    { v: p.best != null ? Number(p.best).toFixed(3) : "—", k: "Best (s)", tip: "Ο γρηγορότερος χρόνος που έχει καταγράψει ποτέ στη σεζόν" },
    { v: p.appearances, k: "Weeks", tip: "Σε πόσα εβδομαδιαία tracks έχει συμμετάσχει" },
    { v: p.avgRank, k: "Avg Rank", tip: "Μέση θέση τερματισμού στα tracks που έτρεξε — όσο μικρότερη, τόσο καλύτερη" },
    { v: p.pbs || 0, k: "PBs", tip: "Προσωπικά ρεκόρ — πόσες φορές βελτίωσε τον δικό του χρόνο" },
    { v: p.bestImprovementPct ? "−" + Number(p.bestImprovementPct).toFixed(1) + "%" : "—", k: "Best PB %", tip: "Η μεγαλύτερη ποσοστιαία βελτίωση από τον πρώτο στον τελευταίο χρόνο σε ένα track" }
  ];
  $("#dr-stats").innerHTML = stats.map(s => `<div class="dr-stat" data-tip="${esc(s.tip)}"><div class="v">${s.v}</div><div class="k">${s.k}</div></div>`).join("");
  // form chips
  const form = p.form || [];
  $("#dr-form").innerHTML = form.length ? form.map(r =>
    `<div class="form-chip ${r === 1 ? "y" : r <= 3 ? "g" : "o"}">${r === 1 ? "🏆" : "#" + r}<span class="w">${r === 1 ? "WIN" : "RANK"}</span></div>`).join("")
    : `<div class="dr-empty">Καμία συμμετοχή ακόμα.</div>`;
  $("#dr-digest").innerHTML = renderDigestBlock(pilotName, d, raw);
  // weeks list — με % πίσω από τον νικητή της εβδομάδας (συγκρίνιμο μεταξύ tracks)
  $("#dr-weeks").innerHTML = p.weeks && p.weeks.some(Boolean) ? p.weeks.map((w, i) => {
    if (!w) return "";
    const winBest = d.weeks[i] && d.weeks[i].best;
    const pctBehind = (w.rank > 1 && winBest && w.time != null) ? ((w.time - winBest) / winBest * 100) : null;
    return `<div class="dr-week">
      <span class="w">W${i + 1}</span>
      <span class="pos p${w.rank <= 3 ? w.rank : ""}">${w.rank === 1 ? "🏆" : w.rank}</span>
      <span style="color:rgba(255,255,255,.65)">${esc(d.weeks[i].track)}</span>
      ${pctBehind != null ? `<span class="mono" style="font-size:11px;color:rgba(255,255,255,.55);width:52px;text-align:right;flex-shrink:0">+${pctBehind.toFixed(1)}%</span>` : ""}
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
    meta.innerHTML = `<span style="color:rgba(255,255,255,.5)">Χρειάζονται 2+ εβδομάδες για γράφημα πορείας.</span>`;
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

function openOnboarding() {
  $("#onboard-modal").classList.add("on");
  document.body.style.overflow = "hidden";
}
function closeOnboarding() {
  $("#onboard-modal").classList.remove("on");
  if (!$("#drawer").classList.contains("on")) document.body.style.overflow = "";
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

// ------------------------------------------------------------------ live tabs (leaderboard / feed / duels)
function liveTabsInit() {
  $$(".lt-tab").forEach(b => b.addEventListener("click", () => {
    $$(".lt-tab").forEach(x => x.classList.toggle("on", x === b));
    $$(".lt-panel").forEach(p => { p.hidden = p.id !== "ltp-" + b.dataset.tab; });
    // τα pills Current/Season αφορούν μόνο το leaderboard
    const mp = $("#lb-mode-pills");
    if (mp) mp.style.display = b.dataset.tab === "lb" ? "" : "none";
  }));
}

// ------------------------------------------------------------------ reveal on scroll
function revealInit() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));
}

// ------------------------------------------------------------------ float drift (drh-website parallax)
function floatInit() {
  const els = $$("[data-float]");
  if (!els.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const vh = innerHeight;
    els.forEach(el => {
      const speed = parseFloat(el.dataset.float || "0.05");
      const r = el.getBoundingClientRect();
      const offset = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-offset * speed).toFixed(1)}px,0)`;
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  update();
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
  liveTabsInit();
  floatInit();
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
    buildFeed(d, state.data);
    chart.update(d);
    buildDuels(state.data, d);
    buildSpotlight(d, state.data);
    buildReveal(state.data, d);
    buildArchive(d);
    buildHallOfFame(d);
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
  if (feedMore) feedMore.addEventListener("click", () => { feedExpanded = !feedExpanded; buildFeed(state.derivedByClass[activeClass], state.data); });
  const feedFilters = $("#feed-filters");
  if (feedFilters) feedFilters.addEventListener("click", e => {
    const b = e.target.closest(".ff"); if (!b) return;
    if (b.dataset.ff === feedFilter) return;
    feedFilter = b.dataset.ff; feedExpanded = false;
    buildFeed(state.derivedByClass[activeClass], state.data);
  });

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
  const drShare = $("#dr-share");
  if (drShare) drShare.addEventListener("click", shareCurrentPilot);

  // onboarding modal
  const obOpen = $("#onboard-open"), obClose = $("#onboard-close"), obModal = $("#onboard-modal"), obLive = $("#onboard-live");
  if (obOpen) obOpen.addEventListener("click", openOnboarding);
  if (obClose) obClose.addEventListener("click", closeOnboarding);
  if (obModal) obModal.addEventListener("click", e => { if (e.target === obModal) closeOnboarding(); });
  if (obLive) obLive.addEventListener("click", closeOnboarding);

  addEventListener("keydown", e => { if (e.key === "Escape") { closeDrawer(); closeOnboarding(); } });

  // retry
  $("#retry-btn").addEventListener("click", async () => {
    state = await initData();
    lastGenerated = state.data.generated_at;
    renderAll();
    toast(state.error ? "Ακόμα offline — δείχνουμε snapshot" : "Επανασύνδεση επιτυχής", state.error ? "⚠" : "✓");
  });
})();

/* ================= LAYOUT EDIT MODE v4 (preview tool) =================
   «✎ ΔΙΑΤΑΞΗ» κάτω δεξιά. Σε edit mode:
   - DRAG: ελεύθερη μετακίνηση κάθε στοιχείου + SNAP στις άκρες/κέντρα
     των γειτονικών (γαλάζιες γραμμές οδηγοί).
   - ΚΛΙΚ: mini μενού → ✏ ΚΕΙΜΕΝΟ (inline edit) · A− / A+ (μέγεθος) ·
     ↺ ΘΕΣΗ · 👁 ΚΡΥΨΕ (κρυμμένα: λίστα από το κουμπί στη μπάρα).
   - ΒΕΛΑΚΙΑ: μετακινούν το επιλεγμένο 1px (Shift = 10px).
   - UNDO ↩ / Ctrl+Z · REDO ↪ / Ctrl+Y (ή Ctrl+Shift+Z).
   - Esc: έξοδος · 2×κλικ: επαναφορά θέσης.
   Storage: drh_free_v1 (θέσεις), drh_text_v1 (κείμενα), drh_font_v1
   (μεγέθη px), drh_hide_v1 (κρυμμένα), drh_hist_v1 / drh_redo_v1. */
(function () {
  var POSKEY = "drh_free_v1", TXTKEY = "drh_text_v1", FONTKEY = "drh_font_v1",
      HIDEKEY = "drh_hide_v1", HISTKEY = "drh_hist_v1", REDOKEY = "drh_redo_v1";
  var SEL = [
    ".section-head .kick", ".section-head h2", ".section-head p",
    ".hero-kicker", ".hero-title", ".hero-sub", ".hero-stats", ".hero-cta", ".hero-badge-wrap",
    ".top-nav", ".hero-ticker", ".err-banner", ".class-bar",
    ".card", ".titlefight", ".hof-row", ".card-head img", ".show-more", ".lt-tabs"
  ].join(",");

  function load(k, fb) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? fb : v; } catch (e) { return fb; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function normCls(el) {
    return (typeof el.className === "string" && el.className.trim())
      ? el.className.trim().split(/\s+/).filter(function (c) { return ["drh-hover","drh-dragging","drh-textedit","drh-selected"].indexOf(c) < 0; }).join(" ")
      : "";
  }
  function keyFor(el) {
    var sec = el.closest("section");
    var prefix = sec ? sec.id : (el.closest("header") ? "hero" : "page");
    var tag = el.tagName.toLowerCase();
    var ncls = normCls(el);
    var cls = ncls ? "." + ncls.split(" ").join(".") : "";
    var idx = 0;
    if (el.parentElement) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.tagName === el.tagName && normCls(c) === ncls;
      });
      idx = Math.max(0, sibs.indexOf(el));
    }
    return prefix + "|" + tag + cls + "#" + idx;
  }
  function prefixOf(el) {
    var sec = el.closest("section");
    return sec ? "#" + sec.id : (el.closest("header") ? "hero" : "page");
  }
  function plain(html) {
    var d = document.createElement("div"); d.innerHTML = html || "";
    return (d.textContent || "").replace(/\s+/g, " ").trim();
  }
  function labelOf(el, k) {
    return prefixOf(el) + " <" + el.tagName.toLowerCase() + "> «" + plain(origHTML[k] != null ? origHTML[k] : el.innerHTML).slice(0, 30) + "»";
  }

  var offsets = load(POSKEY, {}) || {};
  var texts = load(TXTKEY, {}) || {};
  var fonts = load(FONTKEY, {}) || {};
  var hidden = load(HIDEKEY, {}) || {};
  var hist = load(HISTKEY, []) || [];
  var redoStack = load(REDOKEY, []) || [];

  var origHTML = {}, origFS = {};
  document.querySelectorAll(SEL).forEach(function (el) {
    origHTML[keyFor(el)] = el.innerHTML;
    origFS[keyFor(el)] = parseFloat(getComputedStyle(el).fontSize) || 16;
  });

  function findByKey(k) {
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) if (keyFor(els[i]) === k) return els[i];
    return null;
  }
  function setPos(key, arr) {
    if (arr && (Math.abs(arr[0]) > 0.5 || Math.abs(arr[1]) > 0.5)) offsets[key] = arr; else delete offsets[key];
    var el = findByKey(key);
    if (el) el.style.translate = offsets[key] ? Math.round(offsets[key][0]) + "px " + Math.round(offsets[key][1]) + "px" : "";
    save(POSKEY, offsets);
  }
  function setFont(key, px) {
    if (px != null && Math.abs(px - origFS[key]) > 0.5) fonts[key] = px; else delete fonts[key];
    var el = findByKey(key);
    if (el) el.style.fontSize = fonts[key] ? fonts[key] + "px" : "";
    save(FONTKEY, fonts);
  }
  function setHidden(key, on) {
    if (on) hidden[key] = true; else delete hidden[key];
    var el = findByKey(key);
    if (el) el.style.display = on ? "none" : "";
    save(HIDEKEY, hidden);
    updateHiddenBtn();
  }
  function applyAll() {
    document.querySelectorAll(SEL).forEach(function (el) {
      var k = keyFor(el);
      var o = offsets[k];
      el.style.translate = o ? (Math.round(o[0]) + "px " + Math.round(o[1]) + "px") : "";
      if (texts[k] != null) el.innerHTML = texts[k];
      if (fonts[k] != null) el.style.fontSize = fonts[k] + "px";
      if (hidden[k]) el.style.display = "none";
    });
  }
  applyAll();

  /* ---------- UI ---------- */
  var btn = document.createElement("button");
  btn.className = "layout-toggle"; btn.type = "button"; btn.textContent = "✎ ΔΙΑΤΑΞΗ";
  document.body.appendChild(btn);

  var bar = document.createElement("div");
  bar.className = "layout-bar";
  bar.innerHTML =
    '<span class="lb-hint">σύρε · κλικ = μενού · βέλη = 1px (Shift 10px)</span>' +
    '<button type="button" data-act="undo">↩</button>' +
    '<button type="button" data-act="redo">↪</button>' +
    '<button type="button" data-act="hidden">👁 <span id="drh-hcount">0</span></button>' +
    '<button type="button" data-act="copy">📋 ΑΝΤΙΓΡΑΦΗ</button>' +
    '<button type="button" data-act="reset">↺ ΟΛΑ ΠΙΣΩ</button>' +
    '<button type="button" data-act="done">✓</button>';
  document.body.appendChild(bar);

  var pop = document.createElement("div");
  pop.className = "layout-pop";
  pop.innerHTML =
    '<button type="button" data-pop="text">✏ ΚΕΙΜΕΝΟ</button>' +
    '<button type="button" data-pop="fminus">A−</button>' +
    '<button type="button" data-pop="fplus">A+</button>' +
    '<button type="button" data-pop="pos">↺ ΘΕΣΗ</button>' +
    '<button type="button" data-pop="hide">👁 ΚΡΥΨΕ</button>';
  document.body.appendChild(pop);

  var hpanel = document.createElement("div");
  hpanel.className = "layout-hidden-panel";
  document.body.appendChild(hpanel);

  var guideV = document.createElement("div"); guideV.className = "drh-guide-v"; document.body.appendChild(guideV);
  var guideH = document.createElement("div"); guideH.className = "drh-guide-h"; document.body.appendChild(guideH);

  var toastEl = document.createElement("div");
  toastEl.className = "layout-toast";
  document.body.appendChild(toastEl);
  function toastMsg(t) {
    toastEl.textContent = t;
    toastEl.classList.add("on");
    setTimeout(function () { toastEl.classList.remove("on"); }, 2400);
  }

  var editing = false, hoverEl = null, drag = null, justDragged = false;
  var popEl = null, textEditEl = null, snapEdges = null;

  function updateUndo() {
    var u = bar.querySelector('[data-act="undo"]');
    var r = bar.querySelector('[data-act="redo"]');
    if (u) u.style.opacity = hist.length ? "1" : ".35";
    if (r) r.style.opacity = redoStack.length ? "1" : ".35";
  }
  function updateHiddenBtn() {
    var c = bar.querySelector("#drh-hcount");
    if (c) c.textContent = String(Object.keys(hidden).length);
  }
  function pushHist(a) { hist.push(a); redoStack = []; save(HISTKEY, hist); save(REDOKEY, redoStack); updateUndo(); }

  function applyAction(a, dir) { // dir: -1 undo, +1 redo/apply
    if (a.type === "move" || a.type === "nudge") setPos(a.key, dir < 0 ? a.from : a.to);
    else if (a.type === "posreset") setPos(a.key, dir < 0 ? a.prev : null);
    else if (a.type === "text") {
      var v;
      if (dir < 0) {
        if (a.from != null) texts[a.key] = a.from; else delete texts[a.key];
        v = a.from != null ? a.from : a.orig;
      } else {
        texts[a.key] = a.to; v = a.to;
      }
      save(TXTKEY, texts);
      var el = findByKey(a.key);
      if (el && v != null) el.innerHTML = v;
    }
    else if (a.type === "hide") setHidden(a.key, dir > 0);
    else if (a.type === "unhide") setHidden(a.key, dir < 0);
    else if (a.type === "font") setFont(a.key, dir < 0 ? a.from : a.to);
  }
  function undo() {
    var a = hist.pop();
    if (!a) { toastMsg("Τίποτα για αναίρεση"); return; }
    applyAction(a, -1);
    redoStack.push(a); save(HISTKEY, hist); save(REDOKEY, redoStack); updateUndo();
    toastMsg("Αναίρεση ✓");
  }
  function redo() {
    var a = redoStack.pop();
    if (!a) { toastMsg("Τίποτα για redo"); return; }
    applyAction(a, +1);
    hist.push(a); save(HISTKEY, hist); save(REDOKEY, redoStack); updateUndo();
    toastMsg("Redo ✓");
  }

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle("drh-editing", on);
    bar.classList.toggle("on", on);
    btn.textContent = on ? "✎ ΕΠΕΞΕΡΓΑΣΙΑ…" : "✎ ΔΙΑΤΑΞΗ";
    if (!on) {
      if (hoverEl) { hoverEl.classList.remove("drh-hover"); hoverEl = null; }
      hidePop(); hideHpanel();
      if (textEditEl) finishText(true);
      guideV.style.display = "none"; guideH.style.display = "none";
    }
    updateUndo(); updateHiddenBtn();
  }

  function showPop(el) {
    if (popEl) popEl.classList.remove("drh-selected");
    popEl = el;
    el.classList.add("drh-selected");
    var r = el.getBoundingClientRect();
    pop.classList.add("on");
    var pw = 400;
    var top = r.top - 48; if (top < 8) top = r.bottom + 8;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - pw - 8);
    pop.style.top = Math.round(top) + "px";
    pop.style.left = Math.round(left) + "px";
  }
  function hidePop() {
    pop.classList.remove("on");
    if (popEl) popEl.classList.remove("drh-selected");
    popEl = null;
  }
  function showHpanel() {
    var keys = Object.keys(hidden);
    hpanel.innerHTML = '<div class="lhp-title">ΚΡΥΜΜΕΝΑ — κλικ για επαναφορά</div>' +
      keys.map(function (k) {
        var el = findByKey(k);
        var label = el ? labelOf(el, k) : k;
        return '<button type="button" data-key="' + k.replace(/"/g, "&quot;") + '">👁 ' + label.replace(/</g, "&lt;") + "</button>";
      }).join("");
    hpanel.classList.add("on");
  }
  function hideHpanel() { hpanel.classList.remove("on"); }

  function resetPos(el) {
    var k = keyFor(el);
    var prev = offsets[k] ? offsets[k].slice() : null;
    if (!prev) { toastMsg("Δεν έχει μετακινηθεί"); return; }
    setPos(k, null);
    pushHist({ type: "posreset", key: k, prev: prev });
    toastMsg("Επαναφορά θέσης ✓");
  }
  function changeFont(el, dir) {
    var k = keyFor(el);
    var cur = fonts[k] != null ? fonts[k] : (origFS[k] || 16);
    var next = Math.round(cur * (dir > 0 ? 1.125 : 1 / 1.125) * 10) / 10;
    setFont(k, next);
    var last = hist[hist.length - 1], now = Date.now();
    if (last && last.type === "font" && last.key === k && now - last.t < 900) { last.to = next; last.t = now; save(HISTKEY, hist); }
    else pushHist({ type: "font", key: k, from: cur, to: next, t: now });
    toastMsg("Μέγεθος: " + next + "px");
  }
  function hideEl(el) {
    var k = keyFor(el);
    setHidden(k, true);
    pushHist({ type: "hide", key: k });
    hidePop();
    toastMsg("Κρύφτηκε — επαναφορά από το 👁 της μπάρας");
  }

  function startText(el) {
    hidePop();
    textEditEl = el;
    el.contentEditable = "true";
    el.classList.add("drh-textedit");
    el.classList.remove("drh-hover");
    el.focus();
    try {
      var r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
      var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    } catch (e) {}
  }
  function finishText(cancel) {
    var el = textEditEl; if (!el) return;
    textEditEl = null;
    el.contentEditable = "false";
    el.classList.remove("drh-textedit");
    var k = keyFor(el);
    var savedCur = texts[k] != null ? texts[k] : origHTML[k];
    if (cancel) { el.innerHTML = savedCur; return; }
    var now = el.innerHTML;
    if (now !== savedCur) {
      var prev = texts[k] != null ? texts[k] : null;
      texts[k] = now; save(TXTKEY, texts);
      pushHist({ type: "text", key: k, from: prev, to: now, orig: origHTML[k] });
      toastMsg("Κείμενο αποθηκεύτηκε ✓");
    }
  }

  btn.addEventListener("click", function () { setEditing(!editing); });

  bar.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("button") : null;
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "undo") undo();
    else if (act === "redo") redo();
    else if (act === "hidden") { hpanel.classList.contains("on") ? hideHpanel() : showHpanel(); }
    else if (act === "copy") {
      var lines = [];
      document.querySelectorAll(SEL).forEach(function (el) {
        var k = keyFor(el);
        var label = labelOf(el, k);
        var o = offsets[k];
        if (o && (Math.abs(o[0]) > 0.5 || Math.abs(o[1]) > 0.5)) lines.push("→ " + label + "  x:" + Math.round(o[0]) + "px, y:" + Math.round(o[1]) + "px");
        var t = texts[k];
        if (t != null && t !== origHTML[k]) lines.push("✎ " + label + "  ΝΕΟ ΚΕΙΜΕΝΟ: «" + plain(t).slice(0, 60) + "»");
        if (fonts[k] != null) lines.push("Αα " + label + "  ΜΕΓΕΘΟΣ: " + fonts[k] + "px (ήταν " + (origFS[k] || "?") + "px)");
      });
      Object.keys(hidden).forEach(function (k) {
        var el = findByKey(k);
        lines.push("✖ " + (el ? labelOf(el, k) : k) + "  → ΝΑ ΦΥΓΕΙ");
      });
      var text = lines.length ? lines.join("\n") : "(καμία αλλαγή ακόμα)";
      var done = function () { toastMsg("Αντιγράφηκαν " + lines.length + " αλλαγές — επικόλλησέ τις στο chat"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else { window.prompt("Αντίγραψε τις αλλαγές:", text); done(); }
    }
    else if (act === "reset") {
      Object.keys(texts).forEach(function (k) { var el = findByKey(k); if (el && origHTML[k] != null) el.innerHTML = origHTML[k]; });
      offsets = {}; texts = {}; fonts = {}; hidden = {}; hist = []; redoStack = [];
      save(POSKEY, offsets); save(TXTKEY, texts); save(FONTKEY, fonts); save(HIDEKEY, hidden);
      save(HISTKEY, hist); save(REDOKEY, redoStack);
      document.querySelectorAll(SEL).forEach(function (el) { el.style.translate = ""; el.style.fontSize = ""; el.style.display = ""; });
      updateUndo(); updateHiddenBtn(); hideHpanel();
      toastMsg("Όλα γύρισαν στις αρχικές τους μορφές");
    }
    else if (act === "done") setEditing(false);
  });

  hpanel.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("button") : null;
    if (!b) return;
    var k = b.getAttribute("data-key");
    setHidden(k, false);
    pushHist({ type: "unhide", key: k });
    showHpanel();
    toastMsg("Επανήλθε ✓");
  });

  pop.addEventListener("click", function (ev) {
    var b = ev.target.closest ? ev.target.closest("button") : null;
    if (!b || !popEl) return;
    var act = b.getAttribute("data-pop");
    var el = popEl;
    if (act === "text") startText(el);
    else if (act === "pos") { resetPos(el); hidePop(); }
    else if (act === "hide") hideEl(el);
    else if (act === "fminus") changeFont(el, -1);
    else if (act === "fplus") changeFont(el, +1);
  });

  /* ---------- hover ---------- */
  document.addEventListener("pointerover", function (ev) {
    if (!editing || drag || textEditEl) return;
    var el = ev.target && ev.target.closest ? ev.target.closest(SEL) : null;
    if (el === hoverEl) return;
    if (hoverEl) hoverEl.classList.remove("drh-hover");
    hoverEl = el;
    if (hoverEl) hoverEl.classList.add("drh-hover");
  }, true);

  /* ---------- drag + snap ---------- */
  function collectSnapEdges(except) {
    var vx = [], hy = [];
    document.querySelectorAll(SEL).forEach(function (el) {
      if (el === except || el.style.display === "none") return;
      if (!el.getClientRects().length) return;
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      vx.push(r.left, r.left + r.width / 2, r.right);
      hy.push(r.top, r.top + r.height / 2, r.bottom);
    });
    vx.push(window.innerWidth / 2);
    return { vx: vx, hy: hy };
  }

  document.addEventListener("pointerdown", function (ev) {
    if (!editing || textEditEl) return;
    if (ev.target.closest && (ev.target.closest(".layout-bar") || ev.target.closest(".layout-toggle") || ev.target.closest(".layout-pop") || ev.target.closest(".layout-hidden-panel"))) return;
    var el = ev.target && ev.target.closest ? ev.target.closest(SEL) : null;
    if (!el) return;
    var k = keyFor(el);
    var o = offsets[k] || [0, 0];
    drag = { el: el, key: k, baseX: o[0], baseY: o[1], startX: ev.clientX, startY: ev.clientY, moved: false };
  }, true);

  document.addEventListener("pointermove", function (ev) {
    if (!drag) return;
    var dx = ev.clientX - drag.startX, dy = ev.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.el.classList.add("drh-dragging");
      if (hoverEl) { hoverEl.classList.remove("drh-hover"); hoverEl = null; }
      hidePop();
      snapEdges = collectSnapEdges(drag.el);
    }
    var nx = drag.baseX + dx, ny = drag.baseY + dy;
    drag.el.style.translate = Math.round(nx) + "px " + Math.round(ny) + "px";
    // snap
    var T = 6, r = drag.el.getBoundingClientRect(), gv = null, gh = null, i, d, best;
    best = null;
    var ex = [r.left, r.left + r.width / 2, r.right];
    for (i = 0; i < ex.length; i++) for (var j = 0; j < snapEdges.vx.length; j++) {
      d = snapEdges.vx[j] - ex[i];
      if (Math.abs(d) <= T && (!best || Math.abs(d) < Math.abs(best.d))) best = { d: d, at: snapEdges.vx[j] };
    }
    if (best) { nx += best.d; gv = best.at; }
    best = null;
    var ey = [r.top, r.top + r.height / 2, r.bottom];
    for (i = 0; i < ey.length; i++) for (var m = 0; m < snapEdges.hy.length; m++) {
      d = snapEdges.hy[m] - ey[i];
      if (Math.abs(d) <= T && (!best || Math.abs(d) < Math.abs(best.d))) best = { d: d, at: snapEdges.hy[m] };
    }
    if (best) { ny += best.d; gh = best.at; }
    if (gv != null) { guideV.style.left = Math.round(gv) + "px"; guideV.style.display = "block"; } else guideV.style.display = "none";
    if (gh != null) { guideH.style.top = Math.round(gh) + "px"; guideH.style.display = "block"; } else guideH.style.display = "none";
    offsets[drag.key] = [nx, ny];
    drag.el.style.translate = Math.round(nx) + "px " + Math.round(ny) + "px";
  }, true);

  document.addEventListener("pointerup", function () {
    if (!drag) return;
    if (drag.moved) {
      drag.el.classList.remove("drh-dragging");
      save(POSKEY, offsets);
      pushHist({ type: "move", key: drag.key, from: [drag.baseX, drag.baseY], to: offsets[drag.key].slice() });
      justDragged = true;
    }
    guideV.style.display = "none"; guideH.style.display = "none";
    snapEdges = null;
    drag = null;
  }, true);

  /* ---------- clicks ---------- */
  document.addEventListener("click", function (ev) {
    if (!editing || textEditEl) return;
    if (ev.target.closest && (ev.target.closest(".layout-bar") || ev.target.closest(".layout-toggle") || ev.target.closest(".layout-pop") || ev.target.closest(".layout-hidden-panel"))) return;
    ev.preventDefault(); ev.stopPropagation();
    hideHpanel();
    if (justDragged) { justDragged = false; hidePop(); return; }
    var el = ev.target && ev.target.closest ? ev.target.closest(SEL) : null;
    if (el) showPop(el); else hidePop();
  }, true);

  document.addEventListener("dblclick", function (ev) {
    if (!editing || textEditEl) return;
    var el = ev.target && ev.target.closest ? ev.target.closest(SEL) : null;
    if (!el) return;
    ev.preventDefault(); ev.stopPropagation();
    resetPos(el);
  }, true);

  /* ---------- keys: undo/redo/arrows/esc ---------- */
  document.addEventListener("keydown", function (ev) {
    if (textEditEl) {
      if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); finishText(false); }
      else if (ev.key === "Escape") { ev.preventDefault(); finishText(true); }
      return;
    }
    if (!editing) return;
    var k = ev.key.toLowerCase();
    if ((ev.ctrlKey || ev.metaKey) && k === "z" && !ev.shiftKey) { ev.preventDefault(); undo(); return; }
    if ((ev.ctrlKey || ev.metaKey) && (k === "y" || (k === "z" && ev.shiftKey))) { ev.preventDefault(); redo(); return; }
    if (ev.key === "Escape") { setEditing(false); return; }
    if (popEl && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(ev.key) >= 0) {
      ev.preventDefault();
      var step = ev.shiftKey ? 10 : 1;
      var kk = keyFor(popEl);
      var o = (offsets[kk] || [0, 0]).slice();
      var from = o.slice();
      if (ev.key === "ArrowLeft") o[0] -= step;
      if (ev.key === "ArrowRight") o[0] += step;
      if (ev.key === "ArrowUp") o[1] -= step;
      if (ev.key === "ArrowDown") o[1] += step;
      setPos(kk, o);
      showPop(popEl);
      var last = hist[hist.length - 1], now = Date.now();
      if (last && last.type === "nudge" && last.key === kk && now - last.t < 900) { last.to = o.slice(); last.t = now; save(HISTKEY, hist); }
      else pushHist({ type: "nudge", key: kk, from: from, to: o.slice(), t: now });
    }
  }, true);

  document.addEventListener("blur", function (ev) {
    if (textEditEl && ev.target === textEditEl) finishText(false);
  }, true);

  document.addEventListener("dragstart", function (ev) { if (editing) ev.preventDefault(); }, true);
})();
