# Other Mac Setup Plan

## Purpose

Use this plan on the other Mac to finish the iPad wrapper setup for the Dent Experts Scoper app.

This repo already contains the wrapper scaffold:

- `package.json`
- `capacitor.config.ts`
- `capacitor-bridge.js`
- `scripts/prepare-capacitor-web.mjs`
- camera bridge hooks in `index.html`

What is not done yet:

- generate the `ios/` project
- add the native Swift plugin for volume buttons
- build and test on a real iPad

## What To Bring To The Other Machine

### Required Repo State

Make sure the other Mac has the latest repo state that includes:

- the Capacitor scaffold files
- the updated `index.html`
- the docs in `brain/`

### Required Local Secrets

These files are gitignored and may not exist on the other Mac unless you copy them manually:

- `config.js`
- `config.json`

If the native wrapper is going to use the real API integrations, copy those files over before testing.

## Target Outcome

By the end of this plan, the other machine should be able to:

1. install the project dependencies
2. generate the `ios/` Capacitor project
3. open the wrapper in Xcode
4. run the existing web app inside a native iPad shell
5. be ready for the Swift volume-button plugin

## Phase 0: Machine Prerequisites

### Install These First

1. Full Xcode from the App Store
2. Node.js 20+ or newer
3. Homebrew
4. CocoaPods

### Verify Tooling

Run these commands:

```bash
xcodebuild -version
node -v
npm -v
brew --version
pod --version
```

Expected result:

- all commands return versions
- `xcodebuild` should not complain about CommandLineTools-only mode
- `pod` should exist on PATH

### Fix Active Xcode Path

If `xcodebuild` fails or points to Command Line Tools, run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

Then re-run:

```bash
xcodebuild -version
```

## Phase 1: Prepare The Repo

### 1. Clone Or Pull The Repo

If cloning fresh:

```bash
git clone <your-repo-url>
cd "Dent Pro"
```

If already present:

```bash
cd "Dent Pro"
git pull
```

### 2. Restore Local Config Files

If needed, copy these from the working machine:

- `config.js`
- `config.json`

### 3. Confirm Scaffold Files Exist

Run:

```bash
ls package.json capacitor.config.ts capacitor-bridge.js
ls scripts/prepare-capacitor-web.mjs
```

## Phase 2: Install Project Dependencies

Run:

```bash
npm install
```

This installs:

- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/ios`
- `typescript`

### Validation

Run:

```bash
npm run prepare:capacitor
```

Expected result:

- a `capacitor-www/` folder is created
- the script finishes without errors

### What The Staging Step Does

The script copies the current web app into a native bundle folder:

- `index.html`
- `manifest.json`
- `service-worker.js`
- `version.json`
- `logo.webp`
- `app-icon.png`
- `capacitor-bridge.js`
- `config.js`
- `config.json`
- `Option_B_Custom_WebApp/`

## Phase 3: Generate The iOS Project

Run:

```bash
npm run cap:add:ios
```

Expected result:

- an `ios/` directory is created
- a native Xcode project exists under `ios/App/`

### If `cap:add:ios` Fails

#### Failure: CocoaPods is not installed

Run:

```bash
brew install cocoapods
pod setup
```

Then retry:

```bash
npm run cap:add:ios
```

#### Failure: Xcode not active

Run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

Then retry.

#### Failure: command not found for `pod`

Check:

```bash
which pod
pod --version
```

If still missing after Homebrew install, make sure Homebrew is on PATH:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

For Intel Macs, the path may be `/usr/local/bin/brew` instead.

## Phase 4: Sync The Web App Into iOS

After `ios/` exists, run:

```bash
npm run cap:sync
```

Use this command any time you change the web app and want the native wrapper updated.

Expected result:

- Capacitor copies the latest staged web assets into the native project

## Phase 5: Open In Xcode

Run:

```bash
npm run cap:open:ios
```

Or open manually:

```bash
open ios/App/App.xcworkspace
```

If CocoaPods is not being used and Capacitor opens a project instead of a workspace, use the generated path it creates.

## Phase 6: Prove The Wrapper Runs Before Native Plugin Work

### In Xcode

1. Select an iPad simulator first
2. Build and run
3. Confirm the app launches into the existing web UI

### Validate These Behaviors

1. The app opens the existing main screen
2. The camera modal opens
3. The existing tap-to-capture path works
4. The thumb-zone capture UI still works
5. The app can still load configuration

Do not start the native volume-button work until this phase is stable.

## Phase 7: Add The Native Volume Plugin

This is the first actual native feature phase.

### Files To Add Later

Expected native addition:

- `ios/App/App/plugins/DentCameraBridgePlugin.swift`

### Required Native Responsibilities

1. Start listening when the web app calls `DentNative.startVolumeShutter()`
2. Stop listening when the web app calls `DentNative.stopVolumeShutter()`
3. Emit a native event back to the web layer
4. Ensure the event only triggers one capture per physical press

### Existing Web Hooks Already In Place

The repo already has the web-side integration points ready:

- `openCamera(category)` calls `DentNative.startVolumeShutter()`
- `closeCameraModal()` calls `DentNative.stopVolumeShutter()`
- a `dent:native-volume-shutter` event triggers:
  - `pulseCameraShutter()`
  - `capturePhoto()`

That means the native plugin only needs to feed the existing flow.

## Phase 8: Real Device Testing On iPad

Do not trust the simulator for the hardware button requirement.

Test on a real iPad:

1. Open the app
2. Enter the camera modal
3. Press `volume up`
4. Press `volume down`
5. Confirm exactly one capture per press
6. Confirm no captures happen outside the modal
7. Confirm backgrounding and returning do not break the listener
8. Confirm repeated presses do not flood captures

## Recommended Workflow After The iOS Project Exists

For day-to-day wrapper development:

1. Edit web files in the repo
2. Run `npm run cap:sync`
3. Rebuild in Xcode

For native bridge work:

1. edit Swift plugin files in `ios/`
2. rebuild in Xcode
3. retest on device

## Troubleshooting Checklist

### `npm run prepare:capacitor` fails

Check:

- `node -v`
- `npm install` completed
- required app files exist

### `npm run cap:add:ios` fails

Check:

- Xcode installed
- `xcode-select` points to full Xcode
- `pod --version` works
- Homebrew is on PATH

### App opens but shows stale web content

Run:

```bash
npm run cap:sync
```

Then clean and rebuild in Xcode.

### App launches but config-driven features fail

Check whether the other machine is missing:

- `config.js`
- `config.json`

## Suggested First Session On The Other Mac

Use this exact order:

1. Install Xcode
2. Install Homebrew
3. Install CocoaPods
4. Clone or pull the repo
5. Copy `config.js` and `config.json`
6. Run `npm install`
7. Run `npm run prepare:capacitor`
8. Run `npm run cap:add:ios`
9. Run `npm run cap:sync`
10. Run `npm run cap:open:ios`
11. Prove the app runs in an iPad simulator
12. Then start the Swift plugin work

## What To Hand Back After The Other Machine Session

Once the other Mac gets further, the useful outputs to bring back are:

1. the generated `ios/` directory
2. any Xcode signing or build issues encountered
3. whether the wrapper launches successfully
4. whether camera permissions behave normally in the shell
5. any native plugin prototype for volume-button handling

## Recommended Next Engineering Step After This Plan

Once the iOS project exists on the other machine, the next coding task should be:

- implement `DentCameraBridgePlugin.swift`
- expose `startVolumeShutter` and `stopVolumeShutter`
- emit the native shutter event back to JavaScript

That is the point where the project shifts from scaffold/setup work into actual hardware-button functionality.