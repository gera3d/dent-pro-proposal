import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'capacitor-www');

const includeLocalConfig = process.env.CAP_INCLUDE_LOCAL_CONFIG === '1';
const forcePlaceholderConfig = process.env.CAP_FORCE_PLACEHOLDER_CONFIG === '1';

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

if (includeLocalConfig) {
    const configJsSource = path.join(rootDir, 'config.js');
    if (existsSync(configJsSource)) {
        cpSync(configJsSource, path.join(outputDir, 'config.js'));
    }
}

function readJsonIfPresent(filePath) {
    if (!existsSync(filePath)) return null;
    try {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

function hasUsableAirtableConfig(configObject) {
    const airtable = configObject?.airtable;
    return Boolean(
        airtable &&
        typeof airtable.apiKey === 'string' &&
        airtable.apiKey.trim() &&
        typeof airtable.baseId === 'string' &&
        airtable.baseId.trim() &&
        (
            (typeof airtable.tableName === 'string' && airtable.tableName.trim()) ||
            (typeof airtable.tableId === 'string' && airtable.tableId.trim())
        )
    );
}

function resolveNativeConfigSource() {
    if (forcePlaceholderConfig) return null;

    const explicitPath = process.env.CAP_CONFIG_PATH?.trim();
    const candidatePaths = [];
    if (explicitPath) {
        candidatePaths.push(path.isAbsolute(explicitPath) ? explicitPath : path.join(rootDir, explicitPath));
    }
    candidatePaths.push(
        path.join(rootDir, 'config.native.json'),
        path.join(rootDir, 'config.json')
    );

    for (const candidatePath of candidatePaths) {
        const parsed = readJsonIfPresent(candidatePath);
        if (hasUsableAirtableConfig(parsed)) {
            return candidatePath;
        }
    }

    return null;
}

const resolvedConfigPath = resolveNativeConfigSource();
const targetConfigPath = path.join(outputDir, 'config.json');

if (resolvedConfigPath) {
    cpSync(resolvedConfigPath, targetConfigPath);
} else {
    // Keep builds deterministic when no usable native config is available.
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
    writeFileSync(targetConfigPath, JSON.stringify(fallbackConfig, null, 4));
}

console.log(`Prepared Capacitor web bundle in ${outputDir}`);
if (resolvedConfigPath) {
    console.log(`Using native config source: ${path.relative(rootDir, resolvedConfigPath)}`);
} else if (forcePlaceholderConfig) {
    console.log('Forced placeholder config (CAP_FORCE_PLACEHOLDER_CONFIG=1).');
} else {
    console.log('No usable Airtable config found (checked CAP_CONFIG_PATH, config.native.json, config.json). Wrote placeholder config.json.');
}
if (includeLocalConfig) {
    console.log('CAP_INCLUDE_LOCAL_CONFIG=1 enabled: copied config.js when available.');
}
