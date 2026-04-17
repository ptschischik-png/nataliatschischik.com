(function() {
  if (window.__contactFormLogicLoaded) return;
  window.__contactFormLogicLoaded = true;

  var siteConfig = window.__NT_SITE_CONFIG || {};
  var workers = siteConfig.workers || {};
  var trackingConfig = siteConfig.tracking || {};
  var adsConfig = trackingConfig.googleAdsConversion || {};
  var debugParam = trackingConfig.debugQueryParam || 'debug_tracking';
  var debugEnabled = new URLSearchParams(window.location.search).get(debugParam) === '1';

  function debugLog(action, payload) {
    if (!debugEnabled) return;
    try {
      console.info('[contact-form]', action, payload || '');
    } catch (e) {}
  }

  function normalizeEmail(value) {
    return (value || '').trim().toLowerCase();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function normalizePhoneToE164(value) {
    var raw = (value || '').trim();
    if (!raw) return '';
    var compact = raw.replace(/[^\d+]/g, '');
    if (compact.indexOf('00') === 0) compact = '+' + compact.slice(2);
    if (compact.charAt(0) !== '+') {
      var digits = compact.replace(/\D/g, '');
      if (digits.charAt(0) === '0') digits = '49' + digits.slice(1);
      compact = '+' + digits;
    } else {
      compact = '+' + compact.slice(1).replace(/\D/g, '');
    }
    if (!/^\+[1-9]\d{7,14}$/.test(compact)) return '';
    return compact;
  }

  function normalizeNamePart(value) {
    return (value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s'-]/g, '')
      .replace(/\s+/g, ' ');
  }

  function parseNameParts(fullName) {
    var cleaned = (fullName || '').replace(/\s+(und|&|\+)\s+/gi, '|');
    var firstPerson = cleaned.split('|')[0] || '';
    var parts = firstPerson.trim().split(/\s+/).filter(Boolean);
    return {
      fn: parts[0] ? normalizeNamePart(parts[0]) : '',
      ln: parts[1] ? normalizeNamePart(parts[1]) : ''
    };
  }

  function toHex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(function(b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function isSha256Hex(value) {
    return /^[a-f0-9]{64}$/.test(value || '');
  }

  async function sha256Hex(value) {
    if (!value) return '';
    var normalized = String(value).trim().toLowerCase();
    if (!normalized) return '';
    if (isSha256Hex(normalized)) return normalized;
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) return '';
    var data = new TextEncoder().encode(normalized);
    var digest = await window.crypto.subtle.digest('SHA-256', data);
    return toHex(digest);
  }

  function showStatus(msg, color) {
    var status = document.getElementById('formStatus');
    if (!status) return;
    status.textContent = msg;
    status.style.color = color;
    status.style.display = 'block';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = days * 86400;
    document.cookie = name + '=' + encodeURIComponent(value) + ';max-age=' + maxAge + ';path=/;SameSite=Lax';
  }

  function readStoredIdentity() {
    var raw = getCookie('_ntu');
    if (!raw) return {};
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function persistIdentityHashes(hashes) {
    var current = readStoredIdentity();
    var merged = {
      em: hashes && hashes.em ? hashes.em : current.em || '',
      ph: hashes && hashes.ph ? hashes.ph : current.ph || '',
      fn: hashes && hashes.fn ? hashes.fn : current.fn || '',
      ln: hashes && hashes.ln ? hashes.ln : current.ln || ''
    };
    var payload = {};
    if (merged.em) payload.em = merged.em;
    if (merged.ph) payload.ph = merged.ph;
    if (merged.fn) payload.fn = merged.fn;
    if (merged.ln) payload.ln = merged.ln;
    if (!Object.keys(payload).length) return;
    setCookie('_ntu', JSON.stringify(payload), 180);
    if (payload.em) setCookie('_ext_id', payload.em, 180);
  }

  function ensureGoogleAdsConfig() {
    if (typeof gtag === 'undefined') return {};
    if (!adsConfig.id) return adsConfig;
    if (!window.__googleAdsConfigured) {
      gtag('config', adsConfig.id, {
        allow_enhanced_conversions: true,
        send_page_view: false
      });
      window.__googleAdsConfigured = true;
    }
    return adsConfig;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    var btn = document.getElementById('submitBtn');
    var status = document.getElementById('formStatus');
    var form = document.getElementById('contactForm');

    if (!form || !btn || !status) return;

    var name = form.querySelector('#name').value.trim();
    var emailRaw = form.querySelector('#email').value.trim();
    var phoneRaw = form.querySelector('#phone').value.trim();
    var message = form.querySelector('#message').value.trim();
    var date = '';
    var location = '';

    var normalizedEmail = normalizeEmail(emailRaw);
    var normalizedPhone = normalizePhoneToE164(phoneRaw);
    var parsedName = parseNameParts(name);

    if (!name || !normalizedEmail) return;
    if (!isValidEmail(normalizedEmail)) {
      showStatus('❌ Bitte gebt eine gültige E-Mail-Adresse ein.', '#c0392b');
      return;
    }
    if (phoneRaw && !normalizedPhone) {
      showStatus('❌ Bitte gebt eine gültige Telefonnummer im Format +49... ein.', '#c0392b');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Wird gesendet...';
    btn.style.opacity = '0.6';
    status.style.display = 'none';

    try {
      var fbclid = new URLSearchParams(window.location.search).get('fbclid') || '';
      var fbpMatch = document.cookie.match(/(?:^|;\s*)_fbp=([^;]*)/);
      var fbcMatch = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/);
      var gclidMatch = document.cookie.match(/(?:^|;\s*)_gclid=([^;]*)/);
      var attrMatch = document.cookie.match(/(?:^|;\s*)_attribution=([^;]*)/);
      var fbp = fbpMatch ? fbpMatch[1] : '';
      var fbc = fbcMatch ? fbcMatch[1] : '';
      var gclid = gclidMatch ? gclidMatch[1] : '';
      var attribution = attrMatch ? decodeURIComponent(attrMatch[1]) : '';
      var eventID = 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      debugLog('submit:start', { eventId: eventID, destination: workers.formHandler || '' });

      var res = await fetch(workers.formHandler || 'https://form-handler.nataliatschischik.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: normalizedEmail,
          phone: normalizedPhone,
          date: date,
          location: location,
          message: message,
          fbclid: fbclid,
          fbp: fbp,
          fbc: fbc,
          gclid: gclid,
          attribution: attribution,
          event_id: eventID,
          source_url: window.location.href
        })
      });
      var result = await res.json();

      debugLog('submit:response', result);

      if (res.ok && result.success) {
        var emailHash = await sha256Hex(normalizedEmail);
        var phoneHash = normalizedPhone ? await sha256Hex(normalizedPhone) : '';
        var fnHash = parsedName.fn ? await sha256Hex(parsedName.fn) : '';
        var lnHash = parsedName.ln ? await sha256Hex(parsedName.ln) : '';
        var userData = {};
        if (emailHash) userData.em = emailHash;
        if (phoneHash) userData.ph = phoneHash;
        if (fnHash) userData.fn = fnHash;
        if (lnHash) userData.ln = lnHash;
        persistIdentityHashes(userData);

        if (typeof fbq !== 'undefined') {
          fbq('init', trackingConfig.pixelId || '1083293176093427', userData);
          fbq('trackSingle', trackingConfig.pixelId || '1083293176093427', 'Lead', {
            content_name: 'Kontaktformular',
            content_category: 'Hochzeitsfotografie',
            value: 150,
            currency: 'EUR'
          }, { eventID: eventID });
        }

        if (typeof sendCAPIEvent !== 'undefined') {
          sendCAPIEvent('Lead', eventID, {
            content_name: 'Kontaktformular',
            content_category: 'Hochzeitsfotografie',
            value: 150,
            currency: 'EUR'
          }, {
            em: userData.em,
            fn: userData.fn,
            ln: userData.ln,
            ph: userData.ph
          });
        }

        if (typeof gtag !== 'undefined') {
          var googleUserData = {};
          if (emailHash) googleUserData.sha256_email_address = emailHash;
          if (phoneHash) googleUserData.sha256_phone_number = phoneHash;
          if (Object.keys(googleUserData).length) gtag('set', 'user_data', googleUserData);

          var currentAdsConfig = ensureGoogleAdsConfig();
          if (currentAdsConfig.id && currentAdsConfig.label) {
            gtag('event', 'conversion', {
              send_to: currentAdsConfig.id + '/' + currentAdsConfig.label,
              value: 150,
              currency: 'EUR',
              transaction_id: eventID
            });
          }

          gtag('event', 'generate_lead', {
            event_category: 'Contact',
            event_label: 'Kontaktformular',
            value: 150,
            currency: 'EUR',
            transaction_id: eventID
          });
        }

        showStatus('✅ Vielen Dank! Eure Anfrage wurde gesendet. Natalia meldet sich innerhalb von 24 Stunden.', 'var(--accent)');
        form.reset();
      } else {
        showStatus('❌ Es gab ein Problem beim Senden. Bitte versucht es erneut oder schreibt direkt an natalia@nataliatschischik.com', '#c0392b');
      }
    } catch (err) {
      debugLog('submit:error', err && err.message ? err.message : err);
      showStatus('❌ Verbindungsfehler. Bitte versucht es erneut oder schreibt direkt an natalia@nataliatschischik.com', '#c0392b');
    }

    btn.disabled = false;
    btn.textContent = 'Anfrage absenden';
    btn.style.opacity = '1';
  }

  window.handleFormSubmit = handleFormSubmit;
})();
