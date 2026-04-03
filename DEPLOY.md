# Deployment Guide (Android + iOS + Web)

This guide explains, step by step, how to deploy the apps in this monorepo:

- `apps/mobile` (Expo + React Native) to:
  - Google Play Store (Android)
  - Apple App Store (iOS)
- `apps/web` (Vite + React) to a static web host

The guide is written for people who want exact steps and plain language.

---

## 0. Read this first

### What this repo is

- Mobile app: `apps/mobile`
- Web app: `apps/web`
- Shared code: `packages/core`

### Important terms (plain language)

- **Package name / Bundle ID**: Your app's unique identity in each store.
  - Android package name example: `com.discgolfwindguide.app`
  - iOS bundle ID example: `com.discgolfwindguide.app`
- **AAB**: Android App Bundle file you upload to Play Console.
- **Archive (iOS)**: Signed iOS app build you upload from Xcode to App Store Connect.
- **Play Console**: Google's dashboard for publishing Android apps.
- **App Store Connect**: Apple's dashboard for publishing iOS apps.

### Date-sensitive requirements

Store rules change often. This guide is current as of **April 2, 2026**.

- Apple has announced that starting **April 28, 2026**, app uploads must be built with **Xcode 26+** and iOS/iPadOS/tvOS/visionOS/watchOS 26 SDKs.
- Google Play currently requires new app submissions and updates to target **Android 15 (API 35)**.

Always re-check the official links in the **References** section before pressing final submit.

---

## 1. Accounts and access you need

## 1.1 Google Play side (Android)

You need:

1. A Google account.
2. A Play Console developer account.
3. Permission to publish releases in Play Console.

Notes:

- Play Console requires account registration and identity/profile verification.
- New personal Play developer accounts have testing requirements before first production launch (details in section 7).

## 1.2 Apple side (iOS)

You need:

1. An Apple Account.
2. Apple Developer Program membership.
3. Access to App Store Connect for your team.

Notes:

- Apple Developer Program is listed as USD 99/year on Apple's membership pages.
- Required App Store Connect roles for submission are usually Account Holder, Admin, or App Manager.

---

## 2. Install tools (latest stable versions)

## 2.1 Tools for all platforms

Install:

1. Git
2. Node.js LTS (recommended current LTS)
3. pnpm (this repo uses pnpm)

Check:

```bash
node -v
pnpm -v
git --version
```

## 2.2 Android tools

Install:

1. **Android Studio latest stable** from Android Developers
2. Android SDK components from inside Android Studio
3. Android Emulator (optional but recommended)

As of April 2, 2026, Android's release page shows stable channel **Android Studio Panda 3 (2025.3.3)**.

## 2.3 iOS tools (Mac only)

iOS release builds require macOS.

Install:

1. **Xcode latest stable** from the Mac App Store
2. Xcode Command Line Tools

As of April 2, 2026, Apple's Xcode support page lists Xcode 26.x releases and newer betas. Use the latest **stable** Xcode 26 release unless you intentionally need beta.

---

## 3. Prepare this repo locally

From repo root:

```bash
pnpm install
```

Optional sanity checks:

```bash
pnpm build:web
pnpm dev:web
pnpm dev:mobile
```

If `pnpm dev:mobile` starts Expo successfully, your local setup is healthy.

---

## 4. Confirm app identity and versioning before first release

Open `apps/mobile/app.json`.

Current IDs in this repo:

- iOS bundle identifier: `com.discgolfwindguide.app`
- Android package: `com.discgolfwindguide.app`

Do not change these after public release unless you intentionally want a brand-new app listing.

## 4.1 Add explicit build numbers (recommended)

For reliable store updates, add:

- `android.versionCode` (integer, must go up every Android release)
- `ios.buildNumber` (string number, must go up every iOS release)

