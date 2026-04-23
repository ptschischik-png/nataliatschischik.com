const base = require("./index-pre-index3.11tydata.cjs");
const { locationHeroHeadExtra } = require("./_data/sharedHeadExtras.cjs");

const heroExtra = `
<style>
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
  .hero-cta-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .hero-cta-row .btn-primary,
  .hero-cta-row .btn-ghost {
    width: 100%;
    justify-content: center;
    text-align: center;
  }
  .hero-proof-inline {
    margin-top: 0.95rem;
    gap: 0.35rem 0.45rem;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    line-height: 1.8;
  }
  .hero-travel-note {
    margin-top: 0.8rem;
    padding-top: 0.75rem;
    font-size: 0.88rem;
  }
}
</style>`;

module.exports = {
  ...base,
  permalink: "index.html",
  headExtra: locationHeroHeadExtra + heroExtra
};
