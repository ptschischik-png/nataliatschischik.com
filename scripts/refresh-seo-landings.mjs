import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd());
const srcDir = path.join(root, "src");

const heroAndPricingStyles = `
<style>
/* ═══ SEO LANDING REFRESH ═══ */
.hero {
  min-height: clamp(64rem, 118vh, 78rem);
}
.portfolio {
  background: var(--cream-light);
}
.hero-image img,
.hero-image:hover img {
  transform: none !important;
  transition: none !important;
}
.hero-proof-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.35rem;
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brown-400);
}
.hero-proof-inline span[aria-hidden="true"] {
  color: var(--brown-300);
}
.hero-travel-note {
  margin-top: 0.9rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(122, 98, 88, 0.18);
  font-size: var(--text-sm);
  color: var(--brown-500);
  max-width: none;
}
#preise-teaser {
  background: linear-gradient(180deg, rgba(253, 252, 250, 0.92) 0%, rgba(250, 248, 244, 0.98) 100%);
}
.index2-pricing-teaser-card {
  padding: clamp(2rem, 5vw, 4rem) 0;
}
.index2-pricing-teaser-head {
  text-align: center;
  max-width: 44rem;
  margin: 0 auto 2.5rem;
}
.index2-pricing-teaser-head .section-title {
  margin-bottom: 1rem;
  font-size: clamp(2rem, 1.35rem + 2vw, 3rem);
}
.index2-pricing-teaser-head p {
  color: var(--brown-500);
  margin: 0 auto;
}
.index2-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  align-items: stretch;
  margin-bottom: 2rem;
}
.index2-pricing-plan {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.5rem 1.35rem;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(122, 98, 88, 0.14);
  box-shadow: 0 10px 26px rgba(44, 24, 16, 0.035);
  min-height: 100%;
}
.index2-pricing-plan.is-featured {
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,243,237,0.98) 100%);
  border-color: rgba(90, 38, 40, 0.18);
  box-shadow: 0 16px 34px rgba(44, 24, 16, 0.06);
  transform: translateY(-6px);
}
.index2-pricing-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: rgba(90, 38, 40, 0.08);
  color: var(--accent);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.index2-pricing-plan-top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}
.index2-pricing-plan-label {
  font-size: var(--text-xs);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brown-500);
}
.index2-pricing-plan h3 {
  font-size: clamp(1.5rem, 1.25rem + 0.5vw, 1.9rem);
  line-height: 1.05;
}
.index2-pricing-plan-price {
  font-size: clamp(1.65rem, 1.35rem + 0.6vw, 2rem);
  font-family: var(--font-display);
  color: var(--brown-900);
  white-space: nowrap;
}
.index2-pricing-plan-copy {
  font-size: var(--text-sm);
  line-height: 1.75;
  color: var(--brown-500);
}
.index2-pricing-plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: auto;
}
.index2-pricing-plan-meta span {
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: rgba(122, 98, 88, 0.08);
  color: var(--brown-600);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.index2-pricing-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem 1.5rem;
}
.index2-pricing-footer-copy {
  font-size: var(--text-sm);
  color: var(--brown-500);
  max-width: 36rem;
}
.index2-pricing-footer-copy strong {
  color: var(--brown-700);
  font-weight: 500;
}
@media (max-width: 980px) {
  .index2-pricing-grid {
    grid-template-columns: 1fr;
  }
  .index2-pricing-plan.is-featured {
    transform: none;
  }
  .index2-pricing-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 768px) {
  .hero {
    min-height: 100svh;
    grid-template-columns: 1fr;
  }
  .hero-image {
    order: -1;
    height: auto;
    aspect-ratio: 2 / 3;
    overflow: hidden;
  }
  .hero-image img {
    width: 100%;
    height: 100%;
    object-position: 52% 42%;
  }
  .hero-content {
    position: relative;
    z-index: 2;
    margin: -2.5rem 1rem 0;
    padding: 1.75rem 1.5rem 2.75rem;
    background: rgba(253,252,250,0.96);
    border-radius: var(--radius);
    box-shadow: 0 18px 38px rgba(44, 24, 16, 0.08);
  }
  .hero h1 {
    font-size: clamp(2.6rem, 10vw, 4rem);
    line-height: 1.02;
    margin-bottom: 1.15rem;
  }
  .hero-label {
    margin-bottom: 0.9rem;
  }
  .hero-text {
    font-size: var(--text-sm);
    line-height: 1.75;
    margin-bottom: 1.75rem;
  }
  .hero-proof-inline {
    margin-top: 1rem;
    gap: 0.45rem;
    line-height: 1.8;
  }
  .hero-travel-note {
    margin-top: 0.85rem;
    padding-top: 0.75rem;
  }
}
@media (max-width: 560px) {
  .index2-pricing-teaser-card {
    padding: 1.5rem 1.25rem;
  }
  .index2-pricing-teaser-head {
    margin-bottom: 1.75rem;
  }
  .index2-pricing-plan {
    padding: 1.25rem 1.1rem;
  }
}
</style>
`;

