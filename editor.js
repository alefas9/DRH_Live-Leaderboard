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
  if (new URLSearchParams(location.search).get("edit") !== "1") return;

  var POSKEY = "drh_free_v1", TXTKEY = "drh_text_v1", FONTKEY = "drh_font_v1",
      HIDEKEY = "drh_hide_v1", HISTKEY = "drh_hist_v1", REDOKEY = "drh_redo_v1";
  var SEL = [
    ".section-head .kick", ".section-head h2", ".section-head p",
    ".hero-kicker", ".hero-title", ".hero-sub", ".hero-stats", ".hero-cta", ".hero-badge-wrap",
    ".hero-hud", ".hudw", ".hudw .wl", ".cd-cells",
    ".top-nav", ".hero-ticker", ".err-banner", ".class-bar",
    ".card", ".titlefight", ".hof-row", ".card-head img", ".show-more", ".lt-tabs",
    ".side-card", ".side-label", ".week-progress", ".wp-txt", ".wp-bar", ".lb-head",
    ".podium", ".hb-row", ".rd-msg", ".feed-row", ".duel",
    ".arc-controls", ".arc-filter", ".arc-week", ".arc-meta",
    ".timing-grid", ".timing-left", ".paddock-grid", ".reveal-card", ".rc-info",
    ".riv-grid", ".riv-card", ".ribbon", ".ribbon-line", ".hof-f", ".hero-radioline", ".hero-radio", ".hero-cta"
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
  var origDescFS = new WeakMap(); // αρχικά px των descendants — για αναλογικό scaling
  document.querySelectorAll(SEL).forEach(function (el) {
    origHTML[keyFor(el)] = el.innerHTML;
    origFS[keyFor(el)] = parseFloat(getComputedStyle(el).fontSize) || 16;
    var kids = el.querySelectorAll("*");
    for (var i = 0; i < kids.length; i++) {
      if (!origDescFS.has(kids[i])) origDescFS.set(kids[i], parseFloat(getComputedStyle(kids[i]).fontSize) || 16);
    }
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
  function applyFont(el, key, px) {
    var base = origFS[key] || 16;
    var kids = el.querySelectorAll("*");
    if (px == null) {
      el.style.fontSize = "";
      for (var i = 0; i < kids.length; i++) kids[i].style.fontSize = "";
      return;
    }
    el.style.fontSize = px + "px";
    for (var i = 0; i < kids.length; i++) {
      var o = origDescFS.get(kids[i]);
      if (o) kids[i].style.fontSize = (Math.round(px * o / base * 10) / 10) + "px";
    }
  }
  function setFont(key, px) {
    if (px != null && Math.abs(px - origFS[key]) > 0.5) fonts[key] = px; else delete fonts[key];
    var el = findByKey(key);
    if (el) applyFont(el, key, fonts[key] != null ? fonts[key] : null);
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
      if (fonts[k] != null) applyFont(el, k, fonts[k]);
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
      document.querySelectorAll(SEL).forEach(function (el) {
        el.style.translate = ""; el.style.fontSize = ""; el.style.display = "";
        var ks = el.querySelectorAll("*");
        for (var i = 0; i < ks.length; i++) ks[i].style.fontSize = "";
      });
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
