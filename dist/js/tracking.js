// ═══ UNIVERSAL MICRO-CONVERSION TRACKING ═══
// Fires events to Meta Pixel, GA4, and Zaraz based on user behavior
(function() {
  var page = window.location.pathname;
  function _fbq() { return window.fbq; }
  function _gtag() { return window.gtag; }
  function _zaraz() { return window.zaraz; }

  // ── 1. PAGE-SPECIFIC VIEWCONTENT ──
  // Tell Meta which type of content was viewed (helps build audiences)
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
    if (typeof window.fbq !== 'undefined') window.fbq('track', 'ViewContent', pageData);
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'view_item', {
      item_name: pageData.content_name,
      item_category: pageData.content_category
    });
  }

  // ── 2. SCROLL DEPTH (25/50/75/100%) ──
  var scrollTracked = {};
  window.addEventListener('scroll', function() {
    var total = document.body.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    var pct = Math.round(100 * window.scrollY / total);
    [25, 50, 75].forEach(function(t) {
      if (pct >= t && !scrollTracked[t]) {
        scrollTracked[t] = true;
        if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'ScrollDepth', {depth: t, page: page});
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'scroll', {percent_scrolled: t});
        if (typeof window.zaraz !== 'undefined') window.zaraz.track('Scroll Depth ' + t);
      }
    });
  });

  // ── 3. TIME ON PAGE (30s = engaged, 60s = highly engaged) ──
  setTimeout(function() {
    if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'EngagedVisit', {duration: '30s', page: page});
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'engaged_visit', {engagement_time: 30, page_path: page});
    if (typeof window.zaraz !== 'undefined') window.zaraz.track('EngagedVisit');
  }, 30000);

  setTimeout(function() {
    if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'HighlyEngaged', {duration: '60s', page: page});
    if (typeof window.gtag !== 'undefined') window.gtag('event', 'highly_engaged', {engagement_time: 60, page_path: page});
  }, 60000);

  // ── 4. FAQ ACCORDION CLICKS ──
  document.querySelectorAll('.faq-question, [aria-expanded]').forEach(function(el) {
    el.addEventListener('click', function() {
      var question = el.textContent.trim().substring(0, 80);
      if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'FAQClick', {question: question});
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'faq_click', {event_label: question});
    });
  });

  // ── 5. CTA / CONTACT BUTTON CLICKS ──
  document.querySelectorAll('a[href*="contact"], a[href*="kontakt"], .btn-primary, .nav-cta, .mobile-cta, a[href*="#contact"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var label = el.textContent.trim().substring(0, 50);
      if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'CTAClick', {content_name: label, content_category: 'CTA', page: page});
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'cta_click', {event_label: label, page_path: page});
      if (typeof window.zaraz !== 'undefined') window.zaraz.track('Contact');
    });
  });

  // ── 6. OUTBOUND / CONTACT LINK CLICKS ──
  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]').forEach(function(el) {
    el.addEventListener('click', function() {
      var type = el.href.indexOf('tel:') === 0 ? 'Telefon' : el.href.indexOf('mailto:') === 0 ? 'Email' : 'WhatsApp';
      if (typeof window.fbq !== 'undefined') window.fbq('track', 'Contact', {content_name: type});
      if (typeof window.gtag !== 'undefined') window.gtag('event', 'contact_click', {method: type, page_path: page});
      if (typeof window.zaraz !== 'undefined') window.zaraz.track('Contact');
    });
  });

  // ── 7. GALLERY IMAGE VIEWS (Reportage pages) ──
  if (page.indexOf('/reportagen/') !== -1) {
    var imgViewed = 0;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          imgViewed++;
          // Track at milestones: 5, 10, 20 images
          if (imgViewed === 5 || imgViewed === 10 || imgViewed === 20) {
            if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'GalleryDepth', {images_viewed: imgViewed, page: page});
            if (typeof window.gtag !== 'undefined') window.gtag('event', 'gallery_depth', {value: imgViewed, page_path: page});
          }
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.5});

    document.querySelectorAll('.gallery img, .chapter-grid img, .reportage-img').forEach(function(img) {
      observer.observe(img);
    });
  }

  // ── 8. PREISE PAGE: Package interest ──
  if (page.indexOf('/preise') !== -1) {
    document.querySelectorAll('.price-card, .paket, [class*="price"], [class*="paket"]').forEach(function(card) {
      card.addEventListener('click', function() {
        var pkg = card.querySelector('h3, h2, .price-title');
        var name = pkg ? pkg.textContent.trim() : 'Paket';
        if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'PackageInterest', {package_name: name});
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'select_item', {item_name: name});
      });
    });
  }

  // ── 9. PORTFOLIO: Reportage link clicks ──
  if (page.indexOf('/portfolio') !== -1) {
    document.querySelectorAll('a[href*="reportagen"]').forEach(function(el) {
      el.addEventListener('click', function() {
        var name = el.closest('.pf-card, .portfolio-item');
        var label = name ? name.querySelector('h3, .pf-title') : null;
        if (typeof window.fbq !== 'undefined') window.fbq('trackCustom', 'ReportageClick', {
          content_name: label ? label.textContent.trim() : 'Reportage',
          content_type: 'service',
          content_category: 'Reportage'
        });
        if (typeof window.gtag !== 'undefined') window.gtag('event', 'select_content', {
          content_type: 'reportage',
          item_id: el.getAttribute('href')
        });
      });
    });
  }
})();
