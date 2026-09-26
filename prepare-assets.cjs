const fs = require('fs');
const path = require('path');

const assetsDir = path.resolve(__dirname, 'assets');
const sourceIcon = path.join(assetsDir, 'wordspaceicon.png');

if (!fs.existsSync(sourceIcon)) {
  console.error(`Error: Source icon not found at: ${sourceIcon}`);
  process.exit(1);
}

// @capacitor/assets requires standard filenames:
// - icon.png or icon-only.png or logo.png (app icon)
// - splash.png or splash-dark.png (splash screen)
const targets = ['icon.png', 'icon-only.png', 'logo.png', 'splash.png', 'splash-dark.png'];

targets.forEach((fileName) => {
  const destPath = path.join(assetsDir, fileName);
  fs.copyFileSync(sourceIcon, destPath);
  console.log(`✓ Created: assets/${fileName}`);
});

console.log('\nAll asset templates prepared successfully for @capacitor/assets!');
