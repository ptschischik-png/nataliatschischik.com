// ═══ UNIVERSAL MICRO-CONVERSION TRACKING v5 ═══
// - reads centralized config from window.__NT_SITE_CONFIG
// - keeps WhatsApp mapped as Lead per project preference
// - adds debug logging via ?debug_tracking=1
(function() {
  var page = window.location.pathname;
  var siteConfig = window.__NT_SITE_CONFIG || {};
  var trackingConfig = siteConfig.tracking || {};
  var pixelId = trackingConfig.pixelId || '1083293176093427';
  var debugParam = trackingConfig.debugQueryParam || 'debug_tracking';
  var debugEnabled = new URLSearchParams(window.location.search).get(debugParam) === '1';

  function debugLog(action, payload) {
    if (!debugEnabled) return;
    try {
      console.info('[tracking]', action, payload || '');
    } catch (e) {}
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
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

  function getUserData() {
    var ud = {};
    var stored = readStoredIdentity();
    ud.fbp = getCookie('_fbp') || '';
    ud.fbc = getCookie('_fbc') || '';
    ud.external_id = getCookie('_ext_id') || stored.em || '';
    if (stored.em) ud.em = stored.em;
    if (stored.ph) ud.ph = stored.ph;
    if (stored.fn) ud.fn = stored.fn;
    if (stored.ln) ud.ln = stored.ln;
    if (!ud.fbc) {
      var fbclid = new URLSearchParams(window.location.search).get('fbclid');
      if (fbclid) ud.fbc = 'fb.1.' + Date.now() + '.' + fbclid;
    }
    if (!ud.fbp) delete ud.fbp;
    if (!ud.fbc) delete ud.fbc;
    if (!ud.external_id) delete ud.external_id;
    return ud;
  }

  function capi(eventName, customData, userData) {
    var eventId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    if (typeof window.fbq !== 'undefined') {
      window.fbq('trackSingle', pixelId, eventName, customData || {}, { eventID: eventId });
    }
    if (typeof window.sendCAPIEvent === 'undefined') {
      debugLog('event', { name: eventName, id: eventId, destination: 'pixel-only (capi unavailable)' });
      return eventId;
    }
    var params = new URLSearchParams(window.location.search);
    var enriched = Object.assign({}, customData || {});
    if (params.get('utm_source')) enriched.utm_source = params.get('utm_source');
    if (params.get('utm_medium')) enriched.utm_medium = params.get('utm_medium');
    if (params.get('utm_campaign')) enriched.utm_campaign = params.get('utm_campaign');
    if (params.get('utm_content')) enriched.utm_content = params.get('utm_content');
    if (document.referrer) enriched.referrer = document.referrer;

    var mergedUser = Object.assign(getUserData(), userData || {});
    debugLog('event', { name: eventName, id: eventId, destination: 'pixel+capi' });
    window.sendCAPIEvent(eventName, eventId, enriched, mergedUser);
    return eventId;
  }

  function capiCustom(eventName, customData) {
    var eventId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    if (typeof window.fbq !== 'undefined') {
      window.fbq('trackCustom', eventName, customData || {}, { eventID: eventId });
    }
    if (typeof window.sendCAPIEvent === 'undefined') {
      debugLog('event', { name: eventName, id: eventId, destination: 'pixel-only (capi unavailable custom)' });
      return eventId;
    }
    debugLog('event', { name: eventName, id: eventId, destination: 'pixel+capi-custom' });
    window.sendCAPIEvent(eventName, eventId, customData, getUserData());
    return eventId;
  }

  var pageData = {};
  if (page.indexOf('/preise') !== -1) {
    pageData = { content_name: 'Preise', content_category: 'Pricing', content_type: 'service' };
  } else if (page.indexOf('/portfolio') !== -1) {
    pageData = { content_name: 'Portfolio', content_category: 'Gallery', content_type: 'service_group' };
  } else if (page.indexOf('/reportagen/') !== -1) {
    var loc = document.querySelector('h1, .hero-title');
    pageData = { content_name: loc ? loc.textContent.trim() : 'Reportage', content_category: 'Reportage', content_type: 'service' };
  } else if (page.indexOf('/ueber-mich') !== -1) {
    pageData = { content_name: 'Über mich', content_category: 'About', content_type: 'content' };
  } else if (page.indexOf('/faq') !== -1) {
    pageData = { content_name: 'FAQ', content_category: 'FAQ', content_type: 'content' };
  } else if (page.indexOf('/journal/') !== -1) {
    var title = document.querySelector('h1');
    pageData = { content_name: title ? title.textContent.trim() : 'Journal', content_category: 'Blog', content_type: 'content' };
  }

  if (pageData.content_name) {
    capi('ViewContent', pageData);
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'view_item', {
        item_name: pageData.content_name,
        item_category: pageData.content_category
      });
    }
  }

  var scrollTracked = {};
  window.addEventListener('scroll', function() {
    var total = document.body.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    var pct = Math.round(100 * window.scrollY / total);
    [25, 50, 75].forEach(function(t) {
      if (pct >= t && !scrollTracked[t]) {
        scrollTracked[t] = true;
        capiCustom('ScrollDepth', { depth: t, page: page });
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'scroll', { percent_scrolled: t });
      }
    });
  }, { passive: true });

  setTimeout(function() {
    capiCustom('EngagedVisit', { duration: '30s', page: page });
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'engaged_visit', { engagement_time: 30, page_path: page });
  }, 30000);

  setTimeout(function() {
    capiCustom('HighlyEngaged', { duration: '60s', page: page });
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'highly_engaged', { engagement_time: 60, page_path: page });
  }, 60000);

  document.querySelectorAll('.faq-question, [aria-expanded]').forEach(function(el) {
    el.addEventListener('click', function() {
      var question = el.textContent.trim().substring(0, 80);
      capiCustom('FAQClick', { question: question });
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'faq_click', { event_label: question });
    });
  });

  document.querySelectorAll('a[href*="contact"], a[href*="kontakt"], .btn-primary, .nav-cta, .mobile-cta, a[href*="#contact"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var label = el.textContent.trim().substring(0, 50);
      capiCustom('CTAClick', { content_name: label, content_category: 'CTA', page: page });
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'cta_click', { event_label: label, page_path: page });
    });
  });

  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var type = el.href.indexOf('tel:') === 0 ? 'Telefon' : el.href.indexOf('mailto:') === 0 ? 'Email' : 'WhatsApp';
      capi('Contact', { content_name: type, page: page });
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'contact_click', { method: type, page_path: page });
      }

      if (type === 'WhatsApp') {
        capiCustom('WhatsAppClick', {
          content_name: 'WhatsApp',
          content_category: 'Contact',
          page: page
        });

        var leadData = {
          content_name: 'WhatsApp',
          content_category: 'Hochzeitsfotografie',
          value: 50,
          currency: 'EUR'
        };
        capi('Lead', leadData);

        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'whatsapp_click', {
            event_category: 'Contact',
            event_label: 'WhatsApp',
            page_path: page
          });
          if (trackingConfig.googleAdsConversion && trackingConfig.googleAdsConversion.id && trackingConfig.googleAdsConversion.label) {
            window.gtag('event', 'conversion', {
              send_to: trackingConfig.googleAdsConversion.id + '/' + trackingConfig.googleAdsConversion.label,
              value: 50,
              currency: 'EUR'
            });
          }
          window.gtag('event', 'generate_lead', {
            event_category: 'Contact',
            event_label: 'WhatsApp',
            value: 50,
            currency: 'EUR'
          });
        }
      }
    });
  });

  if (page.indexOf('/reportagen/') !== -1) {
    var imgViewed = 0;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          imgViewed++;
          if (imgViewed === 5 || imgViewed === 10 || imgViewed === 20) {
            capiCustom('GalleryDepth', { images_viewed: imgViewed, page: page });
            if (typeof window.gtag !== 'undefined') window.gtag('event', 'gallery_depth', { value: imgViewed, page_path: page });
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.photo-frame img, .img-cover, section img').forEach(function(img) {
      observer.observe(img);
    });
  }

  if (page.indexOf('/preise') !== -1) {
    document.querySelectorAll('.price-card, .paket, [class*="price"], [class*="paket"]').forEach(function(card) {
      card.addEventListener('click', function() {
        var pkg = card.querySelector('h3, h2, .price-title');
        var name = pkg ? pkg.textContent.trim() : 'Paket';
        capiCustom('PackageInterest', { package_name: name });
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'select_item', { item_name: name });
      });
    });
  }

  if (page.indexOf('/portfolio') !== -1) {
    document.querySelectorAll('a[href*="reportagen"]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        var href = el.getAttribute('href');
        var name = el.closest('.pf-card, .portfolio-item');
        var label = name ? name.querySelector('h3, .pf-title') : null;
        capiCustom('ReportageClick', {
          content_name: label ? label.textContent.trim() : 'Reportage',
          content_type: 'service',
          content_category: 'Reportage'
        });
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'select_content', { content_type: 'reportage', item_id: href });
        }

        var isPrimaryClick = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
        var isNewWindowTarget = (el.target || '').toLowerCase() === '_blank';
        var isDownload = el.hasAttribute('download');
        if (isPrimaryClick && !isNewWindowTarget && !isDownload && href) {
          e.preventDefault();
          setTimeout(function() { window.location.href = href; }, 150);
        }
      });
    });
  }
})();
