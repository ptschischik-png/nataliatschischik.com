import fs from 'node:fs';
import path from 'node:path';

const webpExtensionPattern = /\.webp(?=($|[\s,)'"]|[?#]))/gi;
const responsiveCandidatePattern = /-(?:400w|800w|1200w)(?=\.(?:webp|avif)(?:$|[?#]))/gi;
const repoRoot = path.resolve(new URL('.', import.meta.url).pathname);

export default function(eleventyConfig) {
  eleventyConfig.setServerPassthroughCopyBehavior('passthrough');
  eleventyConfig.setServerOptions({
    aliases: {
      '/assets/': 'src/assets/'
    }
  });

  eleventyConfig.addTransform('avif-first-image-markup', (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith('.html')) return content;
    return upgradeImageMarkup(content);
  });

  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/css': 'css' });
  eleventyConfig.addPassthroughCopy({ 'src/fonts': 'fonts' });
  eleventyConfig.addPassthroughCopy({ 'src/js': 'js' });
  eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });
  eleventyConfig.addPassthroughCopy({ 'src/llms.txt': 'llms.txt' });
  eleventyConfig.addPassthroughCopy({ 'src/_redirects': '_redirects' });
  eleventyConfig.addPassthroughCopy({ 'src/google71311938103d98f5.html': 'google71311938103d98f5.html' });
  eleventyConfig.addPassthroughCopy({ 'src/favicon.ico': 'favicon.ico' });
  eleventyConfig.addPassthroughCopy({ 'src/favicon.svg': 'favicon.svg' });
  eleventyConfig.addPassthroughCopy({ 'src/favicon-32x32.png': 'favicon-32x32.png' });
  eleventyConfig.addPassthroughCopy({ 'src/apple-touch-icon.png': 'apple-touch-icon.png' });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'dist'
    },
    htmlTemplateEngine: 'njk',
    templateFormats: ['html', 'njk']
  };
};

