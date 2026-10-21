const { readFileSync, writeFileSync, readdirSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { join, relative } = require('node:path');
const root = join(__dirname, '..', 'dist');
const hash = createHash('sha256');
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
    const file = join(dir, item.name);
    if (item.isDirectory()) walk(file);
    else if (item.name !== 'bloodinfo-build.json') hash.update(relative(root, file)).update(readFileSync(file));
  }
}
walk(root);
const sha256 = data => createHash('sha256').update(data).digest('hex');
writeFileSync(join(root, 'bloodinfo-build.json'), JSON.stringify({
  app: 'frontend', commit: process.env.SOURCE_COMMIT || 'local',
  htmlSha256: sha256(readFileSync(join(root, 'index.html'))), buildSha256: hash.digest('hex')
}));
