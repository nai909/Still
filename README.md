# Still

A meditative sound and visualization app for iOS. Play ambient instruments, follow guided breathing, and find calm through interactive audio-visual experiences.

## Features

**Hum Mode** — Tap to play melodic notes with ambient drone accompaniment. Notes follow musical scales and keys.

**Strings Mode** — Strum across harp-style strings for flowing, expressive sound.

**Gaze Mode** — Immersive 3D visuals powered by Three.js for focused meditation.

**Guide Mode** — Guided breathing exercises with various techniques.

## Instruments

- Handpan (multi-sampled across 4 octaves)
- Piano
- Guitar
- Cello
- Harp
- Synth
- Music Box
- Flute
- Voice
- Rainstick
- Percussion

## Tech Stack

- React 18
- Three.js (3D visualizations)
- Web Audio API
- Capacitor (iOS native build)
- Vite

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

## Building for iOS

```bash
npm run build
npx cap sync ios
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
```

## License

MIT
