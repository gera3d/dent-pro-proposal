import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const requiredMirrors = [
    ['index.html', 'ios/App/App/public/index.html'],
    ['manifest.json', 'ios/App/App/public/manifest.json'],
    ['service-worker.js', 'ios/App/App/public/service-worker.js'],
    ['version.json', 'ios/App/App/public/version.json'],
    ['capacitor-bridge.js', 'ios/App/App/public/capacitor-bridge.js']
];

function fileHash(filePath) {
    return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function requireFile(filePath, label) {
    if (!existsSync(filePath)) {
        throw new Error(`Missing ${label}: ${path.relative(rootDir, filePath)}`);
    }
}

for (const [sourceRelative, targetRelative] of requiredMirrors) {
    const sourcePath = path.join(rootDir, sourceRelative);
    const targetPath = path.join(rootDir, targetRelative);

    requireFile(sourcePath, 'source file');
    requireFile(targetPath, 'synced iOS file');

    if (fileHash(sourcePath) !== fileHash(targetPath)) {
        throw new Error(
            `Sync verification failed for ${sourceRelative}; iOS copy does not match ${targetRelative}`
        );
    }
}

const nativeConfigPath = path.join(rootDir, 'ios/App/App/public/config.json');
requireFile(nativeConfigPath, 'native config');

let parsedConfig;
try {
    parsedConfig = JSON.parse(readFileSync(nativeConfigPath, 'utf8'));
} catch {
    throw new Error('Native config is not valid JSON: ios/App/App/public/config.json');
}

const airtable = parsedConfig?.airtable;
if (!airtable?.apiKey?.trim() || !airtable?.baseId?.trim()) {
    throw new Error('Native config is missing Airtable credentials in ios/App/App/public/config.json');
}

console.log('TestFlight preflight passed: iOS wrapper files and native config are in sync.');
