const webpExtensionPattern = /\.webp(?=($|[\s,)'"]|[?#]))/gi;
const responsiveCandidatePattern = /-(?:400w|800w|1200w)(?=\.(?:webp|avif)(?:$|[?#]))/gi;

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
  const isPriority = /\bfetchpriority=["']high["']/i.test(imgTag) || /\bloading=["']eager["']/i.test(imgTag);

  if (imgSrc && /\.webp(?:$|[?#])/i.test(imgSrc)) {
    const fullWebp = stripResponsiveCandidate(imgSrc);
    const fullAvif = toAvif(fullWebp);
    const fullSources = `  <source type="image/avif" srcset="${fullAvif}">\n  <source type="image/webp" srcset="${fullWebp}">`;

    if (isPriority) {
      return picture.replace(/(<picture\b[^>]*>)[\s\S]*?(<img\b[^>]*>)([\s\S]*?<\/picture>)/i, `$1\n${fullSources}\n  $2$3`);
    }

    return picture
      .replace(/<source\b[^>]*>/gi, upgradeSource)
      .replace(/(<img\b[^>]*>)/i, `${fullSources}\n  $1`);
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

  return setAttribute(
    setAttribute(removeAttribute(removeAttribute(toAvif(linkTag), 'imagesrcset'), 'imagesizes'), 'href', toAvif(stripResponsiveCandidate(href))),
    'type',
    'image/avif'
  );
}

function wrapStandaloneWebpImage(imgTag) {
  const src = getAttribute(imgTag, 'src');
  if (!src || !/\.webp(?:$|[?#])/i.test(src)) return imgTag;

  const fullWebp = stripResponsiveCandidate(src);
  const fullAvif = toAvif(fullWebp);
  const fallbackImg = removeAttribute(removeAttribute(imgTag, 'srcset'), 'sizes');

  return `<picture style="display:contents">\n  <source type="image/avif" srcset="${fullAvif}">\n  <source type="image/webp" srcset="${fullWebp}">\n  ${fallbackImg}\n</picture>`;
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
