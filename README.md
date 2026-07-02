# vacation-brain

A mobile app built with [Expo](https://expo.dev) and React Native (TypeScript), using [Expo Router](https://expo.github.io/router) for file-based navigation.

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
```

## Project structure

```
vacation-brain/
├── app/                  # Expo Router file-based routes
│   ├── _layout.tsx       # Root layout (Stack navigator + providers)
│   └── index.tsx         # Home screen (placeholder)
├── src/
│   ├── components/       # Shared UI components
│   ├── context/          # React Context providers
│   │   └── AppContext.tsx
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation utilities and typed route helpers
│   └── types/            # TypeScript type definitions
├── assets/               # Icons and splash screens
├── app.json              # Expo configuration
├── babel.config.js       # Babel config (babel-preset-expo)
├── tsconfig.json         # TypeScript config (strict, @/ path alias)
├── docs/
│   └── product/          # Product documentation
├── intelligence/         # AI/intelligence layer documentation
└── scenarios/            # Use-case scenarios
```

### Path aliases

`@/` maps to `src/`. Use it instead of deep relative imports:

```ts
import { useAppContext } from '@/context/AppContext';
```

## Documentation

Product design docs live under `docs/product/`, intelligence architecture under `intelligence/`, and scenario definitions under `scenarios/`. See each directory's README for details.
