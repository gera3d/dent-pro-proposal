import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'capacitor-www');

const includeLocalConfig = process.env.CAP_INCLUDE_LOCAL_CONFIG === '1';

const entriesToCopy = [
    'index.html',
    'manifest.json',
    'service-worker.js',
    'version.json',
    'logo.webp',
    'app-icon.png',
    'capacitor-bridge.js',
    'Option_B_Custom_WebApp'
];

if (includeLocalConfig) {
    entriesToCopy.push('config.js', 'config.json');
}

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

if (!includeLocalConfig) {
    // Keep native builds deterministic and avoid shipping local secrets by default.
    const fallbackConfigPath = path.join(outputDir, 'config.json');
    const fallbackConfig = {
        airtable: {
            apiKey: '',
            baseId: '',
            tableName: 'PDR Assessments',
            tableId: ''
        },
        photoUpload: {
            service: 'tmpfiles.org',
            note: 'Files uploaded to tmpfiles.org are immediately downloaded by Airtable.'
        }
    };
    writeFileSync(fallbackConfigPath, JSON.stringify(fallbackConfig, null, 4));
}

console.log(`Prepared Capacitor web bundle in ${outputDir}`);
if (includeLocalConfig) {
    console.log('Included local config files (CAP_INCLUDE_LOCAL_CONFIG=1).');
} else {
    console.log('Skipped local config files. Set CAP_INCLUDE_LOCAL_CONFIG=1 to include them for local native debugging.');
}
