const fetch = require('node-fetch');

// This script ensures "Google Drive Folder" exists on the Airtable base
async function ensureField() {
    const config = require('./config.json');
    if(!config.api_key) {
        // Fallback to searching the codebase
        const fs = require('fs');
        const code = fs.readFileSync('index.html', 'utf8');
        const match = code.match(/loadAirtableConfig[\s\S]*?\{[\s\S]*?apiKey:\s*['"]([^'"]+)['"]/);
        console.log("Match:", match?.[1] ? "found" : "not found");
    }
}
ensureField();
