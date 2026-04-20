const headExtra = `<!-- LCP-critical preloads -->
<link rel="preload" as="image" type="image/webp" href="/reportagen/img/ra-renthof/hero-800w.webp" imagesrcset="/reportagen/img/ra-renthof/hero-400w.webp 400w, /reportagen/img/ra-renthof/hero-800w.webp 800w, /reportagen/img/ra-renthof/hero.webp 1200w" imagesizes="(max-width: 900px) 100vw, 48vw" fetchpriority="high">
<link rel="preload" href="/fonts/cg-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:300 500;font-display:swap;src:url('/fonts/cg-italic-latin-ext.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:300 500;font-display:swap;src:url('/fonts/cg-italic-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:300 500;font-display:swap;src:url('/fonts/cg-normal-latin-ext.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:300 500;font-display:swap;src:url('/fonts/cg-normal-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:400 500;font-display:swap;src:url('/fonts/dm-normal-latin-ext.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:400 500;font-display:swap;src:url('/fonts/dm-normal-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
</style>

<style>
*,
*::before,
*::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; scroll-padding-top: 5rem; }
img { display: block; max-width: 100%; height: auto; }
button,
a { font: inherit; color: inherit; text-decoration: none; }
button { cursor: pointer; background: none; border: none; }
ul { list-style: none; }

:root {
  --cream: #F5F0E8;
  --cream-light: #FAF8F4;
  --cream-dark: #EDE7DB;
  --white: #FDFCFA;
  --brown-900: #2C1810;
  --brown-800: #3D2518;
  --brown-700: #4A3228;
  --brown-600: #5E443A;
  --brown-500: #7A6258;
  --brown-400: #9E8A80;
  --brown-300: #C4B5AB;
  --brown-200: #DDD3CA;
  --brown-100: #EDE7E0;
  --accent: #5A2628;
  --accent-dark: #481E20;
  --accent-light: #835C5D;
  --dark-bg: #1E1B18;
  --dark-card: #2A2622;
  --font-display: 'Cormorant Garamond', 'Georgia', serif;
  --font-body: 'DM Sans', 'Helvetica Neue', sans-serif;
  --text-xs: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  --text-sm: clamp(0.8125rem, 0.78rem + 0.15vw, 0.875rem);
  --text-base: clamp(0.9375rem, 0.9rem + 0.2vw, 1rem);
  --text-lg: clamp(1.0625rem, 1rem + 0.4vw, 1.25rem);
  --text-xl: clamp(1.375rem, 1.1rem + 0.8vw, 1.75rem);
  --text-2xl: clamp(1.75rem, 1.3rem + 1.5vw, 2.75rem);
  --text-3xl: clamp(2.25rem, 1.5rem + 2.5vw, 3.75rem);
  --text-hero: clamp(2.6rem, 1.55rem + 4.6vw, 5.25rem);
  --radius: 6px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --transition: 300ms var(--ease-out);
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.65;
  color: var(--brown-600);
  background: var(--cream);
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.1;
  color: var(--brown-900);
}

p { max-width: 60ch; }

::selection {
  background: rgba(74, 93, 58, 0.18);
  color: var(--brown-900);
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1.25rem clamp(1.5rem, 3vw, 3rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(245, 240, 232, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: padding var(--transition), background var(--transition);
}

.nav.scrolled { padding: 0.75rem clamp(1.5rem, 3vw, 3rem); }

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-style: italic;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--brown-900);
}

.nav-links { display: flex; gap: 2.25rem; align-items: center; }

.nav-links a {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brown-500);
  transition: color var(--transition);
  position: relative;
}

.nav-links a:hover { color: var(--brown-900); }

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--brown-900);
  transition: width var(--transition);
}

.nav-links a:hover::after,
.nav-links a.active::after { width: 100%; }

.nav-cta {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.625rem 1.5rem;
  background: var(--accent);
  color: var(--cream-light);
  border-radius: var(--radius);
  transition: background var(--transition);
}

.nav-cta:hover { background: var(--accent-dark); }

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 24px;
  padding: 0;
}

.hamburger span {
  display: block;
  height: 1.5px;
  background: var(--brown-900);
  transition: transform var(--transition), opacity var(--transition);
  transform-origin: center;
}

.hamburger.active span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.hamburger.active span:nth-child(2) { opacity: 0; }
.hamburger.active span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

.nav-mobile {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 99;
  background: var(--cream);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.nav-mobile.open { display: flex; }

.nav-mobile a {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-style: italic;
  color: var(--brown-900);
  transition: color var(--transition);
}

.nav-mobile a:hover { color: var(--accent); }

.nav-mobile .mobile-cta {
  margin-top: 1rem;
  font-family: var(--font-body);
  font-style: normal;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.875rem 2.5rem;
  background: var(--accent);
  color: var(--cream-light);
}

@media (max-width: 900px) {
  .nav-links,
  .nav-cta { display: none; }
  .hamburger { display: flex; }
}

.container { max-width: 1140px; margin: 0 auto; }

.section {
  padding: clamp(5rem, 10vw, 8rem) clamp(1.5rem, 5vw, 6rem);
}

.section-label {
  display: block;
  margin-bottom: 1rem;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
}

.section-title {
  margin-bottom: 1.5rem;
  font-size: var(--text-2xl);
  font-weight: 300;
  letter-spacing: -0.02em;
}

.section-title em {
  font-style: italic;
  font-weight: 400;
}

.btn-primary,
.btn-ghost,
.p2-plan-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: var(--radius);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: all var(--transition);
}

.btn-primary,
.p2-plan-cta-primary {
  padding: 1rem 2.5rem;
  background: var(--accent);
  color: var(--cream-light);
}

.btn-primary:hover,
.p2-plan-cta-primary:hover {
  background: var(--accent-dark);
  transform: translateY(-1px);
}

.btn-ghost,
.p2-plan-cta-ghost {
  padding: 1rem 2rem;
  border: 1px solid var(--brown-300);
  color: var(--brown-700);
}

.btn-ghost:hover,
.p2-plan-cta-ghost:hover {
  border-color: var(--brown-900);
  color: var(--brown-900);
}

.trust-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(1.4rem, 3vw, 2.75rem);
  padding: 1.5rem 2rem;
  background: var(--white);
  border-top: 1px solid rgba(0,0,0,0.04);
  border-bottom: 1px solid rgba(0,0,0,0.04);
  flex-wrap: wrap;
}

.trust-item {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
}

.trust-number {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--accent);
}

.trust-label {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brown-400);
}

.trust-divider {
  width: 1px;
  height: 24px;
  background: var(--brown-200);
}

.trust-highlight {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: var(--accent);
}

.trust-highlight .trust-number,
.trust-highlight .trust-label { color: var(--cream-light); }

.trust-highlight .trust-label { opacity: 0.82; }

.p2-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.92fr);
  min-height: calc(100vh - 4.5rem);
  background: linear-gradient(180deg, rgba(253,252,250,0.92) 0%, rgba(245,240,232,0.98) 100%);
}

.p2-hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(2rem, 4vw, 5rem) clamp(1.5rem, 5vw, 6rem);
}

.p2-kicker {
  display: block;
  margin-bottom: 1.25rem;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
}

.p2-hero h1 {
  max-width: 11ch;
  margin-bottom: 1.5rem;
  font-size: var(--text-hero);
  font-weight: 300;
  letter-spacing: -0.03em;
}

.p2-hero-lead {
  max-width: 56ch;
  margin-bottom: 2rem;
  font-size: var(--text-lg);
  line-height: 1.75;
  color: var(--brown-600);
}

.p2-hero-note {
  margin-top: 1rem;
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brown-400);
}

.p2-hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.p2-budget-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.p2-budget-chip {
  border: 1px solid rgba(90,38,40,0.12);
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brown-700);
  background: rgba(255,255,255,0.66);
}

.p2-hero-media {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  background: var(--dark-bg);
}

.p2-hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.p2-hero-card {
  position: absolute;
  right: clamp(1rem, 3vw, 2.5rem);
  bottom: clamp(1rem, 3vw, 2rem);
  max-width: 260px;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius);
  background: rgba(30,27,24,0.72);
  backdrop-filter: blur(12px);
  color: var(--cream-light);
}

.p2-hero-card strong {
  display: block;
  margin-bottom: 0.35rem;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 400;
}

.p2-hero-card span {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(250,248,244,0.82);
}

.p2-proof-strip {
  background: var(--cream-light);
}

.p2-proof-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.p2-proof-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.p2-proof-card {
  display: block;
  background: var(--white);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.4s var(--ease-out), border-color var(--transition);
}

.p2-proof-card:hover {
  transform: translateY(-4px);
  border-color: rgba(90,38,40,0.18);
}

.p2-proof-card img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}

.p2-proof-info {
  padding: 1rem 1rem 1.1rem;
}

.p2-proof-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brown-400);
}

.p2-proof-info h3 {
  margin-bottom: 0.45rem;
  font-size: var(--text-xl);
}

.p2-proof-info p {
  max-width: none;
  color: var(--brown-500);
}

.p2-pricing {
  background: var(--cream);
}

.p2-pricing-intro {
  max-width: 700px;
  margin: 0 auto 3rem;
  text-align: center;
}

.p2-price-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}

.p2-plan {
  display: flex;
  flex-direction: column;
  padding: 2rem 1.75rem;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 10px;
  background: var(--white);
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.p2-plan-featured {
  position: relative;
  transform: translateY(-10px);
  border-color: rgba(90,38,40,0.18);
  box-shadow: 0 24px 60px -36px rgba(44,24,16,0.38);
}

.p2-plan-badge {
  position: absolute;
  top: -0.8rem;
  left: 1.5rem;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--cream-light);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.p2-plan-for {
  margin-bottom: 0.85rem;
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brown-400);
}

.p2-plan h3 {
  margin-bottom: 1rem;
  font-size: clamp(1.65rem, 1.4rem + 0.6vw, 2.2rem);
}

.p2-price {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  margin-bottom: 1rem;
  color: var(--accent);
}

.p2-price-from {
  font-size: var(--text-sm);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--brown-400);
}

.p2-price-amount {
  font-family: var(--font-display);
  font-size: clamp(2.3rem, 2rem + 1vw, 3.35rem);
  line-height: 0.95;
}

.p2-plan-copy {
  margin-bottom: 1.25rem;
  color: var(--brown-600);
}

.p2-features {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.p2-features li {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  color: var(--brown-700);
}

.p2-features svg {
  width: 17px;
  height: 17px;
  margin-top: 0.18rem;
  flex: 0 0 auto;
  stroke: var(--accent);
}

.p2-plan-cta {
  margin-top: auto;
  min-height: 48px;
}

.p2-plan-note {
  margin-bottom: 1rem;
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brown-400);
}

.p2-custom {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 2rem;
  align-items: center;
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 10px;
  background: var(--white);
  border: 1px solid rgba(0,0,0,0.05);
}

.p2-custom h3 {
  margin-bottom: 0.8rem;
  font-size: clamp(1.6rem, 1.3rem + 0.8vw, 2.2rem);
}

.p2-custom-list {
  display: grid;
  gap: 0.65rem;
}

.p2-custom-list li {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.p2-custom-list svg {
  width: 16px;
  height: 16px;
  margin-top: 0.2rem;
  flex: 0 0 auto;
  stroke: var(--accent);
}

.p2-feature-review {
  background: var(--dark-bg);
  color: var(--cream-light);
}

.p2-feature-review-card {
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(2rem, 4vw, 3.5rem);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  background: var(--dark-card);
}

.p2-review-stars {
  margin-bottom: 1.25rem;
  font-size: 1rem;
  letter-spacing: 0.3em;
  color: var(--accent-light);
}

.p2-feature-review-card blockquote,
.p2-feature-review-card p {
  max-width: none;
  color: var(--cream-light);
}

.p2-feature-review-card blockquote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(1.45rem, 1.15rem + 1vw, 2.25rem);
  line-height: 1.45;
}

.p2-review-body {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.p2-review-meta {
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brown-400);
}

.p2-review-proof {
  margin-top: 0.5rem;
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brown-500);
}

.p2-includes {
  background: var(--white);
}

.p2-includes-grid,
.p2-factors-grid,
.p2-addon-grid {
  display: grid;
  gap: 1rem;
}

.p2-includes-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 2.5rem;
}

.p2-include-card,
.p2-factor-card,
.p2-addon-card {
  padding: 1.5rem;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 10px;
  background: var(--cream-light);
}

.p2-include-card h3,
.p2-factor-card h3,
.p2-addon-card h3 {
  margin-bottom: 0.65rem;
  font-size: var(--text-xl);
}

.p2-include-card p,
.p2-factor-card p,
.p2-addon-card p {
  max-width: none;
  color: var(--brown-500);
}

.p2-connection {
  background: var(--cream-light);
}

.p2-factors {
  background: var(--white);
}

.p2-factors-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 2rem;
}

.p2-addons {
  background: var(--cream-light);
}

.p2-addon-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 2rem;
}

.p2-process {
  background: var(--white);
}

.p2-faq {
  background: var(--cream-light);
}

.p2-final-call {
  padding: clamp(4rem, 8vw, 5.5rem) clamp(1.5rem, 5vw, 6rem);
  background: var(--dark-bg);
  color: var(--cream-light);
}

.p2-final-call .container {
  max-width: 900px;
  text-align: center;
}

.p2-final-call h2 {
  margin-bottom: 1rem;
  font-size: clamp(2rem, 1.5rem + 1.5vw, 3rem);
  color: var(--cream-light);
}

.p2-final-call p {
  max-width: 620px;
  margin: 0 auto 1.75rem;
  color: rgba(250,248,244,0.82);
}

.section,
.p2-final-call {
  content-visibility: auto;
  contain-intrinsic-size: auto 900px;
}

@media (max-width: 1024px) {
  .p2-price-grid,
  .p2-includes-grid,
  .p2-factors-grid,
  .p2-addon-grid,
  .p2-proof-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 900px) {
  .p2-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .p2-hero-media {
    min-height: 360px;
    border-top: 1px solid rgba(0,0,0,0.04);
  }

  .trust-divider { display: none; }

  .trust-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 0.75rem;
    padding: 1.35rem 1.25rem;
  }

  .trust-item { justify-content: center; text-align: center; }

  .p2-price-grid,
  .p2-proof-grid,
  .p2-includes-grid,
  .p2-factors-grid,
  .p2-addon-grid,
  .p2-custom { grid-template-columns: 1fr; }

  .p2-plan-featured { transform: none; }
}

@media (max-width: 640px) {
  .p2-hero-copy { padding: 2rem 1.5rem 2.5rem; }
  .p2-hero-media { min-height: 300px; }
  .p2-hero-card { left: 1rem; right: 1rem; max-width: none; }
  .p2-budget-line { gap: 0.5rem; }
  .p2-budget-chip { width: fit-content; }
  .p2-feature-review-card { padding: 1.75rem 1.25rem; }
}
</style>

<link rel="stylesheet" href="/css/below-fold.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/css/below-fold.css"></noscript>
<link rel="stylesheet" href="/fonts/fonts-secondary.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/fonts/fonts-secondary.css"></noscript>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Preise & Leistungen für Hochzeitsfotografie — Natalia Tschischik",
  "description": "Transparente Preise für Hochzeitsfotografie in Kassel, Göttingen und Nordhessen. Standesamtbegleitung ab 500 €, Halbtagsreportage ab 1.400 €, Ganztagsreportage ab 2.400 € und individuelle Begleitungen ab 3.400 €.",
  "provider": {
    "@type": ["LocalBusiness", "Photographer"],
    "name": "Natalia Tschischik — Hochzeitsfotograf Kassel",
    "url": "https://nataliatschischik.com"
  },
  "areaServed": [
    { "@type": "City", "name": "Kassel" },
    { "@type": "City", "name": "Göttingen" },
    { "@type": "AdministrativeArea", "name": "Nordhessen" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Hochzeitsfotografie Begleitungen",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Standesamtbegleitung",
        "description": "Ab 3 Stunden Begleitung, mindestens 150 bearbeitete Bilder, Online-Galerie, 50 km inklusive",
        "price": "500",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "500",
          "priceCurrency": "EUR"
        }
      },
      {
        "@type": "Offer",
        "name": "Halbtagsreportage",
        "description": "8 Stunden Begleitung, mindestens 400 bearbeitete Bilder, Galerie & Download, 200 km inklusive",
        "price": "1400",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "1400",
          "priceCurrency": "EUR"
        }
      },
      {
        "@type": "Offer",
        "name": "Ganztagsreportage",
        "description": "10 Stunden Begleitung, mindestens 600 bearbeitete Bilder, Highlight-Diashow, Fine-Art-Album 20x20, 200 km inklusive",
        "price": "2400",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "2400",
          "priceCurrency": "EUR"
        }
      },
      {
        "@type": "Offer",
        "name": "Individuelle Begleitung",
        "description": "Ab 12 Stunden, Second Shooter, Album 30x30, mehrere Orte oder parallele Abläufe",
        "price": "3400",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "minPrice": "3400",
          "priceCurrency": "EUR"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "40",
    "bestRating": "5"
  }
}
</script>`;

