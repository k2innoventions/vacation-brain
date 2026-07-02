@AGENTS.md

## Project context

This is **vacation-brain**, an Expo React Native app written in TypeScript.

- Expo SDK: ~57.0.1
- Expo Router: ~57.0.2 (file-based routing)
- React Native: 0.86.0
- React: 19.2.3
- TypeScript: ~6.0.3

## Key files

- `app/_layout.tsx` — root layout (Stack navigator + global providers)
- `app/index.tsx` — home screen entry point
- `app.json` — Expo config (name, slug, scheme, icons, platform settings)
- `src/context/AppContext.tsx` — global app state via React Context
- `src/` — all application source code (`@/` path alias)
- `docs/product/` — product domain model and specifications
- `intelligence/` — AI/intelligence architecture docs
- `scenarios/` — use-case scenario definitions

## Running locally

```bash
npm install
npm start           # starts Expo dev server; scan QR with Expo Go
npm run android     # opens on Android emulator/device
npm run ios         # opens on iOS simulator (macOS only)
```

## Routing

Routes are file-based inside the `app/` directory (Expo Router).
- `app/index.tsx` → `/`
- `app/some-feature/index.tsx` → `/some-feature`
- `app/some-feature/[id].tsx` → `/some-feature/:id`

Typed routes are enabled via `experiments.typedRoutes: true` in `app.json`.

## State management

- Use React Context (`src/context/`) for simple app/session state.
- Do not add Redux. Do not add Zustand until state complexity clearly justifies it.

## Style conventions

- Functional components with TypeScript
- `StyleSheet.create` for styles (not inline style objects)
- `@/` imports instead of relative paths across `src/`
- No AI or intelligence integrations until the `intelligence/` docs are established
- Do not build product screens until `docs/product/` and `intelligence/` docs are present
