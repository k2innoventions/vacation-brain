# Vacation Brain — Mobile App

This is the **canonical Expo app root** for Vacation Brain, per
[Decision 003](../decisions/003-canonical-app-location.md).
All app implementation happens here. Do not create another app
scaffold without a new decision record and explicit approval.

## Stack

- Expo SDK 54
- Expo Router (file-based routing in `app/`)
- TypeScript (strict)

## Commands

Run these from this folder (`mobile/`):

```
npm install        # install dependencies
npm start          # start the dev server (runs with --offline)
npm run typecheck  # tsc --noEmit
```

## Running the app

- **Device:** `npm start`, then scan the QR code with Expo Go
  (iOS/Android).
- **Web:** `npm run web`. The default Metro port is 8081; if it is
  taken, pass a port explicitly: `npm run web -- --port 8090`.
- **Simulators:** `npm run ios` / `npm run android` (requires
  Xcode / Android Studio).

Note: `npm start` uses `--offline`, which skips Expo's network checks —
useful on flaky connections, but remove the flag if you need tunnel
mode or Expo account features.

## Structure

```
app/            routes (Expo Router)
  _layout.tsx   root stack layout
  index.tsx     home screen
  +not-found.tsx
constants/      theme colors
hooks/          useTheme, useColorScheme
assets/images/  icons and splash
```
