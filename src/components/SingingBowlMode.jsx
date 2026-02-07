import { useRef, useEffect, useState, useCallback } from 'react';
import { haptic } from '../config/haptic';

// =============================================
// SINGING BOWL — Interactive Meditation Mode
// Hyperrealistic hammered brass bowl with progressive resonance
// =============================================

export default function SingingBowlMode({ primaryHue = 42 }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const reverbNodeRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);

  // Physics state refs
  const resonanceRef = useRef(0);
  const targetResonanceRef = useRef(0);
  const rimAngleRef = useRef(0);
  const lastRimAngleRef = useRef(0);
  const rimSpeedRef = useRef(0);
  const rimContactRef = useRef(false);
  const fingerPosRef = useRef({ x: 0, y: 0 });
  const lastFingerPosRef = useRef({ x: 0, y: 0 });
  const sweetSpotPhaseRef = useRef(0);
  const strikeEnergyRef = useRef(0);
  const sessionTimeRef = useRef(0);
  const lastHapticTimeRef = useRef(0);
  const continuousResonanceTimeRef = useRef(0); // Track how long we've been resonating

  // Particles
  const ripplesRef = useRef([]);
  const waterRipplesRef = useRef([]);
  const shimmerParticlesRef = useRef([]);

  // Pre-generated hammered texture pattern (generated once on mount)
  const hammerMarksRef = useRef([]);

  // Harmonics — slower initial build rates, accelerate with resonance
  const harmonicsRef = useRef([
    { freq: 174,       ratio: 1,     amplitude: 0, maxAmp: 0.30, decay: 0.997, baseBuildRate: 0.003, name: 'fundamental' },
    { freq: 174 * 2,   ratio: 2,     amplitude: 0, maxAmp: 0.18, decay: 0.995, baseBuildRate: 0.002, name: 'octave' },
    { freq: 174 * 3,   ratio: 3,     amplitude: 0, maxAmp: 0.12, decay: 0.993, baseBuildRate: 0.0012, name: 'fifth' },
    { freq: 174 * 4.16, ratio: 4.16, amplitude: 0, maxAmp: 0.07, decay: 0.991, baseBuildRate: 0.0008, name: 'high partial' },
    { freq: 174 * 5.43, ratio: 5.43, amplitude: 0, maxAmp: 0.04, decay: 0.988, baseBuildRate: 0.0005, name: 'shimmer' },
  ]);

  // Dimensions
  const dimsRef = useRef({ W: 0, H: 0, cx: 0, cy: 0, bowlRadius: 0, rimWidth: 0 });

  const [showHint, setShowHint] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const hintShownRef = useRef(false);

  // Generate hammer marks for the bowl texture
  const generateHammerMarks = useCallback((bowlRadius) => {
    const marks = [];
    // Create a grid of hammer indentations on the lower bowl
    const rows = 8;
    const baseCols = 24;

    for (let row = 0; row < rows; row++) {
      const rowProgress = row / rows;
      // More marks near the middle of the bowl body
      const cols = Math.floor(baseCols * (0.6 + Math.sin(rowProgress * Math.PI) * 0.4));
      const yOffset = 0.15 + rowProgress * 0.38; // Vertical position on bowl wall

      for (let col = 0; col < cols; col++) {
        const angle = (col / cols) * Math.PI * 2 + (row % 2) * (Math.PI / cols);
        // Add some randomness
        const angleJitter = (Math.random() - 0.5) * 0.15;
        const radiusJitter = (Math.random() - 0.5) * 0.03;
        const sizeJitter = 0.7 + Math.random() * 0.6;

        marks.push({
          angle: angle + angleJitter,
          yOffset: yOffset + radiusJitter,
          size: sizeJitter,
          depth: 0.3 + Math.random() * 0.5,
        });
      }
    }

    hammerMarksRef.current = marks;
  }, []);

  // =============================================
  // RESIZE
  // =============================================
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = W / 2;
    const cy = H * 0.48;
    const bowlRadius = Math.min(W, H) * 0.32;
    const rimWidth = bowlRadius * 0.06;

    dimsRef.current = { W, H, cx, cy, bowlRadius, rimWidth };

    // Generate hammer marks if not already done or bowl size changed
    if (hammerMarksRef.current.length === 0) {
      generateHammerMarks(bowlRadius);
    }
  }, [generateHammerMarks]);

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

    // Fade in slowly
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
    // Higher frequencies as resonance builds
    filter.frequency.value = 1500 + speed * 2000 + resonance * 2000;
    filter.Q.value = 1.5;

    const frictionGain = audioCtx.createGain();
    // Louder friction as resonance builds
    frictionGain.gain.value = Math.min(speed * 0.2 + resonance * 0.1, 0.15);

    src.connect(filter);
    filter.connect(frictionGain);
    frictionGain.connect(masterGain);
    src.start(now);
  }, []);

  // =============================================
  // HAPTICS - Scale with resonance
  // =============================================
  const triggerResonanceHaptic = useCallback((resonance, currentTime) => {
    // Haptic intensity and frequency scales with resonance
    // At low resonance: very subtle, infrequent
    // At high resonance: stronger, more frequent pulses

    const timeSinceLastHaptic = currentTime - lastHapticTimeRef.current;

    // Calculate interval based on resonance (faster pulses at higher resonance)
    // At resonance 0.1: every 800ms, at resonance 1.0: every 150ms
    const minInterval = 0.15;
    const maxInterval = 0.8;
    const interval = maxInterval - (maxInterval - minInterval) * Math.pow(resonance, 0.7);

    if (timeSinceLastHaptic >= interval && resonance > 0.08) {
      // Choose haptic intensity based on resonance
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
  // GEOMETRY HELPERS
  // =============================================
  const getAngleFromCenter = useCallback((x, y) => {
    const { cx, cy } = dimsRef.current;
    return Math.atan2(y - cy, x - cx);
  }, []);

  const getDistFromCenter = useCallback((x, y) => {
    const { cx, cy } = dimsRef.current;
    return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  }, []);

  const isOnRim = useCallback((x, y) => {
    const { cx, cy, bowlRadius } = dimsRef.current;
    const nx = (x - cx) / (bowlRadius * 1.05);
    const ny = (y - cy) / (bowlRadius * 0.55);
    const ellipseDist = Math.sqrt(nx * nx + ny * ny);
    return ellipseDist > 0.75 && ellipseDist < 1.25;
  }, []);

  const isOnBowl = useCallback((x, y) => {
    const { cx, cy, bowlRadius } = dimsRef.current;
    const nx = (x - cx) / (bowlRadius * 1.05);
    const ny = (y - cy) / (bowlRadius * 0.55);
    const ellipseDist = Math.sqrt(nx * nx + ny * ny);
    return ellipseDist <= 0.75;
  }, []);

  // =============================================
  // PARTICLES
  // =============================================
  const spawnRipple = useCallback((x, y, force) => {
    const { cx, cy, bowlRadius } = dimsRef.current;
    ripplesRef.current.push({
      x: cx, y: cy,
      radius: bowlRadius * 0.3,
      maxRadius: bowlRadius * 1.2,
      life: 1,
      decay: 0.008,
      width: 1 + force * 2,
    });
  }, []);

  const spawnWaterRipple = useCallback((force) => {
    const { cx, cy, bowlRadius } = dimsRef.current;
    const count = 2 + Math.floor(force * 3);
    for (let i = 0; i < count; i++) {
      waterRipplesRef.current.push({
        cx: cx + (Math.random() - 0.5) * bowlRadius * 0.4,
        cy: cy + (Math.random() - 0.5) * bowlRadius * 0.15,
        radius: 2 + Math.random() * 10,
        maxRadius: 30 + Math.random() * bowlRadius * 0.5,
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
        delay: i * 0.08,
      });
    }
  }, []);

  const spawnShimmer = useCallback((x, y) => {
    shimmerParticlesRef.current.push({
      x, y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -0.5 - Math.random() * 2,
      life: 1,
      decay: 0.01 + Math.random() * 0.015,
      size: 1 + Math.random() * 2.5,
      hue: 30 + Math.random() * 20,
    });
  }, []);

  // =============================================
  // INTERACTION
  // =============================================
  const strike = useCallback((force, x, y) => {
    if (!isInitialized) initAudio();

    strikeEnergyRef.current = force;
    const harmonics = harmonicsRef.current;

    harmonics.forEach((h, i) => {
      const excitation = force * (i === 0 ? 0.7 : 0.35 / (i + 1));
      h.amplitude = Math.min(h.amplitude + excitation, 1);
    });

    targetResonanceRef.current = Math.min(targetResonanceRef.current + force * 0.35, 1);

    playStrikeSound(force);
    haptic.medium();

    spawnRipple(x, y, force);
    spawnWaterRipple(force);

    const { cx, cy, bowlRadius } = dimsRef.current;
    for (let i = 0; i < 8 + force * 12; i++) {
      spawnShimmer(
        cx + (Math.random() - 0.5) * bowlRadius * 1.5,
        cy + (Math.random() - 0.5) * bowlRadius * 0.6
      );
    }
  }, [isInitialized, initAudio, playStrikeSound, spawnRipple, spawnWaterRipple, spawnShimmer]);

  const handleStart = useCallback((x, y) => {
    if (!isInitialized) initAudio();

    fingerPosRef.current = { x, y };
    lastFingerPosRef.current = { x, y };

    if (isOnRim(x, y)) {
      rimContactRef.current = true;
      rimAngleRef.current = getAngleFromCenter(x, y);
      lastRimAngleRef.current = rimAngleRef.current;
      setShowHint(false);
      haptic.soft();
    } else if (isOnBowl(x, y)) {
      const { bowlRadius } = dimsRef.current;
      const dist = getDistFromCenter(x, y);
      const force = 0.5 + (1 - dist / bowlRadius) * 0.5;
      strike(force, x, y);
    }
  }, [isInitialized, initAudio, isOnRim, isOnBowl, getAngleFromCenter, getDistFromCenter, strike]);

  const handleMove = useCallback((x, y) => {
    if (!rimContactRef.current) return;

    lastFingerPosRef.current = { ...fingerPosRef.current };
    fingerPosRef.current = { x, y };

    const newAngle = getAngleFromCenter(x, y);
    let angleDelta = newAngle - rimAngleRef.current;

    if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
    if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

    rimSpeedRef.current = rimSpeedRef.current * 0.7 + Math.abs(angleDelta) * 0.3;
    lastRimAngleRef.current = rimAngleRef.current;
    rimAngleRef.current = newAngle;

    const { cx, cy, bowlRadius } = dimsRef.current;
    const nx = (x - cx) / (bowlRadius * 1.05);
    const ny = (y - cy) / (bowlRadius * 0.55);
    const ellipseDist = Math.sqrt(nx * nx + ny * ny);

    if (ellipseDist < 0.5 || ellipseDist > 1.6) {
      rimContactRef.current = false;
      rimSpeedRef.current = 0;
      return;
    }

    const rimSpeed = rimSpeedRef.current;
    const currentResonance = resonanceRef.current;

    if (rimSpeed > 0.002) {
      const optimalSpeed = 0.035;
      const speedFactor = 1 - Math.min(Math.abs(rimSpeed - optimalSpeed) / optimalSpeed, 1);

      // Build rate accelerates with current resonance (slow start, faster as it builds)
      // At resonance 0: use base rate * 0.5
      // At resonance 1: use base rate * 4
      const resonanceMultiplier = 0.5 + currentResonance * 3.5;

      const harmonics = harmonicsRef.current;
      harmonics.forEach((h, i) => {
        const harmonicFactor = i === 0 ? 1 : i < 3 ? (0.5 + rimSpeed * 6) : (rimSpeed * 12);
        const buildRate = h.baseBuildRate * resonanceMultiplier * harmonicFactor * speedFactor;
        h.amplitude = Math.min(h.amplitude + buildRate, 1);
      });

      const buildAmount = (speedFactor * 0.004 + 0.001) * resonanceMultiplier;
      targetResonanceRef.current = Math.min(targetResonanceRef.current + buildAmount, 1);

      // Friction sounds scale with resonance
      if (Math.random() < rimSpeed * 6 + currentResonance * 0.2) {
        playRimFriction(rimSpeed, currentResonance);
      }

      // Particles
      if (Math.random() < rimSpeed * 4 + currentResonance * 0.3) {
        spawnShimmer(x, y);
      }
    }
  }, [getAngleFromCenter, playRimFriction, spawnShimmer]);

  const handleEnd = useCallback(() => {
    rimContactRef.current = false;
    rimSpeedRef.current = 0;
  }, []);

  // =============================================
  // DRAWING - Hyperrealistic Bowl
  // =============================================
  const drawBowl = useCallback((ctx, dt) => {
    const { W, H, cx, cy, bowlRadius, rimWidth } = dimsRef.current;
    const resonance = resonanceRef.current;
    const sessionTime = sessionTimeRef.current;
    const harmonics = harmonicsRef.current;
    const vibration = resonance * 1.5;

    // === CUSHION/BASE ===
    ctx.save();
    // Cushion shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + bowlRadius * 0.62, bowlRadius * 0.85, bowlRadius * 0.18, 0, 0, Math.PI * 2);
    const cushionShadow = ctx.createRadialGradient(cx, cy + bowlRadius * 0.62, 0, cx, cy + bowlRadius * 0.62, bowlRadius * 0.85);
    cushionShadow.addColorStop(0, 'rgba(0,0,0,0.4)');
    cushionShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cushionShadow;
    ctx.fill();

    // Cushion body - dark red/maroon fabric
    ctx.beginPath();
    ctx.ellipse(cx, cy + bowlRadius * 0.58, bowlRadius * 0.72, bowlRadius * 0.14, 0, 0, Math.PI * 2);
    const cushionGrad = ctx.createRadialGradient(cx - bowlRadius * 0.2, cy + bowlRadius * 0.52, 0, cx, cy + bowlRadius * 0.58, bowlRadius * 0.72);
    cushionGrad.addColorStop(0, 'rgb(85, 25, 30)');
    cushionGrad.addColorStop(0.5, 'rgb(65, 18, 22)');
    cushionGrad.addColorStop(1, 'rgb(45, 12, 15)');
    ctx.fillStyle = cushionGrad;
    ctx.fill();

    // Cushion highlight edge
    ctx.beginPath();
    ctx.ellipse(cx, cy + bowlRadius * 0.55, bowlRadius * 0.68, bowlRadius * 0.11, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.strokeStyle = 'rgba(120, 45, 50, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // === BOWL SHADOW ===
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + bowlRadius * 0.38, bowlRadius * 1.06, bowlRadius * 0.32, 0, 0, Math.PI * 2);
    const shadowGrad = ctx.createRadialGradient(cx, cy + bowlRadius * 0.38, 0, cx, cy + bowlRadius * 0.38, bowlRadius * 1.06);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
    shadowGrad.addColorStop(0.6, 'rgba(0,0,0,0.2)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();

    // === OUTER BOWL WALL WITH HAMMERED TEXTURE ===
    ctx.save();

    // Base bowl wall shape
    ctx.beginPath();
    ctx.ellipse(cx, cy, bowlRadius * 1.02, bowlRadius * 0.51, 0, 0, Math.PI);
    ctx.lineTo(cx - bowlRadius * 0.68, cy + bowlRadius * 0.52);
    ctx.ellipse(cx, cy + bowlRadius * 0.52, bowlRadius * 0.68, bowlRadius * 0.18, 0, Math.PI, 0, true);
    ctx.closePath();

    // Bronze/brass gradient
    const wallGrad = ctx.createLinearGradient(cx - bowlRadius, cy, cx + bowlRadius, cy + bowlRadius * 0.5);
    const brassBase = 140 + resonance * 30;
    const brassHighlight = 180 + resonance * 40;
    const brassShadow = 80 + resonance * 20;
    wallGrad.addColorStop(0, `rgb(${brassShadow}, ${brassShadow * 0.7}, ${brassShadow * 0.35})`);
    wallGrad.addColorStop(0.2, `rgb(${brassBase}, ${brassBase * 0.78}, ${brassBase * 0.4})`);
    wallGrad.addColorStop(0.4, `rgb(${brassHighlight}, ${brassHighlight * 0.82}, ${brassHighlight * 0.45})`);
    wallGrad.addColorStop(0.6, `rgb(${brassBase * 0.9}, ${brassBase * 0.72}, ${brassBase * 0.38})`);
    wallGrad.addColorStop(0.8, `rgb(${brassShadow * 1.1}, ${brassShadow * 0.75}, ${brassShadow * 0.4})`);
    wallGrad.addColorStop(1, `rgb(${brassShadow * 0.8}, ${brassShadow * 0.55}, ${brassShadow * 0.3})`);
    ctx.fillStyle = wallGrad;
    ctx.fill();

    // Clip to bowl shape for hammer marks
    ctx.clip();

    // Draw hammered indentations
    const marks = hammerMarksRef.current;
    marks.forEach(mark => {
      // Only draw marks on visible part (bottom half)
      if (mark.angle > 0 && mark.angle < Math.PI) {
        const wallX = cx + Math.cos(mark.angle) * bowlRadius * 0.85;
        const wallY = cy + mark.yOffset * bowlRadius + Math.sin(mark.angle) * bowlRadius * 0.1;

        // Elliptical hammer mark (perspective)
        const markWidth = bowlRadius * 0.04 * mark.size;
        const markHeight = markWidth * 0.5;

        // Shadow (indent)
        ctx.beginPath();
        ctx.ellipse(wallX, wallY + 1, markWidth, markHeight, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(40, 28, 15, ${mark.depth * 0.4})`;
        ctx.fill();

        // Highlight (rim of indent catching light)
        ctx.beginPath();
        ctx.ellipse(wallX - 1, wallY - 1, markWidth * 0.9, markHeight * 0.9, 0, Math.PI * 1.2, Math.PI * 2.2);
        ctx.strokeStyle = `rgba(220, 190, 120, ${mark.depth * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });

    ctx.restore();

    // === DECORATIVE ETCHED RINGS (near rim) ===
    ctx.save();
    const ringOffsets = [0.88, 0.91, 0.94];
    ringOffsets.forEach((offset, i) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy + bowlRadius * (0.02 + i * 0.015), bowlRadius * offset, bowlRadius * offset * 0.5, 0, 0, Math.PI);
      ctx.strokeStyle = i === 1
        ? `rgba(90, 65, 35, ${0.5 + resonance * 0.2})`
        : `rgba(180, 150, 90, ${0.3 + resonance * 0.15})`;
      ctx.lineWidth = i === 1 ? 2 : 1;
      ctx.stroke();
    });
    ctx.restore();

    // === INNER BOWL ===
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, bowlRadius * 0.86, bowlRadius * 0.43, 0, 0, Math.PI * 2);
    const innerGrad = ctx.createRadialGradient(cx, cy - bowlRadius * 0.15, 0, cx, cy, bowlRadius * 0.86);
    // Darker interior with brass tint
    innerGrad.addColorStop(0, `rgba(${50 + resonance * 30}, ${40 + resonance * 20}, ${25 + resonance * 10}, 1)`);
    innerGrad.addColorStop(0.4, `rgba(${30 + resonance * 15}, ${25 + resonance * 10}, ${15 + resonance * 5}, 1)`);
    innerGrad.addColorStop(0.8, `rgba(${45 + resonance * 20}, ${38 + resonance * 15}, ${22 + resonance * 8}, 1)`);
    innerGrad.addColorStop(1, `rgba(${70 + resonance * 25}, ${58 + resonance * 18}, ${35 + resonance * 10}, 1)`);
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.restore();

    // === WATER SURFACE ===
    if (resonance > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, bowlRadius * 0.80, bowlRadius * 0.37, 0, 0, Math.PI * 2);
      ctx.clip();

      // Water ripple rings
      const waterRipples = waterRipplesRef.current;
      for (let i = waterRipples.length - 1; i >= 0; i--) {
        const r = waterRipples[i];
        r.radius += dt * 40;
        r.life -= r.decay;
        if (r.life <= 0) {
          waterRipples.splice(i, 1);
          continue;
        }
        const alpha = r.life * 0.12 * resonance;
        ctx.beginPath();
        ctx.ellipse(r.cx, r.cy, r.radius, r.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 175, 130, ${alpha})`;
        ctx.lineWidth = 0.5 + r.life;
        ctx.stroke();
      }

      // Standing wave pattern
      if (resonance > 0.12) {
        const waveCount = 5;
        const waveAmp = resonance * 2.5;
        const sweetSpotPhase = sweetSpotPhaseRef.current;

        for (let w = 0; w < waveCount; w++) {
          const phase = sweetSpotPhase + (w / waveCount) * Math.PI * 2;
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += 0.05) {
            const wobble = Math.sin(a * 4 + phase) * waveAmp;
            const rx = (bowlRadius * 0.55 + wobble) * Math.cos(a);
            const ry = (bowlRadius * 0.26 + wobble * 0.4) * Math.sin(a);
            if (a === 0) ctx.moveTo(cx + rx, cy + ry);
            else ctx.lineTo(cx + rx, cy + ry);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(180, 160, 120, ${resonance * 0.05})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // === RIM ===
    ctx.save();
    const rimVibX = Math.sin(sessionTime * harmonics[0].freq * 0.02) * vibration * 0.25;
    const rimVibY = Math.cos(sessionTime * harmonics[0].freq * 0.02) * vibration * 0.12;

    // Rim base
    ctx.beginPath();
    ctx.ellipse(cx + rimVibX, cy + rimVibY, bowlRadius, bowlRadius * 0.5, 0, 0, Math.PI * 2);
    ctx.lineWidth = rimWidth;

    // Polished brass rim gradient
    const rimGrad = ctx.createLinearGradient(cx - bowlRadius, cy - rimWidth, cx + bowlRadius, cy + rimWidth);
    const rimBase = 160 + resonance * 50;
    const rimHighlight = 220 + resonance * 35;
    const rimShadow = 100 + resonance * 30;
    rimGrad.addColorStop(0, `rgb(${rimShadow}, ${rimShadow * 0.72}, ${rimShadow * 0.38})`);
    rimGrad.addColorStop(0.25, `rgb(${rimHighlight}, ${rimHighlight * 0.85}, ${rimHighlight * 0.5})`);
    rimGrad.addColorStop(0.5, `rgb(${rimBase}, ${rimBase * 0.8}, ${rimBase * 0.45})`);
    rimGrad.addColorStop(0.75, `rgb(${rimHighlight * 0.95}, ${rimHighlight * 0.82}, ${rimHighlight * 0.48})`);
    rimGrad.addColorStop(1, `rgb(${rimShadow * 1.1}, ${rimShadow * 0.75}, ${rimShadow * 0.4})`);
    ctx.strokeStyle = rimGrad;
    ctx.stroke();

    // Inner rim edge (dark line)
    ctx.beginPath();
    ctx.ellipse(cx + rimVibX, cy + rimVibY, bowlRadius * 0.94, bowlRadius * 0.47, 0, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `rgba(60, 45, 25, ${0.5 + resonance * 0.2})`;
    ctx.stroke();

    // Outer rim highlight
    ctx.beginPath();
    ctx.ellipse(cx + rimVibX, cy + rimVibY - 1, bowlRadius * 1.01, bowlRadius * 0.505, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255, 240, 180, ${0.2 + resonance * 0.15})`;
    ctx.stroke();

    ctx.restore();

    // === RESONANCE GLOW ===
    if (resonance > 0.08) {
      ctx.save();
      // Soft glow around rim
      ctx.beginPath();
      ctx.ellipse(cx, cy, bowlRadius, bowlRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.lineWidth = rimWidth + resonance * 12;
      const glowAlpha = resonance * 0.12;
      ctx.strokeStyle = `rgba(255, 220, 140, ${glowAlpha})`;
      ctx.stroke();

      // Bright inner glow
      ctx.beginPath();
      ctx.ellipse(cx, cy, bowlRadius * 0.98, bowlRadius * 0.49, 0, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(255, 245, 200, ${glowAlpha * 0.6})`;
      ctx.stroke();
      ctx.restore();
    }

    // === HARMONIC RINGS (inside bowl) ===
    if (resonance > 0.06) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, bowlRadius * 0.84, bowlRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.clip();

      harmonics.forEach((h, i) => {
        if (h.amplitude < 0.01) return;
        const ringRadius = bowlRadius * (0.12 + i * 0.13);
        const ringAlpha = h.amplitude * 0.18;
        const wobble = Math.sin(sessionTime * (1 + i * 0.7)) * h.amplitude * 2.5;

        ctx.beginPath();
        ctx.ellipse(cx + wobble, cy + wobble * 0.4, ringRadius, ringRadius * 0.48, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${200 + i * 10}, ${170 + i * 8}, ${110 - i * 8}, ${ringAlpha})`;
        ctx.lineWidth = 0.5 + h.amplitude * 1.2;
        ctx.stroke();
      });

      ctx.restore();
    }
  }, []);

  const drawParticles = useCallback((ctx, dt) => {
    const { cx, cy, bowlRadius } = dimsRef.current;
    const resonance = resonanceRef.current;
    const shimmerParticles = shimmerParticlesRef.current;
    const ripples = ripplesRef.current;

    // Shimmer particles
    for (let i = shimmerParticles.length - 1; i >= 0; i--) {
      const p = shimmerParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.01;
      p.life -= p.decay;

      if (p.life <= 0) {
        shimmerParticles.splice(i, 1);
        continue;
      }

      const alpha = p.life * p.life * 0.7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 55%, ${60 + p.life * 20}%, ${alpha})`;
      ctx.fill();

      if (alpha > 0.25) {
        const sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        sg.addColorStop(0, `hsla(${p.hue}, 55%, 65%, ${alpha * 0.18})`);
        sg.addColorStop(1, `hsla(${p.hue}, 55%, 45%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }
    }

    // Ambient floating particles when resonating
    if (resonance > 0.25 && Math.random() < resonance * 0.15) {
      const angle = Math.random() * Math.PI * 2;
      const dist = bowlRadius * (0.35 + Math.random() * 0.5);
      spawnShimmer(
        cx + Math.cos(angle) * dist,
        cy + Math.sin(angle) * dist * 0.5
      );
    }

    // Ripple rings
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += dt * 100;
      r.life -= r.decay;
      if (r.life <= 0) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(220, 195, 130, ${r.life * 0.25})`;
      ctx.lineWidth = r.width * r.life;
      ctx.stroke();
    }
  }, [spawnShimmer]);

  const drawFingerGlow = useCallback((ctx) => {
    if (!rimContactRef.current) return;

    const { x: gx, y: gy } = fingerPosRef.current;
    const resonance = resonanceRef.current;
    const intensity = 0.25 + rimSpeedRef.current * 6 + resonance * 0.3;

    const fg = ctx.createRadialGradient(gx, gy, 0, gx, gy, 20 + intensity * 15);
    fg.addColorStop(0, `rgba(255, 225, 150, ${Math.min(intensity, 0.55)})`);
    fg.addColorStop(0.5, `rgba(220, 180, 100, ${Math.min(intensity * 0.25, 0.18)})`);
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(gx, gy, 20 + intensity * 15, 0, Math.PI * 2);
    ctx.fillStyle = fg;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(gx, gy, 2 + intensity * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 245, 210, ${Math.min(intensity * 0.7, 0.6)})`;
    ctx.fill();
  }, []);

  // =============================================
  // MAIN LOOP
  // =============================================
  const update = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { W, H } = dimsRef.current;

    if (!lastFrameRef.current) lastFrameRef.current = ts;
    const dt = Math.min((ts - lastFrameRef.current) / 1000, 0.05);
    lastFrameRef.current = ts;

    sessionTimeRef.current += dt;
    const sessionTime = sessionTimeRef.current;
    const harmonics = harmonicsRef.current;
    const rimContact = rimContactRef.current;

    // Show hint after 3 seconds of no interaction
    if (!hintShownRef.current && sessionTime > 3 && resonanceRef.current < 0.05) {
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

    // Strike energy decays
    strikeEnergyRef.current *= 0.95;

    // Sweet spot rotates slowly
    sweetSpotPhaseRef.current += dt * 0.4;

    // Update audio
    updateAudio();

    // Haptic feedback scales with resonance
    const resonance = resonanceRef.current;
    triggerResonanceHaptic(resonance, sessionTime);

    // Draw
    ctx.clearRect(0, 0, W, H);

    // Background
    const bgWarmth = resonance * 0.025;
    ctx.fillStyle = `rgb(${Math.round(5 + bgWarmth * 35)}, ${Math.round(5 + bgWarmth * 18)}, ${Math.round(5 + bgWarmth * 8)})`;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow behind bowl
    if (resonance > 0.04) {
      const { cx, cy, bowlRadius } = dimsRef.current;
      const glowR = bowlRadius * (1.4 + resonance * 0.5);
      const glow = ctx.createRadialGradient(cx, cy, bowlRadius * 0.2, cx, cy, glowR);
      const a = resonance * 0.1;
      glow.addColorStop(0, `rgba(200, 165, 100, ${a})`);
      glow.addColorStop(0.5, `rgba(140, 100, 50, ${a * 0.25})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
    }

    drawBowl(ctx, dt);
    drawParticles(ctx, dt);
    drawFingerGlow(ctx);

    animationRef.current = requestAnimationFrame(update);
  }, [updateAudio, drawBowl, drawParticles, drawFingerGlow, triggerResonanceHaptic]);

  // =============================================
  // LIFECYCLE
  // =============================================
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Cleanup audio
      oscillatorsRef.current.forEach(({ osc, osc2 }) => {
        try { osc.stop(); } catch (e) {}
        try { osc2.stop(); } catch (e) {}
      });

      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [resize, update]);

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

  const onMouseLeave = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#050505',
      touchAction: 'none',
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
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />

      {/* Vignette */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 5,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(5,5,5,0.5) 55%, rgba(5,5,5,0.97) 85%)',
      }} />

      {/* Hint */}
      <div style={{
        position: 'fixed',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        fontWeight: 300,
        fontSize: 13,
        color: '#5a5040',
        letterSpacing: '0.22em',
        opacity: showHint ? 0.45 : 0,
        transition: 'opacity 2.5s ease',
        pointerEvents: 'none',
        textAlign: 'center',
        fontFamily: "'Cormorant Garamond', serif",
      }}>
        trace the rim slowly
      </div>
    </div>
  );
}
