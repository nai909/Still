import React from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { haptic } from '../config/haptic';
import { KEYS, KEY_FREQUENCIES, SCALE_TYPES } from '../config/constants';
import GazeMode from './GazeMode';

const { useState, useEffect, useRef, useCallback } = React;

const generateScale = (keyName, scaleType, targetNotes = 9) => {
  const baseFreq = KEY_FREQUENCIES[keyName];
  const intervals = scaleType.intervals;
  const frequencies = [];

  // Generate enough octaves to fill the handpan (9 notes: 1 ding + 8 tone fields)
  let octave = 0;
  while (frequencies.length < targetNotes && octave < 4) {
    for (const interval of intervals) {
      const freq = baseFreq * Math.pow(2, octave + interval / 12);
      if (freq < 880) { // Extended cap to allow more notes
        frequencies.push(freq);
        if (frequencies.length >= targetNotes) break;
      }
    }
    octave++;
  }
  // Sort ascending to ensure low notes at bottom, high notes at top
  return frequencies.sort((a, b) => a - b).slice(0, targetNotes);
};

const HandpanView = React.forwardRef(function HandpanView({ scale, onPlayNote, primaryHue, breathValue = 0.5 }, ref) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const handpanRef = useRef(null);
  const hitTargetsRef = useRef([]);
  const toneFieldsRef = useRef([]);
  const clockRef = useRef(null);
  const activeNotesRef = useRef([]);
  const particlesRef = useRef(null);
  const ripplesRef = useRef([]);
  const bloomRef = useRef(null);
  const animationFrameRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(null);
  const primaryColorRef = useRef(new THREE.Color(`hsl(${primaryHue}, 52%, 68%)`));
  const accentColorRef = useRef(new THREE.Color(`hsl(${primaryHue}, 52%, 82%)`));

  useEffect(() => {
    primaryColorRef.current = new THREE.Color(`hsl(${primaryHue}, 52%, 68%)`);
    accentColorRef.current = new THREE.Color(`hsl(${primaryHue}, 52%, 82%)`);
    if (handpanRef.current) {
      handpanRef.current.traverse(obj => {
        if (obj.material && obj.material.visible !== false) {
          obj.material.color.copy(obj.material.opacity > 0.55 ? accentColorRef.current : primaryColorRef.current);
        }
      });
    }
  }, [primaryHue]);

  const triggerGlowRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    handleTap: (clientX, clientY) => {
      if (!rendererRef.current || !cameraRef.current || !raycasterRef.current || !mouseRef.current) return false;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const hits = raycasterRef.current.intersectObjects(hitTargetsRef.current, false);
      if (hits.length > 0) {
        const { noteIndex, visualGroup } = hits[0].object.userData;
        if (visualGroup && triggerGlowRef.current) triggerGlowRef.current(visualGroup);
        if (onPlayNote && scale?.[noteIndex] !== undefined) onPlayNote(noteIndex);
        return true;
      }
      return false;
    }
  }), [scale, onPlayNote]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.025);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Camera position: native iOS keeps original size, web gets larger handpan
    const isNativeApp = Capacitor.isNativePlatform();
    if (isNativeApp) {
      camera.position.set(0, 8.5, 6); // Original size for iOS native app
    } else if (isMobile) {
      camera.position.set(0, 6, 4.5); // Larger handpan for mobile web browser
    } else {
      camera.position.set(0, 6, 4.2); // Larger handpan for desktop
    }
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.4, 0.25);
    bloomRef.current = bloom;
    composer.addPass(bloom);
    composerRef.current = composer;

    clockRef.current = new THREE.Clock();
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();

    const handpan = new THREE.Group();
    scene.add(handpan);
    handpanRef.current = handpan;
    const pColor = primaryColorRef.current;
    const aColor = accentColorRef.current;

    // Shell
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(1.95, 72, 36, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshBasicMaterial({ color: pColor, wireframe: true, transparent: true, opacity: 0.18 })
    );
    shell.rotation.x = Math.PI;
    handpan.add(shell);

    // Rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.05, 16, 100),
      new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.7 })
    );
    rim.rotation.x = Math.PI / 2;
    handpan.add(rim);

    // Ding (center note)
    const dingGroup = new THREE.Group();
    const dingHit = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.3, 32), new THREE.MeshBasicMaterial({ visible: false }));
    dingHit.userData = { noteIndex: 0, visualGroup: dingGroup };
    dingGroup.add(dingHit);
    hitTargetsRef.current.push(dingHit);
    const dingRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.028, 12, 48), new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.65 }));
    dingRing.rotation.x = Math.PI / 2;
    dingGroup.add(dingRing);
    const dingCenter = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.014, 8, 24), new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.6 }));
    dingCenter.rotation.x = Math.PI / 2;
    dingGroup.add(dingCenter);
    dingGroup.position.y = 0.08;
    handpan.add(dingGroup);

    // Tone fields - always 8 surrounding the ding
    // Size decreases with pitch (noteIndex) - lower notes are larger
    const numFields = 8;
    for (let i = 0; i < numFields; i++) {
      const angle = -Math.PI / 2 + (i / numFields) * Math.PI * 2;
      const g = new THREE.Group();
      // Scale factor: 1.0 for lowest note (i=0), down to 0.65 for highest (i=7)
      const ns = 1.0 - (i / (numFields - 1)) * 0.35;
      // Hit target sized to match visual
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.52 * ns, 0.52 * ns, 0.15, 32), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData = { noteIndex: i + 1, visualGroup: g };
      g.add(hit);
      hitTargetsRef.current.push(hit);
      // Outer oval - scales with pitch
      const oval = new THREE.Mesh(new THREE.TorusGeometry(0.46 * ns, 0.026, 12, 40), new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.6 }));
      oval.rotation.x = Math.PI / 2;
      oval.scale.set(1, 1.25, 1);
      g.add(oval);
      // Inner oval - scales proportionally
      const innerOval = new THREE.Mesh(new THREE.TorusGeometry(0.15 * ns, 0.013, 8, 24), new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.5 }));
      innerOval.rotation.x = Math.PI / 2;
      innerOval.scale.set(1, 1.25, 1);
      g.add(innerOval);
      g.position.set(Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3);
      g.rotation.y = -angle - Math.PI / 2;
      handpan.add(g);
      toneFieldsRef.current.push(g);
    }

    // Twinkling stars background - kept far from camera to avoid square artifacts
    const starCount = 400;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starData = [];
    for (let i = 0; i < starCount; i++) {
      // Spread stars in a sphere around the scene, but keep them far back
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 25 + Math.random() * 35; // Distance 25-60 from center
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6 - 5; // Flatten vertically, shift down
      starPos[i * 3 + 2] = r * Math.cos(phi);
      starData.push({
        baseOpacity: 0.3 + Math.random() * 0.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      size: 0.08,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeom, starMaterial);
    stars.userData.starData = starData;
    scene.add(stars);

    renderer.domElement.style.pointerEvents = 'none';

    const animate = () => {
      // Twinkle stars
      if (stars.userData.starData) {
        const time = Date.now() * 0.001;
        let avgOpacity = 0;
        stars.userData.starData.forEach((s, i) => {
          const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
          avgOpacity += s.baseOpacity * twinkle;
        });
        stars.material.opacity = 0.4 + 0.3 * Math.sin(time * 0.5);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
      if (handpanRef.current) {
        handpanRef.current.scale.setScalar(0.96 + breathValue * 0.08);
        handpanRef.current.rotation.y += 0.001;
      }
      if (bloomRef.current) bloomRef.current.strength = 0.35 + breathValue * 0.4;
      if (clockRef.current) {
        const now = clockRef.current.getElapsedTime();
        for (let i = activeNotesRef.current.length - 1; i >= 0; i--) {
          const n = activeNotesRef.current[i];
          const p = (now - n.birth) / n.duration;
          if (p >= 1) { n.states.forEach(s => { s.obj.material.opacity = s.op; s.obj.material.color.copy(s.col); }); activeNotesRef.current.splice(i, 1); }
          else { const g = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85; n.states.forEach(s => { s.obj.material.opacity = s.op + (1 - s.op) * g * 0.7; s.obj.material.color.copy(s.col).lerp(accentColorRef.current, g * 0.8); }); }
        }
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          const p = (now - r.userData.born) / r.userData.maxAge;
          if (p >= 1) { scene.remove(r); r.geometry.dispose(); r.material.dispose(); ripplesRef.current.splice(i, 1); }
          else { const s = 1 + p * 8; r.scale.set(s, s, 1); r.position.y = -1.8 - p * 5; r.material.opacity = 0.3 * (1 - p * 0.8); }
        }
      }
      composer.render();
    };
    animate();

    const onResize = () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); composer.setSize(container.clientWidth, container.clientHeight); };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      ripplesRef.current.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      if (renderer) { renderer.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); }
    };
  }, []);

  const triggerNoteGlow = useCallback((mesh) => {
    if (!mesh || !clockRef.current || !sceneRef.current) return;
    const states = [];
    mesh.traverse(o => { if (o.material && o.material.visible !== false) states.push({ obj: o, op: o.material.opacity, col: o.material.color.clone() }); });
    activeNotesRef.current.push({ mesh, states, birth: clockRef.current.getElapsedTime(), duration: 0.8 });
    // Only one ripple at a time - remove existing before adding new
    ripplesRef.current.forEach(r => { sceneRef.current.remove(r); r.geometry.dispose(); r.material.dispose(); });
    ripplesRef.current = [];
    const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 12, 48), new THREE.MeshBasicMaterial({ color: primaryColorRef.current, transparent: true, opacity: 0.3, wireframe: true }));
    ripple.rotation.x = Math.PI / 2;
    ripple.position.y = -1.8;
    ripple.userData = { born: clockRef.current.getElapsedTime(), maxAge: 12 };
    sceneRef.current.add(ripple);
    ripplesRef.current.push(ripple);
  }, []);

  triggerGlowRef.current = triggerNoteGlow;

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, touchAction: 'none' }} />;
});

