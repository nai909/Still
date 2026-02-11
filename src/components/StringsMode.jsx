import { useRef, useEffect, useState, useCallback } from 'react';
import { haptic } from '../config/haptic';
import { KEYS, KEY_FREQUENCIES, SCALE_TYPES } from '../config/constants';

// =============================================
// STRINGS MODE — Multi-instrument Harp
// Play different instruments across harp-style strings
// =============================================

const INSTRUMENTS = [
  { name: 'harp', file: 'harp.mp3', baseFreq: 130.81, type: 'sampled' },
  { name: 'piano', file: 'piano.mp3', baseFreq: 130.81, type: 'sampled' },
  { name: 'guitar', file: 'guitar.m4a', baseFreq: 130.81, type: 'sampled' },
  { name: 'cello', file: 'cello.mp3', baseFreq: 130.81, type: 'sampled' },
  { name: 'handpan', type: 'multisampled' },
  { name: 'synth', type: 'synth' },
  { name: 'music box', type: 'musicbox' },
  { name: 'flute', type: 'flute' },
  { name: 'voice', file: 'samples/voice-c3.m4a', baseFreq: 130.81, type: 'sampled' },
];

// Handpan sample frequencies (note name to Hz)
const HANDPAN_NOTES = {
  'C2': 65.41, 'Cs2': 69.30, 'D2': 73.42, 'Ds2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'Fs2': 92.50, 'G2': 98.00, 'Gs2': 103.83, 'A2': 110.00, 'As2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'Cs3': 138.59, 'D3': 146.83, 'Ds3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'Fs3': 185.00, 'G3': 196.00, 'Gs3': 207.65, 'A3': 220.00, 'As3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'Cs4': 277.18, 'D4': 293.66, 'Ds4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'Fs4': 369.99, 'G4': 392.00, 'Gs4': 415.30, 'A4': 440.00, 'As4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'Cs5': 554.37, 'D5': 587.33, 'Ds5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'Fs5': 739.99, 'G5': 783.99, 'Gs5': 830.61, 'A5': 880.00, 'As5': 932.33, 'B5': 987.77,
  'C6': 1046.50,
};

const TEXTURES = [
  { name: 'silence', noise: 0, foley: false },
  { name: 'rain', noise: 0.008, foley: true, foleyType: 'rain' },
  { name: 'forest', noise: 0, foley: true, foleyType: 'forest' },
  { name: 'water', noise: 0, foley: true, foleyType: 'water' },
  { name: 'night', noise: 0, foley: true, foleyType: 'night' }
];

