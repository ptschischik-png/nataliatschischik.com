// ═══ UNIVERSAL MICRO-CONVERSION TRACKING v3 ═══
// Änderungen gegenüber v2:
// - getUserData() liest fbp, fbc, external_id aus Cookies/URL
// - Alle CAPI-Calls senden jetzt user_data mit → bessere Event-Qualität
// - fbc-Fallback aus fbclid URL-Parameter
(function() {
  var page = window.location.pathname;

  // ── USER DATA HELPER (fbp, fbc, external_id) ──
  function getUserData() {
    var ud = {};
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf('_fbp=') === 0) ud.fbp = c.substring(5);
      if (c.indexOf('_fbc=') === 0) ud.fbc = c.substring(5);
    }
    // Fallback: fbc aus URL bauen wenn fbclid vorhanden
    if (!ud.fbc) {
      var fbclid = new URLSearchParams(window.location.search).get('fbclid');
      if (fbclid) ud.fbc = 'fb.1.' + Date.now() + '.' + fbclid;
    }
    // external_id aus fbp ableiten (stabiler Cross-Session Identifier)
    if (ud.fbp) ud.external_id = ud.fbp;
    return ud;
  }

  // Helper: send to CAPI + Pixel mit Deduplication
  function capi(eventName, customData, userData) {
    if (typeof window.sendCAPIEvent === 'undefined') return;
    var eventId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    // Fire pixel with same eventID for dedup
    if (typeof window.fbq !== 'undefined') {
      window.fbq('trackSingle', '1083293176093427', eventName, customData || {}, { eventID: eventId });
    }
    // Enrich customData with UTM params + referrer
    var params = new URLSearchParams(window.location.search);
    var enriched = Object.assign({}, customData || {});
    if (params.get('utm_source'))   enriched.utm_source   = params.get('utm_source');
    if (params.get('utm_medium'))   enriched.utm_medium   = params.get('utm_medium');
    if (params.get('utm_campaign')) enriched.utm_campaign = params.get('utm_campaign');
    if (params.get('utm_content'))  enriched.utm_content  = params.get('utm_content');
    if (document.referrer)          enriched.referrer     = document.referrer;

    // Merge getUserData() mit übergebenem userData
    var mergedUser = Object.assign(getUserData(), userData || {});
    window.sendCAPIEvent(eventName, eventId, enriched, mergedUser);
    return eventId;
  }

  // Helper: Fire Custom Event über Pixel + CAPI (für Engagement-Events)
  function capiCustom(eventName, customData) {
    if (typeof window.sendCAPIEvent === 'undefined') {
      // Fallback: nur Pixel
      if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', eventName, customData);
      return;
    }
    var eventId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    if (typeof window.fbq !== 'undefined') {
      window.fbq('trackCustom', eventName, customData || {}, { eventID: eventId });
    }
    // Jetzt mit user_data für besseres Matching
    window.sendCAPIEvent(eventName, eventId, customData, getUserData());
  }

  // ── 1. PAGE-SPECIFIC VIEWCONTENT ──
  var pageData = {};
  if (page.indexOf('/preise') !== -1) {
    pageData = {content_name: 'Preise', content_category: 'Pricing', content_type: 'service'};
  } else if (page.indexOf('/portfolio') !== -1) {
    pageData = {content_name: 'Portfolio', content_category: 'Gallery', content_type: 'service_group'};
  } else if (page.indexOf('/reportagen/') !== -1) {
    var loc = document.querySelector('h1, .hero-title');
    pageData = {content_name: loc ? loc.textContent.trim() : 'Reportage', content_category: 'Reportage', content_type: 'service'};
  } else if (page.indexOf('/ueber-mich') !== -1) {
    pageData = {content_name: 'Über mich', content_category: 'About', content_type: 'content'};
  } else if (page.indexOf('/faq') !== -1) {
    pageData = {content_name: 'FAQ', content_category: 'FAQ', content_type: 'content'};
  } else if (page.indexOf('/journal/') !== -1) {
    var title = document.querySelector('h1');
    pageData = {content_name: title ? title.textContent.trim() : 'Journal', content_category: 'Blog', content_type: 'content'};
  }

  if (pageData.content_name) {
    var vcSent = capi('ViewContent', pageData);
    if (!vcSent && typeof window.fbq !== 'undefined') window.fbq('track', 'ViewContent', pageData);
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'view_item', {
      item_name: pageData.content_name,
      item_category: pageData.content_category
    });
  }

  // ── 2. SCROLL DEPTH (25/50/75%) — über CAPI ──
  var scrollTracked = {};
  window.addEventListener('scroll', function() {
    var total = document.body.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    var pct = Math.round(100 * window.scrollY / total);
    [25, 50, 75].forEach(function(t) {
      if (pct >= t && !scrollTracked[t]) {
        scrollTracked[t] = true;
        capiCustom('ScrollDepth', {depth: t, page: page});
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'scroll', {percent_scrolled: t});
        if (typeof window.zaraz !== 'undefined') window.zaraz.track('Scroll Depth ' + t);
      }
    });
  });

  // ── 3. TIME ON PAGE — über CAPI ──
  setTimeout(function() {
    capiCustom('EngagedVisit', {duration: '30s', page: page});
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'engaged_visit', {engagement_time: 30, page_path: page});
    if (typeof window.zaraz !== 'undefined') window.zaraz.track('EngagedVisit');
  }, 30000);

  setTimeout(function() {
    capiCustom('HighlyEngaged', {duration: '60s', page: page});
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'highly_engaged', {engagement_time: 60, page_path: page});
  }, 60000);

  // ── 4. FAQ ACCORDION CLICKS ──
  document.querySelectorAll('.faq-question, [aria-expanded]').forEach(function(el) {
    el.addEventListener('click', function() {
      var question = el.textContent.trim().substring(0, 80);
      capiCustom('FAQClick', {question: question});
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'faq_click', {event_label: question});
    });
  });

  // ── 5. CTA / CONTACT BUTTON CLICKS ──
  document.querySelectorAll('a[href*="contact"], a[href*="kontakt"], .btn-primary, .nav-cta, .mobile-cta, a[href*="#contact"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var label = el.textContent.trim().substring(0, 50);
      capiCustom('CTAClick', {content_name: label, content_category: 'CTA', page: page});
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'cta_click', {event_label: label, page_path: page});
      if (typeof window.zaraz !== 'undefined') window.zaraz.track('Contact');
    });
  });

  // ── 6. OUTBOUND / CONTACT LINK CLICKS ──
  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var type = el.href.indexOf('tel:') === 0 ? 'Telefon' : el.href.indexOf('mailto:') === 0 ? 'Email' : 'WhatsApp';
      var sent = capi('Contact', {content_name: type});
      if (!sent && typeof window.fbq !== 'undefined') window.fbq('track', 'Contact', {content_name: type});
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'contact_click', {method: type, page_path: page});
      if (typeof window.zaraz !== 'undefined') window.zaraz.track('Contact');

      if (type === 'WhatsApp') {
        var leadData = {content_name: 'WhatsApp', content_category: 'Hochzeitsfotografie', value: 50, currency: 'EUR'};
        var leadSent = capi('Lead', leadData);
        if (!leadSent && typeof window.fbq !== 'undefined') window.fbq('track', 'Lead', leadData);
        var adsConfig = window.GOOGLE_ADS_CONVERSION || {};
        if (typeof window.gtag !== 'undefined' && adsConfig.id && adsConfig.label) {
          window.gtag('event', 'conversion', {
            send_to: adsConfig.id + '/' + adsConfig.label,
            value: 50,
            currency: 'EUR'
          });
        }
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'generate_lead', {
          event_category: 'Contact',
          event_label: 'WhatsApp',
          value: 50,
          currency: 'EUR'
        });
        if (typeof window.zaraz !== 'undefined') window.zaraz.track('Lead');
      }
    });
  });

  // ── 7. GALLERY IMAGE VIEWS ──
  if (page.indexOf('/reportagen/') !== -1) {
    var imgViewed = 0;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          imgViewed++;
          if (imgViewed === 5 || imgViewed === 10 || imgViewed === 20) {
            capiCustom('GalleryDepth', {images_viewed: imgViewed, page: page});
            if (typeof window.gtag !== 'undefined') window.gtag('event', 'gallery_depth', {value: imgViewed, page_path: page});
          }
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.5});

    document.querySelectorAll('.photo-frame img, .img-cover, section img').forEach(function(img) {
      observer.observe(img);
    });
  }

  // ── 8. PREISE: Package interest ──
  if (page.indexOf('/preise') !== -1) {
    document.querySelectorAll('.price-card, .paket, [class*="price"], [class*="paket"]').forEach(function(card) {
      card.addEventListener('click', function() {
        var pkg = card.querySelector('h3, h2, .price-title');
        var name = pkg ? pkg.textContent.trim() : 'Paket';
        capiCustom('PackageInterest', {package_name: name});
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'select_item', {item_name: name});
      });
    });
  }

  // ── 9. PORTFOLIO: Reportage link clicks (mit Navigation-Delay für CAPI) ──
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
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'select_content', {
          content_type: 'reportage',
          item_id: href
        });

        // Nur "normale" Link-Klicks verzögern; neue Tabs/Fenster nicht blockieren.
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
