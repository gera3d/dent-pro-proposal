# Capacitor Wrapper Quickstart

## What Was Added

This repo now contains the first wrapper scaffold for an iPad app:

- `package.json` with Capacitor scripts and dependencies
- `capacitor.config.ts` pointing at a staged web bundle in `capacitor-www/`
- `scripts/prepare-capacitor-web.mjs` to copy the current static app into the Capacitor bundle folder
- `capacitor-bridge.js` as a browser-safe native bridge stub
- `ios/App/App/plugins/DentCameraBridgePlugin.swift` for native volume-button shutter events

## How The Bridge Works

The current web app remains the source of truth.

- Browser/PWA: `window.DentNative` does nothing
- Native wrapper: `window.DentNative.startVolumeShutter()` and `stopVolumeShutter()` can call into native code
- Native iOS code will later trigger `window.DentNative.emitVolumeShutter()` to reuse the existing shutter path

## Commands

Install dependencies:

```bash
npm install
```

Prepare web assets for Capacitor:

```bash
npm run prepare:capacitor
```

Prepare web assets and include local secret config (local debugging only):

```bash
CAP_INCLUDE_LOCAL_CONFIG=1 npm run prepare:capacitor
```

Generate iOS project:

```bash
npm run cap:add:ios
```

Sync web changes into the iOS project:

```bash
npm run cap:sync
```

Open Xcode:

```bash
npm run cap:open:ios
```

## Current Limitation

- By default, Capacitor bundle prep does **not** include local `config.json` / `config.js` to avoid shipping secrets.
- Native wrapper disables service worker registration to prevent stale cache behavior inside WKWebView.
- If you need live Airtable/GHL calls in a local native debug build, run `CAP_INCLUDE_LOCAL_CONFIG=1 npm run prepare:capacitor` before `npm run cap:sync`.
