#!/usr/bin/env python3
"""
update-capi-v2.py — Aktualisiert den CAPI-Block in ALLEN HTML-Dateien.

Erkennt sowohl den alten v1-Block als auch den v2-Block OHNE country
und ersetzt beide durch die finale Version mit country: "de".

Anleitung:
1. Lege diese Datei ins Root deines Repos (wo index.html liegt)
2. Führe aus: python3 update-capi-v2.py
3. Prüfe: git diff
4. Commit: git add -A && git commit -m "CAPI v2.1: country-Parameter" && git push
"""

import os
import glob

# ── Alter v1-Block ──
OLD_V1 = '''<!-- CAPI Server-Side Tracking -->
<script>
(function() {
  var CAPI_WORKER_URL = "https://meta-capi.icy-sunset-af0f.workers.dev";

  function generateEventId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
  }
  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }
  function getFbcFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get("fbclid");
    if (fbclid) return "fb.1." + Date.now() + "." + fbclid;
    return null;
  }

  // Send event to CAPI Worker only (pixel fires separately)
  window.sendCAPIEvent = function(eventName, eventId, customData, userData) {
    customData = customData || {};
    userData = userData || {};
    var payload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      event_id: eventId,
      user_data: { fbp: getCookie("_fbp"), fbc: getCookie("_fbc") || getFbcFromUrl() },
      custom_data: customData
    };
    if (userData.em) payload.user_data.em = userData.em;
    if (userData.fn) payload.user_data.fn = userData.fn;
    if (userData.ln) payload.user_data.ln = userData.ln;
    if (userData.ph) payload.user_data.ph = userData.ph;
    var url = CAPI_WORKER_URL + "/event";
    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    else fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body, keepalive: true }).catch(function() {});
  };

  // PageView with dedup event_id
  var pvId = generateEventId();
  if (typeof fbq !== "undefined") fbq("trackSingle", "1083293176093427", "PageView", {}, { eventID: pvId });
  sendCAPIEvent("PageView", pvId);
})();
</script>'''

# ── v2-Block OHNE country (falls schon mit update-capi.py aktualisiert) ──
OLD_V2_NO_COUNTRY = '''      external_id: getCookie("_ext_id") || externalId
      // client_ip_address + client_user_agent werden vom Worker
      // aus den Request-Headers extrahiert'''

NEW_V2_WITH_COUNTRY = '''      external_id: getCookie("_ext_id") || externalId,
      country: "de"
      // client_ip_address + client_user_agent werden vom Worker
      // aus den Request-Headers extrahiert'''

# ── Kompletter neuer Block (für v1 → v2.1 Ersetzung) ──
NEW_BLOCK = '''<!-- CAPI Server-Side Tracking v2 — fbp-Garantie + external_id + country -->
<script>
(function() {
  var CAPI_WORKER_URL = "https://meta-capi.icy-sunset-af0f.workers.dev";

  // ── Hilfsfunktionen ──
  function generateEventId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 10);
  }
  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }
  function setCookie(name, value, days) {
    var maxAge = days * 86400;
    document.cookie = name + "=" + encodeURIComponent(value) + ";max-age=" + maxAge + ";path=/;SameSite=Lax";
  }
  function getFbcFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get("fbclid");
    if (fbclid) return "fb.1." + Date.now() + "." + fbclid;
    return null;
  }

  // ── 1. _fbp SELBST GENERIEREN wenn nicht vorhanden ──
  function ensureFbp() {
    var existing = getCookie("_fbp");
    if (existing) return existing;
    var fbp = "fb.1." + Date.now() + "." + (Math.floor(Math.random() * 2147483647) + 1);
    setCookie("_fbp", fbp, 90);
    return fbp;
  }

  // ── 2. external_id — stabiler Pseudonym-Identifier ──
  function ensureExternalId() {
    var existing = getCookie("_ext_id");
    if (existing) return existing;
    var id = "nt_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 12);
    setCookie("_ext_id", id, 180);
    return id;
  }

  var fbp = ensureFbp();
  var externalId = ensureExternalId();

  // ── 3. sendCAPIEvent — alle Match-Keys ──
  window.sendCAPIEvent = function(eventName, eventId, customData, userData) {
    customData = customData || {};
    userData = userData || {};

    var user_data = {
      fbp: getCookie("_fbp") || fbp,
      fbc: getCookie("_fbc") || getFbcFromUrl(),
      external_id: getCookie("_ext_id") || externalId,
      country: "de"
      // client_ip_address + client_user_agent werden vom Worker
      // aus den Request-Headers extrahiert
    };

    if (userData.em) user_data.em = userData.em;
    if (userData.fn) user_data.fn = userData.fn;
    if (userData.ln) user_data.ln = userData.ln;
    if (userData.ph) user_data.ph = userData.ph;

    var payload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      event_id: eventId,
      user_data: user_data,
      custom_data: customData
    };

    var url = CAPI_WORKER_URL + "/event";
    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body, keepalive: true }).catch(function() {});
    }
  };

  // ── 4. PageView mit garantiertem fbp ──
  var pvId = generateEventId();
  if (typeof fbq !== "undefined") fbq("trackSingle", "1083293176093427", "PageView", {}, { eventID: pvId });
  sendCAPIEvent("PageView", pvId);
})();
</script>'''


def main():
    html_files = glob.glob("**/*.html", recursive=True)

    if not html_files:
        print("❌ Keine HTML-Dateien gefunden. Bist du im richtigen Verzeichnis?")
        return

    updated_v1 = 0
    updated_v2 = 0
    already_done = 0
    skipped = 0

    for filepath in sorted(html_files):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Schon mit country?
        if 'country: "de"' in content and "CAPI Server-Side Tracking v2" in content:
            already_done += 1
            print(f"  ⏭  {filepath} (bereits aktuell)")
            continue

        # Fall 1: Noch alter v1-Block → komplett ersetzen
        if OLD_V1 in content:
            content = content.replace(OLD_V1, NEW_BLOCK)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updated_v1 += 1
            print(f"  ✅ {filepath} (v1 → v2.1)")
            continue

        # Fall 2: v2-Block ohne country → nur country einfügen
        if OLD_V2_NO_COUNTRY in content:
            content = content.replace(OLD_V2_NO_COUNTRY, NEW_V2_WITH_COUNTRY)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            updated_v2 += 1
            print(f"  ✅ {filepath} (v2 + country)")
            continue

        skipped += 1
        print(f"  ⚠️  {filepath} (kein CAPI-Block gefunden)")

    print(f"\n{'='*50}")
    print(f"✅ v1 → v2.1:     {updated_v1}")
    print(f"✅ v2 + country:  {updated_v2}")
    print(f"⏭  Bereits aktuell: {already_done}")
    print(f"⚠️  Übersprungen:    {skipped}")
    print(f"{'='*50}")

    if updated_v1 + updated_v2 > 0:
        print("\nNächste Schritte:")
        print("  1. git diff")
        print("  2. git add -A")
        print('  3. git commit -m "CAPI v2.1: country-Parameter für besseren EMQ"')
        print("  4. git push")


if __name__ == "__main__":
    main()
