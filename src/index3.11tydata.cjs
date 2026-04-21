const base = require("./index.11tydata.cjs");

const previewPolish = `
<base href="/">
<style>
.hero {
  position: relative;
  min-height: clamp(66rem, 118vh, 80rem);
  background: linear-gradient(180deg, rgba(253, 252, 250, 0.96) 0%, rgba(250, 248, 244, 0.98) 100%);
  box-shadow: inset 0 -1px 0 rgba(122, 98, 88, 0.08);
}
.hero-content {
  padding-block-end: clamp(4rem, 8vw, 6.5rem);
}
.hero-label + h1 {
  max-width: 9ch;
}
.hero-text {
  max-width: 33rem;
  color: var(--brown-600);
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
.hero-image img,
.hero-image:hover img {
  transform: none !important;
  transition: none !important;
}

.portfolio {
  background: var(--cream);
  padding-top: clamp(6.5rem, 12vw, 10rem);
}
.portfolio-header {
  margin-bottom: clamp(3rem, 5vw, 4.75rem);
}
.portfolio-header > div {
  max-width: 38rem;
}

.testimonials {
  box-shadow: inset 0 24px 36px -30px rgba(17, 11, 8, 0.65);
}
.testimonials-header {
  margin-bottom: 3.1rem;
}

.process {
  background: linear-gradient(180deg, var(--cream-light) 0%, #f8f3ec 100%);
}
.process-header {
  margin-bottom: 3.25rem;
}
.process-step {
  background: rgba(255, 255, 255, 0.68);
  border-color: rgba(122, 98, 88, 0.1);
  box-shadow: 0 14px 30px rgba(44, 24, 16, 0.035);
}

#preise-teaser {
  background: linear-gradient(180deg, rgba(250, 248, 244, 0.94) 0%, rgba(247, 241, 235, 0.98) 100%);
  border-top: 1px solid rgba(122, 98, 88, 0.08);
  border-bottom: 1px solid rgba(122, 98, 88, 0.08);
}
.index2-pricing-teaser-card {
  padding: clamp(2.25rem, 5vw, 4.25rem) 0;
}
.index2-pricing-teaser-head {
  margin-bottom: 2.25rem;
}
.index2-pricing-teaser-head .section-title {
  margin-bottom: 0.9rem;
}
.index2-pricing-teaser-head p {
  max-width: 40rem;
}
.index2-pricing-plan {
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 34px rgba(44, 24, 16, 0.04);
}
.index2-pricing-plan.is-featured {
  transform: translateY(-4px);
}
.index2-pricing-footer-copy {
  max-width: 38rem;
}

.faq {
  background: #efe8de;
}
.faq-header {
  margin-bottom: 2.5rem;
}
.faq-intro {
  max-width: 36rem;
  margin: 0 auto;
  color: var(--brown-500);
  line-height: 1.75;
}

.contact {
  background: linear-gradient(180deg, #f8f3ec 0%, var(--cream) 100%);
  border-top: 1px solid rgba(122, 98, 88, 0.08);
}
.contact-desc {
  max-width: 34rem;
}
.contact-form {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(122, 98, 88, 0.1);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: 0 16px 32px rgba(44, 24, 16, 0.035);
}
.form-trust {
  text-align: left;
}

.journal-teaser {
  border-top: 1px solid rgba(122, 98, 88, 0.08);
}
.journal-teaser-header {
  max-width: 40rem;
  margin-inline: auto;
}
.journal-teaser-header p {
  color: var(--brown-500);
  line-height: 1.75;
  margin: 0 auto;
  max-width: 33rem;
}
.journal-teaser-grid {
  align-items: start;
}
.journal-teaser-card {
  transition: transform 0.4s var(--ease-out);
}
.journal-teaser-card:hover {
  transform: translateY(-4px);
}

@media (max-width: 980px) {
  .index2-pricing-plan.is-featured {
    transform: none;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: auto;
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
    margin: -3rem 1rem 0;
    padding: 1.5rem 1.35rem 2rem;
    background: rgba(253, 252, 250, 0.97);
    border-radius: var(--radius);
    box-shadow: 0 18px 38px rgba(44, 24, 16, 0.08);
  }
  .hero h1 {
    font-size: clamp(2.35rem, 9vw, 3.45rem);
    line-height: 1.02;
    margin-bottom: 1rem;
    max-width: 8ch;
    text-wrap: balance;
  }
  .hero-label {
    margin-bottom: 0.8rem;
  }
  .hero-text {
    font-size: 0.98rem;
    line-height: 1.68;
    margin-bottom: 1.4rem;
  }
  .hero-cta-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .hero-cta-row .btn-primary,
  .hero-cta-row .btn-ghost {
    width: 100%;
    text-align: center;
    justify-content: center;
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

  .portfolio {
    padding-top: clamp(5rem, 14vw, 6.5rem);
  }
  .portfolio-header {
    margin-bottom: 2.5rem;
  }

  .testimonials {
    padding-top: clamp(5rem, 13vw, 6.5rem);
  }
  .testimonial-card {
    padding: 2rem 1.5rem;
  }

  .process-step {
    padding: 1.6rem 1.25rem;
  }
  .process-step p {
    max-width: none;
  }

  .index2-pricing-teaser-card {
    padding: 1rem 0;
  }
  .index2-pricing-teaser-head {
    margin-bottom: 1.65rem;
  }
  .index2-pricing-teaser-head .section-title {
    font-size: clamp(1.8rem, 7vw, 2.35rem);
  }
  .index2-pricing-teaser-head p {
    max-width: 30ch;
  }
  .index2-pricing-plan {
    padding: 1.2rem 1.1rem;
    gap: 0.75rem;
  }
  .index2-pricing-plan-copy {
    font-size: 0.96rem;
    line-height: 1.65;
  }
  .index2-pricing-footer-copy {
    max-width: 30ch;
  }

  .faq-question {
    font-size: clamp(1.2rem, 6vw, 1.45rem);
    padding: 1.2rem 0;
  }
  .faq-answer-inner {
    padding-bottom: 1.2rem;
  }

  .contact {
    padding-top: clamp(5rem, 14vw, 6.5rem);
  }
  .contact-form {
    padding: 1.25rem;
  }
  .form-submit {
    width: 100%;
  }

  .journal-teaser {
    padding-top: clamp(5rem, 14vw, 6.5rem) !important;
  }
  .journal-teaser-grid {
    gap: 2.25rem !important;
  }
  .journal-teaser-card {
    max-width: 30rem;
    margin: 0 auto;
  }
}
</style>`;

module.exports = {
  ...base,
  permalink: "index3/index.html",
  seo: {
    ...base.seo,
    title: "Index Preview | Natalia Tschischik",
    description: "Preview der überarbeiteten Startseite mit harmonisierten Übergängen, konsistenterem Copy-Ton und mobilem Polish.",
    canonical: "https://nataliatschischik.com/index3/",
    ogTitle: "Index Preview | Natalia Tschischik",
    ogDescription: "Preview der überarbeiteten Startseite mit harmonisierten Übergängen, konsistenterem Copy-Ton und mobilem Polish.",
    robots: "noindex, nofollow",
    twitterTitle: "Index Preview | Natalia Tschischik",
    twitterDescription: "Preview der überarbeiteten Startseite mit harmonisierten Übergängen, konsistenterem Copy-Ton und mobilem Polish."
  },
  headExtra: base.headExtra + previewPolish
};
