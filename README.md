# PaceTrack AI 🏏

Offline-first cricket bowling speed tracker and delivery analytics. React + TypeScript + Vite, Tailwind CSS, Dexie/IndexedDB, Recharts and Lucide icons. Runs fully client-side after initial asset install; recorded profiles, deliveries, and settings stay in the browser.

## Quick start

```bash
npm install
npm run dev
```

Production verification/build:

```bash
npm run typecheck
npm run build
npm run preview
```

## Features

- Five views: Live Tracker, Bowler Stats, Batter Stats, Head-to-Head and Settings.
- IndexedDB storage via Dexie; seeded with two bowlers, two batters and 15 realistic demo deliveries on first run.
- Camera request (`environment`, ideal 60 FPS) with accessible simulation canvas fallback; animated simulated ball speed for safe testing.
- Draggable calibration markers, speed unit conversion, speed/outcome capture, Web Speech voice announcements.
- Reactive bowler/batter analytics, trend and pitch-length charts, delivery history and deletion.
- Configurable pitch presets/custom distance, profile management, JSON export, factory demo reset.
- Install-ready service worker caches the app shell for offline use after first successful load.

## Measurement caveat

The simulated speed is labelled as a simulation. Browser camera frame differencing alone cannot robustly identify the ball or determine true travel time without calibrated image geometry, reliable object tracking, and camera-specific validation. PaceTrack AI therefore does not silently claim a simulated or unvalidated estimate is a certified radar measurement. The camera HUD is an experimental preview, while the simulation supports interaction testing.

## Offline behaviour

Vite builds a service worker and manifest for app-shell caching. IndexedDB is local to each browser/device; export JSON regularly to back up records. Camera access normally requires HTTPS or localhost and user permission. Speech synthesis availability varies by browser/device.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, Dexie, dexie-react-hooks, Recharts, lucide-react. Controls are implemented with semantic native form elements styled in the app for a lean, touch-friendly interface.
