#!/usr/bin/env python3
"""
fix-reportage-links.py — Korrigiert die Footer-Links in allen Reportage-Seiten.

Problem: ../hochzeit-xxx → geht zu /hochzeit-xxx (existiert nicht)
Fix:     hochzeit-xxx    → bleibt in /reportagen/hochzeit-xxx (korrekt)

Nur Dateien im reportagen/-Ordner werden geändert.
Navigationslinks (../portfolio, ../preise etc.) bleiben unverändert.

Anleitung:
1. Lege diese Datei ins dist-Verzeichnis
2. python3 fix-reportage-links.py
3. git add -A && git commit -m "Fix: Footer-Links in Reportagen korrigiert" && git push
"""
import glob
import re

reportage_files = glob.glob("reportagen/*.html")

if not reportage_files:
    print("❌ Keine Dateien in reportagen/ gefunden. Bist du im dist-Ordner?")
    exit()

# These are the reportage slugs that should NOT have ../
reportage_slugs = [
    "hochzeit-goettingen",
    "hochzeit-renthof-kassel",
    "hochzeit-renthof-kassel-ra",
    "hochzeit-sababurg-dornroeschenschloss",
    "hochzeit-bergpark-wilhelmshoehe",
    "hochzeit-schloss-bad-arolsen",
    "hochzeit-schloss-berlepsch",
    "hochzeit-rathaus-kassel",
]

updated = 0

for filepath in sorted(reportage_files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    for slug in reportage_slugs:
        # Fix ../slug → slug (same directory)
        content = content.replace(f'href="../{slug}"', f'href="{slug}"')

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        updated += 1
        print(f"  ✅ {filepath}")
    else:
        print(f"  ⏭  {filepath} (keine Änderung)")

print(f"\n✅ {updated} Dateien korrigiert")
