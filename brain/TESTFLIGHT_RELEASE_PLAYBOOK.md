# TestFlight Release Playbook (Dent Experts Scoper)

Use this exact flow every time to avoid stale TestFlight builds.

## 1) Preflight (required)

Run from project root:

```bash
cd /Users/gerayeremin/Documents/projects/dent-pro-proposal
```

Verify Xcode and team:

```bash
xcodebuild -version
```

Use Apple team/profile:
- Team ID: `V8ZQK8U83A` (Arsen profile)
- Bundle ID: `com.v8zqk8u83a.dentexpertsscoper`

## 2) Bump versions every release

Update all 3 places:

1. `ios/App/App.xcodeproj/project.pbxproj`
- `MARKETING_VERSION` (example: `1.1.3`)
- `CURRENT_PROJECT_VERSION` (example: `6`, increment every upload)

2. `version.json`
- Update `"version"` (example: `2026.03.09.02`)

3. `service-worker.js`
- Update `APP_VERSION` to the same value as `version.json`

Quick verify:

```bash
rg -n "MARKETING_VERSION|CURRENT_PROJECT_VERSION" ios/App/App.xcodeproj/project.pbxproj
cat version.json
head -n 2 service-worker.js
```

## 3) Sync web assets into iOS wrapper

```bash
npm run cap:sync
```

Critical check (prevents Airtable breakage in native build):

```bash
cat ios/App/App/public/config.json
```

Confirm `airtable.apiKey` and `airtable.baseId` are non-empty.

## 4) Archive iOS build

Replace version in archive name as needed:

```bash
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath build/App-1.1.3.xcarchive \
  archive
```

## 5) Export + upload to App Store Connect

Use this export options plist:
- `/tmp/ExportArsenV8Upload.plist`
- Must include:
  - `method = app-store-connect`
  - `destination = upload`
  - `teamID = V8ZQK8U83A`
  - `manageAppVersionAndBuildNumber = true`

Upload command:

```bash
xcodebuild \
  -exportArchive \
  -archivePath build/App-1.1.3.xcarchive \
  -exportPath build/export-1.1.3-$(date +%Y%m%d-%H%M%S) \
  -exportOptionsPlist /tmp/ExportArsenV8Upload.plist
```

Success signal in output:
- `Upload succeeded.`
- `Uploaded package is processing.`

## 6) Confirm uploaded version/build

```bash
plutil -p build/App-1.1.3.xcarchive/Info.plist
```

Confirm:
- `CFBundleShortVersionString` is expected marketing version.
- `CFBundleVersion` is expected build number.
- `Distributions[].uploadedBuildNumber` matches expected build.

## 7) TestFlight actions in App Store Connect (required)

Go to:
- `Apps -> Dent Experts Scoper -> TestFlight -> iOS Builds`

For the new build:

1. If status is `Missing Compliance`:
- Click `Manage`
- Select: `None of the algorithms mentioned above`
- Save

2. Add build to groups:
- Internal group (immediate availability)
- External group (requires Apple beta review)

3. Enter/update `What to Test`
- Submit for review when prompted

## 8) What testers should expect

- Internal testers:
  - Usually immediate once build status is `Testing`.
- External testers:
  - Must wait for status to change from `Waiting for Review` to `Testing`.
  - Old build remains visible until Apple approves the new one.

## 9) Fast troubleshooting

If TestFlight still shows old build:

1. Check build status in group page (not only iOS Builds page).
2. Confirm new build is added to the correct tester group.
3. Confirm compliance was completed for the new build.
4. Confirm external review finished (if external testers).
5. In TestFlight app, pull down to refresh and reopen app page.

If Airtable fails in iOS/TestFlight build:

1. Re-run `npm run cap:sync`
2. Re-check `ios/App/App/public/config.json` is populated
3. Re-archive and re-upload with new build number

## 10) Release checklist (copy/paste)

- [ ] Bumped `MARKETING_VERSION`
- [ ] Bumped `CURRENT_PROJECT_VERSION`
- [ ] Bumped `version.json`
- [ ] Bumped `service-worker.js APP_VERSION`
- [ ] Ran `npm run cap:sync`
- [ ] Verified native `config.json` has Airtable credentials
- [ ] Archived successfully
- [ ] Uploaded successfully to App Store Connect
- [ ] Fixed compliance (`Missing Compliance`) if present
- [ ] Added build to Internal group
- [ ] Added build to External group
- [ ] Submitted external build for review
- [ ] Confirmed final status in group pages
