# DRH — DESIGN RULES (Style Guide)

_Έκδοση 1.0 · 2026-11-05 · Ισχύει για κάθε αλλαγή στο site από εδώ και πέρα._

> **Κανόνας-οροφή:** τίποτα καινούργιο δεν μπαίνει στο site αν δεν χρησιμοποιεί τα tokens αυτού του εγγράφου. Κανένα hardcoded hex, κανένα ελεύθερο px εκτός σκάλας, κανένα inline `style="..."` στο `app.js` για στοιχεία που καλύπτει token.

---

## 1. Χρώματα

### 1.1 Backgrounds — 4 επίπεδα, τέλος

| Token | Τιμή | Χρήση |
|---|---|---|
| `--bg` | `#0a0a0f` | Φόντο σελίδας |
| `--surface-1` | `#141419` | Cards, βασικές επιφάνειες |
| `--surface-2` | `#1a1a22` | Elevated: εσωτερικά micro-cards, drawer headers |
| `--surface-3` | `#22222c` | Hover επιφάνειες, active states |

Αντικαθιστά τα σημερινά `#0d0d13`, `#101018`, `#111119`, `#15151f`, `#161620`, `#131420`, `#08080d` κ.ά. (εκκρεμεί ενοποίηση — βλ. §8).

### 1.2 Κείμενο — 4 επίπεδα

| Token | Τιμή | Χρήση |
|---|---|---|
| `--text` | `#ffffff` | Τίτλοι, κύριο κείμενο, data υψηλής έμφασης |
| `--text-2` | `rgba(255,255,255,.72)` | Δευτερεύον κείμενο |
| `--text-3` | `rgba(255,255,255,.55)` | Muted: meta πληροφορίες, labels |
| `--text-dim` | `rgba(255,255,255,.4)` | Πολύ αδύναμο: placeholders, disabled |

Τα `#cbd5e1`, `#aab2d0`, και τα ενδιάμεσα `.35/.45/.5/.6` ενοποιούνται στα παραπάνω.

### 1.3 Accents — κάθε χρώμα σημαίνει κάτι

| Token | Τιμή | Σημασιολογικός ρόλος |
|---|---|---|
| `--cyan` | `#22d3ee` | Primary: live, data, ενεργά tabs, links, sync |
| `--fuchsia` | `#e879f9` | Secondary: pair του gradient, ιδιαίτερες επισημάνσεις |
| `--violet` | `#a78bfa` | Editorial: Race Director, notes, ανακοινώσεις |
| `--yellow` | `#facc15` | Νίκες, 1η θέση, records, πρωταθλητής |
| `--emerald` | `#34d399` | Θετικό: βελτίωση, PB, wins, άνοδος |
| `--red` | `#ef4444` | Αρνητικό: ήττα, πτώση, live alert |
| `--orange` | `#fb923c` | Hot: hot battles, στενά gaps, προσοχή |
| `--amber` | `#f59e0b` | 3η θέση / bronze, δευτερεύουσες διακρίσεις |

**Κανόνες:**
- Δεν διαλέγουμε accent «για ομορφιά» — πάντα σημασιολογικά.
- Gradients: μόνο `cyan → fuchsia` (primary) — κανένα άλλο ζεύγος χωρίς απόφαση.
- Tinted backgrounds: `rgba(<accent>,.12)` για chips/badges, `rgba(<accent>,.05)` για subtle card tint.

### 1.4 Borders

| Token | Τιμή | Χρήση |
|---|---|---|
| `--line` | `rgba(255,255,255,.08)` | Default border cards/rows |
| `--line-strong` | `rgba(255,255,255,.14)` | Hover, ενεργά στοιχεία |
| `--line-accent` | `rgba(34,211,238,.22)` | Accent outlines (cyan) |

---

## 2. Border-radius — 5 τιμές, τέλος

| Token | Τιμή | Χρήση |
|---|---|---|
| `--r-sm` | `8px` | Chips, inputs, μικρά στοιχεία |
| `--r-md` | `12px` | Buttons, standard cards |
| `--r-lg` | `16px` | Μεγάλες cards, drawer |
| `--r-xl` | `24px` | Hero blocks, podium |
| `--r-pill` | `999px` | Tags, pills, badges |

Οι τιμές 5/6/7/9/10/14/18/20/26/28/32px και `99px` είναι legacy — ενοποιούνται στην πλησιέστερη της σκάλας. Το `50%` επιτρέπεται μόνο για τέλειους κύκλους (avatars, dots).

---

## 3. Τυπογραφία

### 3.1 Fonts ανά ρόλο (δεν αλλάζουν)

| Font | Ρόλος |
|---|---|
| `--font-display` (Archivo) | Τίτλοι sections, hero, μεγάλα νούμερα (podium, stats) |
| `--font-mono` (JetBrains Mono) | Data: χρόνοι, positions, points, labels, timestamps |
| `--font-body` (Inter) | Παράγραφοι, RD notes, κείμενα |

