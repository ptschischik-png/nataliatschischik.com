(function() {
  if (window.__NTTrackingBootstrapLoaded) return;
  window.__NTTrackingBootstrapLoaded = true;

  var siteConfig = window.__NT_SITE_CONFIG || {};
  var trackingConfig = siteConfig.tracking || {};
  var measurementId = trackingConfig.measurementId;
  var pixelId = trackingConfig.pixelId;
  var capiWorkerUrl = trackingConfig.capiWorkerUrl;
  var debugParam = trackingConfig.debugQueryParam || 'debug_tracking';
  var debugEnabled = new URLSearchParams(window.location.search).get(debugParam) === '1';
  var trackingBooted = false;
  var lateTrackingBooted = false;
  var capiQueue = [];
  var bootFbp = null;
  var bootExternalId = null;
  var pageViewEventId = null;

  window.GOOGLE_ADS_CONVERSION = trackingConfig.googleAdsConversion || {};

  function log(action, payload) {
    if (!debugEnabled) return;
    try {
      console.info('[tracking]', action, payload || '');
    } catch (e) {}
  }

  function loadScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (attrs) {
      Object.keys(attrs).forEach(function(key) {
        s.setAttribute(key, attrs[key]);
      });
    }
    (document.head || document.body).appendChild(s);
  }

  function generateEventId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
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

  function getFbcFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid');
    if (fbclid) return 'fb.1.' + Date.now() + '.' + fbclid;
    return null;
  }

  function ensureFbp() {
    var existing = getCookie('_fbp');
    if (existing) return existing;
    var fbp = 'fb.1.' + Date.now() + '.' + (Math.floor(Math.random() * 2147483647) + 1);
    setCookie('_fbp', fbp, 90);
    return fbp;
  }

  function ensureExternalId() {
    var existing = getCookie('_ext_id');
    if (existing) return existing;
    var stored = readStoredIdentity();
    if (stored.em) {
      setCookie('_ext_id', stored.em, 180);
      return stored.em;
    }
    var id = 'nt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 12);
    setCookie('_ext_id', id, 180);
    return id;
  }

  (function captureClickIds() {
    var params = new URLSearchParams(window.location.search);
    var fbclid = params.get('fbclid');
    if (fbclid) {
      setCookie('_fbc', 'fb.1.' + Date.now() + '.' + fbclid, 90);
    }

    var gclid = params.get('gclid');
    if (gclid) {
      setCookie('_gclid', gclid, 90);
    }

    var gbraid = params.get('gbraid');
    if (gbraid) {
      setCookie('_gbraid', gbraid, 90);
    }

    var wbraid = params.get('wbraid');
    if (wbraid) {
      setCookie('_wbraid', wbraid, 90);
    }

    var hasGoogleClickId = gclid || gbraid || wbraid;
    if (params.get('utm_source') || hasGoogleClickId || fbclid) {
      var attribution = JSON.stringify({
        source: params.get('utm_source') || (hasGoogleClickId ? 'google' : fbclid ? 'meta' : ''),
        medium: params.get('utm_medium') || (hasGoogleClickId ? 'cpc' : fbclid ? 'cpc' : ''),
        campaign: params.get('utm_campaign') || '',
        landing: window.location.pathname,
        ts: Date.now()
      });
      setCookie('_attribution', attribution, 90);
    }
  })();

  function sendCapiNow(eventName, eventId, customData, userData) {
    customData = customData || {};
    userData = userData || {};
    var stored = readStoredIdentity();

    if (!bootFbp) bootFbp = ensureFbp();
    if (!bootExternalId) bootExternalId = ensureExternalId();

    var payload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      event_id: eventId,
      user_data: {
        fbp: getCookie('_fbp') || bootFbp,
        fbc: getCookie('_fbc') || getFbcFromUrl(),
        external_id: getCookie('_ext_id') || stored.em || bootExternalId,
        country: 'de'
      },
      custom_data: customData
    };

    if (stored.em) payload.user_data.em = stored.em;
    if (stored.fn) payload.user_data.fn = stored.fn;
    if (stored.ln) payload.user_data.ln = stored.ln;
    if (stored.ph) payload.user_data.ph = stored.ph;
    if (userData.em) payload.user_data.em = userData.em;
    if (userData.fn) payload.user_data.fn = userData.fn;
    if (userData.ln) payload.user_data.ln = userData.ln;
    if (userData.ph) payload.user_data.ph = userData.ph;

    log('capi:send', { eventName: eventName, eventId: eventId, destination: capiWorkerUrl + '/event' });

    var url = capiWorkerUrl + '/event';
    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true
      }).catch(function(err) {
        log('capi:error', err && err.message ? err.message : err);
      });
    }
  }

  window.sendCAPIEvent = function(eventName, eventId, customData, userData) {
    if (!trackingBooted) {
      capiQueue.push([eventName, eventId, customData, userData]);
      log('capi:queue', { eventName: eventName, eventId: eventId });
      return;
    }
    sendCapiNow(eventName, eventId, customData, userData);
  };

  function initGoogle() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };

    window.gtag('consent', 'default', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });

    window.gtag('js', new Date());
    window.gtag('config', measurementId, { allow_enhanced_conversions: true });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + measurementId);
    log('google:init', { measurementId: measurementId });
  }

  function getPixelUserData() {
    var stored = readStoredIdentity();
    var externalId = getCookie('_ext_id') || stored.em || bootExternalId || ensureExternalId();
    var userData = {};
    if (stored.em) userData.em = stored.em;
    if (stored.fn) userData.fn = stored.fn;
    if (stored.ln) userData.ln = stored.ln;
    if (stored.ph) userData.ph = stored.ph;
    if (externalId) userData.external_id = externalId;
    return userData;
  }

  function initMetaPixel() {
    !function(f,b,e,v,n,t,s){
      if (f.fbq) return;
      n = f.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    if (typeof window.fbq !== 'undefined') {
      window.fbq('init', pixelId, {}, { autoConfig: false, autoAdvancedMatching: false });
      log('meta:init', { pixelId: pixelId });
    }
  }

  function flushQueuedCapi() {
    if (!capiQueue.length) return;
    capiQueue.forEach(function(args) {
      sendCapiNow(args[0], args[1], args[2], args[3]);
    });
    capiQueue = [];
  }

  function bootLateTracking() {
    if (lateTrackingBooted) return;
    lateTrackingBooted = true;
    var matchData = getPixelUserData();
    if (measurementId) initGoogle();
    if (pixelId) initMetaPixel();
    if (typeof window.fbq !== 'undefined' && pageViewEventId) {
      window.fbq('trackSingle', pixelId, 'PageView', matchData, { eventID: pageViewEventId });
      log('meta:pageview', { eventId: pageViewEventId });
    }
    loadScript('/js/tracking.js');
  }

  function scheduleLateTracking() {
    var fired = false;
    function trigger() {
      if (fired) return;
      fired = true;
      bootLateTracking();
      window.removeEventListener('pointerdown', trigger, true);
      window.removeEventListener('keydown', trigger, true);
      window.removeEventListener('touchstart', trigger, true);
      window.removeEventListener('scroll', trigger, true);
    }

    window.addEventListener('pointerdown', trigger, { once: true, passive: true, capture: true });
    window.addEventListener('keydown', trigger, { once: true, capture: true });
    window.addEventListener('touchstart', trigger, { once: true, passive: true, capture: true });
    window.addEventListener('scroll', trigger, { once: true, passive: true, capture: true });

    setTimeout(trigger, 12000);
  }

  function bootTracking() {
    if (trackingBooted) return;
    trackingBooted = true;
    pageViewEventId = generateEventId();
    sendCapiNow('PageView', pageViewEventId);
    log('pageview', { eventId: pageViewEventId, destination: capiWorkerUrl + '/event' });
    flushQueuedCapi();
    scheduleLateTracking();
  }

  function scheduleTrackingBoot() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(bootTracking, { timeout: 2000 });
    } else {
      setTimeout(bootTracking, 1);
    }
  }

  if (document.readyState === 'complete') {
    scheduleTrackingBoot();
  } else {
    window.addEventListener('load', scheduleTrackingBoot, { once: true });
  }
})();
