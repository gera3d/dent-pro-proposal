# Local iOS Deploy Flow (iPad + Simulator)

Use this when you want to push the latest local web changes into the native iOS wrapper and test on your iPad.

## 1) Full local sync + clean simulator build

```bash
npm run ios:sync:clean:build
```

This command already does:

1. `npm run cap:sync`
2. `xcodebuild ... clean build` for iOS Simulator

## 2) Find the correct physical-device UDID

Important: `xcodebuild` needs the **iOS destination UDID**, not the CoreDevice identifier.

```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -showdestinations
```

Use the `platform:iOS` destination `id=...` value for your iPad.

## 3) Build, install, and launch on iPad

```bash
IOS_DEVICE_ID="<YOUR_IOS_UDID>" npm run ios:build:device
IOS_DEVICE_ID="<YOUR_IOS_UDID>" npm run ios:install:device
IOS_DEVICE_ID="<YOUR_IOS_UDID>" npm run ios:launch:device
```

Or in one line:

```bash
IOS_DEVICE_ID="<YOUR_IOS_UDID>" npm run ios:build:device && \
IOS_DEVICE_ID="<YOUR_IOS_UDID>" npm run ios:install:device && \
IOS_DEVICE_ID="<YOUR_IOS_UDID>" npm run ios:launch:device
```

## 4) If app looks stale on iPad

1. Fully close the app from app switcher.
2. Relaunch it.
3. Re-run the one-line deploy command above.

## 5) Current script shortcuts in package.json

- `ios:sync:clean:build`
- `ios:build:sim`
- `ios:clean:build:sim`
- `ios:build:device`
- `ios:install:device`
- `ios:launch:device`