### 3.2 Κλειστή σκάλα μεγεθών

| Token | Τιμή | Χρήση |
|---|---|---|
| `--fs-micro` | `10px` | Micro-labels, overlines |
| `--fs-label` | `11px` | Labels, chips, meta |
| `--fs-small` | `12px` | Secondary text, feed meta |
| `--fs-body` | `13px` | Default κείμενο/πίνακες |
| `--fs-body-lg` | `14px` | RD notes, έμφαση κειμένου |
| `--fs-h3` | `16px` | Τίτλοι cards |
| `--fs-h2` | `20px` | Τίτλοι ενοτήτων (mobile base) |
| `--fs-stat` | `24px` | Μεγάλα στατιστικά |

Display/hero μεγέθη: μόνο `clamp()` (υπάρχοντα pattern) — ποτέ σταθερό px πάνω από 24.
Τα `11.5px`, `14.5px`, `19px` είναι legacy → πλησιέστερη τιμή σκάλας.

### 3.3 Weights

| Weight | Χρήση |
|---|---|
| 400 | Body κείμενο |
| 700 | Έμφαση, data values |
| 800 | Τίτλοι cards |
| 900 | Μόνο display/hero |

### 3.4 Uppercase labels — ένα standard

```css
font-family: var(--font-mono);
font-size: var(--fs-micro);   /* ή --fs-label */
letter-spacing: .12em;
text-transform: uppercase;
color: var(--text-3);
```

Όλα τα `.06em–.35em` ενοποιούνται στο `.12em`. Αρνητικό tracking (`-.03em`) μόνο σε display τίτλους.

---

## 4. Κουμπιά — ένα base + variants

```css
.btn{
  padding: 12px 18px;
  border-radius: var(--r-md);
  font: 700 var(--fs-body) var(--font-body);
  transition: transform .2s, box-shadow .2s;
}
```

| Variant | Στυλ |
|---|---|
| `.btn-primary` | Gradient `cyan → fuchsia`, σκούρο κείμενο `#0a0a0f`, glow cyan |
| `.btn-ghost` | `border: 1px solid var(--line)`, `--text-2`, hover → `--line-strong` |

**Απαγορεύεται** δεύτερο `.btn` block — οποιαδήποτε αλλαγή γίνεται στο ένα base rule.

---

## 5. Spacing — πολλαπλάσια του 4

| Token | Τιμή |
|---|---|
| `--s-1` | `4px` |
| `--s-2` | `8px` |
| `--s-3` | `12px` |
| `--s-4` | `16px` |
| `--s-5` | `24px` |
| `--s-6` | `32px` |
| `--s-7` | `48px` |

Gaps, paddings, margins μόνο από τη σκάλα (ή `clamp()` για section spacing). Οι τιμές 6/7/10/14/18/20/28/34px είναι legacy.

---

## 6. Shadows & Glows — 3 επίπεδα

| Token | Τιμή | Χρήση |
|---|---|---|
| `--shadow-card` | `0 8px 30px rgba(0,0,0,.55)` | Cards, floating στοιχεία |
| `--shadow-pop` | `0 24px 80px rgba(0,0,0,.5)` | Drawer, toast, overlays |
| `--glow-cyan` | `0 0 44px rgba(34,211,238,.2)` | Accent glows (και fuchsia αντίστοιχο) |

---

## 7. Components — σταθερές συμβάσεις

- **Tag/pill:** `--r-pill`, `--fs-label` mono uppercase, tinted bg του σημασιολογικού accent.
- **Card:** `--surface-1`, `--line`, `--r-md` (ή `--r-lg` αν full-width section card).
- **Micro-card (stats grid):** `--surface-2`, `--r-sm`, τιμή mono 700.
- **Section head:** kick (uppercase micro, cyan) → h2 display 800 → περιγραφή `--text-3`.
- **Θέση podium:** 1η=yellow, 2η=`--text-2`, 3η=amber.
- **Delta/μεταβολές:** θετικό=emerald, αρνητικό=red, ουδέτερο=`--text-3`.

---

## 8. Εκκρεμείς ενοποιήσεις (επόμενα βήματα, με preview πριν από καθεμία)

1. 10 legacy σκούρα backgrounds → `--surface-*` (θα αλλάξει ελάχιστα η απόχρωση ορισμένων cards).
2. 28 τιμές radius → 5 tokens.
3. Legacy font-sizes (11.5/14.5/19px) → σκάλα.
4. Letter-spacing `.06–.35em` → `.12em`.
5. Spacing εκτός σκάλας (6/7/10/14/18/20/28/34px) → σκάλα.
6. 52 inline styles του `app.js` → classes με tokens.
7. Μεμονωμένα hardcoded hex (π.χ. `#feed`, `#06121a`, `#1a0618`, `#221a00`) → tokens ή σημασιολογικά accents.

Κάθε μία από αυτές γίνεται ξεχωριστά, με screenshot preview πριν εφαρμοστεί.
