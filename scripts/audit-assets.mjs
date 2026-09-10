import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const targetArg = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'public';
const targetRoot = path.resolve(process.cwd(), targetArg);
const TOP_FILES = 30;
const TOP_FOLDERS = 30;

function humanBytes(value) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = value;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  const digits = i === 0 || n >= 100 ? 0 : n >= 10 ? 1 : 2;
  return `${n.toFixed(digits)} ${units[i]}`;
}

function percent(part, total) {
  return total ? `${((part / total) * 100).toFixed(1)}%` : '0.0%';
}

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (entry.isFile()) {
      const stat = await fs.stat(full);
      files.push({
        full,
        rel: path.relative(targetRoot, full).split(path.sep).join('/'),
        size: stat.size,
        ext: path.extname(entry.name).toLowerCase() || '(no extension)',
      });
    }
  }
  return files;
}

function addSize(map, key, size) {
  map.set(key, (map.get(key) ?? 0) + size);
}

function folderKeys(rel) {
  const parts = rel.split('/');
  const keys = [];
  if (parts.length > 1) keys.push(parts[0]);
  if (parts.length > 2) keys.push(`${parts[0]}/${parts[1]}`);
  return keys;
}

async function sha256(filePath) {
  const buffer = await fs.readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

async function main() {
  try {
    const stat = await fs.stat(targetRoot);
    if (!stat.isDirectory()) throw new Error('not a directory');
  } catch {
    console.error(`\n❌ Folder not found: ${targetRoot}`);
    console.error('Usage: npm run audit:assets -- [folder]');
    process.exit(1);
  }

  console.log(`\n🔎 Scanning ${path.relative(process.cwd(), targetRoot) || '.'} ...`);
  const files = await walk(targetRoot);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const folderTotals = new Map();
  const extTotals = new Map();

  for (const file of files) {
    addSize(extTotals, file.ext, file.size);
    for (const key of folderKeys(file.rel)) addSize(folderTotals, key, file.size);
  }

  const sortedFiles = [...files].sort((a, b) => b.size - a.size);
  const sortedFolders = [...folderTotals.entries()].sort((a, b) => b[1] - a[1]);
  const sortedExts = [...extTotals.entries()].sort((a, b) => b[1] - a[1]);

  console.log('\n════════════════════════════════════════════');
  console.log('📦 ASSET AUDIT — ממלכת הלמידה');
  console.log('════════════════════════════════════════════');
  console.log(`Files:        ${files.length.toLocaleString()}`);
  console.log(`Total size:   ${humanBytes(total)}`);

  console.log('\n📁 Largest folders');
  for (const [folder, size] of sortedFolders.slice(0, TOP_FOLDERS)) {
    console.log(`${humanBytes(size).padStart(10)}  ${percent(size, total).padStart(6)}  ${folder}`);
  }

  console.log('\n🧱 By file type');
  for (const [ext, size] of sortedExts) {
    console.log(`${humanBytes(size).padStart(10)}  ${percent(size, total).padStart(6)}  ${ext}`);
  }

  console.log(`\n🐘 ${TOP_FILES} largest files`);
  for (const file of sortedFiles.slice(0, TOP_FILES)) {
    console.log(`${humanBytes(file.size).padStart(10)}  ${file.rel}`);
  }

  // Only hash groups that share a byte-size. This keeps duplicate detection practical.
  const bySize = new Map();
  for (const file of files) {
    const group = bySize.get(file.size) ?? [];
    group.push(file);
    bySize.set(file.size, group);
  }

  const byHash = new Map();
  for (const group of [...bySize.values()].filter((group) => group.length > 1)) {
    for (const file of group) {
      const hash = await sha256(file.full);
      const key = `${file.size}:${hash}`;
      const hashGroup = byHash.get(key) ?? [];
      hashGroup.push(file);
      byHash.set(key, hashGroup);
    }
  }

  const duplicateGroups = [...byHash.values()]
    .filter((group) => group.length > 1)
    .sort((a, b) => (b[0].size * (b.length - 1)) - (a[0].size * (a.length - 1)));

  const duplicateExtraBytes = duplicateGroups.reduce(
    (sum, group) => sum + group[0].size * (group.length - 1),
    0,
  );

  console.log('\n🧬 Exact byte-identical duplicates');
  console.log(`Duplicate groups: ${duplicateGroups.length.toLocaleString()}`);
  console.log(`Extra bytes represented by duplicates: ${humanBytes(duplicateExtraBytes)}`);
  console.log('⚠️  Do NOT delete automatically: repeated animation frames may be intentional.');

  for (const group of duplicateGroups.slice(0, 10)) {
    const repeatedBytes = group[0].size * (group.length - 1);
    console.log(`\n${group.length} × ${humanBytes(group[0].size)}  (${humanBytes(repeatedBytes)} repeated)`);
    for (const file of group.slice(0, 6)) console.log(`   ${file.rel}`);
    if (group.length > 6) console.log(`   ... +${group.length - 6} more`);
  }

  console.log('\n🚀 Deployment-storage scale (simple upper-bound illustration)');
  for (const count of [1, 5, 10, 20, 50]) {
    console.log(`${String(count).padStart(2)} deployments × ${humanBytes(total)} ≈ ${humanBytes(total * count)}`);
  }
  console.log('\nℹ️  This is a scale indicator, not a Vercel billing calculation.');

  console.log('\n💡 Useful commands');
  console.log('   npm run audit:assets              # scans public');
  console.log('   npm run build');
  console.log('   npm run audit:assets -- dist      # scans actual Vite build output');
  console.log('');
}

main().catch((error) => {
  console.error('\n❌ Asset audit failed:', error);
  process.exit(1);
});
