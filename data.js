// DRH Leaderboard — data layer
// Fetches live from the bot's site_data.json, with local fallback snapshot.
// Class-agnostic: supports any number of classes (5inch, tinywhoop, ...)
// discovered dynamically from the payload. New classes appear automatically
// as soon as the bot exports them — no frontend change needed.

const FALLBACK = {
  generated_at: "2026-11-02T20:30:02.965744",
  season: 2026,
  current_track: "SimRushWeek-5",
  current_leaderboard: {
    "5inch": [
      { pilot: "DedalosFPV", time: 39.183, quad: "Bahamut" },
      { pilot: "tomahok", time: 52.293, quad: "Five33 Switchback" },
      { pilot: "Agorastos", time: 68.537, quad: "Carbix Zero" },
      { pilot: "Bakarim", time: 120.871, quad: "TBS Oblivion" }
    ]
  },
  season_standings: {
    "5inch": [
      { pilot: "Exo_FPV", points: 86, wins: 2, podiums: 4, best: 38.31 },
      { pilot: "ZOUP", points: 83, wins: 2, podiums: 4, best: 40.165 },
      { pilot: "TettixPro", points: 57, wins: 0, podiums: 3, best: 42.241 },
      { pilot: "DedalosFPV", points: 46, wins: 0, podiums: 0, best: 48.537 },
      { pilot: "Cbeikos", points: 28, wins: 0, podiums: 0, best: 56.123 },
      { pilot: "tomahok", points: 26, wins: 0, podiums: 0, best: 63.578 },
      { pilot: "dimbazus", points: 20, wins: 0, podiums: 0, best: 65.008 },
      { pilot: "anthunder", points: 18, wins: 0, podiums: 1, best: 38.87 },
      { pilot: "Liapos", points: 18, wins: 0, podiums: 0, best: 70.629 },
      { pilot: "Agorastos", points: 16, wins: 0, podiums: 0, best: 67.587 },
      { pilot: "Torque72", points: 3, wins: 0, podiums: 0, best: 110.281 },
      { pilot: "fpvchucky", points: 2, wins: 0, podiums: 0, best: 149.462 },
      { pilot: "Pontikos", points: 1, wins: 0, podiums: 0, best: null },
      { pilot: "gkfpv13", points: 0, wins: 0, podiums: 0, best: null },
      { pilot: "Bakarim", points: 0, wins: 0, podiums: 0, best: 272.859 },
      { pilot: "Gaston_FPV", points: 0, wins: 0, podiums: 0, best: 314.214 }
    ]
  },
  history: [
    { date: "2026-10-11T00:07:15.960303", track: "SimRush Week1", class: "5inch",
      results: [
        { pilot: "Exo_FPV", time: 38.31, points: 25 },
        { pilot: "anthunder", time: 38.87, points: 18 },
        { pilot: "ZOUP", time: 41.353, points: 15 },
        { pilot: "TettixPro", time: 44.709, points: 12 },
        { pilot: "DedalosFPV", time: 50.564, points: 10 },
        { pilot: "tomahok", time: 66.467, points: 8 },
        { pilot: "Liapos", time: 70.629, points: 6 },
        { pilot: "dimbazus", time: 71.886, points: 4 },
        { pilot: "Agorastos", time: 77.166, points: 2 },
        { pilot: "fpvchucky", time: 160.283, points: 1 }
      ],
      winner: "Exo_FPV", best_time: 38.31, pilots_count: 10, records_broken: 67,
      quads: { Exo_FPV: "Bahamut", anthunder: "Bahamut", ZOUP: "Five33 Switchback", TettixPro: "Bahamut", DedalosFPV: "Bahamut", tomahok: "Five33 Switchback", Liapos: "Bahamut", dimbazus: "SniperX", Agorastos: "Bahamut", fpvchucky: "Bahamut" } },
    { date: "2026-10-17T20:41:59.014846", track: "SimRushWeek2", class: "5inch",
      results: [
        { pilot: "ZOUP", time: 78.055, points: 25 },
        { pilot: "Exo_FPV", time: 78.546, points: 18 },
        { pilot: "TettixPro", time: 85.841, points: 15 },
        { pilot: "DedalosFPV", time: 102.158, points: 12 },
        { pilot: "tomahok", time: 128.807, points: 10 },
        { pilot: "Cbeikos", time: 132.451, points: 8 },
        { pilot: "Agorastos", time: 134.332, points: 6 },
        { pilot: "Liapos", time: 140.24, points: 4 },
        { pilot: "dimbazus", time: 141.878, points: 2 },
        { pilot: "fpvchucky", time: 377.356, points: 1 }
      ],
      winner: "ZOUP", best_time: 78.055, pilots_count: 10, records_broken: 87,
      quads: { ZOUP: "Bahamut", Exo_FPV: "Bahamut", TettixPro: "Five33 Switchback", DedalosFPV: "Bahamut", tomahok: "Five33 Switchback", Cbeikos: "Five33 Switchback", Agorastos: "BetaFPV 75x", Liapos: "Bahamut", dimbazus: "Bahamut", fpvchucky: "Bahamut" } },
    { date: "2026-10-24T18:06:02.064241", track: "SimRushWeek3", class: "5inch",
      results: [
        { pilot: "Exo_FPV", time: 39.312, points: 25 },
        { pilot: "ZOUP", time: 40.165, points: 18 },
        { pilot: "TettixPro", time: 42.241, points: 15 },
        { pilot: "DedalosFPV", time: 48.537, points: 12 },
        { pilot: "Cbeikos", time: 56.123, points: 10 },
        { pilot: "tomahok", time: 63.578, points: 8 },
        { pilot: "dimbazus", time: 65.008, points: 6 },
        { pilot: "Agorastos", time: 67.587, points: 4 },
        { pilot: "Liapos", time: 73.075, points: 2 },
        { pilot: "Torque72", time: 110.281, points: 1 }
      ],
      winner: "Exo_FPV", best_time: 39.312, pilots_count: 13, records_broken: 71,
      quads: { Exo_FPV: "Bahamut", ZOUP: "Bahamut", TettixPro: "Carbix Zero", DedalosFPV: "Bahamut", Cbeikos: "Five33 Switchback", tomahok: "Five33 Switchback", dimbazus: "Bahamut", Agorastos: "Carbix Zero", Liapos: "Bahamut", Torque72: "Five33 Switchback", gkfpv13: null, fpvchucky: "Carbix Zero", Bakarim: "TBS Oblivion" } },
    { date: "2026-10-31T18:06:03.392199", track: "SimRushWeek-4", class: "5inch",
      results: [
        { pilot: "ZOUP", time: 76.192, points: 25 },
        { pilot: "Exo_FPV", time: 77.595, points: 18 },
        { pilot: "TettixPro", time: 90.149, points: 15 },
        { pilot: "DedalosFPV", time: 93.657, points: 12 },
        { pilot: "Cbeikos", time: 115.225, points: 10 },
        { pilot: "dimbazus", time: 134.78, points: 8 },
        { pilot: "Liapos", time: 150.967, points: 6 },
        { pilot: "Agorastos", time: 188.394, points: 4 },
        { pilot: "Torque72", time: 214.556, points: 2 },
        { pilot: "Pontikos", time: 221.562, points: 1 }
      ],
      winner: "ZOUP", best_time: 76.192, pilots_count: 11, records_broken: 71,
      quads: { ZOUP: "Bahamut", Exo_FPV: "Bahamut", TettixPro: "Five33 Switchback", DedalosFPV: "Bahamut", Cbeikos: "Five33 Switchback", dimbazus: "Bahamut", Liapos: "Bahamut", Agorastos: "Carbix Zero", Torque72: "Five33 Switchback", Pontikos: null, Gaston_FPV: "Five33 Switchback" } }
  ],
  // Το fallback είναι snapshot ΜΟΝΟ για να μη μένει άδειο το layout σε offline mode.
  // Duels/feed/POTW δεν μπαίνουν εδώ επίτηδες: fabricated μονομαχίες σε offline
  // προβολή θα παραπλανούσαν. Σε error state αυτά τα sections δείχνουν empty state.
  duels: [],
  improvements: [],
  pilot_stats: {},
  pilot_of_the_week: null,
  hot_battles: []
};

