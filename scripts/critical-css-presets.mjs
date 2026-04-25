const COMMON_CRITICAL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;scroll-padding-top:5rem}
body{font-family:var(--font-body);font-size:var(--text-base);line-height:1.65;color:var(--brown-600);background:var(--cream)}
img{display:block;max-width:100%;height:auto}
button,a{font:inherit;color:inherit;text-decoration:none}
button{cursor:pointer;background:none;border:none}
ul,ol{list-style:none}
:root{--cream:#F5F0E8;--cream-light:#FAF8F4;--cream-dark:#EDE7DB;--white:#FDFCFA;--brown-900:#2C1810;--brown-800:#3D2518;--brown-700:#4A3228;--brown-600:#5E443A;--brown-500:#7A6258;--brown-400:#9E8A80;--brown-300:#C4B5AB;--brown-200:#DDD3CA;--brown-100:#EDE7E0;--accent:#5A2628;--accent-dark:#481E20;--accent-light:#835C5D;--dark-bg:#1E1B18;--dark-card:#2A2622;--font-display:'Cormorant Garamond','Georgia',serif;--font-body:'DM Sans','Helvetica Neue',sans-serif;--text-xs:clamp(.6875rem,.65rem + .15vw,.75rem);--text-sm:clamp(.8125rem,.78rem + .15vw,.875rem);--text-base:clamp(.9375rem,.9rem + .2vw,1rem);--text-lg:clamp(1.0625rem,1rem + .4vw,1.25rem);--text-xl:clamp(1.375rem,1.1rem + .8vw,1.75rem);--text-2xl:clamp(1.75rem,1.3rem + 1.5vw,2.75rem);--text-3xl:clamp(2.25rem,1.5rem + 2.5vw,3.75rem);--text-hero:clamp(2.75rem,1rem + 5.5vw,5.5rem);--text-display:clamp(3.5rem,1.5rem + 6vw,7rem);--radius:6px;--ease-out:cubic-bezier(.16,1,.3,1);--transition:300ms var(--ease-out)}
h1,h2,h3,h4{font-family:var(--font-display);font-weight:400;line-height:1.1;color:var(--brown-900)}
p{max-width:60ch}
::selection{background:rgba(90,38,40,.16);color:var(--brown-900)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.material-symbols-outlined{display:inline-block;width:1em;height:1em;vertical-align:-.125em;flex-shrink:0}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.25rem clamp(1.5rem,3vw,3rem);display:flex;justify-content:space-between;align-items:center;background:rgba(245,240,232,.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,0,0,.04);transition:padding var(--transition),background var(--transition)}
.nav.scrolled{padding:.75rem clamp(1.5rem,3vw,3rem)}
.nav-logo{font-family:var(--font-display);font-size:1.5rem;font-style:italic;font-weight:500;letter-spacing:0;color:var(--brown-900)}
.nav-links{display:flex;gap:2.25rem;align-items:center}
.nav-links a{font-size:var(--text-xs);font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--brown-500);transition:color var(--transition);position:relative}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:var(--brown-900);transition:width var(--transition)}
.nav-links a:hover,.nav-links a.active{color:var(--brown-900)}
.nav-links a:hover::after,.nav-links a.active::after{width:100%}
.nav-cta{display:inline-block;font-size:var(--text-xs);font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:.625rem 1.5rem;background:var(--accent);color:var(--cream-light);border-radius:var(--radius);transition:background var(--transition)}
.hamburger{display:none;flex-direction:column;gap:5px;width:24px;padding:0}
.hamburger span{display:block;height:1.5px;background:var(--brown-900);transition:transform var(--transition),opacity var(--transition);transform-origin:center}
.hamburger.active span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
.hamburger.active span:nth-child(2){opacity:0}
.hamburger.active span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
.nav-mobile{display:none;position:fixed;inset:0;z-index:99;background:var(--cream);flex-direction:column;justify-content:center;align-items:center;gap:2rem}
.nav-mobile.open{display:flex}
.nav-mobile a{font-family:var(--font-display);font-size:var(--text-xl);font-style:italic;color:var(--brown-900);transition:color var(--transition)}
.nav-mobile .mobile-cta{margin-top:1rem;font-family:var(--font-body);font-style:normal;font-size:var(--text-xs);font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:.875rem 2.5rem;background:var(--accent);color:var(--cream-light);border-radius:var(--radius)}
@media(max-width:900px){.nav-links,.nav-cta{display:none}.hamburger{display:flex}}
.btn-primary{display:inline-block;font-size:var(--text-xs);font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:1rem 2.5rem;background:var(--accent);color:var(--cream-light);border-radius:var(--radius);transition:background var(--transition),transform .2s ease}
.btn-ghost{display:inline-block;font-size:var(--text-xs);font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:1rem 2rem;border:1px solid var(--brown-300);color:var(--brown-600);border-radius:var(--radius);transition:all var(--transition)}
.breadcrumb{margin-top:4.75rem;padding:.875rem clamp(1.5rem,3vw,3rem);font-size:var(--text-xs);font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--brown-400);border-bottom:1px solid var(--brown-100)}
.breadcrumb ol{display:flex;align-items:center;flex-wrap:wrap;gap:.35rem}
.breadcrumb a{color:var(--brown-500)}
.relative{position:relative}.absolute{position:absolute}.fixed{position:fixed}.inset-0{inset:0}.block{display:block}.inline-block{display:inline-block}.flex{display:flex}.grid{display:grid}.hidden{display:none}.w-full{width:100%}.h-screen{height:100vh}.overflow-hidden{overflow:hidden}.mx-auto{margin-left:auto;margin-right:auto}.text-center{text-align:center}.uppercase{text-transform:uppercase}.italic{font-style:italic}.font-light{font-weight:300}.text-white{color:#fff}.text-white\\/90{color:rgba(255,255,255,.9)}.text-xs{font-size:.75rem;line-height:1rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-6xl{font-size:3.75rem;line-height:1}.mb-6{margin-bottom:1.5rem}.mt-6{margin-top:1.5rem}.max-w-2xl{max-width:42rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.items-center{align-items:center}.justify-center{justify-content:center}.flex-col{flex-direction:column}.-translate-x-1\\/2{--tw-translate-x:-50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y,0))}.left-1\\/2{left:50%}.bottom-8{bottom:2rem}.w-16{width:4rem}.leading-relaxed{line-height:1.625}.tracking-\\[0\\.25em\\]{letter-spacing:.25em}.tracking-\\[0\\.4em\\]{letter-spacing:.4em}.bg-gradient-to-t{background-image:linear-gradient(to top,var(--tw-gradient-stops))}.from-black\\/65{--tw-gradient-from:rgba(0,0,0,.65) var(--tw-gradient-from-position);--tw-gradient-to:transparent var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.via-black\\/20{--tw-gradient-to:transparent var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),rgba(0,0,0,.2) var(--tw-gradient-via-position),var(--tw-gradient-to)}.to-black\\/10{--tw-gradient-to:rgba(0,0,0,.1) var(--tw-gradient-to-position)}
@media(min-width:768px){.md\\:text-2xl{font-size:1.5rem;line-height:2rem}.md\\:text-8xl{font-size:6rem;line-height:1}.md\\:px-12{padding-left:3rem;padding-right:3rem}}
`;

const MARKETING_HERO_CRITICAL_CSS = `
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;padding-top:4.5rem}
.hero-content{display:flex;flex-direction:column;justify-content:center;padding:clamp(2rem,5vw,6rem);padding-right:clamp(2rem,4vw,4rem)}
.hero-label{font-size:var(--text-xs);font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:1.5rem}
.hero h1{font-size:var(--text-hero);font-weight:300;letter-spacing:0;margin-bottom:2rem;color:var(--brown-900)}
.hero h1 em{font-style:italic;font-weight:400;color:var(--accent)}
.hero-text{font-size:var(--text-base);color:var(--brown-500);margin-bottom:2.5rem;line-height:1.8}
.hero-cta-row{display:flex;gap:1.25rem;align-items:center;flex-wrap:wrap}
.hero-image{position:relative;overflow:hidden}
.hero-image picture{display:block;width:100%;height:100%}
.hero-image img{width:100%;height:100%;object-fit:cover}
.hero-proof-inline{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.35rem;font-size:var(--text-xs);letter-spacing:.1em;text-transform:uppercase;color:var(--brown-400)}
.hero-travel-note{margin-top:.9rem;padding-top:.85rem;border-top:1px solid rgba(122,98,88,.18);font-size:var(--text-sm);color:var(--brown-500);max-width:none}
@media(max-width:768px){.hero{grid-template-columns:1fr;min-height:100svh;overflow-x:clip}.hero-image{height:auto;aspect-ratio:962/1282;order:-1;justify-self:stretch;width:100%;max-width:100vw}.hero-content{position:relative;z-index:2;margin:-2.5rem 1rem 0;padding:1.75rem 1.5rem 2.75rem;background:rgba(253,252,250,.96);border-radius:var(--radius);box-shadow:0 18px 38px rgba(44,24,16,.08)}.hero h1{font-size:clamp(2.6rem,10vw,4rem);line-height:1.02;margin-bottom:1.15rem}.hero-text{font-size:var(--text-sm);line-height:1.75;margin-bottom:1.75rem}.hero-cta-row{display:grid;grid-template-columns:1fr;gap:.75rem}.hero-cta-row .btn-primary,.hero-cta-row .btn-ghost{width:100%;justify-content:center;text-align:center}.hero-proof-inline{margin-top:.95rem;gap:.35rem .45rem;font-size:.68rem;letter-spacing:.08em;line-height:1.8}}
`;

const PORTFOLIO_CRITICAL_CSS = `
@media(max-width:767px){#mobile-portfolio-slider{position:relative;width:100vw;height:100svh;overflow:hidden}.hslider-track{position:relative;width:100%;height:100%}.hslider-slide{position:absolute;inset:0;width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;opacity:0;pointer-events:none}.hslider-slide.active{opacity:1;pointer-events:auto;z-index:2}.hslide-media,.hslide-image{position:absolute;inset:0;display:block;width:100%;height:100%}.hslide-media{z-index:0}.hslide-image{object-fit:cover;object-position:center}.hslide-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.12) 50%,rgba(0,0,0,0) 100%);pointer-events:none}.hslide-content{position:relative;z-index:2;text-align:center;padding:0 2.5rem 5.5rem;color:#FDFCFA}.hslide-content h2{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(2.8rem,12vw,4.5rem);font-weight:300;letter-spacing:0;line-height:1.05;margin-bottom:.3rem;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.4)}.hslide-location{font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;opacity:.7;margin-bottom:1.5rem}.hslide-quote{font-family:var(--font-display);font-style:italic;font-size:1.1rem;opacity:.85;margin-bottom:1.75rem}.hslide-btn{display:inline-block;color:#FDFCFA;font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;border:1px solid rgba(255,255,255,.45);padding:.8rem 1.8rem}}
@media(min-width:768px){#mobile-portfolio-slider{display:none}}
`;

const PRICING_CRITICAL_CSS = `
.p2-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,44vw);min-height:calc(100svh - 4.5rem);padding-top:4.5rem;background:var(--cream);border-bottom:1px solid var(--brown-100)}
.p2-hero-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(3rem,7vw,7rem) clamp(1.5rem,5vw,6rem)}
.p2-kicker{font-size:var(--text-xs);font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:1.25rem}
.p2-hero h1{font-size:clamp(2.6rem,5.6vw,5.8rem);font-weight:300;letter-spacing:0;line-height:.98;max-width:10ch;margin-bottom:1.4rem}
.p2-hero-lead{font-size:var(--text-base);line-height:1.8;color:var(--brown-500);margin-bottom:1.5rem}
.p2-budget-line{display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:.65rem}
.p2-budget-chip{display:inline-flex;border:1px solid rgba(90,38,40,.18);background:rgba(253,252,250,.74);padding:.45rem .7rem;border-radius:999px;font-size:var(--text-xs);letter-spacing:.08em;text-transform:uppercase;color:var(--brown-700)}
.p2-budget-note{font-size:var(--text-xs);color:var(--brown-400);margin-bottom:1.5rem}
.p2-hero-actions{display:flex;gap:1rem;flex-wrap:wrap;align-items:center}
.p2-hero-note{margin-top:1rem;font-size:var(--text-sm);color:var(--brown-400)}
.p2-hero-media{position:relative;min-height:100%;overflow:hidden}
.p2-hero-media picture,.p2-hero-media img{display:block;width:100%;height:100%}
.p2-hero-media img{object-fit:cover}
.p2-hero-card{position:absolute;left:1.5rem;bottom:1.5rem;max-width:22rem;background:rgba(253,252,250,.92);padding:1rem 1.15rem;border-radius:var(--radius);box-shadow:0 18px 38px rgba(44,24,16,.16)}
.p2-hero-card strong{display:block;font-family:var(--font-display);font-size:var(--text-lg);font-style:italic;color:var(--brown-900)}
.p2-hero-card span{display:block;font-size:var(--text-sm);color:var(--brown-500);line-height:1.6}
@media(max-width:900px){.p2-hero{display:flex;flex-direction:column;padding-top:4.5rem}.p2-hero-media{order:-1;min-height:52svh}.p2-hero-copy{padding:2rem 1.5rem 2.5rem}.p2-hero-card{left:1rem;right:1rem;max-width:none}.p2-hero h1{font-size:clamp(2.35rem,12vw,4.2rem);max-width:12ch}.p2-hero-actions{display:grid;grid-template-columns:1fr}.p2-hero-actions .btn-primary,.p2-hero-actions .btn-ghost{text-align:center}}
`;

const JOURNAL_CRITICAL_CSS = `
.journal-hero{padding:clamp(8rem,12vw,12rem) clamp(1.5rem,5vw,6rem) clamp(3rem,5vw,5rem);text-align:center;background:var(--cream)}
.journal-hero-label{font-size:var(--text-xs);font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--brown-400);margin-bottom:1rem;display:block}
.journal-hero h1{font-size:var(--text-display);font-style:italic;font-weight:300;color:var(--brown-900);margin-bottom:1.5rem}
.journal-hero p{font-size:var(--text-base);color:var(--brown-500);max-width:52ch;margin:0 auto;line-height:1.7}
.journal-wrap{max-width:1240px;margin:0 auto;padding:0 clamp(1.5rem,3vw,3rem)}
.featured-post{margin-bottom:1.75rem}
.featured-post-image{width:100%;aspect-ratio:16/8;object-fit:cover;border-radius:var(--radius);margin-bottom:1.75rem}
`;

const REPORTAGE_CRITICAL_CSS = `
main{padding-top:4.5rem}
.chapter-sidebar{position:fixed;left:1.25rem;top:50%;transform:translateY(-50%);z-index:40;display:flex;flex-direction:column;gap:.8rem}
.chapter-sidebar a{display:flex;align-items:center;gap:.5rem;color:rgba(44,24,16,.42)}
.chapter-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
@media(max-width:900px){.chapter-sidebar{display:none}}
`;

function pageTypeCss(rel, html) {
  const chunks = [];

  if (html.includes('class="hero"') || html.includes("class='hero'")) {
    chunks.push(MARKETING_HERO_CRITICAL_CSS);
  }

  if (rel === 'portfolio.html' || html.includes('id="mobile-portfolio-slider"')) {
    chunks.push(PORTFOLIO_CRITICAL_CSS);
  }

  if (html.includes('class="p2-hero"')) {
    chunks.push(PRICING_CRITICAL_CSS);
  }

  if (html.includes('class="journal-hero"')) {
    chunks.push(JOURNAL_CRITICAL_CSS);
  }

  if (rel.startsWith('reportagen/') && html.includes('h-screen')) {
    chunks.push(REPORTAGE_CRITICAL_CSS);
  }

  return chunks.join('\n');
}

export function getCriticalCssForPage(rel, html) {
  return [COMMON_CRITICAL_CSS, pageTypeCss(rel, html)].filter(Boolean).join('\n').trim();
}
