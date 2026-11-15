/* DRH broadcast indicator: only authentic Race Director data activates signal. */
(() => {
  "use strict";
  const indicator = document.getElementById("drh-broadcast-signal");
  const label = document.getElementById("drh-broadcast-signal-label");
  const station = document.getElementById("drh-inline-duels");
  if (!indicator || !label || !station || typeof MutationObserver === "undefined") return;
  let scheduled = false;
  function update() {
    scheduled = false;
    const authentic = !!station.querySelector(".drh-radio-item:not(.drh-radio-waiting)");
    indicator.classList.toggle("is-active", authentic);
    label.textContent = authentic ? "RACE CONTROL / OFFICIAL UPDATE" : "RACE CONTROL / STANDBY";
  }
  const observer = new MutationObserver(() => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  });
  observer.observe(station, {childList:true,subtree:true});
  update();
})();
