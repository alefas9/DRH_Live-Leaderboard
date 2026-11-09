// Frontend-only editorial configuration. This file does not modify the bot.
// Keys: season:week:normalized-track. Official bot track_reveal video wins.
// Remove entries when the bot starts exporting the official YouTube URL.
window.DRH_SITE_CONFIG = Object.freeze({
  // Verified deployed Cloudflare Worker; GitHub API/raw remain fallback in data.js.
  dataGateway: "https://drh-data-gateway.alefas9.workers.dev/data",
  trackVideos: Object.freeze({
    "2026:6:simrushweek6": "https://www.youtube.com/watch?v=UR-yZRoTbcY"
  })
});
