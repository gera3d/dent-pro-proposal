import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'capacitor-www');

const entriesToCopy = [
    'index.html',
    'manifest.json',
    'service-worker.js',
    'version.json',
    'logo.webp',
    'app-icon.png',
    'capacitor-bridge.js',
    'config.js',
    'config.json',
    'Option_B_Custom_WebApp'
];

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const entry of entriesToCopy) {
    const sourcePath = path.join(rootDir, entry);
    const targetPath = path.join(outputDir, entry);

    if (!existsSync(sourcePath)) {
        continue;
    }

    cpSync(sourcePath, targetPath, { recursive: true });
}

console.log(`Prepared Capacitor web bundle in ${outputDir}`);