#!/usr/bin/env python3
"""
fix-all-nav-footer.py — Fixt Navigation + Footer auf ALLEN Seiten.

1. h5 → h4 in Footer-Überschriften
2. Pinterest-Deadlinks entfernt
3. .html-Endungen in Footer-Links entfernt (einheitliche 3-Spalten-Struktur)
4. Einheitlicher Footer: Navigation, Social, Rechtliches
5. .html-Endungen in Navigation (oben) entfernt (betrifft v.a. Journal-Seiten)

Anleitung:
1. Lege diese Datei ins dist-Verzeichnis
2. python3 fix-all-nav-footer.py
3. Stichprobe prüfen
4. git add -A && git commit -m "Nav + Footer: .html entfernt, einheitlich" && git push
"""
import glob
import os


# ═══ HELPERS ═══

def get_prefix(filepath):
    parts = filepath.replace("\\", "/").split("/")
    if len(parts) >= 2 and parts[-2] in ("reportagen", "journal"):
        return "../"
    return ""

def get_contact_link(prefix):
    if prefix == "../":
        return "/#contact"
    return "#contact"

def build_footer_links(prefix):
    contact = get_contact_link(prefix)
    return f'''    <div class="footer-links">
      <div class="footer-col">
        <h4>Navigation</h4>
        <a href="{prefix}portfolio">Portfolio</a>
        <a href="{prefix}ueber-mich">Über mich</a>
        <a href="{prefix}preise">Preise</a>
        <a href="{prefix}faq">FAQ</a>
        <a href="{prefix}journal">Journal</a>
        <a href="{contact}">Kontakt</a>
      </div>
      <div class="footer-col">
        <h4>Social</h4>
        <a href="https://www.instagram.com/hochzeitsfotografin.natalia/" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
      <div class="footer-col">
        <h4>Rechtliches</h4>
        <a href="{prefix}impressum">Impressum</a>
        <a href="{prefix}datenschutz">Datenschutz</a>
      </div>
    </div>'''


# ═══ FIX 1-4: FOOTER ═══

def fix_footer(content, filepath):
    if '<div class="footer-links">' not in content:
        return content

    prefix = get_prefix(filepath)
    new_links = build_footer_links(prefix)

    start_marker = '<div class="footer-links">'
    start_idx = content.find(start_marker)
    if start_idx == -1:
        return content

    end_marker = '<div class="footer-bottom">'
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        return content

    before = content[:start_idx]
    after = content[end_idx:]
    replacement = new_links + "\n  </div>\n  "

    return before + replacement + after


# ═══ FIX 5: NAVIGATION .html ENTFERNEN ═══

def fix_nav_html(content):
    """Entfernt .html-Endungen aus Navigationslinks."""
    # Bekannte Seiten die von ../pagename.html → ../pagename werden sollen
    pages = [
        "portfolio", "ueber-mich", "preise", "faq",
        "journal", "impressum", "datenschutz"
    ]

    for page in pages:
        # ../pagename.html" → ../pagename"
        content = content.replace(f'../{page}.html"', f'../{page}"')
        # ../pagename.html# → ../pagename# (für Anker-Links)
        content = content.replace(f'../{page}.html#', f'../{page}#')

    # ../index.html#contact → /#contact
    content = content.replace('../index.html#contact', '/#contact')
    # ../index.html" → /" (Logo-Link zur Startseite)
    content = content.replace('../index.html"', '/"')

    # Journal-interne Links: pagename.html# → # (z.B. hochzeitsalbum.html# → #)
    # Das sind die kaputten Pinterest-Links im Format dateiname.html#
    import re
    content = re.sub(r'href="[a-z0-9-]+\.html#"', 'href="#"', content)

    return content


# ═══ MAIN ═══

def main():
    html_files = glob.glob("**/*.html", recursive=True)

    if not html_files:
        print("❌ Keine HTML-Dateien gefunden. Bist du im dist-Ordner?")
        return

    updated = 0
    skipped = 0

    for filepath in sorted(html_files):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        original = content

        # Fix 1-4: Footer vereinheitlichen
        content = fix_footer(content, filepath)

        # Fix 5: .html aus Navigation entfernen
        content = fix_nav_html(content)

        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updated += 1
            prefix = get_prefix(filepath)
            print(f"  ✅ {filepath} (prefix: '{prefix}')")
        else:
            print(f"  ⏭  {filepath} (keine Änderung)")
            skipped += 1

    print(f"\n{'='*50}")
    print(f"✅ Aktualisiert: {updated}")
    print(f"⏭  Übersprungen:  {skipped}")
    print(f"{'='*50}")

    if updated > 0:
        print("\nNächste Schritte:")
        print("  1. Stichprobe: öffne 1-2 Seiten im Browser")
        print("  2. git add -A")
        print('  3. git commit -m "Nav + Footer: .html entfernt, einheitlich"')
        print("  4. git push")
        print("  5. rm fix-all-nav-footer.py && git add -A && git commit -m 'Cleanup' && git push")


if __name__ == "__main__":
    main()