function getSeoHtmlFiles(files) {
  return files.filter((name) => /^hochzeitsfotograf-.*\.html$/.test(name));
}

function updateHero(html, fileName) {
  const heroLabelMatch = html.match(/<span class="hero-label">([\s\S]*?)<\/span>\s*<h1>/);
  const subLabelMatch = html.match(/<p class="hero-label" style="[^"]*">([\s\S]*?)<\/p>/);
  const heroTextMatch = html.match(/<p class="hero-text">\s*([\s\S]*?)\s*<\/p>/);
  const cityMatch = html.match(/<span id="city-rotate">([\s\S]*?)<\/span>/) || html.match(/<h1>Euer Hochzeitsfotograf <br>in <em>([\s\S]*?)\.<\/em><\/h1>/);

  if (!heroLabelMatch || !subLabelMatch || !heroTextMatch || !cityMatch) {
    throw new Error(`Hero parsing failed for ${fileName}`);
  }

  const heroLabel = heroLabelMatch[1].trim();
  const subLabel = subLabelMatch[1].trim();
  const heroText = heroTextMatch[1].trim();
  const city = cityMatch[1].replace(/<[^>]+>/g, "").trim();

  const replacement = `<!-- ═══ HERO ═══ -->
<section class="hero" aria-label="Willkommen">
  <div class="hero-content">
    <span class="hero-label">${heroLabel}</span>
    <h1>Euer Hochzeitsfotograf <br>in <em>${city}.</em></h1>
    <p class="hero-label" style="margin-top: -0.5rem; margin-bottom: 1.5rem; font-size: var(--text-xs); letter-spacing: 0.15em; text-transform: uppercase; color: var(--brown-400);">${subLabel}</p>
    <p class="hero-text">
      ${heroText}
    </p>
    <div class="hero-cta-row">
      <a href="#contact" class="btn-primary">Termin prüfen</a>
      <a href="portfolio" class="btn-ghost">Reportagen ansehen</a>
    </div>
    <div class="hero-proof-inline" aria-label="Vertrauensindikatoren">
      <span>200+ Paare begleitet</span>
      <span aria-hidden="true">&middot;</span>
      <span>10+ Jahre Erfahrung</span>
      <span aria-hidden="true">&middot;</span>
      <span>4.8 ★ Google Bewertung</span>
    </div>
    <p class="hero-travel-note">Anreise inklusive</p>
  </div>
  <div class="hero-image">
    <img src="reportagen/img/sababurg/2-14.webp" srcset="reportagen/img/sababurg/2-14-400w.webp 400w, reportagen/img/sababurg/2-14-800w.webp 800w, reportagen/img/sababurg/2-14.webp 1920w" sizes="(max-width: 768px) 100vw, 40vw" alt="Brautpaar bei einem innigen Kuss während einer freien Trauung auf der Sababurg" fetchpriority="high" width="1920" height="1080">
  </div>
</section>`;

  return html.replace(/<!-- ═══ HERO ═══ -->[\s\S]*?<!-- ═══ PORTFOLIO TEASER ═══ -->/, `${replacement}\n\n<!-- ═══ PORTFOLIO TEASER ═══ -->`);
}