const DroneMode = React.forwardRef(function DroneMode({
  primaryHue = 162,
  primaryColor = 'hsl(162, 52%, 68%)',
  backgroundMode = false,
  onSamplesReady = null,
  // Shared drone state from App.jsx
  currentKey: propCurrentKey,
  onKeyChange,
  droneEnabled: propDroneEnabled,
  onDroneToggle,
}, ref) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [samplesReady, setSamplesReady] = useState(false);
  const samplesReadyRef = useRef(false);
  const samplesLoadedCountRef = useRef(0);
  const totalSamplesToLoad = 20; // Number of handpan samples
  const [currentInstrument, setCurrentInstrument] = useState(0); // handpan
  const [currentTexture, setCurrentTexture] = useState(2); // forest
  // Use prop if provided, otherwise use local state (backwards compat)
  const [localCurrentKey, setLocalCurrentKey] = useState(5); // F
  const currentKey = propCurrentKey !== undefined ? propCurrentKey : localCurrentKey;
  const setCurrentKey = onKeyChange || setLocalCurrentKey;
  const [currentScaleType, setCurrentScaleType] = useState(13); // insen
  const [showLabel, setShowLabel] = useState(false);
  const [showScaleSelector, setShowScaleSelector] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathValue, setBreathValue] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  // Use prop if provided, otherwise use local state
  const [localDroneEnabled, setLocalDroneEnabled] = useState(false);
  const droneEnabled = propDroneEnabled !== undefined ? propDroneEnabled : localDroneEnabled;
  const setDroneEnabled = onDroneToggle || setLocalDroneEnabled;
  const droneEnabledRef = useRef(droneEnabled);
  const backgroundModeRef = useRef(backgroundMode);

  // Keep refs in sync with state/props for animation loop access
  useEffect(() => {
    droneEnabledRef.current = droneEnabled;
  }, [droneEnabled]);

  useEffect(() => {
    backgroundModeRef.current = backgroundMode;
    // Note: We no longer turn off drone when entering background mode
    // The drone is shared and should persist across mode switches
  }, [backgroundMode]);

  // Generate current scale based on key and scale type (memoized to prevent stale closures)
  const scale = React.useMemo(() =>
    generateScale(KEYS[currentKey], SCALE_TYPES[currentScaleType]),
    [currentKey, currentScaleType]
  );

  // Convert frequency to note name
  const freqToNoteName = useCallback((freq) => {
    const A4 = 440;
    const semitones = Math.round(12 * Math.log2(freq / A4));
    const noteIndex = ((semitones % 12) + 12) % 12;
    const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    return noteNames[noteIndex];
  }, []);

  // Show note and fade it using DOM manipulation (more reliable than state)
  const showPlayedNote = useCallback((freq, primaryHueVal) => {
    const noteName = freqToNoteName(freq);

    // Inject keyframes if not already present
    if (!document.getElementById('note-fade-style')) {
      const style = document.createElement('style');
      style.id = 'note-fade-style';
      style.textContent = `
        @keyframes noteFadeDOM {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Remove any existing note display
    const existing = document.getElementById('played-note-display');
    if (existing) existing.remove();

    // Create new note display element
    const noteEl = document.createElement('div');
    noteEl.id = 'played-note-display';
    noteEl.textContent = noteName;
    noteEl.style.cssText = `
      position: fixed;
      bottom: 3%;
      left: 50%;
      transform: translate(-50%, 0);
      font-size: 1.5rem;
      font-family: "Jost", sans-serif;
      font-weight: 300;
      letter-spacing: 0.3em;
      color: hsl(${primaryHueVal}, 52%, 68%);
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      animation: noteFadeDOM 2s ease-in-out forwards;
    `;
    document.body.appendChild(noteEl);

    // Remove after animation completes
    setTimeout(() => noteEl.remove(), 2000);
  }, [freqToNoteName]);

  // Touch ref for forwarding to GazeMode ripples
  const externalTouchRef = useRef([]);
  const handpanViewRef = useRef(null);

  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const reverbGainRef = useRef(null);
  const dryGainRef = useRef(null);
  const droneOscillatorsRef = useRef([]);
  const noiseNodeRef = useRef(null);
  const noiseGainRef = useRef(null);
  const foleyIntervalRef = useRef(null);
  const breathStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const labelTimeoutRef = useRef(null);
  const wheelAccumXRef = useRef(0);
  const wheelAccumYRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const touchActiveRef = useRef(false); // Track if touch is active to prevent click
  const currentTextureRef = useRef(currentTexture);
  currentTextureRef.current = currentTexture;
  const pianoBufferRef = useRef(null);
  const guitarBufferRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const particlesRef = useRef([]);
  const harpBufferRef = useRef(null);
  const celloBufferRef = useRef(null);
  const handpanBufferRef = useRef(null);
  const handpanSamplesRef = useRef({}); // Multi-sample handpan: { freq: buffer }
  const voiceBufferRef = useRef(null);
  const rainstickBufferRef = useRef(null);
  const percBufferRef = useRef(null);
  const fetchAbortControllerRef = useRef(null); // For cancelling sample loads on unmount

  // Breath pattern (4-7-8)
  const breathPattern = { inhale: 4, hold: 7, exhale: 8 };

  const instruments = [
    { name: 'handpan', type: 'sampledHandpan' },
    { name: 'piano', type: 'sampledPiano' },
    { name: 'guitar', type: 'sampledGuitar' },
    { name: 'synth', type: 'feltPiano' },
    { name: 'music box', type: 'musicBox' },
    { name: 'cello', type: 'sampledCello' },
    { name: 'flute', type: 'organicFlute' },
    { name: 'harp', type: 'sampledHarp' },
    { name: 'voice', type: 'sampledVoice' },
    { name: 'rainstick', type: 'sampledRainstick' },
    { name: 'perc', type: 'sampledPerc' }
  ];

  const textures = [
    { name: 'silence', noise: 0, foley: false },
    { name: 'rain', noise: 0.008, foley: true, foleyType: 'rain' },
    { name: 'forest', noise: 0, foley: true, foleyType: 'forest' },
    { name: 'water', noise: 0, foley: true, foleyType: 'water' },
    { name: 'night', noise: 0, foley: true, foleyType: 'night' }
  ];


  // Initialize audio context
  const initAudio = useCallback((forceReinit = false) => {
    // If forcing reinit, clean up old context
    if (forceReinit && ctxRef.current) {
      try {
        // Stop all drone oscillators
        droneOscillatorsRef.current.forEach(node => {
          if (node.osc) {
            try { node.osc.stop(); } catch (e) {}
          }
        });
        droneOscillatorsRef.current = [];
        ctxRef.current.close();
      } catch (e) {}
      ctxRef.current = null;
    }

    if (ctxRef.current) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    // Resume context immediately (required for mobile browsers)
    // This is critical for iOS - must happen in user gesture handler
    ctx.resume().catch(() => {});

    // CRITICAL: Play silent buffer immediately to warm up iOS audio hardware
    // This prevents lag/glitch on first real sound playback
    const silentBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const silentSource = ctx.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(ctx.destination);
    silentSource.start();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGainRef.current = masterGain;

    // Set up dry output immediately (no reverb delay on first tap)
    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.8; // Slightly louder dry signal initially
    dryGainRef.current = dryGain;

    masterGain.connect(dryGain);
    dryGain.connect(ctx.destination);

    // Create reverb asynchronously - defer heavily to not block UI
    // Use shorter reverb (3s instead of 6s) to reduce computation
    setTimeout(() => {
      const reverbNode = ctx.createConvolver();
      const reverbLength = 3; // Reduced from 6s
      const sampleRate = ctx.sampleRate;
      const length = sampleRate * reverbLength;
      const impulse = ctx.createBuffer(2, length, sampleRate);

      // Build impulse buffer in chunks to avoid blocking
      let ch = 0;
      const buildChunk = () => {
        if (ch >= 2) {
          reverbNode.buffer = impulse;
          reverbNodeRef.current = reverbNode;

          const reverbGain = ctx.createGain();
          reverbGain.gain.value = 0.5;
          reverbGainRef.current = reverbGain;

          masterGain.connect(reverbNode);
          reverbNode.connect(reverbGain);
          reverbGain.connect(ctx.destination);
          dryGain.gain.setTargetAtTime(0.6, ctx.currentTime, 0.5);
          return;
        }
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const earlyDecay = Math.exp(-t * 3) * 0.3;
          const lateDecay = Math.exp(-t * 0.8) * 0.7;
          data[i] = (Math.random() * 2 - 1) * (earlyDecay + lateDecay);
        }
        ch++;
        setTimeout(buildChunk, 16); // Yield to UI between channels
      };
      buildChunk();
    }, 500); // Delay reverb creation until after samples start loading

    // Create AbortController for cancelling sample loads on unmount
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }
    fetchAbortControllerRef.current = new AbortController();
    const { signal } = fetchAbortControllerRef.current;

    // Defer non-handpan samples - load after handpan is ready
    // These are for alternate instruments, not needed immediately
    setTimeout(() => {
      // Load piano sample (C3 = 130.81Hz base note)
      fetch('piano.mp3', { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => { pianoBufferRef.current = audioBuffer; })
        .catch(() => {});
    }, 1000);

    setTimeout(() => {
      // Load guitar sample
      fetch('guitar.wav', { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => { guitarBufferRef.current = audioBuffer; })
        .catch(() => {});
    }, 1500);

    setTimeout(() => {
      // Load harp sample
      fetch('harp.mp3', { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => { harpBufferRef.current = audioBuffer; })
        .catch(() => {});
    }, 2000);

    setTimeout(() => {
      // Load cello sample
      fetch('cello.mp3', { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => { celloBufferRef.current = audioBuffer; })
        .catch(() => {});
    }, 2500);

    // Load multi-sample handpan - C2 to C6 chromatic from real recordings
    const handpanSampleMap = [
      // Octave 2 (from C2 ding recording)
      ['C2', 65.41], ['Cs2', 69.30], ['D2', 73.42], ['Ds2', 77.78],
      ['E2', 82.41], ['F2', 87.31], ['Fs2', 92.50], ['G2', 98.00],
      ['Gs2', 103.83], ['A2', 110.00], ['As2', 116.54], ['B2', 123.47],
      // Octave 3 (from C3 recording)
      ['C3', 130.81], ['Cs3', 138.59], ['D3', 146.83], ['Ds3', 155.56],
      ['E3', 164.81], ['F3', 174.61], ['Fs3', 185.00], ['G3', 196.00],
      ['Gs3', 207.65], ['A3', 220.00], ['As3', 233.08], ['B3', 246.94],
      // Octave 4
      ['C4', 261.63], ['Cs4', 277.18], ['D4', 293.66], ['Ds4', 311.13],
      ['E4', 329.63], ['F4', 349.23], ['Fs4', 369.99], ['G4', 392.00],
      ['Gs4', 415.30], ['A4', 440.00], ['As4', 466.16], ['B4', 493.88],
      // Octave 5
      ['C5', 523.25], ['Cs5', 554.37], ['D5', 587.33], ['Ds5', 622.25],
      ['E5', 659.26], ['F5', 698.46], ['Fs5', 739.99], ['G5', 783.99],
      ['Gs5', 830.61], ['A5', 880.00], ['As5', 932.33], ['B5', 987.77],
      // Octave 6
      ['C6', 1046.50],
    ];

    // Load handpan samples - using original recorded samples for best quality
    // Original samples: As2, B2, C3, C4, C5, Cs2, Cs3, Cs5, Ds2, Ds3, Ds4, Ds5, F2, F3, F4, F5, G3, G4, Gs3, Gs4
    const handpanKeySamples = [
      ['handpan-Cs2.wav', 69.30],   // C#2 - original
      ['handpan-Ds2.wav', 77.78],   // D#2 - original
      ['handpan-F2.wav', 87.31],    // F2 - original
      ['handpan-As2.wav', 116.54],  // A#2 - original
      ['handpan-B2.wav', 123.47],   // B2 - original
      ['handpan-C3.wav', 130.81],   // C3 - original
      ['handpan-Cs3.wav', 138.59],  // C#3 - original
      ['handpan-Ds3.wav', 155.56],  // D#3 - original
      ['handpan-F3.wav', 174.61],   // F3 - original
      ['handpan-G3.wav', 196.00],   // G3 - original
      ['handpan-Gs3.wav', 207.65],  // G#3 - original
      ['handpan-C4.wav', 261.63],   // C4 - original
      ['handpan-Ds4.wav', 311.13],  // D#4 - original
      ['handpan-F4.wav', 349.23],   // F4 - original
      ['handpan-G4.wav', 392.00],   // G4 - original
      ['handpan-Gs4.wav', 415.30],  // G#4 - original
      ['handpan-C5.wav', 523.25],   // C5 - original
      ['handpan-Cs5.wav', 554.37],  // C#5 - original
      ['handpan-Ds5.wav', 622.25],  // D#5 - original
      ['handpan-F5.wav', 698.46],   // F5 - original
    ];
    setSamplesLoading(true);
    samplesLoadedCountRef.current = 0;

    // Stagger sample loading - load in batches of 4 with delays
    // This prevents network congestion and CPU spikes
    // Flag to ensure we only warm up once
    let audioWarmedUp = false;

    const loadSample = ([file, freq]) => {
      return fetch(file, { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          handpanSamplesRef.current[freq] = audioBuffer;
          samplesLoadedCountRef.current++;

          // CRITICAL: Play a very quiet note on first sample to fully warm up iOS audio
          // Silent buffers don't fully wake the audio hardware - need real audio source
          if (!audioWarmedUp && masterGainRef.current) {
            audioWarmedUp = true;
            const warmupSource = ctx.createBufferSource();
            warmupSource.buffer = audioBuffer;
            const warmupGain = ctx.createGain();
            warmupGain.gain.value = 0.01; // Nearly inaudible
            warmupSource.connect(warmupGain);
            warmupGain.connect(ctx.destination);
            warmupSource.start();
            // Stop after 100ms
            setTimeout(() => { try { warmupSource.stop(); } catch(e) {} }, 100);
          }

          // Mark as ready once we have at least 6 samples (enough for basic playing)
          if (samplesLoadedCountRef.current >= 6 && !samplesReadyRef.current) {
            samplesReadyRef.current = true;
            setSamplesReady(true);
            setSamplesLoading(false);
            if (onSamplesReady) onSamplesReady();
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            samplesLoadedCountRef.current++;
          }
        });
    };

    // Load first batch immediately (6 samples for quick startup)
    const prioritySamples = handpanKeySamples.slice(0, 6);
    const remainingSamples = handpanKeySamples.slice(6);

    Promise.all(prioritySamples.map(loadSample)).then(() => {
      // Load remaining samples in background with staggered timing
      remainingSamples.forEach((sample, i) => {
        setTimeout(() => loadSample(sample), i * 100); // 100ms between each
      });
    });

    // Defer texture samples - load after handpan is ready
    setTimeout(() => {
      fetch('samples/voice-c3.m4a', { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => { voiceBufferRef.current = audioBuffer; })
        .catch(() => {});
    }, 3000);

    setTimeout(() => {
      fetch('samples/rainstick-c3.m4a', { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => { rainstickBufferRef.current = audioBuffer; })
        .catch(() => {});
    }, 3500);

    setTimeout(() => {
      fetch('samples/perc-c3.m4a', { signal })
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => { percBufferRef.current = audioBuffer; })
        .catch(() => {});
    }, 4000);

    // Start drone
    startDrone(ctx, masterGain);

    // Start textures
    startTextures(ctx, masterGain);

    // Start breath loop
    breathStartTimeRef.current = performance.now();
    const updateBreath = (timestamp) => {
      if (!breathStartTimeRef.current) breathStartTimeRef.current = timestamp;

      const totalCycle = breathPattern.inhale + breathPattern.hold + breathPattern.exhale;
      const elapsed = ((timestamp - breathStartTimeRef.current) / 1000) % totalCycle;

      let phase, value;
      if (elapsed < breathPattern.inhale) {
        phase = 'inhale';
        value = elapsed / breathPattern.inhale;
      } else if (elapsed < breathPattern.inhale + breathPattern.hold) {
        phase = 'hold';
        value = 1;
      } else {
        phase = 'exhale';
        value = 1 - (elapsed - breathPattern.inhale - breathPattern.hold) / breathPattern.exhale;
      }

      setBreathPhase(phase);
      setBreathValue(value);

      // Modulate drone (respects drone toggle AND background mode)
      droneOscillatorsRef.current.forEach(node => {
        const droneMultiplier = droneEnabledRef.current ? 1 : 0;
        const target = node.baseGain * (0.4 + value * 0.6) * droneMultiplier;
        node.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.5);
      });

      animationFrameRef.current = requestAnimationFrame(updateBreath);
    };
    animationFrameRef.current = requestAnimationFrame(updateBreath);

    setIsInitialized(true);
  }, []);

  // Expose initAudio to parent component via ref
  React.useImperativeHandle(ref, () => ({
    init: initAudio
  }), [initAudio]);

  // Start drone oscillators
  const startDrone = (ctx, masterGain) => {
    const baseFreq = 55; // A1
    const layers = [
      { ratio: 1, type: 'sine', gain: 0.15, detune: 0 },
      { ratio: 2, type: 'sine', gain: 0.12, detune: 3 },
      { ratio: 1.5, type: 'sine', gain: 0.08, detune: -2 },
      { ratio: 3, type: 'sine', gain: 0.05, detune: 5 },
      { ratio: 4, type: 'sine', gain: 0.03, detune: -4 },
      { ratio: 0.5, type: 'sine', gain: 0.1, detune: 0 },
      { ratio: 2.01, type: 'sine', gain: 0.04, detune: 0 },
      { ratio: 1.498, type: 'sine', gain: 0.03, detune: 0 }
    ];

    layers.forEach(layer => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      osc.type = layer.type;
      osc.frequency.value = baseFreq * layer.ratio;
      osc.detune.value = layer.detune;

      gain.gain.value = 0;
      panner.pan.value = (Math.random() - 0.5) * 0.3;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(masterGain);

      osc.start();
      gain.gain.setTargetAtTime(layer.gain, ctx.currentTime, 0.3);

      droneOscillatorsRef.current.push({ osc, gain, baseGain: layer.gain, ratio: layer.ratio });
    });
  };

  // Update drone frequencies when key changes
  useEffect(() => {
    if (!isInitialized || !ctxRef.current || droneOscillatorsRef.current.length === 0) return;

    const keyName = KEYS[currentKey];
    const keyFreq = KEY_FREQUENCIES[keyName];
    const baseFreq = keyFreq / 4; // Get low octave (like A1 = 55 from A3 = 220)

    droneOscillatorsRef.current.forEach(node => {
      const newFreq = baseFreq * node.ratio;
      node.osc.frequency.setTargetAtTime(newFreq, ctxRef.current.currentTime, 0.5);
    });
  }, [currentKey, isInitialized]);

  // Fade drone in/out when toggle changes
  useEffect(() => {
    if (!isInitialized || !ctxRef.current || droneOscillatorsRef.current.length === 0) return;

    // Drone plays when enabled - persists across mode switches
    const targetGain = droneEnabled ? 1 : 0;
    droneOscillatorsRef.current.forEach(node => {
      node.gain.gain.setTargetAtTime(node.baseGain * targetGain, ctxRef.current.currentTime, 0.3);
    });
  }, [droneEnabled, isInitialized, backgroundMode]);

  // Resume audio context when app returns from background (iOS)
  useEffect(() => {
    let needsReinit = false;

    const resumeAudio = async () => {
      // If context is closed or doesn't exist but we were initialized, we need full reinit
      if (ctxRef.current && ctxRef.current.state === 'closed') {
        needsReinit = true;
      }

      if (!ctxRef.current) return;

      const ctx = ctxRef.current;

      // iOS can suspend/interrupt audio - try to resume
      if (ctx.state !== 'running') {
        try {
          await ctx.resume();
        } catch (e) {
          // Resume failed - might need reinit on next touch
          needsReinit = true;
        }
      }
    };

    // On touch, check if we need to reinitialize audio completely
    const handleTouchReinit = () => {
      if (needsReinit || (ctxRef.current && ctxRef.current.state === 'closed')) {
        needsReinit = false;
        initAudio(true); // Force reinit
      } else {
        resumeAudio();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if context is dead
        if (ctxRef.current && ctxRef.current.state === 'closed') {
          needsReinit = true;
        }
        // Multiple attempts with delays for iOS
        resumeAudio();
        setTimeout(resumeAudio, 100);
        setTimeout(resumeAudio, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resume/reinit on any touch after returning
    document.addEventListener('touchstart', handleTouchReinit, { passive: true });
    document.addEventListener('touchend', handleTouchReinit, { passive: true });
    document.addEventListener('click', handleTouchReinit);

    // Also listen for page focus
    window.addEventListener('focus', resumeAudio);
    window.addEventListener('pageshow', resumeAudio);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleTouchReinit);
      document.removeEventListener('touchend', handleTouchReinit);
      document.removeEventListener('click', handleTouchReinit);
      window.removeEventListener('focus', resumeAudio);
      window.removeEventListener('pageshow', resumeAudio);
    };
  }, [initAudio]);

  // Floating particles animation (like stars in space)
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const particleCount = 150;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }
    particlesRef.current = particles;

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const time = Date.now() * 0.001;

      particles.forEach(p => {
        // Gentle floating motion
        p.x += p.vx + Math.sin(time * 0.5 + p.phase) * 0.1;
        p.y += p.vy + Math.cos(time * 0.3 + p.phase) * 0.1;

        // Wrap around edges
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        // Twinkle effect
        const twinkle = 0.5 + Math.sin(time * p.twinkleSpeed * 10 + p.phase) * 0.5;
        const currentOpacity = p.opacity * twinkle;

        // Draw particle as soft glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(${primaryHue}, 52%, 68%, ${currentOpacity})`);
        gradient.addColorStop(1, `hsla(${primaryHue}, 52%, 68%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [primaryHue]);

  // Start texture noise
  const startTextures = (ctx, masterGain) => {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    noiseNodeRef.current = noiseNode;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 2000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = textures[0].noise;
    noiseGainRef.current = noiseGain;

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseNode.start();

    // Foley interval - use ref to get current texture value
    foleyIntervalRef.current = setInterval(() => {
      const tex = textures[currentTextureRef.current];
      if (tex && tex.foley) {
        playFoley(ctx, masterGain, tex.foleyType);
      }
    }, 1500 + Math.random() * 2000);
  };

  // Foley sounds
  const playFoley = (ctx, masterGain, type) => {
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

  // Play instrument
  const playInstrument = useCallback((freq, velocity = 0.8) => {
    const ctx = ctxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const type = instruments[currentInstrument].type;
    const now = ctx.currentTime;

    // DEFER haptic feedback - don't block audio playback
    // Haptics can cause latency on first call, so run async
    setTimeout(() => {
      if (freq < 150) {
        Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}), 50);
      } else if (freq < 300) {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      } else {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
    }, 0);

    if (type === 'sampledPiano') {
      // Sampled piano - pitch shift from base note (C3 = 130.81Hz)
      // Limit range to ~1.5 octaves up to keep it sounding natural
      if (!pianoBufferRef.current) return;

      const baseFreq = 130.81; // C3 - middle of the sample range
      // Allow full 3-octave range (up to 8x playback rate)
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = pianoBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.8 * velocity, now, 0.01);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.1, 0.3);
      gain.gain.setTargetAtTime(0, now + 0.5, 2.0);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledGuitar') {
      // Sampled guitar - pitch shift from base note (C3 = 130.81Hz)
      // Keep notes in C3-C4 range (one octave ascending from sample pitch)
      if (!guitarBufferRef.current) return;

      const baseFreq = 130.81; // C3 (the sample's pitch)
      // Allow full 3-octave range
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = guitarBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.8 * velocity, now, 0.01);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.15, 0.4);
      gain.gain.setTargetAtTime(0, now + 0.8, 2.5);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'feltPiano') {
      // FM synthesis for warm character
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const mainGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

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
      mainGain.connect(masterGain);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + 4);
      modulator.stop(now + 4);
    } else if (type === 'musicBox') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * 2;
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.2 * velocity, now, 0.001);
      gain.gain.setTargetAtTime(0, now + 0.1, 0.6);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 2);
    } else if (type === 'sampledHarp') {
      // Sampled harp - pitch shift from base note (C3 = 130.81Hz)
      if (!harpBufferRef.current) return;

      const baseFreq = 130.81; // C3
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = harpBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(1.0 * velocity, now, 0.01);
      gain.gain.setTargetAtTime(0.7 * velocity, now + 0.1, 0.3);
      gain.gain.setTargetAtTime(0, now + 0.5, 3.0);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledCello') {
      // Sampled cello - pitch shift from base note (C3 = 130.81Hz)
      if (!celloBufferRef.current) return;

      const baseFreq = 130.81; // C3
      // Allow full 3-octave range
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = celloBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.7 * velocity, now, 0.02);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.2, 0.5);
      gain.gain.setTargetAtTime(0, now + 1.0, 3.5);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledHandpan') {
      // Multi-sampled handpan - find closest sample to minimize pitch shifting
      const samples = handpanSamplesRef.current;
      const sampleFreqs = Object.keys(samples).map(Number).filter(f => samples[f]);

      if (sampleFreqs.length === 0) return;

      // Find closest sample frequency
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

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.7 * velocity, now, 0.003);
      gain.gain.setTargetAtTime(0.5 * velocity, now + 0.15, 0.4);
      gain.gain.setTargetAtTime(0, now + 1.0, 4.0);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledVoice') {
      // Sampled voice - ethereal choir-like pad
      if (!voiceBufferRef.current) return;

      const baseFreq = 130.81; // C3
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = voiceBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.5 * velocity, now, 0.1);
      gain.gain.setTargetAtTime(0.4 * velocity, now + 0.3, 0.8);
      gain.gain.setTargetAtTime(0, now + 1.5, 3);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledRainstick') {
      // Sampled rainstick - gentle cascading texture
      if (!rainstickBufferRef.current) return;

      const baseFreq = 130.81; // C3
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = rainstickBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.6 * velocity, now, 0.05);
      gain.gain.setTargetAtTime(0.4 * velocity, now + 0.5, 1.0);
      gain.gain.setTargetAtTime(0, now + 2.0, 3);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'sampledPerc') {
      // Sampled percussion - short punchy attack
      if (!percBufferRef.current) return;

      const baseFreq = 130.81; // C3
      const playbackRate = freq / baseFreq;

      const source = ctx.createBufferSource();
      source.buffer = percBufferRef.current;
      source.playbackRate.value = playbackRate;

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.7 * velocity, now, 0.01);
      gain.gain.setTargetAtTime(0.3 * velocity, now + 0.1, 0.3);
      gain.gain.setTargetAtTime(0, now + 0.5, 1.5);

      source.connect(gain);
      gain.connect(masterGain);
      source.start(now);
    } else if (type === 'organicFlute') {
      // Flute synthesis - focus on the breathy "edge tone" character

      const duration = 1.0;

      // === MAIN TONE (triangle for hollow quality) ===
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';

      // Pitch scoop - start slightly flat, rise to pitch
      osc.frequency.setValueAtTime(freq * 0.97, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.25);

      // Gentle vibrato (delayed onset)
      const vibrato = ctx.createOscillator();
      const vibGain = ctx.createGain();
      vibrato.frequency.value = 5;
      vibGain.gain.setValueAtTime(0, now);
      vibGain.gain.setTargetAtTime(freq * 0.004, now + 0.3, 0.15);
      vibrato.connect(vibGain);
      vibGain.connect(osc.frequency);

      // Tone envelope - slow attack, gentle decay
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.05 * velocity, now + 0.35);
      oscGain.gain.setTargetAtTime(0, now + 0.5, 0.2);

      // === SECOND HARMONIC (octave) ===
      const osc2 = ctx.createOscillator();
      const osc2Gain = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;
      osc2Gain.gain.setValueAtTime(0, now);
      osc2Gain.gain.linearRampToValueAtTime(0.01 * velocity, now + 0.35);
      osc2Gain.gain.setTargetAtTime(0, now + 0.5, 0.15);

      // === BREATH/AIR NOISE ===
      const noiseLen = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Formant filter - gives the "edge tone" resonance
      const formant = ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.value = freq * 1.5;
      formant.Q.value = 2;

      // High frequency air/breath
      const airBand = ctx.createBiquadFilter();
      airBand.type = 'highpass';
      airBand.frequency.value = 2000;

      const noiseGain = ctx.createGain();
      // Soft breath attack, gradual fade
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.04 * velocity, now + 0.2);
      noiseGain.gain.setTargetAtTime(0.02 * velocity, now + 0.3, 0.12);
      noiseGain.gain.setTargetAtTime(0, now + 0.5, 0.15);

      // === OUTPUT FILTER (warm, not shrill) ===
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = Math.min(freq * 6, 4000);
      lpf.Q.value = 0.5;

      // === CONNECTIONS ===
      osc.connect(oscGain);
      osc2.connect(osc2Gain);
      oscGain.connect(lpf);
      osc2Gain.connect(lpf);

      noise.connect(formant);
      noise.connect(airBand);
      formant.connect(noiseGain);
      airBand.connect(noiseGain);
      noiseGain.connect(lpf);

      lpf.connect(masterGain);

      // === START ===
      osc.start(now);
      osc2.start(now);
      vibrato.start(now);
      noise.start(now);

      osc.stop(now + duration);
      osc2.stop(now + duration);
      vibrato.stop(now + duration);
      noise.stop(now + duration);
    }

    haptic.tap();
  }, [currentInstrument]);

  // Update texture
  const updateTexture = useCallback((newTexture) => {
    setCurrentTexture(newTexture);
    if (noiseGainRef.current && ctxRef.current) {
      noiseGainRef.current.gain.setTargetAtTime(textures[newTexture].noise, ctxRef.current.currentTime, 0.5);
    }
  }, []);

  // Show label
  const displayLabel = useCallback(() => {
    setShowLabel(true);
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 1500);
  }, []);

  // Show label when drone initializes
  useEffect(() => {
    if (isInitialized && !backgroundMode) {
      displayLabel();
    }
  }, [isInitialized, backgroundMode, displayLabel]);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    if (backgroundMode || showScaleSelector) return;
    if (!isInitialized) {
      initAudio();
    }

    touchActiveRef.current = true;

    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    lastTouchRef.current = { x: clientX, y: clientY };
  }, [backgroundMode, showScaleSelector, isInitialized, initAudio]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (backgroundMode || showScaleSelector || !isInitialized) return;
    lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [backgroundMode, showScaleSelector, isInitialized]);

  // Handle touch end - detect swipe vs tap
  const handleTouchEnd = useCallback((e) => {
    // Prevent click event from being synthesized (prevents double-play)
    e.preventDefault();

    if (backgroundMode || showScaleSelector || !ctxRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const swipeThreshold = 50;
    const isSwipe = Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold;

    if (isSwipe && deltaTime < 500) {
      // Vertical swipe up - open scale selector
      if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
        setShowScaleSelector(true);
      }
    } else {
      // Tap - play note
      handpanViewRef.current?.handleTap(touchStartRef.current.x, touchStartRef.current.y);
    }

    // Clear touch active flag after a delay (to prevent click from also firing)
    setTimeout(() => {
      touchActiveRef.current = false;
    }, 300);
  }, [backgroundMode, showScaleSelector]);

  // Handle click (for desktop - skip if touch was just handled)
  const handleClick = useCallback((e) => {
    // Skip if touch was just handled (prevents double-play on mobile)
    if (touchActiveRef.current) return;

    if (backgroundMode || showScaleSelector) return;
    if (!isInitialized) {
      initAudio();
    }
    if (!ctxRef.current) return;

    // Delegate to the handpan 3D view
    handpanViewRef.current?.handleTap(e.clientX, e.clientY);
  }, [backgroundMode, showScaleSelector, isInitialized, initAudio]);

  // Handle scroll for instrument/texture/key/scale change
  useEffect(() => {
    if (backgroundMode) return;

    const handleWheel = (e) => {
      if (!isInitialized) return;

      wheelAccumXRef.current += e.deltaX;
      wheelAccumYRef.current += e.deltaY;

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumXRef.current = 0;
        wheelAccumYRef.current = 0;
      }, 200);

      const threshold = 30;

      // Vertical swipe up when menu is closed = open settings menu
      if (!showScaleSelector && wheelAccumYRef.current > threshold && Math.abs(wheelAccumYRef.current) > Math.abs(wheelAccumXRef.current)) {
        e.preventDefault();
        setShowScaleSelector(true);
        wheelAccumXRef.current = 0;
        wheelAccumYRef.current = 0;
        return;
      }

      // Only allow texture/key/scale changes when menu is open
      if (!showScaleSelector) return;

      if (e.shiftKey) {
        // Shift held: change key (horizontal) or scale type (vertical)
        if (Math.abs(wheelAccumXRef.current) > Math.abs(wheelAccumYRef.current)) {
          if (Math.abs(wheelAccumXRef.current) > threshold) {
            e.preventDefault();
            const dir = wheelAccumXRef.current > 0 ? 1 : -1;
            setCurrentKey(prev => (prev + dir + KEYS.length) % KEYS.length);
            displayLabel();
            wheelAccumXRef.current = 0;
            wheelAccumYRef.current = 0;
          }
        } else {
          if (Math.abs(wheelAccumYRef.current) > threshold) {
            e.preventDefault();
            const dir = wheelAccumYRef.current > 0 ? 1 : -1;
            setCurrentScaleType(prev => (prev + dir + SCALE_TYPES.length) % SCALE_TYPES.length);
            displayLabel();
            wheelAccumXRef.current = 0;
            wheelAccumYRef.current = 0;
          }
        }
      } else {
        // Normal scroll: change texture (vertical only)
        if (Math.abs(wheelAccumYRef.current) > threshold) {
          e.preventDefault();
          const dir = wheelAccumYRef.current > 0 ? 1 : -1;
          const newTexture = (currentTexture + dir + textures.length) % textures.length;
          updateTexture(newTexture);
          displayLabel();
          wheelAccumXRef.current = 0;
          wheelAccumYRef.current = 0;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [backgroundMode, isInitialized, showScaleSelector, currentTexture, updateTexture, displayLabel]);

  // Cleanup - properly disconnect and stop all audio nodes
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (foleyIntervalRef.current) clearInterval(foleyIntervalRef.current);
      if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);

      // Cancel any in-flight sample fetches
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }

      // Disconnect and stop all drone oscillators
      droneOscillatorsRef.current.forEach(node => {
        try {
          if (node.osc) {
            node.osc.disconnect();
            node.osc.stop();
          }
          if (node.gain) node.gain.disconnect();
          if (node.panner) node.panner.disconnect();
        } catch {}
      });
      droneOscillatorsRef.current = [];

      // Stop and disconnect noise node
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.disconnect();
          noiseNodeRef.current.stop();
        } catch {}
      }

      // Disconnect other audio nodes
      if (masterGainRef.current) {
        try { masterGainRef.current.disconnect(); } catch {}
      }
      if (reverbNodeRef.current) {
        try { reverbNodeRef.current.disconnect(); } catch {}
      }
      if (reverbGainRef.current) {
        try { reverbGainRef.current.disconnect(); } catch {}
      }
      if (dryGainRef.current) {
        try { dryGainRef.current.disconnect(); } catch {}
      }

      // Close audio context
      if (ctxRef.current) {
        try { ctxRef.current.close(); } catch {}
      }
    };
  }, []);

  // In background mode, just keep audio alive without UI
  if (backgroundMode) {
    return null;
  }

  return (
    <main
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute',
        inset: 0,
        background: '#000',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* 3D handpan visualization */}
      <HandpanView
          ref={handpanViewRef}
          scale={scale}
          onPlayNote={(noteIndex) => {
            if (!isInitialized) initAudio();
            const freq = scale?.[noteIndex];
            if (freq) {
              // Play audio FIRST - highest priority for responsiveness
              playInstrument(freq, 0.6 + breathValue * 0.4);
              // Defer haptics and visuals to not block audio
              requestAnimationFrame(() => {
                haptic.tap();
                if (showNotes) showPlayedNote(freq, primaryHue);
              });
            }
          }}
          primaryHue={primaryHue}
          breathValue={breathValue}
        />



      {/* Note display is handled via DOM manipulation in showPlayedNote */}

      {/* Instrument indicator - tap to change */}
      {!showScaleSelector && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setCurrentInstrument(prev => (prev + 1) % instruments.length);
            displayLabel();
            haptic.tap();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setCurrentInstrument(prev => (prev + 1) % instruments.length);
            displayLabel();
            haptic.tap();
          }}
          style={{
            position: 'fixed',
            bottom: 'calc(6% + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            textAlign: 'center',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            border: `1px solid hsla(${primaryHue}, 52%, 68%, 0.3)`,
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
            letterSpacing: '0.15em',
            textTransform: 'lowercase',
            color: `hsla(${primaryHue}, 52%, 68%, 0.95)`,
            fontFamily: '"Jost", sans-serif',
            fontWeight: 300,
          }}>
            {instruments[currentInstrument].name}
          </div>
        </div>
      )}

      {/* Swipe up arrow hint - REMOVED (gesture hints overlay covers this)
      {!showScaleSelector && isInitialized && (
        <div
          onClick={(e) => { e.stopPropagation(); setShowScaleSelector(true); haptic.tap(); }}
          style={{
            position: 'absolute',
            bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'auto',
            zIndex: 200,
            cursor: 'pointer',
            padding: '1rem 2rem',
          }}>
          <span style={{
            fontSize: '0.75rem',
            color: `hsla(${primaryHue}, 52%, 68%, 0.85)`,
            marginBottom: '0.35rem',
            letterSpacing: '0.1em',
            animation: 'settingsFadeOut 3s ease-out forwards',
          }}>settings</span>
          <svg
            width="28"
            height="28"
            viewBox="0 0 20 20"
            fill="none"
            style={{
              animation: 'droneArrowBounce 2s ease-in-out infinite, droneArrowPulse 2s ease-in-out infinite',
            }}
          >
            <path
              d="M10 4L4 12H16L10 4Z"
              fill={`hsla(${primaryHue}, 52%, 68%, 0.85)`}
            />
          </svg>
        </div>
      )}
      */}

      {/* Scale selector drawer */}
      {showScaleSelector && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowScaleSelector(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 10,
              animation: 'fadeInScale 0.5s ease-out',
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
              zIndex: 11,
              animation: 'slideUpScale 0.5s ease-out',
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
                {textures.map((texture, index) => (
                  <button
                    key={texture.name}
                    onClick={() => {
                      updateTexture(index);
                      displayLabel();
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
                    }}
                  >
                    {texture.name}
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
                onClick={() => {
                  setShowNotes(prev => !prev);
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

            {/* Drone toggle */}
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
                onClick={() => {
                  setDroneEnabled(prev => !prev);
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
                    onClick={() => {
                      setCurrentKey(index);
                      displayLabel();
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
                {/* Bottom spacer for scroll */}
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
                {SCALE_TYPES.map((scaleType, index) => (
                  <button
                    key={scaleType.name}
                    onClick={() => {
                      setCurrentScaleType(index);
                      displayLabel();
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
                    {scaleType.name}
                  </button>
                ))}
                {/* Bottom spacer for scroll */}
                <div style={{ height: 'calc(8rem + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }} />
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes droneRipple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes droneTextPulse {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpScale {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes droneArrowPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes droneArrowBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes settingsFadeOut {
          0% { opacity: 0; }
          15% { opacity: 0.85; }
          50% { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes noteFade {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes noteFadeDOM {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes gestureHintsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gestureHintsFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

    </main>
  );
});

export default DroneMode;
