# PATCH για το export_site_data.py του bot σου
#
# ΠΡΟΒΛΗΜΑ: Η γραμμή 192-198 εξάδει ΜΟΝΟ τα ενεργά (μη-resolved) duels:
#
#   active_duels = []
#   if os.path.exists("duels.json"):
#       try:
#           with open("duels.json", encoding="utf-8") as f:
#               active_duels = [d for d in json.load(f) if not d.get("resolved")]
#       except (json.JSONDecodeError, OSError):
#           pass
#
# Γι' αυτό τα λίγα duels που έγιναν (και λύθηκαν) δεν φαίνονται ποτέ στο site.
#
# ΛΥΣΗ: Αντικατέστησε εκείνο το block με αυτό — εξάγει τα ενεργά ΟΛΑ + τα τελευταία 10 resolved:
#
# ---------------------------------------------------------------------------
#   # duels για εμφάνιση στο site: ενεργά + πρόσφατα ολοκληρωμένα
#   site_duels = []
#   if os.path.exists("duels.json"):
#       try:
#           with open("duels.json", encoding="utf-8") as f:
#               all_duels = json.load(f)
#           active = [d for d in all_duels if not d.get("resolved")]
#           resolved = [d for d in all_duels if d.get("resolved")][-10:]  # τελευταία 10
#           site_duels = active + resolved
#       except (json.JSONDecodeError, OSError):
#           pass
# ---------------------------------------------------------------------------
#
# Και στο dict πιο κάτω άλλαξε:
#   "duels": active_duels,   →   "duels": site_duels,
#
# Το site τα ξεχωρίζει μόνο του: ό,τι έχει resolved:true πάει στην ενότητα
# "ΟΛΟΚΛΗΡΩΜΕΝΑ" με 🏆 νικητή, ό,τι έχει resolved:false στο "⚡ ΕΝΕΡΓΑ" με deadline.
# Όταν μαζευτούν πολλά, δείχνει μόνο τα 3 τελευταία resolved — δεν γεμίζει η σελίδα.

# ===========================================================================
# PATCH #2 (2026-11-04): track_reveal + race_director_messages
#
# Το site έχει πλέον δύο νέα blocks που διαβάζουν Ο,ΤΙ τους στείλεις μέσα
# στο site_data.json. Και τα δύο είναι προαιρετικά — αν λείπουν, το site
# δείχνει placeholder (reveal) ή κρύβει την κάρτα (notes), οπότε δεν
# σπάει τίποτα αν δεν προλάβεις το patch.
#
# ---------------------------------------------------------------------------
# 1) TRACK REVEAL — βίντεο παρουσίασης του track της εβδομάδας
#
# Πρόσθεσε στο dict του site_data.json:
#
#   "track_reveal": {
#       "youtube": "https://www.youtube.com/watch?v=XXXXXXX",   # ή σκέτο το video id
#       "track": current_track,        # προαιρετικό — αλλιώς παίρνει το current_track
#       "title": "TRACK REVEAL · ..."  # προαιρετικό
#   },
#
# Αν δεν υπάρχει βίντεο αυτή την εβδομάδα, βάλε "track_reveal": None
# και το site δείχνει «έρχεται σύντομα».
#
# ---------------------------------------------------------------------------
# 2) RACE DIRECTOR NOTES — τα μηνύματα που σήμερα πάνε ΜΟΝΟ στο Discord
#
# Κάθε φορά που το bot στέλνει ανακοίνωση Race Director στο Discord,
# πρόσθεσέ την και σε ένα αρχείο race_director_log.json (max ~30 τελευταία),
# και κάνε την export:
#
#   rd_messages = []
#   if os.path.exists("race_director_log.json"):
#       try:
#           with open("race_director_log.json", encoding="utf-8") as f:
#               rd_messages = json.load(f)[-10:]   # τα 10 πιο πρόσφατα αρκούν
#       except (json.JSONDecodeError, OSError):
#           pass
#
#   # και στο dict:
#   "race_director_messages": rd_messages,
#
# Μορφή κάθε μηνύματος:
#   { "date": "2026-11-04T18:30:00", "text": "...", "tag": "announcement" }
#   - date: ISO string (όπως στα improvements)
#   - text: το ίδιο κείμενο που πάει στο Discord
#   - tag: προαιρετικό (π.χ. "announcement", "duel", "weekly")
#
# Το site τα δείχνει ως 📣 NOTE events στο Community Feed — το νεότερο
# καρφιτσώνεται πάντα στην κορυφή του feed με 📌, τα παλιότερα ρέουν
# κανονικά ανά ημερομηνία. Υπάρχει και φίλτρο «📣 Notes».
# ===========================================================================
