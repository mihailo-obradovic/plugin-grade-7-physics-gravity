// Self-contained packaging for a standalone plugin repo. Runs after `tsup` has
// emitted dist/index.js: drops manifest.json, styles.css, and assets/ alongside
// it and strips the source map unless PUBLISH_SOURCEMAPS=1. jsDelivr serves the
// resulting dist/ from a version tag (see .github/workflows/publish.yml).
import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(source, destination) {
  if (!(await pathExists(source))) {
    return false;
  }

  await cp(source, destination, { recursive: true });
  return true;
}

await mkdir(distDir, { recursive: true });

const hasBundle = await pathExists(path.join(distDir, 'index.js'));
const publishSourcemaps = process.env.PUBLISH_SOURCEMAPS === '1';

if (!publishSourcemaps) {
  await rm(path.join(distDir, 'index.js.map'), { force: true });
}

await copyIfExists(
  path.join(repoRoot, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

await copyIfExists(
  path.join(repoRoot, 'src/styles.css'),
  path.join(distDir, 'styles.css')
);

await copyIfExists(path.join(repoRoot, 'assets'), path.join(distDir, 'assets'));

await copyIfExists(
  path.join(repoRoot, 'src/i18n/messages'),
  path.join(distDir, 'messages')
);

console.info(
  `Packaged ${hasBundle ? 'plugin' : 'iframe plugin'} into ${distDir}`
);
