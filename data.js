// DRH Leaderboard — data layer
// Fetches live from the same source as the React app, with local fallback snapshot.
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
  duels: [
    { pilot_a: 'Exo_FPV', pilot_b: 'ZOUP', track: 'SimRushWeek-5', created_at: '2026-11-01T10:00:00', deadline: '2026-11-04T10:00:00', best_time_a: 39.312, best_time_b: 40.165, resolved: false },
    { pilot_a: 'TettixPro', pilot_b: 'DedalosFPV', track: 'SimRush Week1', created_at: '2026-10-12T10:00:00', deadline: '2026-10-15T10:00:00', best_time_a: 44.709, best_time_b: 50.564, resolved: true },
    { pilot_a: 'tomahok', pilot_b: 'Cbeikos', track: 'SimRushWeek2', created_at: '2026-10-18T10:00:00', deadline: '2026-10-21T10:00:00', best_time_a: 128.807, best_time_b: 132.451, resolved: true }
  ]
};

const DATA_URL = "https://raw.githubusercontent.com/alefas9/velocidrone-bot-data/main/site_data.json";
const REFRESH_MS = 5 * 60 * 1000;

// ---- derived data ----------------------------------------------------------

function computeDerived(d) {
  const weeks = (d.history || []).map((h, i) => ({
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
  let cum = {};
  [...pilots].forEach(p => (cum[p] = 0));
  weeks.forEach(w => {
    w.results.forEach(r => (cum[r.pilot] = (cum[r.pilot] || 0) + (r.points || 0)));
    [...pilots].forEach(p => progression[p].push(cum[p] || 0));
  });

  // head-to-head wins
  const h2h = {};
  const names = [...pilots];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i], b = names[j];
      let aw = 0, bw = 0;
      weeks.forEach(w => {
        const ra = w.results.find(r => r.pilot === a);
        const rb = w.results.find(r => r.pilot === b);
        if (ra && rb) { if (ra.time < rb.time) aw++; else if (rb.time < ra.time) bw++; }
      });
      if (aw + bw > 0) h2h[a + "|" + b] = { a, b, aw, bw };
    }
  }

  // per-pilot profile cards
  const standings = d.season_standings["5inch"] || [];
  const profiles = {};
  standings.forEach(s => {
    const weekResults = weeks.map(w => w.results.find(r => r.pilot === s.pilot)).map((r, i) => r ? { week: i + 1, ...r } : null);
    const quadsUsed = [...new Set(weeks.map(w => w.quads[s.pilot]).filter(Boolean))];
    profiles[s.pilot] = {
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
  (d.current_leaderboard["5inch"] || []).forEach(r => { if (r.quad) quadCount[r.quad] = (quadCount[r.quad] || 0) + 1; });

  const totalRecords = weeks.reduce((s, w) => s + (w.records || 0), 0);
  const totalPoints = standings.reduce((s, p) => s + (p.points || 0), 0);

  // next track estimate: weekly drop, Sat ~18:00 local, from last history date
  const lastDate = weeks.length ? new Date(weeks[weeks.length - 1].date) : new Date();
  let next = new Date(lastDate);
  next.setDate(next.getDate() + 7);
  const now = new Date();
  if (next < now) { // already passed — next week from now
    next = new Date(now);
    next.setDate(next.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
    next.setHours(18, 0, 0, 0);
  }

  // title fight: top-2
  const s1 = standings[0], s2 = standings[1];

  return {
    ...d, weeks, progression, h2h, profiles, quadCount, totalRecords, totalPoints, nextTrackAt: next.toISOString(), titleFight: { a: s1, b: s2, gap: s1.points - s2.points }
  };
}

// ---- loader ----------------------------------------------------------------

let state = { data: null, derived: null, error: false, updatedAt: null };
let initStarted = false;

async function fetchNow() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status " + res.status);
    const json = await res.json();
    if (!json.history) json.history = state.data ? state.data.history : FALLBACK.history;
    state = { data: json, derived: computeDerived(json), error: false, updatedAt: new Date() };
  } catch (e) {
    console.warn("[DRH] live fetch failed, using fallback:", e.message);
    const json = state.data || FALLBACK;
    state = { data: json, derived: computeDerived(json), error: true, updatedAt: new Date() };
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
