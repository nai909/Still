import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { haptic } from '../config/haptic';

// =============================================
// SINGING BOWL — Interactive Meditation Mode
// 3D wireframe bowl matching app aesthetic
// =============================================

export default function SingingBowlMode({ primaryHue = 220 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const bowlGroupRef = useRef(null);
  const bloomRef = useRef(null);
  const clockRef = useRef(null);
  const animationRef = useRef(null);

  // Audio refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const reverbNodeRef = useRef(null);

  // Interaction refs
  const resonanceRef = useRef(0);
  const targetResonanceRef = useRef(0);
  const rimAngleRef = useRef(0);
  const rimSpeedRef = useRef(0);
  const rimContactRef = useRef(false);
  const fingerPosRef = useRef({ x: 0, y: 0 });
  const lastHapticTimeRef = useRef(0);
  const sessionTimeRef = useRef(0);

  // Visual refs
  const primaryColorRef = useRef(new THREE.Color());
  const accentColorRef = useRef(new THREE.Color());
  const rimMeshRef = useRef(null);
  const shellMeshRef = useRef(null);
  const innerRingRef = useRef(null);
  const glowRingsRef = useRef([]);
  const particlesRef = useRef(null);

  // Harmonics
  const harmonicsRef = useRef([
    { freq: 174, ratio: 1, amplitude: 0, maxAmp: 0.30, decay: 0.997, baseBuildRate: 0.003, name: 'fundamental' },
    { freq: 174 * 2, ratio: 2, amplitude: 0, maxAmp: 0.18, decay: 0.995, baseBuildRate: 0.002, name: 'octave' },
    { freq: 174 * 3, ratio: 3, amplitude: 0, maxAmp: 0.12, decay: 0.993, baseBuildRate: 0.0012, name: 'fifth' },
    { freq: 174 * 4.16, ratio: 4.16, amplitude: 0, maxAmp: 0.07, decay: 0.991, baseBuildRate: 0.0008, name: 'high partial' },
    { freq: 174 * 5.43, ratio: 5.43, amplitude: 0, maxAmp: 0.04, decay: 0.988, baseBuildRate: 0.0005, name: 'shimmer' },
  ]);

  const [showHint, setShowHint] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const hintShownRef = useRef(false);

  // Update colors when hue changes
  useEffect(() => {
    primaryColorRef.current = new THREE.Color(`hsl(${primaryHue}, 52%, 68%)`);
    accentColorRef.current = new THREE.Color(`hsl(${primaryHue}, 52%, 82%)`);

    if (rimMeshRef.current) {
      rimMeshRef.current.material.color.copy(primaryColorRef.current);
    }
    if (shellMeshRef.current) {
      shellMeshRef.current.material.color.copy(primaryColorRef.current);
    }
    if (innerRingRef.current) {
      innerRingRef.current.material.color.copy(accentColorRef.current);
    }
    glowRingsRef.current.forEach(ring => {
      ring.material.color.copy(accentColorRef.current);
    });
  }, [primaryHue]);

  // =============================================
  // AUDIO ENGINE
  // =============================================
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    // Create convolution reverb
    const reverbTime = 4.5;
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * reverbTime;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }

    const reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = impulse;
    reverbNodeRef.current = reverbNode;

    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.3;
    reverbNode.connect(reverbGain);
    reverbGain.connect(audioCtx.destination);

    // Master gain
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
    masterGain.connect(reverbNode);
    masterGainRef.current = masterGain;

    masterGain.gain.setTargetAtTime(0.7, audioCtx.currentTime, 2.0);

    // Create oscillators for each harmonic
    const harmonics = harmonicsRef.current;
    const oscillators = [];

    harmonics.forEach((h, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = h.freq;

      const osc2 = audioCtx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = h.freq + (0.3 + Math.random() * 0.5);

      const gain = audioCtx.createGain();
      gain.gain.value = 0;

      const gain2 = audioCtx.createGain();
      gain2.gain.value = 0;

      const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
      const panner2 = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

      if (panner) {
        panner.pan.value = -0.2 - i * 0.1;
        panner2.pan.value = 0.2 + i * 0.1;
      }

      osc.connect(gain);
      osc2.connect(gain2);

      if (panner) {
        gain.connect(panner);
        gain2.connect(panner2);
        panner.connect(masterGain);
        panner2.connect(masterGain);
      } else {
        gain.connect(masterGain);
        gain2.connect(masterGain);
      }

      osc.start();
      osc2.start();

      oscillators.push({ osc, osc2, gain, gain2, harmonic: h });
    });

    oscillatorsRef.current = oscillators;
    setIsInitialized(true);
  }, []);

  const updateAudio = useCallback(() => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const harmonics = harmonicsRef.current;

    oscillatorsRef.current.forEach(({ gain, gain2 }, i) => {
      const h = harmonics[i];
      const targetVol = h.amplitude * h.maxAmp;
      gain.gain.setTargetAtTime(targetVol, now, 0.08);
      gain2.gain.setTargetAtTime(targetVol * 0.7, now, 0.08);
    });
  }, []);

  const playStrikeSound = useCallback((force) => {
    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!audioCtx || !masterGain) return;

    const now = audioCtx.currentTime;
    const strikeLen = 0.18;
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * strikeLen, audioCtx.sampleRate);
    const d = buf.getChannelData(0);

    for (let i = 0; i < d.length; i++) {
      const t = i / audioCtx.sampleRate;
      const env = Math.exp(-t * 25);
      d[i] = env * force * 0.5 * (
        Math.sin(2 * Math.PI * 174 * t) * 0.4 +
        Math.sin(2 * Math.PI * 348 * t) * 0.25 +
        Math.sin(2 * Math.PI * 522 * t) * 0.15 +
        Math.sin(2 * Math.PI * 724 * t) * 0.1 +
        (Math.random() * 2 - 1) * 0.08 * Math.exp(-t * 50)
      );
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const strikeGain = audioCtx.createGain();
    strikeGain.gain.value = 0.6;
    src.connect(strikeGain);
    strikeGain.connect(masterGain);
    src.start(now);
  }, []);

  const playRimFriction = useCallback((speed, resonance) => {
    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!audioCtx || !masterGain) return;

    const now = audioCtx.currentTime;
    const len = 0.05;
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);

    for (let i = 0; i < d.length; i++) {
      const t = i / audioCtx.sampleRate;
      const env = Math.sin(Math.PI * t / len);
      d[i] = (Math.random() * 2 - 1) * env * speed * 0.03;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500 + speed * 2000 + resonance * 2000;
    filter.Q.value = 1.5;

    const frictionGain = audioCtx.createGain();
    frictionGain.gain.value = Math.min(speed * 0.2 + resonance * 0.1, 0.15);

    src.connect(filter);
    filter.connect(frictionGain);
    frictionGain.connect(masterGain);
    src.start(now);
  }, []);

  // =============================================
  // HAPTICS
  // =============================================
  const triggerResonanceHaptic = useCallback((resonance, currentTime) => {
    const timeSinceLastHaptic = currentTime - lastHapticTimeRef.current;
    const minInterval = 0.15;
    const maxInterval = 0.8;
    const interval = maxInterval - (maxInterval - minInterval) * Math.pow(resonance, 0.7);

    if (timeSinceLastHaptic >= interval && resonance > 0.08) {
      if (resonance > 0.7) {
        haptic.medium();
      } else if (resonance > 0.4) {
        haptic.soft();
      } else {
        haptic.selection();
      }
      lastHapticTimeRef.current = currentTime;
    }
  }, []);

  // =============================================
  // THREE.JS SETUP
  // =============================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 4.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.4, 0.5, 0.2);
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomRef.current = bloomPass;

    // Clock
    clockRef.current = new THREE.Clock();

    // Colors
    const pColor = new THREE.Color(`hsl(${primaryHue}, 52%, 68%)`);
    const aColor = new THREE.Color(`hsl(${primaryHue}, 52%, 82%)`);
    primaryColorRef.current = pColor;
    accentColorRef.current = aColor;

    // Bowl group
    const bowlGroup = new THREE.Group();
    scene.add(bowlGroup);
    bowlGroupRef.current = bowlGroup;

    // Shell - bowl shape (inverted half sphere, open top)
    const shellGeom = new THREE.SphereGeometry(1.95, 72, 36, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48);
    const shellMat = new THREE.MeshBasicMaterial({ color: pColor, wireframe: true, transparent: true, opacity: 0.18 });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    shell.rotation.x = Math.PI;
    bowlGroup.add(shell);
    shellMeshRef.current = shell;

    // Rim - torus at the top opening
    const rimGeom = new THREE.TorusGeometry(1.95, 0.06, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.7 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.05;
    bowlGroup.add(rim);
    rimMeshRef.current = rim;

    // Inner decorative ring
    const innerRingGeom = new THREE.TorusGeometry(1.5, 0.03, 12, 80);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0.4 });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -0.15;
    bowlGroup.add(innerRing);
    innerRingRef.current = innerRing;

    // Glow rings (for resonance visualization)
    const glowRings = [];
    for (let i = 0; i < 3; i++) {
      const radius = 1.0 - i * 0.3;
      const ringGeom = new THREE.TorusGeometry(radius, 0.02, 8, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: aColor, transparent: true, opacity: 0 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.3 - i * 0.15;
      bowlGroup.add(ring);
      glowRings.push(ring);
    }
    glowRingsRef.current = glowRings;

    // Stars background
    const starCount = 400;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 25 + Math.random() * 35;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6 - 5;
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);
    particlesRef.current = stars;

    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const dt = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();
      sessionTimeRef.current = elapsed;

      const harmonics = harmonicsRef.current;
      const rimContact = rimContactRef.current;

      // Show hint after 3 seconds
      if (!hintShownRef.current && elapsed > 3 && resonanceRef.current < 0.05) {
        setShowHint(true);
        hintShownRef.current = true;
      }

      // Natural decay of harmonics
      harmonics.forEach(h => {
        if (!rimContact) {
          h.amplitude *= h.decay;
          if (h.amplitude < 0.001) h.amplitude = 0;
        }
      });

      // Resonance follows harmonics
      const totalAmplitude = harmonics.reduce((sum, h) => sum + h.amplitude * h.maxAmp, 0);
      const maxTotal = harmonics.reduce((sum, h) => sum + h.maxAmp, 0);
      targetResonanceRef.current = totalAmplitude / maxTotal;
      resonanceRef.current += (targetResonanceRef.current - resonanceRef.current) * dt * 2.5;

      const resonance = resonanceRef.current;

      // Update audio
      updateAudio();

      // Haptics
      triggerResonanceHaptic(resonance, elapsed);

      // Visual updates
      const breathValue = 0.5 + Math.sin(elapsed * 0.5) * 0.1;

      // Bowl breathing/pulsing
      if (bowlGroupRef.current) {
        const scale = 0.96 + breathValue * 0.08 + resonance * 0.04;
        bowlGroupRef.current.scale.setScalar(scale);
        bowlGroupRef.current.rotation.y += 0.001 + resonance * 0.003;
      }

      // Rim vibration
      if (rimMeshRef.current) {
        const vibX = Math.sin(elapsed * harmonics[0].freq * 0.02) * resonance * 0.015;
        const vibZ = Math.cos(elapsed * harmonics[0].freq * 0.02) * resonance * 0.015;
        rimMeshRef.current.position.x = vibX;
        rimMeshRef.current.position.z = vibZ;
        rimMeshRef.current.material.opacity = 0.7 + resonance * 0.3;
      }

      // Shell opacity increases with resonance
      if (shellMeshRef.current) {
        shellMeshRef.current.material.opacity = 0.18 + resonance * 0.2;
      }

      // Inner ring pulses
      if (innerRingRef.current) {
        innerRingRef.current.material.opacity = 0.4 + resonance * 0.4;
        innerRingRef.current.rotation.z = elapsed * 0.1;
      }

      // Glow rings appear with resonance
      glowRingsRef.current.forEach((ring, i) => {
        const threshold = 0.15 + i * 0.2;
        const alpha = Math.max(0, (resonance - threshold) * 2);
        ring.material.opacity = alpha * 0.5;
        ring.rotation.z = elapsed * (0.1 + i * 0.05) * (i % 2 === 0 ? 1 : -1);
        ring.scale.setScalar(1 + Math.sin(elapsed * 2 + i) * resonance * 0.1);
      });

      // Bloom intensity
      if (bloomRef.current) {
        bloomRef.current.strength = 0.35 + resonance * 0.6;
      }

      composer.render();
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);

      // Cleanup audio
      oscillatorsRef.current.forEach(({ osc, osc2 }) => {
        try { osc.stop(); } catch (e) {}
        try { osc2.stop(); } catch (e) {}
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [primaryHue, updateAudio, triggerResonanceHaptic]);

  // =============================================
  // INTERACTION HELPERS
  // =============================================
  const screenToWorld = useCallback((clientX, clientY) => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!camera || !renderer) return { x: 0, y: 0 };

    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    return { x, y };
  }, []);

  const isOnRim = useCallback((clientX, clientY) => {
    const { x, y } = screenToWorld(clientX, clientY);
    // Approximate rim detection - ellipse in screen space
    const rimRadius = 0.65;
    const dist = Math.sqrt(x * x + (y - 0.15) * (y - 0.15) * 4);
    return dist > rimRadius * 0.7 && dist < rimRadius * 1.3;
  }, [screenToWorld]);

  const isOnBowl = useCallback((clientX, clientY) => {
    const { x, y } = screenToWorld(clientX, clientY);
    const rimRadius = 0.65;
    const dist = Math.sqrt(x * x + (y - 0.15) * (y - 0.15) * 4);
    return dist < rimRadius * 0.7;
  }, [screenToWorld]);

  const getAngleFromCenter = useCallback((clientX, clientY) => {
    const { x, y } = screenToWorld(clientX, clientY);
    return Math.atan2(y - 0.15, x);
  }, [screenToWorld]);

  // =============================================
  // INTERACTION HANDLERS
  // =============================================
  const strike = useCallback((force) => {
    if (!isInitialized) initAudio();

    const harmonics = harmonicsRef.current;
    harmonics.forEach((h, i) => {
      const excitation = force * (i === 0 ? 0.7 : 0.35 / (i + 1));
      h.amplitude = Math.min(h.amplitude + excitation, 1);
    });

    targetResonanceRef.current = Math.min(targetResonanceRef.current + force * 0.35, 1);

    playStrikeSound(force);
    haptic.medium();
  }, [isInitialized, initAudio, playStrikeSound]);

  const handleStart = useCallback((clientX, clientY) => {
    if (!isInitialized) initAudio();

    fingerPosRef.current = { x: clientX, y: clientY };

    if (isOnRim(clientX, clientY)) {
      rimContactRef.current = true;
      rimAngleRef.current = getAngleFromCenter(clientX, clientY);
      setShowHint(false);
      haptic.soft();
    } else if (isOnBowl(clientX, clientY)) {
      const force = 0.7;
      strike(force);
    }
  }, [isInitialized, initAudio, isOnRim, isOnBowl, getAngleFromCenter, strike]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!rimContactRef.current) return;

    fingerPosRef.current = { x: clientX, y: clientY };

    const newAngle = getAngleFromCenter(clientX, clientY);
    let angleDelta = newAngle - rimAngleRef.current;

    if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
    if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

    rimSpeedRef.current = rimSpeedRef.current * 0.7 + Math.abs(angleDelta) * 0.3;
    rimAngleRef.current = newAngle;

    // Check if still on rim
    if (!isOnRim(clientX, clientY)) {
      rimContactRef.current = false;
      rimSpeedRef.current = 0;
      return;
    }

    const rimSpeed = rimSpeedRef.current;
    const currentResonance = resonanceRef.current;

    if (rimSpeed > 0.002) {
      const optimalSpeed = 0.035;
      const speedFactor = 1 - Math.min(Math.abs(rimSpeed - optimalSpeed) / optimalSpeed, 1);
      const resonanceMultiplier = 0.5 + currentResonance * 3.5;

      const harmonics = harmonicsRef.current;
      harmonics.forEach((h, i) => {
        const harmonicFactor = i === 0 ? 1 : i < 3 ? (0.5 + rimSpeed * 6) : (rimSpeed * 12);
        const buildRate = h.baseBuildRate * resonanceMultiplier * harmonicFactor * speedFactor;
        h.amplitude = Math.min(h.amplitude + buildRate, 1);
      });

      const buildAmount = (speedFactor * 0.004 + 0.001) * resonanceMultiplier;
      targetResonanceRef.current = Math.min(targetResonanceRef.current + buildAmount, 1);

      if (Math.random() < rimSpeed * 6 + currentResonance * 0.2) {
        playRimFriction(rimSpeed, currentResonance);
      }
    }
  }, [getAngleFromCenter, isOnRim, playRimFriction]);

  const handleEnd = useCallback(() => {
    rimContactRef.current = false;
    rimSpeedRef.current = 0;
  }, []);

  // Touch handlers
  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    const t = e.touches[0];
    handleStart(t.clientX, t.clientY);
  }, [handleStart]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  }, [handleMove]);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  const onMouseDown = useCallback((e) => {
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const onMouseMove = useCallback((e) => {
    if (e.buttons === 1) {
      handleMove(e.clientX, e.clientY);
    }
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#030306',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
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

      {/* Label */}
      <div style={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center',
        pointerEvents: 'none',
        opacity: 0.7,
        transition: 'opacity 1s ease',
      }}>
        <div style={{
          fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
          letterSpacing: '0.3em',
          textTransform: 'lowercase',
          color: `hsla(${primaryHue}, 52%, 68%, 0.9)`,
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
        }}>
          singing bowl
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: 'fixed',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        fontWeight: 300,
        fontSize: 13,
        color: `hsla(${primaryHue}, 30%, 50%, 0.6)`,
        letterSpacing: '0.22em',
        opacity: showHint ? 0.6 : 0,
        transition: 'opacity 2.5s ease',
        pointerEvents: 'none',
        textAlign: 'center',
        fontFamily: '"Jost", sans-serif',
      }}>
        trace the rim slowly
      </div>
    </div>
  );
}