export default function StringsMode({
  primaryHue = 220,
  // Shared drone state from App.jsx
  currentKey: propCurrentKey,
  onKeyChange,
  droneEnabled: propDroneEnabled,
  onDroneToggle,
}) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const noiseGainRef = useRef(null);
  const foleyIntervalRef = useRef(null);
  // Note: Drone oscillators removed - using shared drone from DroneMode

  // Sample buffers for each instrument
  const sampleBuffersRef = useRef({});
  const handpanSamplesRef = useRef({});
  const animationRef = useRef(null);
  const stringsRef = useRef([]);
  const dimsRef = useRef({ W: 0, H: 0 });
  const activeRef = useRef(new Map());
  const lastPluckedRef = useRef(new Map());
  const primaryHueRef = useRef(primaryHue);
  const touchStartRef = useRef(null);
  const audioCloseTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const [currentInstrument, setCurrentInstrument] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  // Use shared key from props, fallback to local state
  const [localCurrentKey, setLocalCurrentKey] = useState(5); // F
  const currentKey = propCurrentKey !== undefined ? propCurrentKey : localCurrentKey;
  const setCurrentKey = onKeyChange || setLocalCurrentKey;
  const [currentScaleType, setCurrentScaleType] = useState(13); // insen
  const [currentTexture, setCurrentTexture] = useState(2); // forest
  const [showNotes, setShowNotes] = useState(false);
  // Use shared drone state from props, fallback to local state
  const [localDroneEnabled, setLocalDroneEnabled] = useState(false);
  const droneEnabled = propDroneEnabled !== undefined ? propDroneEnabled : localDroneEnabled;
  const setDroneEnabled = onDroneToggle || setLocalDroneEnabled;
  const currentTextureRef = useRef(currentTexture);

  // Keep hue ref updated
  useEffect(() => {
    primaryHueRef.current = primaryHue;
  }, [primaryHue]);

  // Keep texture ref synced with state
  useEffect(() => {
    currentTextureRef.current = currentTexture;
  }, [currentTexture]);

  // Ref to track showNotes for use in callbacks
  const showNotesRef = useRef(showNotes);
  useEffect(() => {
    showNotesRef.current = showNotes;
  }, [showNotes]);

  // Note: Drone volume and frequency control removed
  // Using shared drone from DroneMode via props

  // Convert frequency to note name
  const freqToNoteName = useCallback((freq) => {
    const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const A4 = 440;
    const semitonesFromA4 = 12 * Math.log2(freq / A4);
    const noteIndex = Math.round(semitonesFromA4) + 9; // A is index 9
    const octave = Math.floor((noteIndex + 12 * 10) / 12) - 10 + 4;
    const noteName = noteNames[((noteIndex % 12) + 12) % 12];
    return `${noteName}${octave}`;
  }, []);

  // Show note and fade it using DOM manipulation
  const showPlayedNote = useCallback((freq) => {
    const noteName = freqToNoteName(freq);

    // Inject keyframes if not already present
    if (!document.getElementById('strings-note-fade-style')) {
      const style = document.createElement('style');
      style.id = 'strings-note-fade-style';
      style.textContent = `
        @keyframes stringsNoteFade {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Remove any existing note display
    const existing = document.getElementById('strings-played-note-display');
    if (existing) existing.remove();

    // Create new note display element
    const noteEl = document.createElement('div');
    noteEl.id = 'strings-played-note-display';
    noteEl.textContent = noteName;
    noteEl.style.cssText = `
      position: fixed;
      bottom: 3%;
      left: 50%;
      transform: translate(-50%, 0);
      font-family: "Jost", sans-serif;
      font-size: 1.5rem;
      font-weight: 300;
      letter-spacing: 0.1em;
      color: hsla(${primaryHueRef.current}, 52%, 68%, 0.9);
      text-shadow: 0 0 20px hsla(${primaryHueRef.current}, 52%, 68%, 0.5);
      z-index: 9998;
      pointer-events: none;
      animation: stringsNoteFade 1.2s ease-out forwards;
    `;
    document.body.appendChild(noteEl);

    // Remove element after animation
    setTimeout(() => {
      if (noteEl.parentNode) noteEl.remove();
    }, 1200);
  }, [freqToNoteName]);

  // Generate scale frequencies
  const generateScale = useCallback((keyIndex, scaleTypeIndex, octaves = 2) => {
    const keyName = KEYS[keyIndex];
    if (!keyName) return [];
    const baseFreq = KEY_FREQUENCIES[keyName];
    if (!baseFreq) return [];
    const scaleType = SCALE_TYPES[scaleTypeIndex];
    if (!scaleType || !scaleType.intervals) return [];
    const intervals = scaleType.intervals;
    const frequencies = [];

    for (let oct = 0; oct < octaves; oct++) {
      for (const interval of intervals) {
        const semitones = interval + (oct * 12);
        const freq = baseFreq * Math.pow(2, semitones / 12);
        frequencies.push(freq);
      }
    }
    // Add the octave note at the end
    frequencies.push(baseFreq * Math.pow(2, octaves));

    return frequencies;
  }, []);

  // =============================================
  // CREATE STRINGS
  // =============================================
  const createStrings = useCallback(() => {
    const { W, H } = dimsRef.current;
    if (W === 0 || H === 0) {
      // Dimensions not ready yet - will be called again after resize
      return;
    }

    // Validate key and scale indices - use defaults if invalid
    const safeKey = (typeof currentKey === 'number' && currentKey >= 0 && currentKey < KEYS.length) ? currentKey : 3;
    const safeScale = (typeof currentScaleType === 'number' && currentScaleType >= 0 && currentScaleType < SCALE_TYPES.length) ? currentScaleType : 13;

    const frequencies = generateScale(safeKey, safeScale, 2);
    const numStrings = frequencies.length;
    if (numStrings < 2) {
      // Invalid scale - clear strings and return
      stringsRef.current = [];
      return;
    }

    const strings = [];

    const margin = W * 0.08;
    const availWidth = W - margin * 2;
    const spacing = availWidth / (numStrings - 1);

    const topBase = H * 0.08;
    const bottomBase = H * 0.92;

    frequencies.forEach((freq, i) => {
      const x = margin + i * spacing;
      const normalizedIndex = i / (numStrings - 1);

      const topY = topBase + normalizedIndex * H * 0.2;
      const bottomY = bottomBase - normalizedIndex * H * 0.05;

      const segments = 48;
      strings.push({
        x,
        topY,
        bottomY,
        freq,
        index: i,
        normalizedIndex,
        energy: 0,
        glowIntensity: 0,
        decay: 0.9985 + normalizedIndex * 0.0008,
        pluckPoint: 0.5,
        segments,
        displacement: new Float32Array(segments).fill(0),
        prevDisplacement: new Float32Array(segments).fill(0),
        thickness: 2.5 - normalizedIndex * 1.5,
        ripples: [],
      });
    });

    stringsRef.current = strings;
  }, [currentKey, currentScaleType, generateScale]);

  // =============================================
  // AUDIO ENGINE
  // =============================================
  const initAudio = useCallback(() => {
    // Don't initialize if component is unmounted
    if (!mountedRef.current) return;

    // Check if we have a valid, non-closed audio context
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      // Just resume if suspended
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return;
    }

    // Clear any stale foley interval before creating new context
    if (foleyIntervalRef.current) {
      clearInterval(foleyIntervalRef.current);
      foleyIntervalRef.current = null;
    }

    // Create new audio context (or recreate if previous was closed)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    // Resume audio context immediately (required for mobile browsers)
    audioCtx.resume().catch(() => {});

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;

    // Load sampled instrument samples
    let loadIndex = 0;
    INSTRUMENTS.forEach((instrument) => {
      if (instrument.type === 'sampled' && instrument.file) {
        setTimeout(() => {
          fetch(instrument.file)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
              sampleBuffersRef.current[instrument.name] = audioBuffer;
            })
            .catch(() => {});
        }, loadIndex * 200);
        loadIndex++;
      }
    });

    // Load handpan multi-samples
    const handpanNotes = [
      'A2', 'A3', 'A4', 'A5', 'As2', 'As3', 'As4', 'As5',
      'B2', 'B3', 'B4', 'B5', 'C2', 'C3', 'C4', 'C5', 'C6',
      'Cs2', 'Cs3', 'Cs4', 'Cs5', 'D2', 'D3', 'D4', 'D5',
      'Ds2', 'Ds3', 'Ds4', 'Ds5', 'E2', 'E3', 'E4', 'E5',
      'F2', 'F3', 'F4', 'F5', 'Fs2', 'Fs3', 'Fs4', 'Fs5',
      'G2', 'G3', 'G4', 'G5', 'Gs2', 'Gs3', 'Gs4', 'Gs5',
    ];
    handpanNotes.forEach((note, i) => {
      setTimeout(() => {
        fetch(`handpan-${note}.m4a`)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            const freq = HANDPAN_NOTES[note];
            if (freq) handpanSamplesRef.current[freq] = audioBuffer;
          })
          .catch(() => {});
      }, 1000 + i * 50); // Start loading after other samples
    });

    // Reverb
    const reverbTime = 5;
    const sr = audioCtx.sampleRate;
    const len = sr * reverbTime;
    const impulse = audioCtx.createBuffer(2, len, sr);

    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const env = Math.pow(1 - i / len, 2.2);
        d[i] = (Math.random() * 2 - 1) * env * 0.6;
        if (i < sr * 0.08) {
          d[i] += (Math.random() * 2 - 1) * 0.15 * (1 - i / (sr * 0.08));
        }
      }
    }

    const reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = impulse;
    reverbNodeRef.current = reverbNode;

    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.35;
    reverbNode.connect(reverbGain);
    reverbGain.connect(audioCtx.destination);

    masterGain.connect(reverbNode);
    masterGain.gain.setTargetAtTime(0.65, audioCtx.currentTime, 0.1);

    // Note: Drone oscillators removed - using shared drone from DroneMode

    // Start foley interval
    foleyIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      if (audioCtx.state === 'closed') return;
      const tex = TEXTURES[currentTextureRef.current];
      if (tex && tex.foley) {
        playFoley(audioCtx, masterGain, tex.foleyType);
      }
    }, 1500 + Math.random() * 2000);
  }, []);

  // Foley sounds for ambient textures
  const playFoley = (ctx, masterGain, type) => {
    if (!ctx || ctx.state === 'closed' || !masterGain) return;
    if (Math.random() > 0.4) return;
    const now = ctx.currentTime;

    if (type === 'rain') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1000 + Math.random() * 500;
      osc.frequency.setTargetAtTime(400 + Math.random() * 200, now, 0.02);
      gain.gain.value = 0.015;
      gain.gain.setTargetAtTime(0, now, 0.08);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'forest') {
      if (Math.random() > 0.5) {
        // Bird chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const baseFreq = 2000 + Math.random() * 1500;
        osc.frequency.value = baseFreq;
        osc.frequency.setTargetAtTime(baseFreq * 1.2, now, 0.03);
        osc.frequency.setTargetAtTime(baseFreq * 0.9, now + 0.05, 0.02);
        gain.gain.value = 0;
        gain.gain.setTargetAtTime(0.02, now, 0.01);
        gain.gain.setTargetAtTime(0, now + 0.08, 0.03);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        // Leaf rustle
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
        }
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const gain = ctx.createGain();
        gain.gain.value = 0.01;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
      }
    } else if (type === 'water') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 200 + Math.random() * 150;
      osc.frequency.setTargetAtTime(400 + Math.random() * 200, now, 0.03);
      gain.gain.value = 0.015;
      gain.gain.setTargetAtTime(0, now, 0.1);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'night') {
      if (Math.random() > 0.7) {
        // Cricket
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 4000 + Math.random() * 1000;
        lfo.frequency.value = 30 + Math.random() * 20;
        lfoGain.gain.value = 0.01;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        gain.gain.value = 0.01;
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + 0.1 + Math.random() * 0.1);
        lfo.stop(now + 0.2);
      }
    }
  };

  // Play current instrument
  const pluckStringAudio = useCallback((string, velocity) => {
    // Skip if component unmounted
    if (!mountedRef.current) return;

    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;

    // Skip if audio not ready or context is closed
    if (!audioCtx || !masterGain || audioCtx.state === 'closed') return;

    // Resume AudioContext if suspended (iOS requirement after user interaction)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const freq = string.freq;
    const instrument = INSTRUMENTS[currentInstrument];

    // Helper for stereo panning
    const applyPanning = (output) => {
      if (audioCtx.createStereoPanner) {
        const panner = audioCtx.createStereoPanner();
        panner.pan.value = (string.normalizedIndex - 0.5) * 1.2;
        output.connect(panner);
        panner.connect(masterGain);
      } else {
        output.connect(masterGain);
      }
    };

    if (instrument.type === 'sampled') {
      // Sampled instruments (harp, piano, guitar, cello, voice)
      const buffer = sampleBuffersRef.current[instrument.name];
      if (!buffer) return;

      const playbackRate = freq / instrument.baseFreq;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000 + string.normalizedIndex * 6000 + velocity * 2000;
      filter.Q.value = 0.5;

      const gain = audioCtx.createGain();
      gain.gain.value = 0;

      // Different envelope characteristics per instrument
      if (instrument.name === 'cello') {
        gain.gain.setTargetAtTime(0.7 * velocity, now, 0.02);
        gain.gain.setTargetAtTime(0.5 * velocity, now + 0.2, 0.5);
        gain.gain.setTargetAtTime(0, now + 1.0, 3.5);
      } else if (instrument.name === 'guitar') {
        gain.gain.setTargetAtTime(0.8 * velocity, now, 0.01);
        gain.gain.setTargetAtTime(0.5 * velocity, now + 0.15, 0.4);
        gain.gain.setTargetAtTime(0, now + 0.8, 2.5);
      } else if (instrument.name === 'piano') {
        gain.gain.setTargetAtTime(0.8 * velocity, now, 0.01);
        gain.gain.setTargetAtTime(0.5 * velocity, now + 0.1, 0.3);
        gain.gain.setTargetAtTime(0, now + 0.5, 2.0);
      } else if (instrument.name === 'voice') {
        gain.gain.setTargetAtTime(0.5 * velocity, now, 0.1);
        gain.gain.setTargetAtTime(0.4 * velocity, now + 0.3, 0.8);
        gain.gain.setTargetAtTime(0, now + 1.5, 3);
      } else {
        // Default harp envelope
        gain.gain.setTargetAtTime(1.0 * velocity, now, 0.01);
        gain.gain.setTargetAtTime(0.7 * velocity, now + 0.1, 0.3);
        gain.gain.setTargetAtTime(0, now + 0.5, 3.0);
      }

      source.connect(filter);
      filter.connect(gain);
      applyPanning(gain);
      source.start(now);

    } else if (instrument.type === 'multisampled') {
      // Handpan - find closest sample
      const samples = handpanSamplesRef.current;
      const sampleFreqs = Object.keys(samples).map(Number).filter(f => samples[f]);
      if (sampleFreqs.length === 0) return;

      let closestFreq = sampleFreqs[0];
      let minDiff = Math.abs(Math.log2(freq / closestFreq));
      for (const sampleFreq of sampleFreqs) {
        const diff = Math.abs(Math.log2(freq / sampleFreq));
        if (diff < minDiff) {
          minDiff = diff;
          closestFreq = sampleFreq;
        }
      }

      const buffer = samples[closestFreq];
      if (!buffer) return;

      const playbackRate = freq / closestFreq;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;

      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.7 * velocity, now, 0.003);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.15, 0.4);
      gain.gain.setTargetAtTime(0, now + 1.0, 4.0);

      source.connect(gain);
      applyPanning(gain);
      source.start(now);

    } else if (instrument.type === 'synth') {
      // FM synthesis synth (feltPiano style)
      const carrier = audioCtx.createOscillator();
      const modulator = audioCtx.createOscillator();
      const modGain = audioCtx.createGain();
      const mainGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      modulator.frequency.value = freq * 2;
      modGain.gain.value = freq * 0.5;
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      carrier.type = 'triangle';
      carrier.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = freq * 4;
      filter.Q.value = 0.5;
      filter.frequency.setTargetAtTime(freq * 1.5, now, 0.3);

      mainGain.gain.value = 0;
      mainGain.gain.setTargetAtTime(0.25 * velocity, now, 0.01);
      mainGain.gain.setTargetAtTime(0.15 * velocity, now + 0.1, 0.2);
      mainGain.gain.setTargetAtTime(0, now + 0.3, 1.5);

      carrier.connect(filter);
      filter.connect(mainGain);
      applyPanning(mainGain);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + 4);
      modulator.stop(now + 4);

    } else if (instrument.type === 'musicbox') {
      // Music box - bright sine at octave
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * 2;
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.2 * velocity, now, 0.001);
      gain.gain.setTargetAtTime(0, now + 0.1, 0.6);
      osc.connect(gain);
      applyPanning(gain);
      osc.start(now);
      osc.stop(now + 2);

    } else if (instrument.type === 'flute') {
      // Organic flute synthesis with breath
      const duration = 1.0;

      // Main tone (triangle for hollow quality)
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 0.97, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.25);

      // Gentle vibrato
      const vibrato = audioCtx.createOscillator();
      const vibGain = audioCtx.createGain();
      vibrato.frequency.value = 5;
      vibGain.gain.setValueAtTime(0, now);
      vibGain.gain.setTargetAtTime(freq * 0.004, now + 0.3, 0.15);
      vibrato.connect(vibGain);
      vibGain.connect(osc.frequency);

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.05 * velocity, now + 0.35);
      oscGain.gain.setTargetAtTime(0, now + 0.5, 0.2);

      // Second harmonic
      const osc2 = audioCtx.createOscillator();
      const osc2Gain = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;
      osc2Gain.gain.setValueAtTime(0, now);
      osc2Gain.gain.linearRampToValueAtTime(0.01 * velocity, now + 0.35);
      osc2Gain.gain.setTargetAtTime(0, now + 0.5, 0.15);

      // Breath noise
      const noiseLen = audioCtx.sampleRate * duration;
      const noiseBuffer = audioCtx.createBuffer(1, noiseLen, audioCtx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;

      const formant = audioCtx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.value = freq * 1.5;
      formant.Q.value = 2;

      const airBand = audioCtx.createBiquadFilter();
      airBand.type = 'highpass';
      airBand.frequency.value = 2000;

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.04 * velocity, now + 0.2);
      noiseGain.gain.setTargetAtTime(0.02 * velocity, now + 0.3, 0.12);
      noiseGain.gain.setTargetAtTime(0, now + 0.5, 0.15);

      const lpf = audioCtx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = Math.min(freq * 6, 4000);
      lpf.Q.value = 0.5;

      osc.connect(oscGain);
      osc2.connect(osc2Gain);
      oscGain.connect(lpf);
      osc2Gain.connect(lpf);
      noise.connect(formant);
      noise.connect(airBand);
      formant.connect(noiseGain);
      airBand.connect(noiseGain);
      noiseGain.connect(lpf);
      applyPanning(lpf);

      osc.start(now);
      osc2.start(now);
      vibrato.start(now);
      noise.start(now);
      osc.stop(now + duration);
      osc2.stop(now + duration);
      vibrato.stop(now + duration);
      noise.stop(now + duration);
    }

    // Sympathetic resonance
    try {
      const currentStrings = stringsRef.current;
      if (currentStrings && Array.isArray(currentStrings)) {
        for (let i = 0; i < currentStrings.length; i++) {
          const s = currentStrings[i];
          if (!s || s === string || !s.freq || !string.freq) continue;
          const ratio = s.freq / string.freq;
          const nearestHarmonic = Math.round(ratio);
          if (nearestHarmonic > 0 && nearestHarmonic <= 4 && Math.abs(ratio - nearestHarmonic) < 0.05) {
            setTimeout(() => {
              // Check if still mounted before modifying state
              if (!mountedRef.current) return;
              try {
                // Re-check that s is still valid (strings may have been recreated)
                if (s && typeof s.energy === 'number' && typeof s.glowIntensity === 'number') {
                  s.energy = Math.min(s.energy + velocity * 0.08, 0.3);
                  s.glowIntensity = Math.min(s.glowIntensity + 0.15, 0.3);
                  exciteStringVisual(s, velocity * 0.15);
                }
              } catch (e) { /* ignore */ }
            }, 30 + Math.random() * 60);
          }
        }
      }
    } catch (e) {
      // Silently ignore - sympathetic resonance is a nice-to-have
    }
  }, [currentInstrument]);

  const exciteStringVisual = useCallback((string, velocity) => {
    if (!string || !string.displacement || !string.segments) return;
    try {
      const pluckSeg = Math.floor(string.pluckPoint * string.segments);
      for (let i = 0; i < string.segments; i++) {
        const distFromPluck = Math.abs(i - pluckSeg) / string.segments;
        const displacement = velocity * 12 * Math.max(0, 1 - distFromPluck * 2.5);
        string.displacement[i] += displacement * (Math.random() > 0.5 ? 1 : -1);
      }
    } catch (e) {
      // Silently handle animation errors
    }
  }, []);

  // =============================================
  // PLUCK
  // =============================================
  const pluck = useCallback((string, y, velocity) => {
    if (!string || typeof string.topY !== 'number' || typeof string.bottomY !== 'number') return;
    try {
      string.pluckPoint = Math.max(0.1, Math.min(0.9, (y - string.topY) / (string.bottomY - string.topY)));
      string.energy = Math.min((string.energy || 0) + velocity, 1);
      string.glowIntensity = Math.min(velocity + 0.2, 1);
      exciteStringVisual(string, velocity);

      if (string.ripples && Array.isArray(string.ripples)) {
        string.ripples.push({
          y,
          spread: 0,
          maxSpread: (string.bottomY - string.topY) * 0.8,
          life: 1,
          velocity,
        });
      }

      pluckStringAudio(string, velocity);

      // Show note name if enabled
      if (showNotesRef.current) {
        showPlayedNote(string.freq);
      }

      // Haptic feedback based on string pitch
      const idx = string.normalizedIndex || 0;
      if (idx < 0.33) {
        haptic.medium();
      } else if (idx < 0.66) {
        haptic.soft();
      } else {
        haptic.tap();
      }
    } catch (e) {
      // Silently handle pluck errors
    }
  }, [pluckStringAudio, exciteStringVisual]);

  // =============================================
  // INTERACTION
  // =============================================
  const findNearestString = useCallback((x) => {
    const strings = stringsRef.current;
    if (!strings || !Array.isArray(strings) || strings.length === 0) return null;
    const { W } = dimsRef.current;
    if (!W || W === 0) return null;

    let nearest = null;
    let minDist = Infinity;

    for (let i = 0; i < strings.length; i++) {
      const s = strings[i];
      if (!s || typeof s.x !== 'number') continue;
      const d = Math.abs(x - s.x);
      if (d < minDist) { minDist = d; nearest = s; }
    }

    const maxDist = W / strings.length * 0.8;
    return minDist < maxDist ? nearest : null;
  }, []);

  const handleStart = useCallback((id, x, y) => {
    // Skip if component unmounted
    if (!mountedRef.current) return;

    // Initialize or reinitialize audio if needed
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      initAudio();
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    activeRef.current.set(id, { x, y });

    const s = findNearestString(x);
    if (s && y > s.topY && y < s.bottomY) {
      pluck(s, y, 0.6);
      lastPluckedRef.current.set(s.index, performance.now());
    }
  }, [initAudio, findNearestString, pluck]);

  const handleMove = useCallback((id, x, y) => {
    if (!mountedRef.current) return;
    try {
      const prev = activeRef.current.get(id);
      if (!prev) return;

      const dx = x - prev.x;
      const strings = stringsRef.current;
      if (!strings || !Array.isArray(strings)) return;

      for (let i = 0; i < strings.length; i++) {
        const s = strings[i];
        if (!s || typeof s.x !== 'number') continue;

        const crossedRight = prev.x < s.x && x >= s.x;
        const crossedLeft = prev.x > s.x && x <= s.x;

        if ((crossedRight || crossedLeft) && y > s.topY && y < s.bottomY) {
          const lastTime = lastPluckedRef.current.get(s.index) || 0;
          if (performance.now() - lastTime < 100) continue;
          lastPluckedRef.current.set(s.index, performance.now());

          const velocity = Math.min(Math.abs(dx) / 30, 1) * 0.5 + 0.3;
          pluck(s, y, velocity);
        }
      }

      activeRef.current.set(id, { x, y });
    } catch (e) {
      // Silently handle move errors
    }
  }, [pluck]);

  const handleEnd = useCallback((id) => {
    activeRef.current.delete(id);
  }, []);

  // =============================================
  // LIFECYCLE
  // =============================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial resize
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dimsRef.current = { W, H };

    // Resize handler
    const handleResize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimsRef.current = { W, H };
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let running = true;
    let lastFrame = 0;
    const loop = (ts) => {
      if (!running || !mountedRef.current) return;

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          animationRef.current = requestAnimationFrame(loop);
          return;
        }

        if (!lastFrame) lastFrame = ts;
        const dt = Math.min((ts - lastFrame) / 1000, 0.05);
        lastFrame = ts;

      // Physics - get a local reference to strings
      const strings = stringsRef.current;
      if (!strings || !Array.isArray(strings)) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      if (strings.length > 0) {
        const c = 0.4;
        for (let si = 0; si < strings.length; si++) {
          const s = strings[si];
          if (!s || !s.displacement || !s.prevDisplacement) continue;

          const damping = 0.96 + s.normalizedIndex * 0.015;
          const segments = s.segments;
          const disp = s.displacement;
          const prev = s.prevDisplacement;

          // Wave equation with proper double-buffering:
          // prev holds y(t-dt), disp holds y(t)
          // Compute y(t+dt) into prev array (we read from disp which stays unchanged)
          for (let i = 1; i < segments - 1; i++) {
            const accel = c * c * (disp[i - 1] + disp[i + 1] - 2 * disp[i]);
            prev[i] = (2 * disp[i] - prev[i] + accel) * damping;
          }
          // Fix boundary conditions
          prev[0] = 0;
          prev[segments - 1] = 0;

          // Swap arrays: prev now holds y(t+dt), disp holds y(t)
          // After swap: displacement = y(t+dt), prevDisplacement = y(t)
          s.displacement = prev;
          s.prevDisplacement = disp;

          s.energy *= s.decay;
          if (s.energy < 0.001) s.energy = 0;
          s.glowIntensity *= 0.97;
          if (s.glowIntensity < 0.005) s.glowIntensity = 0;

          // Update ripples
          for (let ri = s.ripples.length - 1; ri >= 0; ri--) {
            const r = s.ripples[ri];
            r.spread += dt * 400;
            r.life -= dt * 0.5;
            if (r.life <= 0) s.ripples.splice(ri, 1);
          }
        }

        // Draw
        const { W, H } = dimsRef.current;
        if (W > 0 && H > 0) {
          const h = primaryHueRef.current;
          const sat = 35;
          const l = 50;
          ctx.clearRect(0, 0, W, H);

          // Calculate total energy safely
          let totalEnergy = 0;
          for (let i = 0; i < strings.length; i++) {
            const s = strings[i];
            if (s && typeof s.energy === 'number') {
              totalEnergy += s.energy;
            }
          }
          totalEnergy = totalEnergy / Math.max(strings.length, 1);

          const bgL = 1.5 + totalEnergy * 3;
          ctx.fillStyle = `hsl(${h}, ${sat * 0.3}%, ${bgL}%)`;
          ctx.fillRect(0, 0, W, H);
          if (totalEnergy > 0.01) {
            const ambGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
            ambGrad.addColorStop(0, `hsla(${h}, ${sat}%, ${l}%, ${totalEnergy * 0.06})`);
            ambGrad.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
            ctx.fillStyle = ambGrad;
            ctx.fillRect(0, 0, W, H);
          }

          // Draw strings with null checks
          for (let si = 0; si < strings.length; si++) {
            const str = strings[si];
            if (!str || !str.displacement || typeof str.segments !== 'number') continue;

            const glowIntensity = str.glowIntensity || 0;
            const energy = str.energy || 0;
            const thickness = str.thickness || 1;
            const x = str.x;
            const topY = str.topY;
            const bottomY = str.bottomY;

            if (typeof x !== 'number' || typeof topY !== 'number' || typeof bottomY !== 'number') continue;

            if (glowIntensity > 0.01) {
              ctx.save();
              ctx.globalAlpha = glowIntensity * 0.25;
              ctx.shadowColor = `hsla(${h}, ${sat + 20}%, ${l + 20}%, 0.8)`;
              ctx.shadowBlur = 15 + glowIntensity * 20;
              ctx.beginPath();
              ctx.moveTo(x, topY);
              for (let i = 0; i < str.segments; i++) {
                const segY = topY + (i / (str.segments - 1)) * (bottomY - topY);
                const disp = str.displacement[i] || 0;
                ctx.lineTo(x + disp, segY);
              }
              ctx.strokeStyle = `hsla(${h}, ${sat + 20}%, ${l + 25}%, ${0.3 + glowIntensity * 0.5})`;
              ctx.lineWidth = thickness + glowIntensity * 4;
              ctx.stroke();
              ctx.restore();
            }
            ctx.beginPath();
            ctx.moveTo(x, topY);
            for (let i = 0; i < str.segments; i++) {
              const t = i / (str.segments - 1);
              const disp = str.displacement[i] || 0;
              ctx.lineTo(x + disp, topY + t * (bottomY - topY));
            }
            ctx.strokeStyle = `hsla(${h}, ${sat}%, ${l * 0.4 + glowIntensity * l * 0.6 + 10}%, ${0.35 + energy * 0.5 + glowIntensity * 0.15})`;
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.stroke();


            ctx.beginPath();
            ctx.arc(x, topY, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${h}, ${sat - 10}%, ${l + 20}%, 0.3)`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottomY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${h}, ${sat - 10}%, ${l + 15}%, 0.2)`;
            ctx.fill();
          }
        }
      }
      } catch (e) {
        // Silently continue on errors to prevent crash
      }

      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    mountedRef.current = true;

    // Initialize audio on mount - user has already tapped "touch to begin"
    // so we can create AudioContext without waiting for another touch
    initAudio();

    return () => {
      running = false;
      mountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (foleyIntervalRef.current) clearInterval(foleyIntervalRef.current);

      // Cancel any pending audio close timeout
      if (audioCloseTimeoutRef.current) {
        clearTimeout(audioCloseTimeoutRef.current);
        audioCloseTimeoutRef.current = null;
      }

      // Fade out audio on unmount for smooth transition
      const audioCtx = audioCtxRef.current;
      const masterGain = masterGainRef.current;
      if (audioCtx && audioCtx.state !== 'closed') {
        try {
          const now = audioCtx.currentTime;
          // Fade out master gain smoothly (0.3s time constant)
          if (masterGain) {
            masterGain.gain.setTargetAtTime(0, now, 0.3);
          }
          // Close audio context after fade
          setTimeout(() => {
            try { audioCtx.close(); } catch (e) {}
          }, 1000);
        } catch (e) { /* ignore */ }
      }
      // Clear refs so remount gets fresh context
      audioCtxRef.current = null;
      masterGainRef.current = null;
    };
  }, []); // Empty deps - only run on mount/unmount

  // Update strings when key/scale changes
  useEffect(() => {
    createStrings();
  }, [currentKey, currentScaleType, createStrings]);

  // Resume audio context when settings close (iOS can suspend during UI interactions)
  useEffect(() => {
    if (!showSettings && audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
  }, [showSettings]);

  // Handle app backgrounding/foregrounding - resume or reinit audio
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (audioCtxRef.current) {
          if (audioCtxRef.current.state === 'closed') {
            // Context is dead, reinitialize on next interaction
            audioCtxRef.current = null;
          } else if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
          }
        }
      }
    };

    const handleInteraction = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        initAudio();
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('focus', handleInteraction);
    window.addEventListener('pageshow', handleInteraction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('focus', handleInteraction);
      window.removeEventListener('pageshow', handleInteraction);
    };
  }, [initAudio]);

  // Touch handlers with swipe detection for settings
  const onTouchStart = useCallback((e) => {
    // Don't handle canvas touches when settings is open
    if (showSettings) return;
    e.preventDefault();
    const t = e.changedTouches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    for (const touch of e.changedTouches) {
      handleStart(touch.identifier, touch.clientX, touch.clientY);
    }
  }, [handleStart, showSettings]);

  const onTouchMove = useCallback((e) => {
    if (showSettings) return;
    e.preventDefault();
    for (const touch of e.changedTouches) {
      handleMove(touch.identifier, touch.clientX, touch.clientY);
    }
  }, [handleMove, showSettings]);

  const onTouchEnd = useCallback((e) => {
    if (showSettings) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      handleEnd(t.identifier);
    }
    // Check for swipe up to open settings
    if (touchStartRef.current && e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      const deltaY = t.clientY - touchStartRef.current.y;
      const deltaX = t.clientX - touchStartRef.current.x;
      const deltaTime = Date.now() - touchStartRef.current.time;
      if (deltaTime < 500 && deltaY < -50 && Math.abs(deltaY) > Math.abs(deltaX)) {
        setShowSettings(true);
      }
    }
    touchStartRef.current = null;
  }, [handleEnd, showSettings]);

  const onMouseDown = useCallback((e) => {
    handleStart('mouse', e.clientX, e.clientY);
  }, [handleStart]);

  const onMouseMove = useCallback((e) => {
    if (e.buttons === 1) {
      handleMove('mouse', e.clientX, e.clientY);
    }
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd('mouse');
  }, [handleEnd]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#030306',
      touchAction: showSettings ? 'auto' : 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: showSettings ? 'none' : 'auto',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />

      {/* Vignette */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 5,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(3,3,6,0.6) 60%, rgba(3,3,6,0.98) 85%)',
      }} />


      {/* Instrument indicator - hidden when settings open */}
      {!showSettings && (
        <div
          onClick={() => setCurrentInstrument(prev => (prev + 1) % INSTRUMENTS.length)}
          style={{
            position: 'fixed',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            textAlign: 'center',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
          }}
        >
          <div style={{
            fontSize: '1rem',
            letterSpacing: '0.15em',
            textTransform: 'lowercase',
            color: `hsla(${primaryHue}, 45%, 65%, 0.85)`,
            fontFamily: '"Jost", sans-serif',
            fontWeight: 300,
          }}>
            <span style={{ opacity: 0.6, marginRight: '0.5em' }}>‹</span>
            {INSTRUMENTS[currentInstrument].name}
            <span style={{ opacity: 0.6, marginLeft: '0.5em' }}>›</span>
          </div>
        </div>
      )}

      {/* Settings drawer - matches handpan mode style */}
      {showSettings && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowSettings(false)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setShowSettings(false);
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 20,
              animation: 'fadeInSettings 0.5s ease-out',
            }}
          />
          {/* Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              borderTop: `1px solid hsla(${primaryHue}, 52%, 68%, 0.2)`,
              borderRadius: '1.5rem 1.5rem 0 0',
              zIndex: 21,
              animation: 'slideUpSettings 0.5s ease-out',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              touchAction: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem 1.5rem 0.75rem',
              textAlign: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                color: `hsla(${primaryHue}, 52%, 68%, 0.7)`,
                fontSize: '0.6rem',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>Settings</span>
            </div>

            {/* Texture selection row */}
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}>Texture</div>
              <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.25rem',
              }}>
                {TEXTURES.map((tex, index) => (
                  <button
                    key={tex.name}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentTexture(index);
                      currentTextureRef.current = index;
                      haptic.tap();
                    }}
                    onClick={() => {
                      setCurrentTexture(index);
                      currentTextureRef.current = index;
                      haptic.tap();
                    }}
                    style={{
                      background: currentTexture === index ? `hsla(${primaryHue}, 52%, 68%, 0.2)` : 'rgba(255,255,255,0.05)',
                      border: currentTexture === index ? `1px solid hsla(${primaryHue}, 52%, 68%, 0.5)` : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      color: currentTexture === index ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.6)',
                      padding: '0.4rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontFamily: '"Jost", sans-serif',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tex.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Show notes toggle */}
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>Show Notes</div>
              <button
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowNotes(!showNotes);
                  haptic.tap();
                }}
                onClick={() => {
                  setShowNotes(!showNotes);
                  haptic.tap();
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: showNotes ? `hsla(${primaryHue}, 52%, 68%, 0.4)` : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: showNotes ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.5)',
                  position: 'absolute',
                  top: '3px',
                  left: showNotes ? '23px' : '3px',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                }} />
              </button>
            </div>

            {/* Ambient Drone toggle */}
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>Ambient Drone</div>
              <button
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDroneEnabled(!droneEnabled);
                  haptic.tap();
                }}
                onClick={() => {
                  setDroneEnabled(!droneEnabled);
                  haptic.tap();
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: droneEnabled ? `hsla(${primaryHue}, 52%, 68%, 0.4)` : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: droneEnabled ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.5)',
                  position: 'absolute',
                  top: '3px',
                  left: droneEnabled ? '23px' : '3px',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                }} />
              </button>
            </div>

            {/* Two column layout */}
            <div style={{
              display: 'flex',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}>
              {/* Keys column */}
              <div
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'contain',
                }}>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.55rem',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: '"Jost", sans-serif',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  position: 'sticky',
                  top: 0,
                  background: 'rgba(0, 0, 0, 0.95)',
                  zIndex: 1,
                }}>Key</div>
                {KEYS.map((key, index) => (
                  <button
                    key={key}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentKey(index);
                      haptic.tap();
                    }}
                    onClick={() => {
                      setCurrentKey(index);
                      haptic.tap();
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: currentKey === index ? `hsla(${primaryHue}, 52%, 68%, 0.15)` : 'transparent',
                      border: 'none',
                      borderLeft: currentKey === index ? `3px solid hsla(${primaryHue}, 52%, 68%, 0.6)` : '3px solid transparent',
                      color: currentKey === index ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.6)',
                      padding: '0.7rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontFamily: '"Jost", sans-serif',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {key}
                  </button>
                ))}
                <div style={{ height: 'calc(8rem + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }} />
              </div>

              {/* Scales column */}
              <div
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                style={{
                  flex: 2,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'contain',
                }}>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.55rem',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: '"Jost", sans-serif',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  position: 'sticky',
                  top: 0,
                  background: 'rgba(0, 0, 0, 0.95)',
                  zIndex: 1,
                }}>Scale</div>
                {SCALE_TYPES.map((scale, index) => (
                  <button
                    key={scale.name}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentScaleType(index);
                      haptic.tap();
                    }}
                    onClick={() => {
                      setCurrentScaleType(index);
                      haptic.tap();
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: currentScaleType === index ? `hsla(${primaryHue}, 52%, 68%, 0.15)` : 'transparent',
                      border: 'none',
                      borderLeft: currentScaleType === index ? `3px solid hsla(${primaryHue}, 52%, 68%, 0.6)` : '3px solid transparent',
                      color: currentScaleType === index ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.6)',
                      padding: '0.7rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: '"Jost", sans-serif',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {scale.name}
                  </button>
                ))}
                <div style={{ height: 'calc(8rem + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }} />
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInSettings {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpSettings {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