function upgradeImageMarkup(html) {
  const pictureBlocks = [];
  let upgraded = html
    .replace(/<picture\b[\s\S]*?<\/picture>/gi, (picture) => {
      const index = pictureBlocks.push(upgradePicture(picture)) - 1;
      return `%%AVIF_PICTURE_${index}%%`;
    })
    .replace(/<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])[^>]*>/gi, upgradeImagePreload)
    .replace(/<link\b(?=[^>]*\bas=["']image["'])(?=[^>]*\brel=["']preload["'])[^>]*>/gi, upgradeImagePreload)
    .replace(/<img\b[^>]*\bsrc=["'][^"']+\.webp(?:[?#][^"']*)?["'][^>]*>/gi, wrapStandaloneWebpImage);

  for (const [index, picture] of pictureBlocks.entries()) {
    upgraded = upgraded.replace(`%%AVIF_PICTURE_${index}%%`, picture);
  }

  return upgraded;
}

function upgradePicture(picture) {
  if (/\.avif(?:$|[\s,)'"]|[?#])/i.test(picture)) return picture;

  const imgTag = (picture.match(/<img\b[^>]*>/i) || [])[0] || '';
  const imgSrc = getAttribute(imgTag, 'src');

  if (imgSrc && /\.webp(?:$|[?#])/i.test(imgSrc)) {
    const fullWebp = stripResponsiveCandidate(imgSrc);
    const fullAvif = toAvif(fullWebp);
    const mobileSources = shouldAddGeneratedMobileSources(imgTag) && !hasMobileMediaSource(picture) ? buildMobileSources(fullWebp) : '';
    const fullSources = `  <source type="image/avif" srcset="${fullAvif}">\n  <source type="image/webp" srcset="${fullWebp}">`;

    return picture
      .replace(/<source\b[^>]*>/gi, upgradeSource)
      .replace(/(<img\b[^>]*>)/i, `${mobileSources}${fullSources}\n  $1`);
  }

  return picture.replace(/<source\b[^>]*>/gi, upgradeSource);
}

function upgradeSource(sourceTag) {
  if (!/\.webp(?:$|[\s,)'"]|[?#])/i.test(sourceTag) || /\.avif(?:$|[\s,)'"]|[?#])/i.test(sourceTag)) {
    return sourceTag;
  }

  const avifSource = setAttribute(toAvif(sourceTag), 'type', 'image/avif');
  const webpSource = setAttribute(sourceTag, 'type', 'image/webp');
  return `${avifSource}\n  ${webpSource}`;
}

function upgradeImagePreload(linkTag) {
  const href = getAttribute(linkTag, 'href');
  if (!href || !/\.webp(?:$|[?#])/i.test(href)) return linkTag;

  const fullWebp = stripResponsiveCandidate(href);
  const mobileAvifSrcset = buildResponsiveSrcset(toAvif(fullWebp));
  const mobileWebpSrcset = buildResponsiveSrcset(fullWebp);
  const media = getAttribute(linkTag, 'media');

  if (/\bmax-width\b/i.test(media)) {
    const mobileOnly = setAttribute(toAvif(linkTag), 'type', 'image/avif');
    const srcset = getAttribute(linkTag, 'imagesrcset');
    return srcset ? setAttribute(mobileOnly, 'imagesrcset', toAvif(srcset)) : mobileOnly;
  }

  if (/\bmin-width\b/i.test(media)) {
    const desktopOnly = removeAttribute(removeAttribute(linkTag, 'imagesrcset'), 'imagesizes');
    return setAttribute(setAttribute(toAvif(desktopOnly), 'href', toAvif(fullWebp)), 'type', 'image/avif');
  }

  if (mobileAvifSrcset || mobileWebpSrcset) {
    const cleanLink = removeAttribute(removeAttribute(linkTag, 'imagesrcset'), 'imagesizes');
    const fullAvifLink = setAttribute(setAttribute(toAvif(cleanLink), 'href', toAvif(fullWebp)), 'type', 'image/avif');
    const desktopLink = setAttribute(fullAvifLink, 'media', '(min-width: 769px)');
    const mobileHref = getLargestSrcsetUrl(mobileAvifSrcset || mobileWebpSrcset);
    const mobileLink = setAttribute(
      setAttribute(
        setAttribute(
          setAttribute(toAvif(cleanLink), 'href', mobileHref),
          'type',
          mobileAvifSrcset ? 'image/avif' : 'image/webp'
        ),
        'imagesrcset',
        mobileAvifSrcset || mobileWebpSrcset
      ),
      'imagesizes',
      '100vw'
    );
    return `${setAttribute(mobileLink, 'media', '(max-width: 768px)')}\n${desktopLink}`;
  }

  return setAttribute(setAttribute(toAvif(linkTag), 'href', toAvif(href)), 'type', 'image/avif');
}

function wrapStandaloneWebpImage(imgTag) {
  const src = getAttribute(imgTag, 'src');
  if (!src || !/\.webp(?:$|[?#])/i.test(src)) return imgTag;

  const fullWebp = stripResponsiveCandidate(src);
  const fullAvif = toAvif(fullWebp);
  const fallbackImg = removeAttribute(removeAttribute(imgTag, 'srcset'), 'sizes');
  const mobileSources = shouldAddGeneratedMobileSources(imgTag) ? buildMobileSources(fullWebp) : '';

  return `<picture style="display:contents">\n${mobileSources}  <source type="image/avif" srcset="${fullAvif}">\n  <source type="image/webp" srcset="${fullWebp}">\n  ${fallbackImg}\n</picture>`;
}

function buildMobileSources(fullWebp) {
  const avifSrcset = buildResponsiveSrcset(toAvif(fullWebp));
  const webpSrcset = buildResponsiveSrcset(fullWebp);
  const sources = [];

  if (avifSrcset) {
    sources.push(`  <source media="(max-width: 768px)" srcset="${avifSrcset}" sizes="100vw" type="image/avif">`);
  }

  if (webpSrcset) {
    sources.push(`  <source media="(max-width: 768px)" srcset="${webpSrcset}" sizes="100vw" type="image/webp">`);
  }

  return sources.length ? `${sources.join('\n')}\n` : '';
}

function buildResponsiveSrcset(fullUrl) {
  const cleanUrl = stripUrlSuffix(fullUrl);
  const candidates = [400, 800]
    .map((width) => ({
      width,
      url: cleanUrl.replace(/\.(webp|avif)$/i, `-${width}w.$1`)
    }))
    .filter((candidate) => localAssetExists(candidate.url));

  return candidates.map((candidate) => `${candidate.url} ${candidate.width}w`).join(', ');
}

function getLargestSrcsetUrl(srcset) {
  return srcset
    .split(',')
    .map((candidate) => {
      const [url, descriptor = ''] = candidate.trim().split(/\s+/);
      const width = Number((descriptor.match(/^(\d+)w$/) || [])[1] || 0);
      return { url, width };
    })
    .filter((candidate) => candidate.url)
    .sort((a, b) => b.width - a.width)[0]?.url || '';
}

function hasMobileMediaSource(picture) {
  return /<source\b(?=[^>]*\bmedia=["'][^"']*max-width:\s*768px[^"']*["'])/i.test(picture);
}

function shouldAddGeneratedMobileSources(imgTag) {
  return !/\sloading=["']eager["']/i.test(imgTag) && !/\sfetchpriority=["']high["']/i.test(imgTag);
}

function localAssetExists(url) {
  const cleanUrl = stripUrlSuffix(url);
  if (!cleanUrl.startsWith('/assets/')) return false;
  return fs.existsSync(path.join(repoRoot, 'src', cleanUrl.replace(/^\/+/, '')));
}

function stripUrlSuffix(url) {
  return url.replace(/[?#].*$/, '');
}

function toAvif(value) {
  return value.replace(webpExtensionPattern, '.avif');
}

function stripResponsiveCandidate(value) {
  return value.replace(responsiveCandidatePattern, '');
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=["']([^"']+)["']`, 'i'));
  return match ? match[1] : '';
}

function setAttribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}=["'][^"']*["']`, 'i');
  if (pattern.test(tag)) return tag.replace(pattern, ` ${name}="${value}"`);
  return tag.replace(/>$/, ` ${name}="${value}">`);
}

function removeAttribute(tag, name) {
  return tag.replace(new RegExp(`\\s${name}=["'][^"']*["']`, 'gi'), '');
}
