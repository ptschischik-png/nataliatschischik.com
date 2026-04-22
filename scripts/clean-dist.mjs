import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');

async function removeDirSafely(targetDir) {
  try {
    await fs.rm(targetDir, { recursive: true, force: true });
  } catch (error) {
    if (error?.code !== 'ENOTEMPTY') throw error;

    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
          await removeDirSafely(entryPath);
        } else {
          await fs.unlink(entryPath);
        }
      })
    );

    await fs.rmdir(targetDir);
  }
}

await removeDirSafely(distDir);
await fs.mkdir(distDir, { recursive: true });
