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
