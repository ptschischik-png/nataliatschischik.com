const homePageData = require("../index-pre-index3.11tydata.cjs");

const defaultHeroImageBase = "/assets/images/shared/natalia/gd-15zAiT52byizm3F";
const locationHeroImageBase = "/assets/images/reportagen/sababurg-jj/main-card";

function heroImagePreloads(imageBase, { include1200 = false } = {}) {
  const mobileHref = include1200 ? `${imageBase}-1200w.avif` : `${imageBase}-800w.avif`;
  const mobileSrcset = [
    `${imageBase}-400w.avif 400w`,
    `${imageBase}-800w.avif 800w`,
    include1200 ? `${imageBase}-1200w.avif 1200w` : null
  ].filter(Boolean).join(", ");

  return [
    `<link rel="preload" as="image" type="image/avif" media="(max-width: 768px)" href="${mobileHref}" imagesrcset="${mobileSrcset}" imagesizes="100vw" fetchpriority="high">`,
    `<link rel="preload" as="image" type="image/avif" media="(min-width: 769px)" href="${imageBase}.avif" fetchpriority="high">`
  ].join("\n");
}

function withHeroImageBase(headExtra, imageBase, options = {}) {
  const currentHeadExtra = String(headExtra || "").replace(
    /<link rel="preload" as="image"[^>]+fetchpriority="high">/,
    heroImagePreloads(imageBase, options)
  );

  return currentHeadExtra
    .replaceAll(`${defaultHeroImageBase}-400w.webp`, `${imageBase}-400w.webp`)
    .replaceAll(`${defaultHeroImageBase}-800w.webp`, `${imageBase}-800w.webp`)
    .replaceAll(`${defaultHeroImageBase}-1200w.webp`, `${imageBase}-1200w.webp`)
    .replaceAll(`${defaultHeroImageBase}.webp`, `${imageBase}.webp`)
    .replaceAll(`${defaultHeroImageBase}-400w.avif`, `${imageBase}-400w.avif`)
    .replaceAll(`${defaultHeroImageBase}-800w.avif`, `${imageBase}-800w.avif`)
    .replaceAll(`${defaultHeroImageBase}-1200w.avif`, `${imageBase}-1200w.avif`)
    .replaceAll(`${defaultHeroImageBase}.avif`, `${imageBase}.avif`);
}

const locationHeroHeadExtra = withHeroImageBase(homePageData.headExtra, locationHeroImageBase, { include1200: true });

module.exports = {
  heroImagePreloads,
  locationHeroHeadExtra,
  withHeroImageBase
};
