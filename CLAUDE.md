@AGENTS.md

## Project context

This is **vacation-brain**, an Expo React Native app written in TypeScript.

- Expo SDK: ~57.0.1
- React Native: 0.86.0
- React: 19.2.3
- TypeScript: ~6.0.3

## Key files

- `App.tsx` — root component
- `index.ts` — app entry point registered via `registerRootComponent`
- `app.json` — Expo config (name, slug, icons, platform settings)
- `src/` — all application source code
- `docs/product/` — product domain model and specifications
- `intelligence/` — AI/intelligence architecture docs
- `scenarios/` — use-case scenario definitions

## Running locally

```bash
npm install
npm start   # starts Expo dev server; scan QR with Expo Go
```

## Style conventions

- Functional components with TypeScript
- `StyleSheet.create` for styles (not inline style objects)
- No AI or intelligence integrations until the `intelligence/` docs are established
