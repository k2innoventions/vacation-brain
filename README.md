# vacation-brain

A mobile app built with [Expo](https://expo.dev) and React Native (TypeScript).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Expo Go](https://expo.dev/go) on your iOS or Android device, **or** an iOS Simulator / Android Emulator

### Install dependencies

```bash
npm install
```

### Run the app

```bash
# Start the dev server (scan the QR code with Expo Go)
npm start

# Open directly on Android
npm run android

# Open directly on iOS (macOS only)
npm run ios

# Open in a web browser
npm run web
```

## Project structure

```
vacation-brain/
├── App.tsx               # Root component
├── index.ts              # App entry point
├── app.json              # Expo configuration
├── tsconfig.json         # TypeScript configuration
├── assets/               # Images, icons, splash screens
├── src/
│   ├── components/       # Shared UI components
│   ├── screens/          # Screen-level components
│   ├── navigation/       # Navigation configuration
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── docs/
│   └── product/          # Product documentation
├── intelligence/         # AI/intelligence layer documentation
└── scenarios/            # Use-case scenarios
```

## Documentation

Product design docs live under `docs/product/`, intelligence architecture under `intelligence/`, and scenario definitions under `scenarios/`. See each directory's README for details.
