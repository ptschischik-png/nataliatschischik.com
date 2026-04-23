const homePageData = require("../index-pre-index3.11tydata.cjs");

const defaultHeroImageBase = "img/ext/gd-15zAiT52byizm3F";
const locationHeroImageBase = "reportagen/img/sababurg/2-14";

function withHeroImageBase(headExtra, imageBase) {
  return String(headExtra || "")
    .replaceAll(`${defaultHeroImageBase}-400w.webp`, `${imageBase}-400w.webp`)
    .replaceAll(`${defaultHeroImageBase}-800w.webp`, `${imageBase}-800w.webp`)
    .replaceAll(`${defaultHeroImageBase}.webp`, `${imageBase}.webp`);
}

const locationHeroHeadExtra = withHeroImageBase(homePageData.headExtra, locationHeroImageBase);

module.exports = {
  locationHeroHeadExtra,
  withHeroImageBase
};