function getLocationLine(heroLabelHtml) {
  const parts = heroLabelHtml.split("&middot;");
  return (parts[1] || heroLabelHtml).trim();
}

function buildPricingSection(locationLine) {
  return `${heroAndPricingStyles}

<!-- ═══ PRICING TEASER ═══ -->
<section class="section" id="preise-teaser" aria-label="Preise und Leistungen">
  <div class="container">
    <div class="reveal index2-pricing-teaser-card">
      <div class="index2-pricing-teaser-head">
          <span class="section-label">Preise &amp; Leistungen</span>
          <h2 class="section-title"><em>Drei klare Rahmen für unterschiedliche Hochzeitstage.</em></h2>
          <p>
            Statt nur Preise zu nennen, seht ihr hier direkt, welche Begleitung zu welchem Ablauf passt: vom Standesamt bis zur Ganztagsreportage.
          </p>
      </div>
      <div class="index2-pricing-grid">
        <article class="index2-pricing-plan">
          <div class="index2-pricing-plan-top">
            <span class="index2-pricing-plan-label">Standesamt</span>
            <h3>Kurze Begleitung</h3>
            <strong class="index2-pricing-plan-price">ab 590&nbsp;€</strong>
          </div>
          <p class="index2-pricing-plan-copy">
            Ideal für das Ja-Wort, Gratulationen und ein entspanntes Paarshooting ohne Zeitdruck.
          </p>
          <div class="index2-pricing-plan-meta">
            <span>ab 3 Stunden</span>
            <span>50 km inkl.</span>
          </div>
        </article>
        <article class="index2-pricing-plan is-featured">
          <span class="index2-pricing-badge">Beliebt</span>
          <div class="index2-pricing-plan-top">
            <span class="index2-pricing-plan-label">Ganztägig</span>
            <h3>Volle Geschichte</h3>
            <strong class="index2-pricing-plan-price">ab 2.490&nbsp;€</strong>
          </div>
          <p class="index2-pricing-plan-copy">
            Wenn ihr euren Tag vom Getting Ready bis zur Abendstimmung vollständig und ohne enge Grenzen erzählen lassen möchtet.
          </p>
          <div class="index2-pricing-plan-meta">
            <span>10 Stunden</span>
            <span>Album inkl.</span>
          </div>
        </article>
        <article class="index2-pricing-plan">
          <div class="index2-pricing-plan-top">
            <span class="index2-pricing-plan-label">8 Stunden</span>
            <h3>Kompakte Reportage</h3>
            <strong class="index2-pricing-plan-price">ab 1.790&nbsp;€</strong>
          </div>
          <p class="index2-pricing-plan-copy">
            Für Tage mit Trauung, Gästen, Paarzeit und einem spürbaren Teil der Feier in einem klaren Rahmen.
          </p>
          <div class="index2-pricing-plan-meta">
            <span>Trauung bis Abend</span>
            <span>Anreise inkl.</span>
          </div>
        </article>
      </div>
      <div class="index2-pricing-footer">
        <p class="index2-pricing-footer-copy">
          Auf der Preis-Seite seht ihr alle Leistungen im Detail – von der Standesamtbegleitung bis zur Ganztagsreportage für Hochzeiten in <strong>${locationLine}</strong>.
        </p>
        <a href="preise" class="album-link">
          Preise &amp; Leistungen ansehen
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>
`;
}

function updatePricingSection(html, fileName) {
  const heroLabelMatch = html.match(/<span class="hero-label">([\s\S]*?)<\/span>\s*<h1>/);
  if (!heroLabelMatch) {
    throw new Error(`Pricing location parsing failed for ${fileName}`);
  }
  const locationLine = getLocationLine(heroLabelMatch[1]);

  if (html.includes('id="preise-teaser"')) {
    html = html.replace(/<style>\s*\/\* ═══ SEO LANDING REFRESH ═══ \*\/[\s\S]*?<\/section>\s*\n\n<!-- ═══ FAQ ═══ -->/, `${buildPricingSection(locationLine)}\n\n<!-- ═══ FAQ ═══ -->`);
  } else {
    html = html.replace(/<!-- ═══ FAQ ═══ -->/, `${buildPricingSection(locationLine)}\n\n<!-- ═══ FAQ ═══ -->`);
  }

  return html;
}

