// DRH Leaderboard — UI logic (vanilla JS, no framework)
// Multi-class aware: all season/leaderboard sections follow `activeClass`.
/* global initData, classLabel */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// Resolver για CSS tokens σε canvas contexts (το canvas δεν αναγνωρίζει var())
const cssVar = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const initials = (name) => String(name || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
// Bot timestamps είναι naive ISO ΧΩΡΙΣ timezone — τα ερμηνεύουμε ως UTC (το bot τρέχει σε UTC)
// και ο browser τα δείχνει σε τοπική ώρα. Date-only strings περνούν ως έχουν.
const parseTs = (s) => { s = String(s || ""); return new Date((/[zZ]|[+-]\d{2}:?\d{2}$/.test(s) || !s.includes("T")) ? s : s + "Z"); };
// Avatar source priority: verified feed pilots[].avatar_url, then avatars map,
// then the bundled local image, and finally initials. No automatic Discord refresh.
let ACTIVE_AVATAR_DATA = null;
const AV_CACHE = {};
const pilotKey = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
function avatarUrl(pilot) {
  const raw = ACTIVE_AVATAR_DATA;
  const pilots = raw?.pilots || {};
  const key = pilotKey(pilot);
  const profile = Object.entries(pilots).find(([id, p]) =>
    pilotKey(id) === key || pilotKey(p?.callsign) === key || pilotKey(p?.pilot_id) === key
  )?.[1];
  const mapping = raw?.avatars || {};
  const mapped = Object.entries(mapping).find(([id]) => pilotKey(id) === key)?.[1];
  const candidate = profile?.avatar_url || mapped;
  if (typeof candidate !== "string") return null;
  try {
    const url = new URL(candidate, location.href);
    // HTTPS remote avatars only: prevent mixed content on a future HTTPS deployment.
    // Same-origin bundled paths are allowed, but not arbitrary cross-origin HTTP.
    if (url.protocol === "https:") return url.href;
    if (url.protocol === "http:" && url.origin === location.origin &&
        candidate.startsWith("avatars/")) return url.href;
    return null;
  } catch { return null; }
}
function loadPilotAvatar(pilot, onSuccess) {
  const remote = avatarUrl(pilot);
  const local = "avatars/" + encodeURIComponent(pilot) + ".png";
  const sources = remote ? [remote, local] : [local];
  let index = 0;
  const attempt = () => {
    if (index >= sources.length) return;
    const img = new Image();
    img.alt = pilot;
    img.onload = () => onSuccess(img);
    img.onerror = attempt;
    img.src = sources[index++];
  };
  attempt();
}
const avHtml = (pilot) => `<span class="pav" data-av="${esc(pilot)}">${esc(initials(pilot))}</span>`;
function hydrateAvatars(root) {
  (root || document).querySelectorAll(".pav[data-av]").forEach(el => {
    const pilot = el.dataset.av;
    if (!pilot || el.classList.contains("has-img")) return;
    const source = avatarUrl(pilot) || "avatars/" + encodeURIComponent(pilot) + ".png";
    if (AV_CACHE[pilot] === source + "|failed") return;
    loadPilotAvatar(pilot, im => {
      if (!el.isConnected) return;
      AV_CACHE[pilot] = source + "|loaded";
      el.textContent = ""; el.appendChild(im); el.classList.add("has-img");
    });
  });
}
const fmtTime = (t) => (t == null ? "—" : Number(t).toFixed(3) + "s");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function heroTitle() {
  const el = $("#hero-title");
  if (!el || !el.dataset.text) return; // v9: στατικός τίτλος στο markup
  const text = el.dataset.text;
  const words = text.split(" ");
  let i = 0;
  words.forEach((word, wi) => {
    const isLast = wi === words.length - 1; // gradient/outline στην τελευταία λέξη ("HELLAS")
    const w = document.createElement("span");
    w.style.display = "inline-block";
    w.style.whiteSpace = "nowrap";
    for (const ch of word) {
      const s = document.createElement("span");
      s.className = "l" + (isLast ? " grad" : "");
      s.textContent = ch;
      s.style.animationDelay = (0.35 + i * 0.045) + "s";
      w.appendChild(s); i++;
    }
    el.appendChild(w);
    el.appendChild(document.createTextNode(" "));
  });
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

// ----------------------------------------------------------------- hero: nav tele + fastest lap card + status bar
function buildHeroStats(d, raw, isErr) {
  const trackName = d.trackDisplay || d.currentTrack || raw.current_track || "—";
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };

  // nav telemetry
  set("#hud-season", raw.season || "—");
  set("#hud-round", d.weekNo != null ? "W" + String(d.weekNo).padStart(2, "0") : "—");
  set("#hud-track", String(trackName).toUpperCase());

  // fastest lap card (κάτω δεξιά)
  const lead = (d.currentLb || [])[0] || null;
  set("#fl-kick", "THE CURRENT GRID / " + String(d.cls || "").toUpperCase());
  set("#fl-name", lead ? lead.pilot : "—");
  set("#fl-time", lead && lead.time != null ? Number(lead.time).toFixed(3) : "—");
  set("#fl-track", trackName);

  // bottom status bar
  set("#tk-track", trackName);
  set("#tk-leader", lead ? lead.pilot : "—");
  set("#tk-best", lead && lead.time != null ? Number(lead.time).toFixed(3) + "s" : "—");
  set("#tk-title", d.titleFight && d.titleFight.a ? d.titleFight.a.pilot : "—");
  const pilots = new Set(d.weeks.flatMap(w => w.results.map(r => r.pilot)));
  (d.standings || []).forEach(s => pilots.add(s.pilot));
  set("#tk-pilots", pilots.size || (d.standings || []).length || "—");
  const sync = $("#tk-sync");
  if (sync) { sync.textContent = isErr ? "SNAPSHOT" : "CONNECTED"; sync.style.color = isErr ? "var(--yellow)" : "var(--emerald)"; }
}

// ---------------------------------------------------------------- weekly race countdown
// SimRush starts every Saturday at 18:00 Europe/Athens. This is a website
// schedule, not an inferred or fabricated Race Director announcement.
// Intl handles EET/EEST changes; no hardcoded UTC offset or bot dependency.
const countdown = { target: 0, started: false, tick: null };
const ATHENS_TZ = "Europe/Athens";
const athensParts = (instant) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ATHENS_TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(instant));
  return Object.fromEntries(parts.filter(x => x.type !== "literal").map(x => [x.type, Number(x.value)]));
};
function athensWallTimeUtc(y, m, d, hour) {
  const wall = Date.UTC(y, m - 1, d, hour);
  let guess = wall - 2 * 3600000;
  // Convert the desired Athens wall clock to an absolute instant, including DST.
  for (let i = 0; i < 3; i++) {
    const p = athensParts(guess);
    const observed = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess += wall - observed;
  }
  return guess;
}
function nextSaturdayRace(now = Date.now()) {
  const p = athensParts(now);
  const dayOfWeek = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
  const daysAhead = (6 - dayOfWeek + 7) % 7;
  const date = new Date(Date.UTC(p.year, p.month - 1, p.day + daysAhead));
  let target = athensWallTimeUtc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), 18);
  if (target <= now) {
    const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 7));
    target = athensWallTimeUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 18);
  }
  return target;
}
function startCountdown() {
  const date = $("#cd-date");
  const digits = $("#cd-digits");
  if (!digits) return;
  function tick() {
    const now = Date.now();
    if (!countdown.target || countdown.target <= now) {
      countdown.target = nextSaturdayRace(now);
      if (date) date.textContent = new Intl.DateTimeFormat("el-GR", {
        timeZone: ATHENS_TZ, weekday: "long", day: "numeric", month: "short",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).format(new Date(countdown.target)) + " · ώρα Ελλάδας";
    }
    const ms = Math.max(0, countdown.target - now);
    const dd = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5);
    const mm = Math.floor(ms % 36e5 / 6e4), ss = Math.floor(ms % 6e4 / 1e3);
    digits.textContent = `${String(dd).padStart(2, "0")}D ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    const d2 = $("#cd2-d"), h2 = $("#cd2-h"), m2 = $("#cd2-m");
    if (d2) d2.textContent = String(dd).padStart(2, "0");
    if (h2) h2.textContent = String(hh).padStart(2, "0");
    if (m2) m2.textContent = String(mm).padStart(2, "0");
  }
  if (countdown.started) { countdown.tick(); return; }
  countdown.started = true;
  countdown.tick = tick;
  tick();
  setInterval(tick, 1000);
}

// --------------------------------------------------------------- title fight
function buildTitleFight(d, raw) {
  const wrap = $(".tf-wrap");
  if (!wrap) return;
  const { a, b, c, gap } = d.titleFight;
  if (!a) { wrap.style.display = "none"; return; }
  wrap.style.display = "";
  const ghost = $("#tf-ghost"); if (ghost) ghost.textContent = "TITLE/" + (raw && raw.season ? raw.season : "2026");
  const arena = $("#tf-grid");
  const nameA = $("#tf-name-a"), nameB = $("#tf-name-b"), nameC = $("#tf-name-c");
  const third = !!(c && a && Number(a.points) - Number(c.points) <= 10);
  wrap.classList.toggle("tf-three-way", third);
  if (nameC) { nameC.hidden = !third; if (!third) nameC.dataset.pilot = ""; }
  const h2 = wrap.querySelector(".tf-h");
  if (h2) h2.textContent = third ? "ΤΡΕΙΣ ΠΙΛΟΤΟΙ. ΕΝΑΣ ΤΙΤΛΟΣ." : "ΔΥΟ ΠΙΛΟΤΟΙ. ΕΝΑΣ ΤΙΤΛΟΣ.";
  const setName = (el, p) => { el.textContent = p || "—"; el.dataset.pilot = p || ""; };
  if (!b) {
    arena.innerHTML = `<div class="tf-side a">${avHtml(a.pilot)}</div><div class="tf-vs2">👑</div><div class="tf-side b"><span class="pav" style="opacity:.3">?</span></div>`;
    setName(nameA, a.pilot); setName(nameB, null);
    requestAnimationFrame(() => { $("#tf-pa").style.width = "100%"; $("#tf-pb").style.width = "0%"; const pc = $(".tf-bar2 .pc"); if (pc) pc.style.width = "0%"; });
    $("#tf-cap").textContent = `${a.points} POINTS · ΠΕΡΙΜΕΝΕΙ ΑΝΤΙΠΑΛΟ · ${classLabel(d.cls).toUpperCase()}`;
    const mn = $("#margin-n"); if (mn) mn.textContent = "—";
    hydrateAvatars(arena);
    return;
  }
  arena.innerHTML = third
    ? `<div class="tf-side a">${avHtml(a.pilot)}</div><div class="tf-vs2" aria-hidden="true">VS</div><div class="tf-side c">${avHtml(c.pilot)}</div><div class="tf-vs2" aria-hidden="true">VS</div><div class="tf-side b">${avHtml(b.pilot)}</div>`
    : `<div class="tf-side a">${avHtml(a.pilot)}</div><div class="tf-vs2">VS</div><div class="tf-side b">${avHtml(b.pilot)}</div>`;
  setName(nameA, a.pilot); setName(nameB, b.pilot);
  if (third) setName(nameC, c.pilot);
  const tot = a.points + b.points + (third ? c.points : 0) || 1;
  requestAnimationFrame(() => {
    $("#tf-pa").style.width = (a.points / tot * 100) + "%";
    $("#tf-pb").style.width = (b.points / tot * 100) + "%";
    const pc = $(".tf-bar2 .pc"); if (pc) pc.style.width = third ? (c.points / tot * 100) + "%" : "0%";
  });
  $("#tf-cap").textContent = third ? `${a.points} — ${b.points} — ${c.points} POINTS · 1ος–3ος: ${a.points - c.points} βαθμοί` : `${a.points} — ${b.points} POINTS · ${gap} βαθμοί διαφορά`;
  const mn = $("#margin-n"); if (mn) mn.textContent = String(gap).padStart(2, "0");
  hydrateAvatars(arena);
}

// ------------------------------------------------------------- leaderboard
let lbMode = "current", lbExpanded = false;
const prevRanksByKey = {}; // per class+mode — movement arrows

function buildLeaderboard(d, raw, isErr) {
  const cur = d.currentLb;
  const sea = d.standings;
  const trackName = d.trackDisplay || d.currentTrack || raw.current_track || "—";
  const feedState = window.__drhFeedStatus || (isErr ? "snapshot" : "verified");
  const syncLabel = parseTs(raw.generated_at).toLocaleString("el-GR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " · " + feedState.toUpperCase();
  const lu = $("#live-updated"); if (lu) lu.textContent = syncLabel;
  const lcTag = $("#live-class-tag"); if (lcTag) lcTag.textContent = String(d.cls || "").toUpperCase() + " / CURRENT GRID";
  const ltWeek = $("#lt-week"); if (ltWeek) ltWeek.textContent = "WEEK " + (d.weekNo != null ? d.weekNo : "—");
  const rcTrack = $("#rc-track"); if (rcTrack) rcTrack.textContent = String(trackName).toUpperCase();
  const rcGhost = $("#rc-ghost"); if (rcGhost) rcGhost.textContent = String(d.weekNo != null ? d.weekNo : "—").padStart(2, "0");
  const fs = $("#foot-sync");
  if (fs) fs.textContent = "SOURCE: site_data.json · SYNC " + syncLabel + (feedState === "verified" ? " · VERIFIED" : " · NOT VERIFIED");

  // rounds line + season intelligence tiles
  const rounds = d.roundsCompleted != null ? d.roundsCompleted : d.weeks.length;
  const rl = $("#rounds-line"); if (rl) rl.textContent = String(rounds).padStart(2, "0") + " COMPLETED ROUNDS · " + (raw.season || "2026") + " SEASON";
  const pilots = new Set(d.weeks.flatMap(w => w.results.map(r => r.pilot)));
  (sea || []).forEach(s => pilots.add(s.pilot));
  const impr = d.weeks.reduce((s, w) => s + (w.pbs != null ? w.pbs : (w.records || 0)), 0);
  const setT = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  setT("#it-pilots", pilots.size || "—");
  setT("#it-grid", cur.length || "—");
  setT("#it-rounds", rounds);
  setT("#it-impr", impr > 0 ? impr : (d.weeks.some(w => w.pbs != null) ? "0" : "—"));

  // podium: championship top-3 (δομή mockup: tiles P02 · P01 · P03, visual δικό μας)
  const podiumData = (sea || []).slice(0, 3);
  const pbox = $("#podium-box");
  pbox.innerHTML = podiumData.length ? `<div class="podium">` + [1, 0, 2].map(oi => {
    const p = podiumData[oi]; if (!p) return "<div></div>";
    const cls = oi === 0 ? "p1" : oi === 1 ? "p2" : "p3";
    return `<div class="pod ${cls}">
      <span class="ppos">P0${oi + 1}</span>
      ${avHtml(p.pilot)}
      <span class="name nm" data-pilot="${esc(p.pilot)}">${esc(p.pilot)}</span>
      <span class="ptime">${p.points}<small> PTS</small></span>
      <span class="pmeta">${p.wins} WINS · ${p.podiums} PODIUMS</span>
      <div class="block">${oi + 1}</div>
    </div>`;
  }).join("") + `</div>` : `<div class="dr-empty" style="padding:20px 6px">Η βαθμολογία θα εμφανιστεί μετά τον πρώτο γύρο.</div>`;
  hydrateAvatars(pbox);

  // Compact championship insight, computed from the standings.
  // Never presented as an official Race Director quote — the RD stations keep
  // the authentic messages, this line is derived UI status.
  const prd = $("#podium-rd");
  if (prd) {
    const top = (sea || []).slice(0, 2);
    const leaderPts = top.length ? Number(top[0].points) : NaN;
    const runnerPts = top.length > 1 ? Number(top[1].points) : NaN;
    const gap = leaderPts - runnerPts;
    const hasGap = top.length === 2 && Number.isFinite(gap) && gap >= 0;
    const insight = hasGap
      ? `Η διαφορά κορυφής είναι ${gap} ${gap === 1 ? "βαθμός" : "βαθμοί"}. ${top[0].pilot} προηγείται του ${top[1].pilot} στη βαθμολογία.`
      : top.length === 1
        ? `${top[0].pilot} βρίσκεται στην κορυφή της βαθμολογίας.`
        : "Η εικόνα του πρωταθλήματος θα εμφανιστεί μόλις υπάρχουν αποτελέσματα.";
    $("#prd-cat").textContent = "CHAMPIONSHIP INSIGHT";
    $("#prd-date").textContent = d.roundsCompleted != null ? `AFTER ROUND ${d.roundsCompleted}` : "SEASON DATA";
    $("#prd-text").textContent = insight;
    prd.style.display = "";
  }

  // Week = gap from preceding rival + percent behind leader; Season = points behind leader.
  let rows;
  if (lbMode === "current") {
    const leader = cur.length ? Number(cur[0].time) : NaN;
    rows = cur.map((r, i) => {
      const time = Number(r.time);
      const previous = i > 0 ? Number(cur[i - 1].time) : NaN;
      const rivalGap = i && Number.isFinite(time) && Number.isFinite(previous) ? time - previous : null;
      const percent = i && Number.isFinite(time) && Number.isFinite(leader) && leader > 0 ? (time - leader) / leader * 100 : null;
      return { ...r, rank: i + 1,
        gap: i === 0 ? "—" : (rivalGap != null ? "+" + rivalGap.toFixed(3) + "s" : "—"),
        percent: i === 0 ? "—" : (percent != null ? "+" + percent.toFixed(1) + "%" : "—"),
        far: rivalGap != null && rivalGap > 1,
        val: fmtTime(r.time), quad: r.quad || "" };
    });
  } else {
    const leadPts = sea.length ? Number(sea[0].points) || 0 : 0;
    rows = sea.map((r, i) => ({ ...r, rank: i + 1,
      gap: i === 0 ? "—" : "−" + Math.max(0, leadPts - (Number(r.points) || 0)),
      percent: null, far: false,
      val: (Number(r.points) || 0) + " PTS", quad: `${r.wins || 0}W · ${r.podiums || 0}P` }));
  }
  const head = $("#lb-head");
  if (head) head.innerHTML = lbMode === "current"
    ? '<span>POS</span><span>PILOT / QUAD</span><span>RACE DIRECTOR</span><span>FROM RIVAL</span><span>% TO LEADER</span><span>TIME</span>'
    : '<span>POS</span><span>PILOT</span><span>GAP TO LEADER</span><span>POINTS</span>';
  if (head) head.classList.toggle("season", lbMode === "season");
  const timingContext = $("#drh-timing-context");
  if (timingContext) timingContext.textContent = lbMode === "season" ? `SEASON STANDINGS · AFTER ROUND ${d.roundsCompleted ?? "—"}` : `WEEK ${d.weekNo ?? "—"} · LIVE TIMING`;
  if (!rows.length) {
    $("#lb-body").innerHTML = `<div class="dr-empty" style="padding:28px 10px;text-align:center">Κανένας χρόνος ακόμα σε αυτή την κατηγορία — το track είναι ανοιχτό! 🏁</div>`;
    $("#lb-more").style.display = "none";
    const lh0 = $("#lb-head"); if (lh0) lh0.style.display = "none";
    return;
  }
  const lh = $("#lb-head"); if (lh) lh.style.display = "";
  $("#lb-body").classList.toggle("season", lbMode === "season");

  // Reuse the same Race Director weekly awards as the Spotlight card.
  // Each award is attached to its real pilot; the closest battle belongs to both pilots.
  const awardsByPilot = new Map();
  const addAward = (pilot, award) => {
    const key = String(pilot || "").trim().toLocaleLowerCase();
    if (!key) return;
    if (!awardsByPilot.has(key)) awardsByPilot.set(key, []);
    awardsByPilot.get(key).push(award);
  };
  const currentWeekAwards = []; // Season-wide raceAwards() must never be presented as weekly awards.
  currentWeekAwards.forEach(award => {
    if (award.pair) {
      String(award.pilot).split(/\s+vs\s+/i).forEach(pilot => addAward(pilot, award));
    } else addAward(award.pilot, award);
  });
  const pilotAwardsHtml = pilot => (awardsByPilot.get(String(pilot || "").trim().toLocaleLowerCase()) || [])
    .map(award => `<span class="lb-award" title="${esc(award.label + " · " + award.value)}"><span aria-hidden="true">${esc(award.icon)}</span> ${esc(award.label)} <b>${esc(award.value)}</b></span>`)
    .join("");

  // list: πλήρης κατάταξη από το rank 1 — top 8 ορατά, οι υπόλοιποι με «ΕΜΦΑΝΙΣΗ ΟΛΩΝ»
  const showN = lbExpanded ? 999 : 8;
  const pilotTitleHtml = pilot => {
  const title = pilotTitle(pilot, d, raw);
  return title
    ? `<span class="drh-performance-title" style="color:${title.color}">★ ${esc(title.label)}</span>`
    : "";
};
  $("#lb-body").innerHTML = rows.slice(0, showN).map(r => `
    <div class="lb-row r${r.rank}${r.far ? " far" : ""}">
      <span class="rk">${String(r.rank).padStart(2, "0")}</span>
      <span class="pl">${avHtml(r.pilot)}<span class="pl-tx"><span class="nm" data-pilot="${esc(r.pilot)}">${esc(r.pilot)}</span>${pilotTitleHtml(r.pilot)}<span class="${lbMode === "season" ? "season-sub" : "qd"}">${esc(r.quad)}</span><span class="lb-awards lb-awards-inline">${pilotAwardsHtml(r.pilot)}</span></span></span>
      ${lbMode === "current" ? `<span class="lb-awards">${pilotAwardsHtml(r.pilot) || '<span class="lb-no-award">—</span>'}</span>` : ""}
      <span class="gap">${esc(r.gap)}</span>
      ${lbMode === "current" ? `<span class="percent">${esc(r.percent)}</span>` : ""}
      <span class="val">${esc(r.val)}</span>
    </div>`).join("");
  hydrateAvatars($("#lb-body"));
  const more = $("#lb-more");
  if (rows.length > 8) {
    more.style.display = "block";
    more.textContent = lbExpanded ? "ΕΜΦΑΝΙΣΗ ΛΙΓΟΤΕΡΩΝ ↑" : `ΕΜΦΑΝΙΣΗ ΟΛΩΝ (${rows.length}) ↓`;
  } else more.style.display = "none";
}

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
  const awardsBox = $("#spotlight-awards");
  const norm = x => String(x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const currentTrack = norm(raw.current_track || d.currentTrack);
  const currentWeek = Number(raw.week_no ?? d.weekNo);
  const weekFeed = (d.feed || []).filter(r => currentTrack && norm(r.track) === currentTrack &&
    r.week != null && Number(r.week) === currentWeek);
  const items = [];
  // Live timing is reliable current-week evidence; it is not an official award.
  const grid = (d.currentLb || []).filter(r => Number.isFinite(Number(r.time)) && Number(r.time) > 0);
  if (grid.length) {
    const leader = [...grid].sort((a,b) => Number(a.time)-Number(b.time))[0];
    items.push({k:"CURRENT GRID LEADER",v:leader.pilot,s:`Ταχύτερος καταγεγραμμένος γύρος: ${Number(leader.time).toFixed(3)}s · Week ${currentWeek}.`});
    items.push({k:"ON THE GRID",v:`${grid.length} ${grid.length === 1 ? "PILOT" : "PILOTS"}`,s:"Επιβεβαιωμένοι χρόνοι στο τρέχον εβδομαδιαίο leaderboard."});
  }
  const biggest = weekFeed.filter(r => Number(r.delta) > 0).sort((a,b) => Number(b.delta)-Number(a.delta))[0];
  if (biggest) items.push({k:"WEEKLY IMPROVEMENT",v:biggest.pilot,s:`Βελτίωση ${Number(biggest.delta).toFixed(3)}s στην τρέχουσα πίστα.`});
  const potw = d.potw && norm(d.potw.track) === currentTrack &&
    d.potw.week != null && Number(d.potw.week) === currentWeek ? d.potw : null;
  if (potw) items.unshift({k:"PILOT OF THE WEEK",v:potw.pilot,s:`Βελτίωση ${Number(potw.improvement_pct).toFixed(1)}% στο ${potw.track}.`});
  box.innerHTML = items.length ? items.slice(0,3).map(x => `
    <div class="spot-item"><div class="spot-k">${esc(x.k)}</div>
    <div class="spot-v nm" data-pilot="${esc(x.v)}">${esc(x.v)}</div>
    <div class="spot-s">${esc(x.s)}</div></div>`).join("")
    : `<div class="drh-weekly-empty">Αναμονή πρώτης καταγραφής στην τρέχουσα εβδομάδα.</div>`;
  if (awardsBox) { awardsBox.innerHTML = ""; awardsBox.hidden = true; }
}

function buildHallOfFame(d, raw) {
  const feat = $("#hof-featured");
  if (!feat) return;
  // featured: v2.1 export hall_of_fame (most_wins holder) → fallback στον υπολογισμό μας
  let fPilot = null;
  const hof = d.hallOfFame && d.hallOfFame.classes && d.hallOfFame.classes[d.cls];
  if (Array.isArray(hof)) {
    const mw = hof.find(e => e.key === "most_wins");
    if (mw && Array.isArray(mw.holders) && mw.holders.length) fPilot = mw.holders[0].callsign;
  }
  if (!fPilot) {
    const maxWins = Math.max(0, ...(d.standings || []).map(s => s.wins || 0));
    const winTied = maxWins > 0 ? (d.standings || []).filter(s => (s.wins || 0) === maxWins) : [];
    let sbPilot = "";
    if (d.seasonBest != null && isFinite(d.seasonBest)) {
      outer: for (const w of d.weeks || []) {
        for (const r of w.results || []) {
          if (r.time === d.seasonBest) { sbPilot = r.pilot; break outer; }
        }
      }
    }
    const mostAppearances = Object.values(d.profiles || {}).sort((a, b) => (b.appearances || 0) - (a.appearances || 0))[0];
    if (winTied.length) fPilot = sbPilot && winTied.some(s => s.pilot === sbPilot) ? sbPilot : winTied[0].pilot;
    else if (sbPilot) fPilot = sbPilot;
    else if (mostAppearances) fPilot = mostAppearances.pilot;
  }
  const foot = $("#hof-foot");
  if (foot) foot.textContent = `DRH / NIGHT RACE EDITION · SIMRUSH ${(raw && raw.season) || "2026"} · SOURCE: VELOCIDRONE BOT · LAST EXPORT: ${(raw && raw.generated_at) || "—"}`;
  if (!fPilot) {
    feat.innerHTML = `<div class="dr-empty" style="padding:20px 6px">Το Hall of Fame θα γεμίσει μετά τις πρώτες ολοκληρωμένες εβδομάδες.</div>`;
    return;
  }
  const row = (d.standings || []).find(s => s.pilot === fPilot) || {};
  const prof = (d.profiles || {})[fPilot] || {};
  const rounds = d.roundsCompleted != null ? d.roundsCompleted : d.weeks.length;
  const wins = row.wins || 0;
  const winRate = rounds ? Math.round(wins / rounds * 100) : 0;
  let lastWin = null;
  (d.weeks || []).forEach(w => { if (w.winner === fPilot) lastWin = w; });
  feat.innerHTML = `
    <div class="hof-id">
      ${avHtml(fPilot)}
      <div>
        <div class="hof-kick mono">HALL OF FAME&nbsp;/&nbsp;MOST RACE WINS</div>
        <div class="hof-name nm" data-pilot="${esc(fPilot)}">${esc(fPilot)}</div>
        <div class="hof-sub">${wins} ${wins === 1 ? "νίκη" : "νίκες"} σε ${rounds} ολοκληρωμένους αγώνες</div>
      </div>
    </div>
    <div class="hof-cols">
      <div class="hof-col"><div class="v">${wins}</div><div class="k">ΝΙΚΕΣ</div><div class="v2">${winRate}%</div><div class="k">WIN RATE</div></div>
      <div class="hof-col"><div class="v">${row.podiums || 0}</div><div class="k">PODIUMS</div><div class="v2">${fmtTime(row.best)}</div><div class="k">ΚΑΛΥΤΕΡΟΣ ΓΥΡΟΣ</div></div>
      <div class="hof-col"><div class="v">${prof.appearances || 0}</div><div class="k">ΣΥΜΜΕΤΟΧΕΣ</div><div class="v2">${lastWin ? esc(lastWin.trackDisplay || lastWin.track) : "—"}</div><div class="k">ΠΙΟ ΠΡΟΣΦΑΤΗ ΝΙΚΗ${lastWin ? " · " + esc(String(lastWin.date || "").slice(0, 10)) : ""}</div></div>
    </div>`;
  hydrateAvatars(feat);
}

// ------------------------------------------------------------------ track reveal
function ytId(v) {
  if (!v) return null;
  const m = String(v).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (m) return m[1];
  return /^[\w-]{6,15}$/.test(String(v).trim()) ? String(v).trim() : null;
}
// Track reveal πλέον ζει στο sidebar (κάτω από το countdown) — πάντα ορατό,
// με placeholder όσο το bot δεν έχει στείλει youtube id.
function buildReveal(raw, d) {
  const box = $("#reveal-body");
  if (!box) return;
  // Editorial video mapping is configuration, not a hardcoded exception in UI logic.
  // An explicit video in the bot feed always takes precedence.
  const editorial = window.DRH_SITE_CONFIG?.trackVideos || {};
  const videoKey = `${Number(raw?.season || d.season || 0)}:${Number(d.weekNo)}:${String(d.currentTrack || "").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const rv = (raw && raw.track_reveal) || d.trackReveal ||
    (typeof editorial[videoKey] === "string" ? { youtube_url: editorial[videoKey] } : null);
  const id = rv && ytId(rv.youtube_id || rv.youtube_url || rv.youtube || rv.url || rv.id);
  // file:// pages have no usable HTTP referrer; YouTube often rejects their
  // embedded player (Error 153). Keep the official video reachable instead.
  const localPreview = window.location.protocol === "file:";
  if (id && !localPreview) {
    box.innerHTML = `<div class="reveal-vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}" title="Track reveal" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  } else if (id) {
    box.innerHTML = `<div class="vid-placeholder drh-video-pending"><span class="vp-play">▶</span><strong>TRACK REVEAL VIDEO</strong><span>Για αναπαραγωγή άνοιξε το επίσημο βίντεο με το WATCH TRACK REVEAL.</span></div>`;
  } else {
    box.innerHTML = `<div class="vid-placeholder drh-video-pending"><span class="vp-play">▶</span><strong>TRACK VIDEO · STANDBY</strong><span>Αναμονή επίσημης παρουσίασης της νέας πίστας.</span></div>`;
  }
  const revealCard = box.closest(".reveal-card");
  if (revealCard) revealCard.classList.toggle("reveal-awaiting-video", !id);
  // WATCH TRACK REVEAL: ενεργό μόνο όταν υπάρχει πραγματικό video
  const btn = $("#rc-btn");
  if (btn) {
    const url = id ? "https://www.youtube.com/watch?v=" + id : null;
    if (url) { btn.href = url; btn.target = "_blank"; btn.rel = "noopener"; btn.classList.remove("off"); }
    else { btn.removeAttribute("href"); btn.removeAttribute("target"); btn.classList.add("off"); }
  }
  // The current Track Reveal broadcast is rendered once by renderInlineRaceRadio,
  // immediately below the WATCH TRACK REVEAL button.

}

// ------------------------------------------------------------------ RD radio + close rivalries
// RD: το τελευταίο μήνυμα ως broadcast strip στο hero · Rivalries: στατιστικές μάχες
// (ΟΧΙ official duels) με μεγάλα τετράγωνα avatars στο Community Paddock.
function fmtRdDate(iso) {
  const dt = parseTs(iso);
  if (isNaN(dt)) return String(iso || "");
  const d2 = dt.toLocaleDateString("el-GR", { day: "numeric", month: "short" });
  const hm = dt.toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${d2} · ${hm}`;
}

// RD helpers (v2.1 structured messages, v1 fallback)
const rdClean = (t) => String(t || "").replace(/\*\*/g, "").replace(/[ \t]+\n/g, "\n").trim();
const RD_CAT_LABELS = {
  timing: "TIMING RADIO", track_reveal: "TRACK REVEAL", rivalries: "RIVAL WATCH",
  duels: "OFFICIAL DUELS", championship: "CHAMPIONSHIP", community: "COMMUNITY", general: "RACE DIRECTOR"
};
function rdLabel(m, fallback) {
  if (m && m.event_type && m.event_type !== "unknown") return String(m.event_type).replace(/_/g, " ");
  return (m && RD_CAT_LABELS[m.category]) || fallback || "RACE DIRECTOR";
}

function buildSidebar(raw, d) {
  // RD radio στο hero: προτεραιότητα breaking/high (v2 priority), αλλιώς το τελευταίο μήνυμα
  const radio = $("#hero-radio");
  if (radio) {
    // Hero is a short broadcast, never a standings dump or a weekly recap.
    // Route only explicitly categorized events; legacy unknown/general stays out.
    const heroEvents = new Set(["NEW_TOP", "PERSONAL"]);
    const heroCats = new Set(["timing"]);
    const heroSource = [...(d.rd?.messages || [])];
    // Only the active site_data.json may provide official broadcasts.
    // Never resurrect an older embedded snapshot after the live feed advances.
    const heroCandidates = heroSource.filter(x => {
      const cat = String(x.category || "").toLowerCase();
      const event = String(x.event_type || "").toUpperCase();
      const content = rdClean(x.text);
      if (!heroCats.has(cat) || !heroEvents.has(event)) return false;
      if (content.length > 220 || content.split("\n").length > 3) return false;
      if (/βαθμολογ[ίι]α σεζ[όο]ν|ανασκ[όο]πηση εβδομ[άα]δας|weekly (?:standings|recap)/i.test(content)) return false;
      if (!rdMatchesCurrentWeek(x, raw)) return false;
      return true;
    });
    // Priority first, then latest timestamp. If no suitable message exists, hide the radio.
    const priorityRank = {breaking:3,high:2,normal:1,low:0};
    heroCandidates.sort((a,b) => (priorityRank[String(b.priority||"normal").toLowerCase()]??1) - (priorityRank[String(a.priority||"normal").toLowerCase()]??1) || parseTs(b.created_at||b.date).getTime()-parseTs(a.created_at||a.date).getTime());
    // Strict Hero whitelist: no generic fallback (season tables, weekly recaps,
    // standings dumps and long bot messages belong outside the Hero).
    const m = heroCandidates[0] || null;
    window.__drhHeroMessage = m;
    if (m) {
      $("#hr-cat").textContent = rdLabel(m, "TIMING RADIO");
      $("#hr-date").textContent = fmtRdDate(m.created_at || m.date);
      const trk = m.track || d.trackDisplay || d.currentTrack;
      const trkEl = $("#hr-track");
      if (trk) { trkEl.textContent = `[${String(m.class || d.cls || "").toUpperCase()}] «${trk}»`; trkEl.style.display = ""; }
      else trkEl.style.display = "none";
      // v1 μηνύματα επαναλαμβάνουν το «[class] «track»» prefix στο σώμα — το δείχνουμε μόνο στο track line
      $("#hr-text").textContent = rdClean(m.text).replace(/^\[[^\]]*\]\s*«[^»]*»\s*\n?/, "");
      radio.style.display = "";
    } else {
      // No suitable current transmission exists in the active feed.
      $("#hr-cat").textContent = "TIMING RADIO";
      $("#hr-date").textContent = "";
      $("#hr-track").style.display = "none";
      $("#hr-text").textContent = "Ο Race Director περιμένει το επόμενο επίσημο update.";
      radio.style.display = "";
    }
    // Keep the timing card in its fixed right-hand column when radio is absent.
    const heroBottom = radio.closest('.hero-bottom');
    if (heroBottom) heroBottom.classList.remove('hero-no-radio');
  }
  const rivEl = $("#rivalries");
  if (rivEl) {
    // Never carry previous-week statistical pairings into a newly announced track.
    // Both the source week/track and actual current-week timing must agree.
    const normalizeTrack = x => String(x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const currentTrack = normalizeTrack(raw.current_track || d.currentTrack);
    const currentWeek = Number(raw.week_no ?? d.weekNo);
    const currentPilots = new Set((d.currentLb || []).filter(x => Number.isFinite(Number(x.time)) && Number(x.time) > 0).map(x => String(x.pilot || x.callsign || "").toLowerCase()));
    // Verify each bot-reported rivalry against the same current leaderboard snapshot.
    // A matching pair alone is insufficient: stale gaps must never be displayed.
    const currentTimes = new Map();
    for (const entry of d.currentLb || []) {
      const pilot = String(entry.pilot || entry.callsign || "").trim().toLowerCase();
      const time = Number(entry.time);
      if (!pilot || !Number.isFinite(time) || time <= 0) continue;
      // Duplicate names with conflicting times are ambiguous; fail closed.
      if (currentTimes.has(pilot) && Math.abs(currentTimes.get(pilot) - time) > 0.0005) {
        currentTimes.set(pilot, NaN);
      } else if (!currentTimes.has(pilot)) currentTimes.set(pilot, time);
    }
    let hb = Array.isArray(raw.hot_battles) ? raw.hot_battles.map(h => ({...h})) : [];
    hb = hb.filter(h => {
      if (h.class && h.class !== d.cls) return false;
      if (h.week == null && !h.track) return false; // no verifiable round provenance
      if (h.week != null && Number(h.week) !== currentWeek) return false;
      if (h.track && (!currentTrack || normalizeTrack(h.track) !== currentTrack)) return false;
      const leader = String(h.leader || "").trim().toLowerCase();
      const chaser = String(h.chaser || "").trim().toLowerCase();
      if (!leader || !chaser || leader === chaser || !currentPilots.has(leader) || !currentPilots.has(chaser)) return false;
      const leaderTime = currentTimes.get(leader);
      const chaserTime = currentTimes.get(chaser);
      const reportedGap = Number(h.gap);
      if (!Number.isFinite(leaderTime) || !Number.isFinite(chaserTime) ||
          !Number.isFinite(reportedGap) || reportedGap < 0) return false;
      const actualGap = chaserTime - leaderTime;
      // Millisecond timing precision; allow 2ms for independently rounded exports.
      if (actualGap < 0 || Math.abs(actualGap - reportedGap) > 0.002) return false;
      h.verifiedGap = Math.max(0, actualGap);
      return true;
    }).slice(0, 3);
    // V76: No verified current-week rivalries: remove the empty column,
    // allowing the genuine weekly Breakthrough content to use the full row.
    const paddockPair = rivEl.closest('.drh-paddock-pair');
    if (paddockPair) paddockPair.classList.toggle('paddock-solo', hb.length === 0);
    // RD rivalries note (TEASER / DUEL_SUGGEST) πάνω από τις κάρτες
    const candidateNote = d.rd.byCat["rivalries"] || null;
    const note = candidateNote && hb.length &&
      (candidateNote.week != null ? Number(candidateNote.week) === currentWeek : false) &&
      (!candidateNote.track || normalizeTrack(candidateNote.track) === currentTrack)
      ? candidateNote : null;
    const noteHtml = note
      ? `<div class="rd-note" style="grid-column:1/-1"><span class="rdn-tag">RACE DIRECTOR / ${esc(rdLabel(note, "RIVAL WATCH"))}</span>${esc(rdClean(note.text))}</div>`
      : "";
    if (hb.length) {
      rivEl.innerHTML = hb.map(h => `<div class="riv-card">
        <div class="riv-side">${avHtml(h.leader)}<span class="nm" data-pilot="${esc(h.leader)}">${esc(h.leader)}</span><span class="riv-tag">ΚΡΑΤΑΕΙ</span></div>
        <div class="riv-mid"><span class="riv-vs">VS</span><span class="riv-gap">+${h.verifiedGap.toFixed(3)}s</span>${h.days ? `<span class="riv-days">${h.days}Η ΗΜΕΡΑ</span>` : ""}</div>
        <div class="riv-side">${avHtml(h.chaser)}<span class="nm" data-pilot="${esc(h.chaser)}">${esc(h.chaser)}</span><span class="riv-tag">ΚΥΝΗΓΑΕΙ</span></div>
      </div>`).join("");
      hydrateAvatars(rivEl);
    } else {
      rivEl.innerHTML = `<div class="dr-empty" style="padding:20px 6px">Καμία ενεργή μάχη αυτή την εβδομάδα.</div>`;
    }
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
let resolvedDuelsExpanded = false;
function duelRound(p) {
  // A completed duel must carry official round provenance. Never infer it from its position.
  for (const value of [p.week, p.week_no, p.round, p.round_no]) {
    if (value != null && String(value).trim() !== "" && Number.isInteger(Number(value)) && Number(value) > 0) return Number(value);
  }
  const track = String(p.track || p.track_name || "");
  const match = track.match(/sim[\s_-]*rush[\s_-]*week[\s_-]*(\d+)/i);
  return match ? Number(match[1]) : null;
}
function buildDuels(raw, d) {
  const box = $("#duels");
  // δύο σχήματα: παλιό array [...] ή νέο {active:[...], recent_resolved:[...]}
  const du = raw.duels;
  const all = Array.isArray(du) ? du : [
    ...(Array.isArray(du?.active) ? du.active : []),
    ...(Array.isArray(du?.recent_resolved) ? du.recent_resolved.map(p => ({ ...p, resolved: true })) : [])
  ];
  const active = all.filter(p => p.status ? p.status === "active" : !p.resolved);
  const currentWeek = Number(raw.week_no ?? d.weekNo);
  const resolved = all.filter(p => {
    if (!(p.status ? ["resolved", "completed", "finished"].includes(String(p.status).toLowerCase()) : !!p.resolved)) return false;
    const week = duelRound(p);
    return Number.isInteger(currentWeek) && currentWeek > 0 && week !== null && (week === currentWeek || week === currentWeek - 1);
  }).slice().reverse(); // Μόνο επίσημα ολοκληρωμένα της τρέχουσας και προηγούμενης εβδομάδας
  const count = $("#duels-count");
  if (count) {
    count.textContent = active.length + " LIVE";
    count.style.background = active.length ? "rgba(239,68,68,.12)" : "rgba(251,146,60,.12)";
    count.style.color = active.length ? "var(--red)" : "var(--orange)";
  }

  // RD duels note (OFFICIAL_DUEL ανακοίνωση) πάνω από τη λίστα
  const dNote = null; // V37: official announcements are rendered only in the contextual radio above the cards
  let html = dNote
    ? `<div class="rd-note"><span class="rdn-tag">RACE DIRECTOR / ${esc(rdLabel(dNote, "OFFICIAL DUELS"))}</span>${esc(rdClean(dNote.text))}</div>`
    : "";

  // ΜΟΝΟ official, RD-confirmed duels — οι στατιστικές μάχες ζουν στο Community Paddock (Close Rivalries)
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
          : " · λήγει " + parseTs(p.deadline).toLocaleDateString("el-GR", { day: "numeric", month: "short" });
      }
      return `
      <div class="duel">
        <div class="who">
          <div class="n${lead === p.pilot_a ? " w" : ""}">${esc(p.pilot_a)}</div>
          <div class="s">${ta != null ? Number(ta).toFixed(3) + "s" : "— δεν έχει ξαναπετάξει"}</div>
        </div>
        <div class="mid"><div class="score"><b>${ta != null ? Number(ta).toFixed(3) : "—"}</b><span class="d">vs</span><b>${tb != null ? Number(tb).toFixed(3) : "—"}</b></div>
          <div class="duel-track">${esc(p.track || "")}${dl}</div>
        </div>
        <div class="who">
          <div class="n${lead === p.pilot_b ? " w" : ""}">${esc(p.pilot_b)}</div>
          <div class="s">${tb != null ? Number(tb).toFixed(3) + "s" : "— δεν έχει ξαναπετάξει"}</div>
        </div>
      </div>`;
    }).join("");
  }

  const resShow = resolvedDuelsExpanded ? resolved : resolved.slice(0, 3);
  if (resolved.length) {
    html += `<div class="duel-sep">🏁 ΟΛΟΚΛΗΡΩΜΕΝΑ</div>`;
    html += resShow.map(p => {
      const w = p.winner || duelWinner(p);
      const noA = p.best_time_a == null, noB = p.best_time_b == null;
      const walkover = w && (noA || noB);
      const noFlight = t => t == null
        ? `<span class="duel-no-flight">ΔΕΝ ΞΑΝΑΠΕΤΑΞΕ</span>`
        : Number(t).toFixed(3) + "s";
      return `
      <div class="duel done">
        <div class="who">
          <div class="n${w === p.pilot_a ? " w" : ""}">${esc(p.pilot_a)}</div>
          <div class="s">${noFlight(p.best_time_a)}</div>
        </div>
        <div class="mid">
          <div class="score"><b>${p.best_time_a != null ? Number(p.best_time_a).toFixed(3) : "—"}</b><span class="d">—</span><b>${p.best_time_b != null ? Number(p.best_time_b).toFixed(3) : "—"}</b></div>
          <div class="duel-track">${w ? "🏆 " + esc(w) + (walkover ? " · δεν ξαναπέταξε ο άλλος" : "") : (noA && noB ? "χωρίς πτήση — άκυρο" : "άκυρο")}</div>
        </div>
        <div class="who">
          <div class="n${w === p.pilot_b ? " w" : ""}">${esc(p.pilot_b)}</div>
          <div class="s">${noFlight(p.best_time_b)}</div>
        </div>
      </div>`;
    }).join("");
  }


  if (active.length > 3) html += `<button class="show-more" id="duels-more" style="display:block">${duelsExpanded ? "ΛΙΓΟΤΕΡΑ ΕΝΕΡΓΑ ▴" : `ΔΕΣ ΟΛΑ ΤΑ ΕΝΕΡΓΑ (+${active.length - 3}) ▾`}</button>`;
  if (resolved.length > 3) html += `<button class="show-more" id="duels-resolved-more" style="display:block">${resolvedDuelsExpanded ? "SHOW LESS ▴" : `ΔΕΣ ΟΛΑ ΤΑ COMPLETED DUELS (+${resolved.length - 3}) ▾`}</button>`;

  box.innerHTML = html;
  const activeBox = $("#duels-active"), resolvedBox = $("#duels-resolved");
  if (activeBox && resolvedBox) {
    const entries = Array.from(box.children);
    let target = activeBox;
    activeBox.innerHTML = ""; resolvedBox.innerHTML = "";
    entries.forEach(el => {
      if (el.classList.contains("duel-sep")) {
        target = el.textContent.includes("ΟΛΟΚΛΗΡΩΜΕΝΑ") ? resolvedBox : activeBox;
      } else if (el.classList.contains("duel")) {
        target.appendChild(el);
      } else if (el.classList.contains("rd-note")) {
        activeBox.appendChild(el);
      } else if (el.id === "duels-more") {
        activeBox.appendChild(el);
      } else if (el.id === "duels-resolved-more") {
        resolvedBox.appendChild(el);
      }
    });
    if (!active.length) activeBox.insertAdjacentHTML("beforeend", '<div class="dr-empty">Δεν υπάρχουν ενεργά επίσημα duels αυτή τη στιγμή.</div>');
    if (!resolved.length) resolvedBox.insertAdjacentHTML("beforeend", '<div class="dr-empty">Δεν υπάρχουν καταγεγραμμένα ολοκληρωμένα duels για αυτή και την προηγούμενη εβδομάδα.</div>');
  }
  const dm = $("#duels-more");
  if (dm) dm.addEventListener("click", () => { duelsExpanded = !duelsExpanded; buildDuels(raw, d); });
  const rm = $("#duels-resolved-more");
  if (rm) rm.addEventListener("click", () => { resolvedDuelsExpanded = !resolvedDuelsExpanded; buildDuels(raw, d); });
}

// ------------------------------------------------------------------ archive (week viewer, VRL-style)
let arcWeekIdx = -1;  // index στο d.weeks (χρονολογικά) — default: τελευταία ολοκληρωμένη
let arcQuery = "";
function buildArchive(d, raw) {
  const sel = $("#arc-week"), rowsBox = $("#arc-rows");
  if (!sel || !rowsBox) return;
  const weeks = d.weeks || []; // χρονολογικά: W1 πρώτη
  if (!weeks.length) {
    sel.innerHTML = "";
    rowsBox.innerHTML = `<div class="dr-empty" style="padding:24px 6px">Κανένα ολοκληρωμένο track ακόμα σε αυτή την κατηγορία.</div>`;
    return;
  }
  if (arcWeekIdx < 0 || arcWeekIdx >= weeks.length) arcWeekIdx = weeks.length - 1;

  // ξαναχτίσε τα options μόνο αν άλλαξε το σετ εβδομάδων — «track · ημερομηνία» όπως στο mockup
  const key = weeks.map(w => w.label + "|" + w.track).join(";;");
  if (sel._weeksKey !== key) {
    sel._weeksKey = key;
    sel.innerHTML = weeks.map((w, i) => `<option value="${i}">${esc(w.trackDisplay || w.track)} · ${esc(String(w.date || "").slice(0, 10))}</option>`).join("");
  }
  sel.value = String(arcWeekIdx);
  sel.onchange = () => { arcWeekIdx = +sel.value; renderArchiveWeek(d, raw); };
  renderArchiveWeek(d, raw);
}
function renderArchiveWeek(d, raw) {
  const w = (d.weeks || [])[arcWeekIdx];
  const rowsBox = $("#arc-rows");
  if (!w || !rowsBox) return;
  const setT = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  setT("#arc-date", String(w.date || "").slice(0, 10) || "—");
  setT("#arc-track", w.trackDisplay || w.track || "—");
  setT("#arc-best", fmtTime(w.best));
  setT("#arc-grid", w.pilots);
  // v2.1: records_broken μπορεί να είναι null (άγνωστο) — κρύβουμε το πεδίο αντί για fake 0
  const recsWrap = $("#arc-recs-wrap");
  if (recsWrap) {
    if (w.records != null) { setT("#arc-recs", w.records); recsWrap.style.display = ""; }
    else recsWrap.style.display = "none";
  }
  const wBox = $("#arc-w");
  if (wBox) {
    wBox.innerHTML = `<span class="aw-k">RACE WINNER</span>${avHtml(w.winner)}<b class="nm" data-pilot="${esc(w.winner)}">${esc(w.winner)}</b>`;
    hydrateAvatars(wBox);
  }
  const list = w.results || [];
  // V80: Weekly distinctions belong to the corresponding pilot IN the classification.
  // Verified historical results generate factual highlights, not official RD awards.
  const badges = new Map();
  const addBadge = (pilot, label, value, icon, official = false) => {
    const key = String(pilot || "").trim().toLowerCase();
    if (!key) return;
    if (!badges.has(key)) badges.set(key, []);
    const arr = badges.get(key);
    if (!arr.some(b => b.label === label && b.value === value)) arr.push({label, value, icon, official});
  };
  const ranked = list.filter(r => Number.isFinite(Number(r.time)) && Number(r.time) > 0)
    .slice().sort((a,b) => Number(a.time) - Number(b.time));
  if (ranked.length) addBadge(ranked[0].pilot, "RACE WINNER", fmtTime(ranked[0].time), "🏁");
  let closest = null;
  for (let i = 1; i < ranked.length; i++) {
    const gap = Number(ranked[i].time) - Number(ranked[i-1].time);
    if (gap >= 0 && (!closest || gap < closest.gap)) closest = {a:ranked[i-1], b:ranked[i], gap};
  }
  if (closest) {
    const gap = "+" + closest.gap.toFixed(3) + "s";
    addBadge(closest.a.pilot, "CLOSEST BATTLE", gap, "⚔️");
    addBadge(closest.b.pilot, "CLOSEST BATTLE", gap, "⚔️");
  }
  const prior = (d.weeks || [])[arcWeekIdx - 1];
  if (prior && Array.isArray(prior.results)) {
    const oldRanks = new Map(prior.results.map(r => [String(r.pilot).toLowerCase(), Number(r.rank)]));
    const gains = list.map(r => ({pilot:r.pilot, gain:oldRanks.has(String(r.pilot).toLowerCase()) ? oldRanks.get(String(r.pilot).toLowerCase()) - Number(r.rank) : 0}))
      .filter(r => r.gain > 0).sort((a,b) => b.gain-a.gain);
    if (gains.length) addBadge(gains[0].pilot, "BIGGEST RANK CLIMB", "+"+gains[0].gain+" θέσεις", "📈");
  }
  // Official historical awards appear only when explicitly recorded for this week and track.
  const normTrack = x => String(x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const archivedAwards = [
    ...(Array.isArray(raw?.race_director_awards) ? raw.race_director_awards : []),
    ...(Array.isArray(raw?.weekly_awards) ? raw.weekly_awards : []),
    ...(Array.isArray(w.awards) ? w.awards : []),
    ...(Array.isArray(w.race_director_awards) ? w.race_director_awards : [])
  ];
  archivedAwards.forEach(a => {
    if (!a || typeof a !== "object" || (a.week ?? a.week_no) == null || w.week == null || Number(a.week ?? a.week_no) !== Number(w.week)) return;
    if (!a.track || normTrack(a.track) !== normTrack(w.track)) return;
    if (a.class && a.class !== d.cls) return;
    if (a.season != null && w.season != null && Number(a.season) !== Number(w.season)) return;
    if (!a.label && !a.title) return;
    addBadge(a.pilot || a.recipient, String(a.label || a.title).toUpperCase(), a.value == null ? "" : String(a.value), a.icon || "🏅", true);
  });
  rowsBox.innerHTML = list.length ? list.map(r => {
    const pilotBadges = badges.get(String(r.pilot || "").toLowerCase()) || [];
    const badgeHtml = pilotBadges.length ? `<span class="arc-row-badges">${pilotBadges.map(b =>
      `<span class="arc-row-badge${b.official ? " is-official" : ""}" title="${esc(b.official ? "Επίσημη ιστορική διάκριση" : "Στατιστικό από τα αποτελέσματα της εβδομάδας")}"><span aria-hidden="true">${esc(b.icon)}</span> ${esc(b.label)}${b.value ? ` <em>${esc(b.value)}</em>` : ""}</span>`
    ).join("")}</span>` : "";
    return `<div class="arc-row${r.rank <= 3 ? " m" + r.rank : ""}">
      <span class="r">${String(r.rank).padStart(2, "0")}</span>
      <span class="nmpl">${avHtml(r.pilot)}<span class="arc-pilot-stack"><span class="nm" data-pilot="${esc(r.pilot)}">${esc(r.pilot)}</span>${badgeHtml}</span></span>
      <span class="t">${fmtTime(r.time)}</span>
      <span class="pt">${r.points} PTS</span>
    </div>`;
  }).join("") : `<div class="dr-empty" style="padding:18px 6px">Κανένα αποτέλεσμα σε αυτή την εβδομάδα.</div>`;
  hydrateAvatars(rowsBox);

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
  const cur = d.currentLb.find(r => r.pilot === pilotName);
  const rankIdx = d.standings.findIndex(s => s.pilot === pilotName);
  const rank = rankIdx >= 0 ? rankIdx + 1 : null;
  const rankCol = rank === 1 ? "var(--yellow)" : rank === 2 ? "#cbd5e1" : rank === 3 ? "var(--amber)" : "var(--cyan)";
  const rankGlow = rank === 1 ? "rgba(250,204,21,.3)" : rank === 2 ? "rgba(203,213,225,.22)" : rank === 3 ? "rgba(251,146,60,.26)" : "var(--line-accent)";

  // --- hero (χρώμα ανάλογα με τη θέση στη σεζόν) ---
  const hero = $("#dr-hero");
  hero.style.setProperty("--dr-glow", rankGlow);
  const av = $("#dr-av");
  av.textContent = initials(pilotName);
  av.classList.remove("has-img");
  loadPilotAvatar(pilotName, avImg => {
    if (!activeDrawer || activeDrawer.pilot !== pilotName) return;
    av.textContent = "";
    av.appendChild(avImg);
    av.classList.add("has-img");
  });
  av.style.borderColor = rankCol;
  av.style.color = rankCol;
  av.style.boxShadow = `0 0 46px ${rankGlow}`;
  $("#dr-nm").textContent = pilotName;
  // The old gamified title (e.g. PB MACHINE) was an inferred award, not a
  // verified official title. Keep the hero factual and unambiguous.
  $("#dr-title").textContent = "";
  const qdParts = [];
  const currentQuad = cur && typeof cur.quad === "string" ? cur.quad.trim() : "";
  if (currentQuad) qdParts.push(`Quad: ${currentQuad}`);
  if (rank) qdParts.push(`#${rank} στη βαθμολογία σεζόν`);
  // A current track rank is only meaningful for an actual recorded lap.
  const curIdx = d.currentLb.findIndex(r => r.pilot === pilotName);
  if (curIdx >= 0 && Number.isFinite(Number(cur.time)) && Number(cur.time) > 0)
    qdParts.push(`#${curIdx + 1} στην τρέχουσα πίστα`);
  $("#dr-qd").textContent = qdParts.length ? qdParts.join(" · ") : "—";

  // Rank trends across different weekly tracks are not comparable and can
  // mislead users (especially when only some weeks have results).
  $("#dr-chips").replaceChildren();

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
        <div class="dd-status">${status}${myDuel.track ? ` · ${esc(myDuel.track)}` : ""}${myDuel.deadline ? ` · λήγει ${parseTs(myDuel.deadline).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}` : ""}</div>
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
          <span style="color:var(--text-3)">→</span>
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
  // section ΜΑΧΕΣ: αν δεν υπάρχει ούτε duel ούτε μάχη κορυφής, δείξε empty state
  if (!myDuel && race.style.display === "none") duelBox.innerHTML = `<div class="dr-empty">Καμία ενεργή μάχη αυτή την εβδομάδα.</div>`;

  // stats: 2×2 κάρτες (mock) — season best, καλύτερη εντός-track βελτίωση, points+θέση, εμφανίσεις+podiums
  // (cross-track σύγκριση χρόνων W1→W4 είναι άσκοπη: κάθε εβδομάδα έχει διαφορετικό track)
  const impV = p.bestImprovementPct ? "−" + Number(p.bestImprovementPct).toFixed(1) + "%" : "—";
  const impS = p.bestImprovementPct ? "καλύτερο PB σε track" : "";
  const stats = [
    { v: p.best != null ? Number(p.best).toFixed(3) + "s" : "—", k: "Season Best", c: "var(--cyan)", tip: "Ο γρηγορότερος χρόνος που έχει καταγράψει ποτέ στη σεζόν" },
    { v: impV, k: "Βελτίωση", s: impS, c: p.bestImprovementPct ? "var(--emerald)" : null, tip: "Η μεγαλύτερη ποσοστιαία βελτίωση από τον πρώτο στον τελευταίο χρόνο μέσα σε ένα track" },
    { v: p.points, k: "Points", s: rank ? `#${rank} στη σεζόν` : "", tip: "Βαθμοί στη βαθμολογία της σεζόν — μαζεύονται από κάθε εβδομαδιαίο track" },
    { v: p.appearances, k: "Εμφανίσεις", s: p.podiums ? `${p.podiums} podium` : "", tip: "Σε πόσα εβδομαδιαία tracks έχει συμμετάσχει · podiums = top-3 τερματισμοί" }
  ];
  $("#dr-stats").innerHTML = stats.map(s => `<div class="dr-stat" data-tip="${esc(s.tip)}"><div class="k">${s.k}</div><div class="v"${s.c ? ` style="color:${s.c}"` : ""}>${s.v}</div>${s.s ? `<div class="s">${esc(s.s)}</div>` : ""}</div>`).join("");
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
      ${pctBehind != null ? `<span class="mono" style="font-size:var(--fs-label);color:var(--text-3);width:52px;text-align:right;flex-shrink:0">+${pctBehind.toFixed(1)}%</span>` : ""}
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
    ctx.fillStyle = isBest ? "#34d399" : cssVar("--text-3", "rgba(255,255,255,.55)");
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
// Merged tabs: «Αυτή η εβδομάδα»/«Σεζόν» είναι το leaderboard (data-mode),
// Feed/Duels αλλάζουν panel. Τα παλιά pills Current/Season καταργήθηκαν.
function liveTabsInit() {
  $$("#lt-tabs .lt-tab").forEach(b => b.addEventListener("click", () => {
    $$("#lt-tabs .lt-tab").forEach(x => x.classList.toggle("on", x === b));
    $$(".lt-panel").forEach(p => { p.hidden = p.id !== "ltp-" + b.dataset.tab; });
    if (b.dataset.tab === "lb" && b.dataset.mode && b.dataset.mode !== lbMode) {
      lbMode = b.dataset.mode;
      lbExpanded = false;
      buildLeaderboard(state.derivedByClass[activeClass], state.data, state.error);
    }
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
// global cursor glow — ακολουθεί τον κέρσορα σε όλο το backdrop της σελίδας
addEventListener("mousemove", e => {
  const de = document.documentElement.style;
  de.setProperty("--mx", e.clientX + "px");
  de.setProperty("--my", e.clientY + "px");
}, { passive: true });
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
  heroTitle();
  revealInit();
  liveTabsInit();
  floatInit();
  cardGlow();

  // First paint is independent of GitHub latency. The snapshot is explicitly
  // labelled offline until a validated network export replaces it.
  let state = getInitialSnapshotState();
  activeClass = state.classes[0];

  // Independent section renderers. Each section owns its DOM subtree; feed
  // updates only touch sections whose input slice changed. Class switches
  // intentionally invalidate every section. Keep Hero/Reveal/RD together:
  // they share the official announcement deduplication state.
  const sectionSignatures = new Map();
  const sectionRenderers = {
    shell(d) {
      ACTIVE_AVATAR_DATA = state.data;
      state.data.__derived0 = state.derivedByClass[state.classes[0]];
      const hs = $("#hero-season-text");
      if (hs) hs.textContent = (state.data.season || "—") + " SEASON";
      buildClassBar(state);
    },
    announcements(d) {
      buildHeroStats(d, state.data, state.error);
      buildReveal(state.data, d);
      renderInlineRaceRadio(state.data);
    },
    competition(d) {
      buildTitleFight(d, state.data);
      buildLeaderboard(d, state.data, state.error);
      buildDuels(state.data, d);
      buildSpotlight(d, state.data);
    },
    season(d) {
      buildSidebar(state.data, d);
      buildArchive(d, state.data);
      buildHallOfFame(d, state.data);
    }
  };
  function sectionInputs() {
    const raw = state.data;
    return {
      shell: [raw.season, state.classes, activeClass],
      announcements: [raw.race_director_messages, raw.current_track, raw.track_display,
        raw.week_no, raw.season, raw.generated_at, raw.current_leaderboard,
        raw.insights, state.feedStatus, state.error, activeClass],
      competition: [raw.current_leaderboard, raw.season_standings, raw.insights,
        raw.hot_battles, raw.duels, raw.pilot_profiles, raw.history, activeClass, state.error],
      season: [raw.history, raw.season_standings, raw.hall_of_fame,
        raw.season_chart, raw.pilot_stats, raw.current_track, activeClass]
    };
  }
  function renderSections(force = false) {
    const d = state.derivedByClass[activeClass];
    const inputs = sectionInputs();
    for (const [name, render] of Object.entries(sectionRenderers)) {
      const signature = JSON.stringify(inputs[name]);
      if (force || sectionSignatures.get(name) !== signature) {
        render(d);
        sectionSignatures.set(name, signature);
      }
    }
    renderFeedHealth();
  }
  function renderAll() { renderSections(true); }

  // Feed health is independent of the competition payload. Do not rebuild
  // the leaderboard, video iframe, or open drawer just because the network
  // went offline/online while the published results stayed unchanged.
  function renderFeedHealth() {
    const status = state.feedStatus || "snapshot";
    const badge = $("#drh-feed-badge");
    if (badge) {
      badge.dataset.status = status;
      const label = badge.lastChild;
      if (label && label.nodeType === Node.TEXT_NODE) {
        label.textContent = status === "verified" ? "VERIFIED FEED" : status === "stale" ? "STALE FEED" : "SNAPSHOT";
      }
    }
    window.__drhFeedStatus = status;
    const banner = $("#err-banner");
    if (banner) banner.classList.toggle("on", state.error);
  }

  renderAll();
  startCountdown(state.data);

  // data.js owns the only refresh timer. An unchanged payload must not
  // reset interactive state or reload an embedded Track Reveal video.
  addEventListener("drh:data", event => {
    state = event.detail.state;
    if (!event.detail.dataChanged) {
      renderFeedHealth();
      return;
    }
    if (!state.classes.includes(activeClass)) activeClass = state.classes[0];
    const drawer = $("#drawer");
    const drawerWasOpen = drawer && drawer.classList.contains("on");
    const drawerScroll = drawerWasOpen ? drawer.scrollTop : 0;
    const selectedPilot = drawerWasOpen && activeDrawer ? activeDrawer.pilot : null;
    renderSections();
    // Keep the currently selected pilot's details in sync with new results.
    // The old derived profile must not remain visible after a feed update.
    if (selectedPilot) {
      const derived = state.derivedByClass[activeClass];
      if (derived && derived.profiles[selectedPilot]) {
        openDrawer(selectedPilot, derived, state.data);
        drawer.scrollTop = drawerScroll;
      } else {
        closeDrawer();
      }
    }
    if (!state.error) toast("Live data ανανεώθηκε", "⟳");
  });

  // class switcher (delegated — pills are re-rendered)
  $("#class-pills").addEventListener("click", e => {
    const b = e.target.closest(".cls-pill"); if (!b) return;
    if (b.dataset.cls === activeClass) return;
    activeClass = b.dataset.cls;
    lbExpanded = false;
    renderAll();
  });

  // show more
  $("#lb-more").addEventListener("click", () => { lbExpanded = !lbExpanded; buildLeaderboard(state.derivedByClass[activeClass], state.data, state.error); });
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
    // Retry performs a network request; initData() would only return cached data.
    state = await fetchNow();
    toast(state.error ? "Ακόμα offline — δείχνουμε snapshot" : "Επανασύνδεση επιτυχής", state.error ? "⚠" : "✓");
  });

  // Fetch only after the initial snapshot paint and all listeners are ready.
  void initData();
})();


// Race Director events are authoritative only when present in the active site_data.json.
// Older snapshot messages must never be merged into newer online events.
function rdMatchesCurrentWeek(message, raw) {
  if (!message || !raw) return false;
  const week = Number(raw.week_no);
  const msgWeek = Number(message.week ?? message.week_no);
  if (!Number.isFinite(week) || !Number.isFinite(msgWeek) || week !== msgWeek) return false;
  const normalize = value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (message.track && raw.current_track && normalize(message.track) !== normalize(raw.current_track)) return false;
  if (message.season != null && raw.season != null && String(message.season) !== String(raw.season)) return false;
  return true;
}

// Official announcement retained from the user-supplied bot-data site_data.json export.
// The live export can rotate older announcements out of race_director_messages.
// This is NOT a live event: use only when the current live payload lacks its
// own track_reveal announcement, and only for the exact matching week/track/season.
const RD_TRACK_REVEAL_ARCHIVE = Object.freeze({"date":"2026-11-07T18:21:19+00:00","text":"📢 Νέο τεμάχιο: «SimRushWeek6»! Τα LIPO στον φορτιστή, τα νεύρα στο κόκκινο 🔋\n(Auto Leaderboard Upload: ON)","tag":"announcement","id":"rd-ca2ba2c103","event_type":"WEEK_ANNOUNCE","category":"track_reveal","priority":"high","pilots":[],"pilot_ids":[],"track":"SimRushWeek6","class":null,"week":6,"season":2026,"related_duel_id":null,"metadata":{},"created_at":"2026-11-07T18:21:19+00:00","expires_at":null});
function trackRevealArchiveFor(raw, messages) {
  if (messages.some(m => String(m.category || "").toLowerCase() === "track_reveal")) return null;
  return rdMatchesCurrentWeek(RD_TRACK_REVEAL_ARCHIVE, raw)
    ? { ...RD_TRACK_REVEAL_ARCHIVE, _archivedBotExport: true }
    : null;
}

// V61 · Five contextual Race Director stations; only authentic messages are broadcast.
// Empty stations remain visible with a neutral status, never an invented announcement.
function renderInlineRaceRadio(raw) {
  const live = Array.isArray(raw?.race_director_messages) ? raw.race_director_messages : [];
  const messages = [];
  const seenIds = new Set();
  const seenText = new Set();
  for (const m of live) {
    if (!m || typeof m.text !== "string" || !m.text.trim() || !rdMatchesCurrentWeek(m, raw)) continue;
    const id = String(m.id || "").trim();
    const text = m.text.trim();
    if ((id && seenIds.has(id)) || seenText.has(text)) continue;
    if (id) seenIds.add(id);
    seenText.add(text);
    messages.push(m);
  }
  const archivedReveal = trackRevealArchiveFor(raw, messages);
  if (archivedReveal) messages.push(archivedReveal);
  messages.sort((a,b) => parseTs(b.created_at || b.date).getTime() - parseTs(a.created_at || a.date).getTime());
  const used = new Set();
  if (window.__drhHeroMessage && String(window.__drhHeroMessage.category || "").toLowerCase() !== "track_reveal") {
    used.add(String(window.__drhHeroMessage.text || "").trim());
  }
  const stations = [
    {id:"drh-inline-reveal", cats:["track_reveal"], title:"TRACK REVEAL", limit:1},
    {id:"drh-inline-timing", cats:["timing","championship"], title:"LIVE TIMING", limit:3},
    {id:"drh-inline-duels", cats:["duels"], title:"OFFICIAL DUELS", limit:2},
    {id:"drh-inline-paddock", cats:["rivalries"], title:"RIVALRY RADAR", limit:2},
    {id:"drh-inline-breakthrough", cats:["community"], title:"COMMUNITY UPDATES", limit:2}
  ];
  const palette = {timing:"#22d3ee",championship:"#facc15",track_reveal:"#e879f9",duels:"#facc15",rivalries:"#fb923c",community:"#34d399"};
  function makeRadio(msg,i,cat) {
    const item=document.createElement("article"); item.className="drh-radio-item"; item.dataset.rdCat=cat;
    item.style.setProperty("--radio-color",palette[cat]||"#a78bfa");
    item.style.animationDelay=Math.min(i*90,540)+"ms";
    const head=document.createElement("div");head.className="drh-radio-head";
    const label=document.createElement("span");label.textContent="RACE DIRECTOR / "+(cat==="rivalries"?"RIVALRY RADAR":cat==="duels"?"OFFICIAL DUELS":cat.replace(/_/g," ")).toUpperCase();
    const date=document.createElement("time");date.textContent=msg._archivedBotExport
      ? "BOT ARCHIVE · " + fmtRdDate(msg.created_at||msg.date)
      : fmtRdDate(msg.created_at||msg.date);
    head.append(label,date);
    const body=document.createElement("div");body.className="drh-radio-text";body.textContent=rdClean(msg.text);
    item.append(head,body);return item;
  }
  function makeWaiting(title) {
    const item=document.createElement("article"); item.className="drh-radio-item drh-radio-waiting";
    const head=document.createElement("div");head.className="drh-radio-head";
    const label=document.createElement("span");label.textContent="RACE DIRECTOR / "+title;
    const status=document.createElement("span");status.textContent="STANDBY";
    head.append(label,status);
    const body=document.createElement("div");body.className="drh-radio-text";
    body.textContent="Αναμονή επίσημης ανακοίνωσης Race Director.";
    item.append(head,body);return item;
  }
  for (const station of stations) {
    const el=document.getElementById(station.id);if(!el)continue;
    const matching=messages.filter(m => {
      if (!station.cats.includes(String(m.category||"general").toLowerCase()) || used.has(String(m.text).trim())) return false;
      // All stations share the same current-week/track contract.
      // Official duels and statistical rivalries remain separate categories.
      return true;
    }).slice(0,station.limit);
    el.replaceChildren(); el.hidden=false;
    if (!matching.length) { el.append(makeWaiting(station.title)); continue; }
    for (const [i,m] of matching.entries()) {
      used.add(String(m.text).trim());
      el.append(makeRadio(m,i,String(m.category||"general").toLowerCase()));
    }
  }
}
