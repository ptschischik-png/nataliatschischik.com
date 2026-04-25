const homePageData = require("../index-pre-index3.11tydata.cjs");

const defaultHeroImageBase = "/assets/images/shared/natalia/gd-15zAiT52byizm3F";
const locationHeroImageBase = "/assets/images/reportagen/sababurg-jj/2-14";

function heroImagePreloads(imageBase, { include1200 = false } = {}) {
  const mobileHref = include1200 ? `${imageBase}-1200w.webp` : `${imageBase}-800w.webp`;
  const mobileSrcset = [
    `${imageBase}-400w.webp 400w`,
    `${imageBase}-800w.webp 800w`,
    include1200 ? `${imageBase}-1200w.webp 1200w` : null
  ].filter(Boolean).join(", ");

  return [
    `<link rel="preload" as="image" type="image/webp" media="(max-width: 768px)" href="${mobileHref}" imagesrcset="${mobileSrcset}" imagesizes="100vw" fetchpriority="high">`,
    `<link rel="preload" as="image" type="image/webp" media="(min-width: 769px)" href="${imageBase}.webp" fetchpriority="high">`
  ].join("\n");
}

function withHeroImageBase(headExtra, imageBase, options = {}) {
  const currentHeadExtra = String(headExtra || "").replace(
    /<link rel="preload" as="image"[^>]+fetchpriority="high">/,
    heroImagePreloads(defaultHeroImageBase, options)
  );

  return currentHeadExtra
    .replaceAll(`${defaultHeroImageBase}-400w.webp`, `${imageBase}-400w.webp`)
    .replaceAll(`${defaultHeroImageBase}-800w.webp`, `${imageBase}-800w.webp`)
    .replaceAll(`${defaultHeroImageBase}-1200w.webp`, `${imageBase}-1200w.webp`)
    .replaceAll(`${defaultHeroImageBase}.webp`, `${imageBase}.webp`);
}

const locationHeroHeadExtra = withHeroImageBase(homePageData.headExtra, locationHeroImageBase, { include1200: true });

module.exports = {
  heroImagePreloads,
  locationHeroHeadExtra,
  withHeroImageBase
};