const GATEWAY_URL =
 window.DRH_CONFIG?.DATA_GATEWAY_URL ||
  "https://drh-data-gateway.alefas9.workers.dev/data";

const DATA_URL = "https://raw.githubusercontent.com/alefas9/velocidrone-bot-data/main/site_data.json";
// Το GitHub API σερβίρει το ίδιο αρχείο με cache μόνο 60" (το raw.githubusercontent
// έχει CDN cache 5' και ΑΓΝΟΕΙ τα query params — ο cache-buster εκεί δεν δουλεύει).
const API_URL = "https://api.github.com/repos/alefas9/velocidrone-bot-data/contents/site_data.json";
const REFRESH_MS = 2 * 60 * 1000;
const DEFAULT_CLASS = "5inch";

// ---- class helpers -----------------------------------------------------------

// Pretty labels per class; unknown classes get a best-effort prettified name.
const CLASS_LABELS = {
  "5inch": '5"',
  "tinywhoop": "TinyWhoop",
  "whoop": "TinyWhoop",
  "micro": "Micro",
  "7inch": '7"'
};
function classLabel(cls) {
  if (CLASS_LABELS[cls]) return CLASS_LABELS[cls];
  return String(cls).replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Union of class keys from every place they can appear in the payload.
// `5inch` always first (default), then whatever else the bot exports, in
// first-seen order. TinyWhoop (or anything new) shows up automatically.
function discoverClasses(d) {
  const found = [];
  const push = (c) => { if (c && !found.includes(c)) found.push(c); };
  Object.keys(d.current_leaderboard || {}).forEach(push);
  Object.keys(d.season_standings || {}).forEach(push);
  (d.history || []).forEach(h => push(h.class || DEFAULT_CLASS));
  if (!found.length) found.push(DEFAULT_CLASS);
  found.sort((a, b) => (a === DEFAULT_CLASS ? -1 : b === DEFAULT_CLASS ? 1 : 0));
  return found;
}

// ---- derived data (per class) ------------------------------------------------

function computeDerived(d, cls) {
  cls = cls || DEFAULT_CLASS;
  const standings = (d.season_standings && d.season_standings[cls]) || [];
  const currentLb = (d.current_leaderboard && d.current_leaderboard[cls]) || [];

  // history weeks of THIS class only — untagged entries count as the default class
  const weeks = (d.history || [])
    .filter(h => (h.class || DEFAULT_CLASS) === cls)
    .map((h, i) => ({
      n: i + 1,
      label: "W" + (i + 1),
      track: h.track,
      date: h.date,
      winner: h.winner,
      best: h.best_time,
      records: h.records_broken || 0,
      pilots: h.pilots_count || (h.results || []).length,
      results: (h.results || []).map((r, j) => ({ ...r, rank: j + 1 })),
      quads: h.quads || {}
    }));

  // cumulative points progression per pilot
  const progression = {}; // pilot -> [cumPoints after each week]
  const pilots = new Set();
  weeks.forEach(w => w.results.forEach(r => pilots.add(r.pilot)));
  pilots.forEach(p => progression[p] = []);
  const cum = {};
  [...pilots].forEach(p => (cum[p] = 0));
  weeks.forEach(w => {
    w.results.forEach(r => (cum[r.pilot] = (cum[r.pilot] || 0) + (r.points || 0)));
    [...pilots].forEach(p => progression[p].push(cum[p] || 0));
  });
  // pilots in standings but never in a week's results (new season, no flights yet):
  // give them a flat zero line so charts/lookups never hit undefined.
  standings.forEach(s => { if (!progression[s.pilot]) progression[s.pilot] = weeks.map(() => 0); });

  // per-pilot profile cards — built from standings AND current leaderboard,
  // so a brand-new pilot with no season points still opens a drawer.
  const profiles = {};
  const profileSeeds = new Map();
  standings.forEach(s => profileSeeds.set(s.pilot, { ...s }));
  currentLb.forEach(r => {
    if (!profileSeeds.has(r.pilot)) profileSeeds.set(r.pilot, { pilot: r.pilot, points: 0, wins: 0, podiums: 0, best: null });
  });
  profileSeeds.forEach((s, name) => {
    const weekResults = weeks.map(w => w.results.find(r => r.pilot === name)).map((r, i) => r ? { week: i + 1, ...r } : null);
    const quadsUsed = [...new Set(weeks.map(w => w.quads[name]).filter(Boolean))];
    const cur = currentLb.find(r => r.pilot === name);
    if (cur && cur.quad && !quadsUsed.includes(cur.quad)) quadsUsed.push(cur.quad);
    profiles[name] = {
      ...s,
      weeks: weekResults,
      quads: quadsUsed,
      appearances: weekResults.filter(Boolean).length,
      avgRank: (() => {
        const ranks = weekResults.filter(Boolean).map(r => r.rank);
        return ranks.length ? (ranks.reduce((x, y) => x + y, 0) / ranks.length).toFixed(1) : "—";
      })(),
      form: weekResults.filter(Boolean).slice(-3).map(r => r.rank)
    };
  });

  // quad meta
  const quadCount = {};
  weeks.forEach(w => Object.values(w.quads || {}).forEach(q => { if (q) quadCount[q] = (quadCount[q] || 0) + 1; }));
  currentLb.forEach(r => { if (r.quad) quadCount[r.quad] = (quadCount[r.quad] || 0) + 1; });

  const totalRecords = weeks.reduce((s, w) => s + (w.records || 0), 0);
  const totalPoints = standings.reduce((s, p) => s + (p.points || 0), 0);
  const seasonBest = weeks.length ? Math.min(...weeks.map(w => (w.best == null ? Infinity : w.best))) : null;

  // next track estimate: weekly drop, Sat ~18:00 local, from last history date (any class)
  const allWeeks = d.history || [];
  const lastDate = allWeeks.length ? new Date(allWeeks[allWeeks.length - 1].date) : new Date();
  let next = new Date(lastDate);
  next.setDate(next.getDate() + 7);
  const now = new Date();
  if (next < now) { // already passed — next Saturday from now
    next = new Date(now);
    next.setDate(next.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
    next.setHours(18, 0, 0, 0);
  }

  // title fight: top-2 — tolerate classes with 0 or 1 pilot
  const s1 = standings[0] || null;
  const s2 = standings[1] || null;

  // ---- v2 fields (από το νέο export του bot — όλα optional, με safe defaults)

  // track -> class map, για να φιλτράρεται το improvement feed ανά κλάση
  const trackClass = {};
  (d.history || []).forEach(h => { trackClass[h.track] = h.class || DEFAULT_CLASS; });

  // improvement feed: PB events της κλάσης (ή track που δεν έχει ταξινομηθεί ακόμα)
  const feed = (d.improvements || []).filter(r => !trackClass[r.track] || trackClass[r.track] === cls);

  // per-pilot PB σύνοψη -> μέσα στα profiles
  Object.values(profiles).forEach(p => {
    const st = (d.pilot_stats || {})[p.pilot];
    p.pbs = st ? st.pbs : 0;
    p.tracksImproved = st ? st.tracks_improved : 0;
    p.bestImprovementPct = st ? st.best_improvement_pct : 0;
  });

  return {
    cls,
    weeks, progression, profiles, quadCount, totalRecords, totalPoints, seasonBest,
    standings, currentLb,
    nextTrackAt: next.toISOString(),
    currentTrack: d.current_track || null,
    titleFight: { a: s1, b: s2, gap: s1 && s2 ? s1.points - s2.points : null },
    feed,
    potw: d.pilot_of_the_week || null,
    hotBattles: d.hot_battles || []
  };
}

// ---- loader --------------------------------------------------------------------

let state = {
  data: null,          // raw payload
  classes: [DEFAULT_CLASS],
  derivedByClass: {},  // cls -> derived
  error: false,
  updatedAt: null
};
let initStarted = false;

function buildState(json, error) {
  const classes = discoverClasses(json);
  const derivedByClass = {};
  classes.forEach(c => { derivedByClass[c] = computeDerived(json, c); });
  state = { data: json, classes, derivedByClass, error, updatedAt: new Date() };
}


async function fetchNow() {
  try {
    let json = null;

    // 1. Cloudflare Gateway — primary source
    try {
      const res = await fetch(GATEWAY_URL, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("Gateway status " + res.status);
      }

      json = await res.json();

      if (!json || typeof json !== "object" ||
          !json.season_standings || !json.current_leaderboard) {
        throw new Error("Invalid Gateway payload");
      }

      console.info("[DRH] Data loaded from Cloudflare Gateway");
    } catch (gatewayError) {
      console.warn("[DRH] Gateway unavailable:", gatewayError.message);

      // 2. GitHub API — backup source
      let res = await fetch(API_URL, {
        headers: { Accept: "application/vnd.github.raw" },
        cache: "no-store"
      });

      // 3. GitHub Raw — backup for rate limits
      if (res.status === 403 || res.status === 429) {
        res = await fetch(DATA_URL + "?t=" + Date.now(), {
          cache: "no-store"
        });
      }

      if (!res.ok) {
        throw new Error("GitHub status " + res.status);
      }

      json = await res.json();
    }

    // Validate all incoming data
    if (!json || typeof json !== "object" ||
        !json.season_standings || !json.current_leaderboard) {
      throw new Error("Unexpected payload shape");
    }

    if (!json.history) {
      json.history = state.data ? state.data.history : FALLBACK.history;
    }

    if (!json.duels) json.duels = [];

    buildState(json, false);

  } catch (e) {
    console.warn("[DRH] Live fetch failed, using fallback:", e.message);
    buildState(state.data || FALLBACK, true);
  }

  return state;
}


async function initData() {
  if (!initStarted) {
    initStarted = true;
    await fetchNow();
    setInterval(fetchNow, REFRESH_MS);
  }
  return state;
}
