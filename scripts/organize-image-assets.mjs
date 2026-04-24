import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const textExtensions = new Set(['.html', '.njk', '.cjs', '.js', '.css']);
const imageExtensions = new Set(['.avif', '.webp', '.png', '.jpg', '.jpeg', '.svg']);
const moves = [];
const rewrites = [];

const reportagenDirs = [
  ['renthof', 'reportagen/renthof-kassel-aw'],
  ['ra-renthof', 'reportagen/renthof-kassel-ra'],
  ['ee-herkulesterrassen', 'reportagen/herkulesterrassen-kassel-ee'],
  ['sg-goettingen', 'reportagen/goettingen-sg'],
  ['vm-kassel', 'reportagen/rathaus-kassel-vm'],
  ['sababurg', 'reportagen/sababurg-jj'],
  ['bergpark', 'reportagen/bergpark-wilhelmshoehe-tv'],
  ['berlepsch', 'reportagen/schloss-berlepsch-aw'],
  ['bad-arolsen', 'pages/preise/bad-arolsen']
];

for (const [oldDir, newDir] of reportagenDirs) {
  addMove(`src/reportagen/img/${oldDir}`, `src/assets/images/${newDir}`);
  addPrefixRewrite(`reportagen/img/${oldDir}/`, `/assets/images/${newDir}/`);
  addPrefixRewrite(`img/${oldDir}/`, `/assets/images/${newDir}/`);
}

for (const file of listFiles('src/images')) {
  if (!isImage(file)) continue;
  const rel = slash(path.relative('src/images', file));
  const destRel = siteImageDestination(rel);
  addMove(file, `src/assets/images/${destRel}`);
  addExactRewrite(`images/${rel}`, `/assets/images/${destRel}`);
}

for (const file of listFiles('src/img/ext')) {
  if (!isImage(file)) continue;
  const rel = slash(path.relative('src/img/ext', file));
  const destRel = externalImageDestination(rel);
  addMove(file, `src/assets/images/${destRel}`);
  addExactRewrite(`img/ext/${rel}`, `/assets/images/${destRel}`);
}

if (!apply) {
  console.log(`Dry run: ${moves.length} moves, ${rewrites.length} rewrite rules.`);
  console.log('Run with --apply to modify files.');
  process.exit(0);
}

for (const move of moves) {
  movePath(move.from, move.to);
}

const textFiles = listFiles('src').filter((file) => textExtensions.has(path.extname(file)));
let changedFiles = 0;

for (const file of textFiles) {
  const absolute = path.join(root, file);
  let content = fs.readFileSync(absolute, 'utf8');
  const original = content;

  for (const rule of rewrites) {
    content = replaceAllPathVariants(content, rule.from, rule.to);
  }

  if (content !== original) {
    fs.writeFileSync(absolute, content);
    changedFiles++;
  }
}

console.log(`Moved ${moves.length} asset paths and updated ${changedFiles} source files.`);

function addMove(from, to) {
  moves.push({ from, to });
}

function addExactRewrite(from, to) {
  rewrites.push({ from, to });
}

function addPrefixRewrite(from, to) {
  rewrites.push({ from, to });
}

function movePath(from, to) {
  const source = path.join(root, from);
  const target = path.join(root, to);
  if (!fs.existsSync(source)) return;
  if (fs.existsSync(target)) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.renameSync(source, target);
}

function replaceAllPathVariants(content, from, to) {
  const cleanFrom = from.replace(/^\/+/, '');
  const cleanTo = to.startsWith('/') ? to : `/${to}`;
  const variants = [
    `../../${cleanFrom}`,
    `../${cleanFrom}`,
    `https://nataliatschischik.com/${cleanFrom}`,
    `/${cleanFrom}`,
    cleanFrom
  ].sort((left, right) => right.length - left.length);

  for (const variant of variants) {
    const replacement = variant.startsWith('https://')
      ? `https://nataliatschischik.com${cleanTo}`
      : cleanTo;
    content = content.split(variant).join(replacement);
  }

  return content;
}

function listFiles(dir) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) return [];
  const files = [];
  walk(absolute, files);
  return files.map((file) => slash(path.relative(root, file)));
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(file, files);
    } else {
      files.push(file);
    }
  }
}

function isImage(file) {
  return imageExtensions.has(path.extname(file).toLowerCase());
}

function siteImageDestination(rel) {
  const file = path.basename(rel);

  if (rel.startsWith('branding/')) return `brand/google-ads/${file}`;
  if (file === 'material-symbols-sprite.svg') return `icons/${file}`;
  if (file.startsWith('natalia-')) return `shared/natalia/${file}`;
  if (file.startsWith('journal-orangerie-')) return `journal/orangerie-kassel/${file}`;
  if (file.startsWith('journal-golden-hour')) return `journal/golden-hour/${file}`;
  if (file.startsWith('journal-locations')) return `journal/hochzeitslocations-kassel/${file}`;
  if (file.startsWith('journal-shooting')) return `journal/brautpaar-shooting-tipps/${file}`;
  if (file.startsWith('album-watercolor')) return `journal/hochzeitsalbum/${file}`;

  return `shared/illustrations/${file}`;
}

function externalImageDestination(rel) {
  const file = path.basename(rel);
  const stem = file
    .replace(/-(?:400w|800w|1200w|1600w)(?=\.[^.]+$)/, '')
    .replace(/\.[^.]+$/, '');

  if (stem.startsWith('album-')) return `journal/hochzeitsalbum/${file}`;
  if (stem === 'aw-portfolio-teaser') return `reportagen/renthof-kassel-aw/teasers/${file}`;
  if (stem === 'vs-schloss-portrait') return `reportagen/schloss-bad-arolsen-vs/teasers/${file}`;
  if (stem === 'gd-15zAiT52byizm3F' || stem === 'gd-1TyJ_xV_myyaLyhx') return `shared/natalia/${file}`;
  if (stem.startsWith('ai-')) return `journal/generated/${file}`;
  if (stem.startsWith('gd-')) return `reportagen/schloss-bad-arolsen-vs/gallery/${file}`;

  return `legacy/external/${file}`;
}

function slash(value) {
  return value.split(path.sep).join('/');
}
