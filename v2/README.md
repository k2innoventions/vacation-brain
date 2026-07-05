# Vacation Brain — v2 (mobile foundation)

A clean Expo Router + TypeScript project foundation. No product features, no auth, no Supabase, no AI — just the scaffolding.

## Stack

- Expo SDK 57
- Expo Router (file-based routing, `app/`)
- TypeScript (strict)

## Run

```
npm install
npm start
```

Then press `w` for web, or scan the QR code with Expo Go for iOS/Android.

## Structure

```
app/
  _layout.tsx    root Stack layout
  index.tsx      placeholder home screen
  +not-found.tsx fallback route
```

## Status

This replaces the earlier, uncommitted `mobile/` scaffold and the unmerged
`cursor/expo-rn-foundation-3bee` branch as the single source of truth for the
mobile app. Those should be reconciled or removed once this is confirmed as
the direction going forward.
