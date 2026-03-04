const fs = require('fs');

const newVersion = process.argv[2];

if (!newVersion) {
    console.error('Please provide a version string, e.g., node bump-version.js 2026.03.04.02');
    process.exit(1);
}

console.log(`Bumping version to ${newVersion}...`);

// 1. Update version.json
const versionJsonPath = './version.json';
if (fs.existsSync(versionJsonPath)) {
    const vc = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
    vc.version = newVersion;
    fs.writeFileSync(versionJsonPath, JSON.stringify(vc, null, 4));
    console.log('✅ Updated version.json');
}

// 2. Update service-worker.js
const swPath = './service-worker.js';
if (fs.existsSync(swPath)) {
    let sw = fs.readFileSync(swPath, 'utf8');
    sw = sw.replace(/const APP_VERSION = '.*?';/, `const APP_VERSION = '${newVersion}';`);
    fs.writeFileSync(swPath, sw);
    console.log('✅ Updated service-worker.js');
}

// 3. Update Training_Guide.html
const tgPath = './Option_B_Custom_WebApp/Training_Guide.html';
if (fs.existsSync(tgPath)) {
    let tg = fs.readFileSync(tgPath, 'utf8');
    tg = tg.replace(/const LOCAL_APP_VERSION = '.*?';/, `const LOCAL_APP_VERSION = '${newVersion}';`);
    fs.writeFileSync(tgPath, tg);
    console.log('✅ Updated Training_Guide.html');
}

console.log('Done!');