module.exports = {
  layout: "layouts/page.njk",
  permalink: "preise2.html",
  hasInlineContactSection: true,
  seo: {
    title: "Preise & Leistungen | Hochzeitsfotograf Kassel — Natalia Tschischik",
    description: "Transparente Preise für Hochzeitsfotografie: Standesamtbegleitung ab 500 €, Halbtagsreportage ab 1.400 € und Ganztagsreportage ab 2.400 €.",
    keywords: "Hochzeitsfotograf Kassel Preise, Hochzeitsfotografie Kosten, Standesamtbegleitung Preis, Ganztagsreportage Preis",
    canonical: "https://nataliatschischik.com/preise2",
    ogTitle: "Preise & Leistungen | Hochzeitsfotograf Kassel — Natalia Tschischik",
    ogDescription: "Klare Preise für Hochzeitsfotografie: Standesamtbegleitung, Halbtagsreportage, Ganztagsreportage und individuelle Begleitungen.",
    ogType: "website",
    ogLocale: "de_DE",
    ogImage: "https://nataliatschischik.com/images/og-default.jpg",
    ogImageWidth: "1200",
    ogImageHeight: "630",
    robots: "noindex, nofollow",
    geoRegion: "DE-HE",
    geoPlacename: "Kassel",
    twitterCard: "summary_large_image",
    twitterSite: "@natalia_photography",
    twitterTitle: "Preise & Leistungen | Hochzeitsfotograf Kassel — Natalia Tschischik",
    twitterDescription: "Transparente Preise für Hochzeitsfotografie von Standesamt bis Ganztagsreportage.",
    twitterImage: "https://nataliatschischik.com/images/og-default.jpg"
  },
  bodyAttributes: "",
  headExtra,
  trackingEnabled: true,
  isHome: false
};