function updateVisibleFaqPrice(html) {
  return html.replace(
    /Das hängt vor allem davon ab, wie lange ich euch begleite und wie euer Tag aufgebaut ist\.[\s\S]*?Eine kurze standesamtliche Begleitung startet ab 500&nbsp;€,\s*ganztägige Reportagen beginnen ab 1\.400&nbsp;€\.\s*(Für[\s\S]*?Paketlogik\.)/g,
    'Das hängt vor allem davon ab, wie lange ich euch begleite und wie euer Tag aufgebaut ist. Eine kurze standesamtliche Begleitung startet ab 590&nbsp;€, längere Reportagen beginnen ab 1.790&nbsp;€, ganztägige Reportagen ab 2.490&nbsp;€. $1'
  );
}

function updateJsonLdFaqPrice(html) {
  return html.replace(
    /"text": "Das hängt vor allem davon ab, wie lange ich euch begleite und wie euer Tag aufgebaut ist\. Eine kurze standesamtliche Begleitung startet ab 500 €, ganztägige Reportagen beginnen ab 1\.400 €\. (Für[^"]*?Paketlogik\.)"/g,
    '"text": "Das hängt vor allem davon ab, wie lange ich euch begleite und wie euer Tag aufgebaut ist. Eine kurze standesamtliche Begleitung startet ab 590 €, längere Reportagen beginnen ab 1.790 €, ganztägige Reportagen ab 2.490 €. $1"'
  );
}

function updateOfferCatalog(html) {
  return html.replace(
    /"hasOfferCatalog": \{[\s\S]*?\n  \},\n  "sameAs": \[/,
    `"hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Hochzeitsfotografie Begleitungen",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Standesamtbegleitung",
        "description": "Ab 3 Stunden Begleitung, min. 150 bearbeitete Bilder, An- & Abreise bis 50 km inklusive",
        "price": "590",
        "priceCurrency": "EUR"
      },
      {
        "@type": "Offer",
        "name": "Halbtagsreportage",
        "description": "8 Stunden Begleitung, min. 400 bearbeitete Bilder, Galerie & Download, Anreise inklusive",
        "price": "1790",
        "priceCurrency": "EUR"
      },
      {
        "@type": "Offer",
        "name": "Ganztagsreportage",
        "description": "10 Stunden Begleitung, min. 600 bearbeitete Bilder, Highlight-Diashow, Fine-Art-Album 20x20, Anreise inklusive",
        "price": "2490",
        "priceCurrency": "EUR"
      }
    ]
  },
  "sameAs": [`
  );
}

function updateHeadExtra(data) {
  return data
    .replace(/img\/ext\/gd-15zAiT52byizm3F-800w\.webp/g, "reportagen/img/sababurg/2-14-800w.webp")
    .replace(/img\/ext\/gd-15zAiT52byizm3F-400w\.webp/g, "reportagen/img/sababurg/2-14-400w.webp")
    .replace(/img\/ext\/gd-15zAiT52byizm3F\.webp/g, "reportagen/img/sababurg/2-14.webp");
}

const files = await fs.readdir(srcDir);
const htmlFiles = getSeoHtmlFiles(files);

for (const fileName of htmlFiles) {
  const htmlPath = path.join(srcDir, fileName);
  let html = await fs.readFile(htmlPath, "utf8");

  html = updateHero(html, fileName);
  html = updatePricingSection(html, fileName);
  html = updateVisibleFaqPrice(html);
  html = updateJsonLdFaqPrice(html);
  html = updateOfferCatalog(html);

  await fs.writeFile(htmlPath, html);

  const dataPath = path.join(srcDir, fileName.replace(/\.html$/, ".11tydata.cjs"));
  let data = await fs.readFile(dataPath, "utf8");
  data = updateHeadExtra(data);
  await fs.writeFile(dataPath, data);
}

console.log(`Updated ${htmlFiles.length} SEO landing pages.`);
