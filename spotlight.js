(function(){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.addEventListener("pointermove",function(e){var el=e.target.closest("#live-card,#timing .timing-left .intel-card,#battles .drh-rivalry-panel");if(!el)return;var r=el.getBoundingClientRect();el.style.setProperty("--spot-x",(e.clientX-r.left)+"px");el.style.setProperty("--spot-y",(e.clientY-r.top)+"px");},{passive:true});})();

/* DRH V109: track pointer glow on the real Track Reveal panel. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest('#track-reveal .reveal-card');
    if (!el) return;
    var rect = el.getBoundingClientRect();
    el.style.setProperty('--hex-x', (e.clientX - rect.left) + 'px');
    el.style.setProperty('--hex-y', (e.clientY - rect.top) + 'px');
  }, {passive:true});
})();
