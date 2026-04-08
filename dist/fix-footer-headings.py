#!/usr/bin/env python3
"""
fix-footer-headings.py — Ändert .footer-col h5 → .footer-col h4 in allen HTML-Dateien.

Anleitung:
1. Lege diese Datei ins dist-Verzeichnis
2. python3 fix-footer-headings.py
3. git add -A && git commit -m "Fix: Footer-Überschriften sichtbar (h5→h4)" && git push
"""
import glob

OLD = ".footer-col h5 {"
NEW = ".footer-col h4 {"

files = glob.glob("**/*.html", recursive=True)
updated = 0

for f in sorted(files):
    with open(f, "r", encoding="utf-8") as fh:
        content = fh.read()
    if OLD in content:
        content = content.replace(OLD, NEW)
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(content)
        updated += 1
        print(f"  ✅ {f}")
    else:
        print(f"  ⏭  {f}")

print(f"\n✅ {updated} Dateien aktualisiert")
