const homePageData = require("../index-pre-index3.11tydata.cjs");

const defaultHeroImageBase = "img/ext/gd-15zAiT52byizm3F";
const locationHeroImageBase = "reportagen/img/sababurg/2-14";

function heroImagePreloads(imageBase) {
  return [
    `<link rel="preload" as="image" type="image/webp" media="(max-width: 768px)" href="${imageBase}-800w.webp" imagesrcset="${imageBase}-400w.webp 400w, ${imageBase}-800w.webp 800w" imagesizes="100vw" fetchpriority="high">`,
    `<link rel="preload" as="image" type="image/webp" media="(min-width: 769px)" href="${imageBase}.webp" fetchpriority="high">`
  ].join("\n");
}

function withHeroImageBase(headExtra, imageBase) {
  const currentHeadExtra = String(headExtra || "").replace(
    /<link rel="preload" as="image"[^>]+fetchpriority="high">/,
    heroImagePreloads(defaultHeroImageBase)
  );

  return currentHeadExtra
    .replaceAll(`${defaultHeroImageBase}-400w.webp`, `${imageBase}-400w.webp`)
    .replaceAll(`${defaultHeroImageBase}-800w.webp`, `${imageBase}-800w.webp`)
    .replaceAll(`${defaultHeroImageBase}.webp`, `${imageBase}.webp`);
}

const locationHeroHeadExtra = withHeroImageBase(homePageData.headExtra, locationHeroImageBase);

module.exports = {
  heroImagePreloads,
  locationHeroHeadExtra,
  withHeroImageBase
};
