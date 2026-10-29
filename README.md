# AuraAssist — Smart Passthrough

**A mobile-first, open-source Web Audio experiment** for microphone pass-through, adaptive speech clarity and user-controlled parametric EQ. AuraAssist processes audio in your browser; it does not program Bluetooth earbud firmware or unlock proprietary ANC/transparency controls.

> **Safety:** This is an experimental audio utility, not a hearing aid, medical device, or safety-critical listening system. Start at low volume. Bluetooth latency may make it unsuitable for conversation or situational awareness. Do not use as your only means of hearing alarms, traffic, or other hazards.

## Features
- Three software modes: **Transparency**, **Dialogue Boost**, and **Mute / standby**.
- Five parametric EQ bands with a −12 dB to +12 dB range and Flat, Vocal Clarity, Bass Boost, Podcast/Dialogue and Custom presets.
- Preference persistence in `localStorage`.
- Real-time canvas spectrum and RMS / voice-band / sustained low-rumble indicators.
- Adaptive dialogue enhancement: speech-band activity detector, smoothed peaking EQ, and a dynamics compressor in Dialogue Boost mode.
- Adaptive low-frequency rumble subtraction and an 80/115 Hz switchable high-pass filter.
- PWA manifest and service worker for caching app files after the first online visit.
- Mobile-responsive interface and visible startup/error reporting.

## Source structure
```text
index.html
public/{aura-mark.svg,manifest.webmanifest,sw.js}
src/main.tsx
src/App.tsx
src/audio/{AudioEngine.ts,analyzer.ts,types.ts}
src/ui/{EqSliders.tsx,Spectrum.tsx}
src/styles/aura.css
```

## Audio graph
```text
getUserMedia microphone stream -> AnalyserNode (2048 FFT)
  -> High-pass (80 Hz transparency / 115 Hz dialogue), summed with a controllable inverted low-passed (<280 Hz) rumble branch
  -> 5 × BiquadFilterNode (peaking EQ: 160, 500, 1000, 3000, 8000 Hz)
  -> Dialogue peaking filter (2200 Hz, adaptive gain)
  -> DynamicsCompressorNode -> Master GainNode (0 when muted)
  -> AudioContext.destination (OS-selected output route)
```
Control changes use smoothed AudioParam ramps. The low-frequency branch is an experimental, frequency-shaped subtraction—not studio-grade noise cancellation. Voice presence is an energy heuristic, not speech recognition, and may react to non-speech sounds. Dialogue compressor settings: threshold `−24 dB`, knee `30 dB`, ratio `4:1`, attack `3 ms`, release `250 ms`. Transparency mode relaxes compression to keep dynamics natural. Start with the phone and earbuds at low volume.

## Requirements and limitations
- Modern browser with Web Audio API, `getUserMedia`, Canvas, and `localStorage`.
- Mic access requires HTTPS or localhost. Grant microphone permission when prompted.
- Keep the page in the foreground; mobile operating systems may suspend audio in background/lock/battery saving modes.
- Route audio to Hammer Aeromax or another TWS from the operating system before starting. A web page cannot reliably force a particular Bluetooth output on every browser.
- This is a phone-mic pass-through round trip, not earbud hardware transparency. Bluetooth A2DP buffering, codec delay, OS routing, mic hardware, and resampling can add noticeable latency, well beyond Web Audio `baseLatency`/`outputLatency` estimates. Those values are not end-to-end Bluetooth measurement.
- The app intentionally uses the phone microphone. Using headset mic input can cause many Bluetooth headsets to switch to a lower-quality bidirectional profile.
- Echo cancellation, noise suppression, and auto gain control are requested off, but devices/browsers may ignore these constraints.
- No web app can write proprietary ANC/transparency registers unless the manufacturer exposes a supported API/protocol.
- Stop immediately if feedback, discomfort, or unexpected loud audio occurs. This is not a hearing aid or safety-critical listener.

## Run locally
```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```
For mobile LAN testing, use HTTPS; an insecure LAN address can block mic capture.

## GitHub Pages
The Vite config sets `/PaceTrack-AI/` as base in GitHub Actions for this repository. In **Settings → Pages**, choose GitHub Actions if not already configured. A push to `main` runs `.github/workflows/static.yml`, installs dependencies, typechecks/builds, and deploys `dist/`. Visit `https://<owner>.github.io/PaceTrack-AI/`. Change the base path if the repository name changes.

## Privacy
Audio stays in the page and is not intentionally uploaded. No account or analytics. Modes, EQ preset and custom gains are saved in browser `localStorage`. Clearing site data resets preferences.

## License
MIT; see `LICENSE`.