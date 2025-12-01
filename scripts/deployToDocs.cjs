const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const distDir = path.join(root, 'dist');
const docsDir = path.join(root, 'docs');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  // Remove existing docs folder
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(docsDir, { recursive: true });

  // Copy dist contents to docs
  copyDir(distDir, docsDir);
  console.log('Copied dist -> docs');

  // Git add/commit/push
  try {
    execSync('git add docs', { stdio: 'inherit' });
    // Commit only if there are staged changes
    try {
      execSync('git commit -m "chore(docs): update GitHub Pages site from build"', { stdio: 'inherit' });
    } catch (commitErr) {
      console.log('No changes to commit (docs unchanged).');
    }
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('Pushed docs to origin/main');
  } catch (gitErr) {
    console.error('Git operations failed. Please commit and push docs manually.', gitErr);
    process.exit(1);
  }
} catch (err) {
  console.error('Error deploying to docs:', err);
  process.exit(1);
}