Example:

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.discgolfwindguide.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.discgolfwindguide.app",
      "versionCode": 1
    }
  }
}
```

For each new store update:

1. Increase `version` when you want user-visible version change.
2. Always increase `ios.buildNumber`.
3. Always increase `android.versionCode`.

---

## 5. Generate native Android/iOS projects from Expo

This project is Expo-managed, so create native folders before store build steps.

From repo root:

```bash
pnpm --filter @frisbee-wind/mobile exec expo prebuild
```

This creates:

- `apps/mobile/android`
- `apps/mobile/ios`

If you need a full regenerate:

```bash
pnpm --filter @frisbee-wind/mobile exec expo prebuild --clean
```

Use `--clean` carefully because it recreates native projects.

---

## 6. Android release path: Android Studio + Play Console

## 6.1 Build Android App Bundle (.aab) in Android Studio

1. Open Android Studio.
2. Click **Open** and select: `apps/mobile/android`.
3. Let Gradle sync fully.
4. In menu: **Build -> Generate Signed Bundle / APK**.
5. Select **Android App Bundle** (not APK for Play production).
6. Create or select your keystore.
   - If creating new, save keystore file in a secure backup location.
   - Save all passwords in your team password vault.
7. Choose **release** build variant.
8. Build.
9. Find output `.aab` (usually under `app/release/`).

Alternative CLI build from `apps/mobile/android`:

```bash
./gradlew bundleRelease
```

On Windows PowerShell:

```powershell
.\gradlew.bat bundleRelease
```

## 6.2 Create app in Play Console (first release only)

1. Open Play Console.
2. Click **Create app**.
3. Enter app name, default language, app/game type, free/paid, contact email.
4. Accept declarations and Play App Signing terms.
5. Create app record.

## 6.3 Complete Play Console setup tasks

In app dashboard, complete required pages (names can change slightly over time):

1. App access
2. Ads declaration
3. Content rating
4. Target audience and content
5. Data safety
6. Privacy policy URL
7. Main store listing (title, short description, full description, screenshots, icon, feature graphic)
8. Pricing and countries

## 6.4 Upload release and roll out

1. Go to **Test and release -> Production** (or a testing track first).
2. Click **Create new release**.
3. Confirm Play App Signing setup if prompted.
4. Upload your `.aab`.
5. Add release name and release notes.
6. Click **Next** and resolve all blocking errors.
7. Click **Start rollout to production**.
8. Monitor status in Publishing overview.

## 6.5 Very important Play policy notes

1. **Target API level**: New submissions/updates must target Android 15 (API 35) based on current policy.
2. **New personal accounts**: Accounts created after November 13, 2023 must run closed testing with at least 12 opted-in testers for 14 continuous days before production access.
3. **Package name is permanent** in Play listing context.

---

## 7. iOS release path: Xcode + App Store Connect

## 7.1 Create app record in App Store Connect (first release only)

1. Sign in to App Store Connect.
2. Go to **Apps**.
3. Click **+** then **New App**.
4. Select platform(s), name, primary language, bundle ID, SKU.
5. Click **Create**.

The bundle ID must match your iOS app bundle identifier in `app.json`.

## 7.2 Open iOS project in Xcode

1. On a Mac, open:
   - `apps/mobile/ios/*.xcworkspace` (preferred)
2. Select your app target.
3. In **Signing & Capabilities**:
   - Select your Apple Developer team.
   - Confirm Bundle Identifier is correct.
   - Ensure Automatic Signing is on unless your team uses manual profiles.
4. In **General**:
   - Set Version (user-visible) and Build (must increase every upload).

## 7.3 Archive and upload from Xcode

1. Set destination to **Any iOS Device (arm64)** or generic iOS device.
2. Menu: **Product -> Archive**.
3. When Organizer opens, select the new archive.
4. Click **Distribute App**.
5. Choose **App Store Connect**.
6. Choose **Upload**.
7. Continue through signing/export prompts.
8. Finish upload and wait for processing email/status.

## 7.4 Submit in App Store Connect

After build processing finishes:

1. Open your app in App Store Connect.
2. Create/select app version (for example 1.0.0).
3. Add required metadata:
   - Description
   - Keywords
   - Support URL
   - Marketing URL (if you have one)
   - Screenshots for required device sizes
   - App privacy details
   - Age rating questionnaire
4. In Build section, attach the uploaded build.
5. Click **Add for Review**.
6. Click **Submit for Review**.
7. Monitor review status until approved and released.

## 7.5 Very important Apple policy notes

1. Starting **April 28, 2026**, uploads must be built with **Xcode 26+** and platform 26 SDKs.
2. If your app uses required-reason APIs, complete required reason declarations.
3. If your app collects user data, complete privacy details accurately.

---

## 8. Updating an already-published app

For every new release:

1. Update code.
2. Increase versions:
   - Android `versionCode` up
   - iOS `buildNumber` up
   - app `version` if needed
3. Rebuild:
   - Android: new `.aab`
   - iOS: new archive upload
4. Add release notes in both consoles.
5. Submit rollout/review.

If you do not increase build numbers, store upload will fail.

---

## 9. Web app deployment (`apps/web`)

This is a static build (Vite).

Build from repo root:

```bash
pnpm build:web
```

Output folder:

- `apps/web/dist`

Deploy `dist` to any static host (for example Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, GitHub Pages).

Basic host settings:

1. Build command: `pnpm build:web`
2. Publish directory: `apps/web/dist`

If the host builds from `apps/web` directly:

1. Install command: `pnpm install`
2. Build command: `pnpm build`
3. Publish directory: `dist`

---

## 10. Release checklist (copy/paste)

Use this before each store submission:

1. App opens and basic flows work on real device.
2. No debug logs or dev-only settings in release.
3. Android versionCode increased.
4. iOS buildNumber increased.
5. Store screenshots are current.
6. Privacy and data safety forms are current.
7. Release notes added.
8. Submitted to testing track first (recommended).
9. Final production rollout submitted.

---

## References (official docs)

### Android / Play

- Android Studio latest stable release page:  
  https://developer.android.com/studio/releases/index
- Upload app bundle to Play Console:  
  https://developer.android.com/studio/publish/upload-bundle
- Sign your app:  
  https://developer.android.com/guide/publishing/app-signing.html
- Play Console: Create and set up your app:  
  https://support.google.com/googleplay/android-developer/answer/9859152
- Play Console: Prepare and roll out a release:  
  https://support.google.com/googleplay/android-developer/answer/9859348
- Play Console: Publish your app:  
  https://support.google.com/googleplay/android-developer/answer/9859751
- Play Console: Use Play App Signing:  
  https://support.google.com/googleplay/android-developer/answer/9842756
- Play Console: Target API requirements:  
  https://support.google.com/googleplay/android-developer/answer/11926878
- Play Console: Testing requirement for new personal accounts:  
  https://support.google.com/googleplay/android-developer/answer/14151465

### Apple / App Store Connect

- Xcode support and latest versions:  
  https://developer.apple.com/support/xcode/
- Apple upcoming upload requirements:  
  https://developer.apple.com/news/upcoming-requirements/
- App Store Connect workflow:  
  https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-workflow
- Add a new app record:  
  https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app
- Upload builds:  
  https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds
- Submit an app for review:  
  https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app
- TestFlight overview:  
  https://developer.apple.com/testflight/

### Expo (used by this repo)

- Build for app stores:  
  https://docs.expo.dev/deploy/build-project/

