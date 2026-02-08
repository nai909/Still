import { useRef, useEffect, useState, useCallback } from 'react';
import { haptic } from '../config/haptic';

// =============================================
// RAIN STICK — Accelerometer-Driven Meditation
// Tilt device to hear seeds cascade through pegs
// =============================================

export default function RainStickMode({ primaryHue = 120 }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const rainstickBufferRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);
  const sessionTimeRef = useRef(0);

  // Dimensions
  const dimsRef = useRef({ W: 0, H: 0 });
  const tubeRef = useRef({ top: 0, bottom: 0, left: 0, right: 0, centerX: 0 });

  // Tilt state
  const tiltRef = useRef({ x: 0, y: 0 });
  const hasGyroRef = useRef(false);

  // Physics objects
  const seedsRef = useRef([]);
  const pegsRef = useRef([]);
  const dustRef = useRef([]);

  // Audio timing
  const lastImpactRef = useRef(0);

  const [showHint, setShowHint] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const hintShownRef = useRef(false);

  const SEED_COUNT = 120;
  const PEG_ROWS = 18;
  const PEGS_PER_ROW = 4;

  // =============================================
  // RESIZE & SETUP
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

    dimsRef.current = { W, H };

    // Tube dimensions
    const tubeW = W * 0.14;
    const centerX = W / 2;
    const tubeTop = H * 0.08;
    const tubeBottom = H * 0.92;

    tubeRef.current = {
      top: tubeTop,
      bottom: tubeBottom,
      left: centerX - tubeW,
      right: centerX + tubeW,
      centerX,
      width: tubeW * 2,
      height: tubeBottom - tubeTop,
    };

    initPegs();
    if (seedsRef.current.length === 0) initSeeds();
  }, []);

  const initPegs = useCallback(() => {
    const tube = tubeRef.current;
    const pegs = [];

    for (let row = 0; row < PEG_ROWS; row++) {
      const rowY = tube.top + ((row + 1) / (PEG_ROWS + 1)) * tube.height;
      const offset = row % 2 === 0 ? 0 : 0.5;
      const count = PEGS_PER_ROW - (row % 2 === 0 ? 0 : 1);

      for (let col = 0; col < count; col++) {
        const colT = (col + 0.5 + offset) / PEGS_PER_ROW;
        const pegX = tube.left + tube.width * 0.1 + colT * tube.width * 0.8;
        pegs.push({
          x: pegX,
          y: rowY,
          radius: 2.5,
          lastHit: 0,
        });
      }
    }

    pegsRef.current = pegs;
  }, []);

  const initSeeds = useCallback(() => {
    const tube = tubeRef.current;
    const seeds = [];

    for (let i = 0; i < SEED_COUNT; i++) {
      const x = tube.left + tube.width * 0.15 + Math.random() * tube.width * 0.7;
      const y = tube.bottom - 10 - Math.random() * tube.height * 0.15;

      seeds.push({
        x, y,
        vx: 0,
        vy: 0,
        radius: 1.2 + Math.random() * 1.8,
        mass: 0.5 + Math.random() * 0.5,
        hue: primaryHue - 20 + Math.random() * 40,
        sat: 25 + Math.random() * 25,
        lightness: 35 + Math.random() * 20,
        lastBounce: 0,
        trail: [],
      });
    }

    seedsRef.current = seeds;
  }, [primaryHue]);

  // =============================================
  // AUDIO ENGINE
  // =============================================
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;

    // Load rainstick sample
    fetch('samples/rainstick-c3.m4a')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => { rainstickBufferRef.current = audioBuffer; })
      .catch(() => {});

    // Reverb - tube acoustics
    const reverbTime = 3;
    const sr = audioCtx.sampleRate;
    const len = sr * reverbTime;
    const impulse = audioCtx.createBuffer(2, len, sr);

    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const env = Math.pow(1 - i / len, 1.8);
        d[i] = (Math.random() * 2 - 1) * env * 0.4;
        if (i < sr * 0.05) {
          const earlyEnv = 1 - i / (sr * 0.05);
          d[i] += Math.sin(i / sr * Math.PI * 600) * earlyEnv * 0.05;
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
    masterGain.gain.setTargetAtTime(0.7, audioCtx.currentTime, 1.5);

    setIsInitialized(true);
  }, []);

  const playSeedImpact = useCallback((seed, velocity, pegY) => {
    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!audioCtx || !masterGain) return;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    if (now - lastImpactRef.current < 0.008) return;
    lastImpactRef.current = now;

    const tube = tubeRef.current;
    const positionInTube = (pegY - tube.top) / tube.height;
    const basePitch = 2000 + (1 - positionInTube) * 5000;
    const pitch = basePitch + Math.random() * 800;

    const duration = 0.015 + Math.random() * 0.02;
    const buf = audioCtx.createBuffer(1, Math.round(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const d = buf.getChannelData(0);

    for (let i = 0; i < d.length; i++) {
      const t = i / audioCtx.sampleRate;
      const env = Math.exp(-t * (40 + Math.random() * 30));
      d[i] = env * velocity * (
        (Math.random() * 2 - 1) * 0.25 +
        Math.sin(2 * Math.PI * pitch * t) * 0.4 +
        Math.sin(2 * Math.PI * pitch * 1.5 * t) * 0.15
      );
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = pitch;
    filter.Q.value = 1.5 + Math.random() * 2;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.1 + velocity * 0.12;

    let output = gain;
    if (audioCtx.createStereoPanner) {
      const pan = audioCtx.createStereoPanner();
      const panVal = (seed.x - tube.centerX) / tube.width * 2;
      pan.pan.value = Math.max(-1, Math.min(1, panVal));
      gain.connect(pan);
      output = pan;
    }

    src.connect(filter);
    filter.connect(gain);
    output.connect(masterGain);
    src.start(now);
  }, []);

  const playWallBounce = useCallback((velocity) => {
    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!audioCtx || !masterGain) return;

    const now = audioCtx.currentTime;
    if (now - lastImpactRef.current < 0.005) return;
    lastImpactRef.current = now;

    const duration = 0.025;
    const buf = audioCtx.createBuffer(1, Math.round(audioCtx.sampleRate * duration), audioCtx.sampleRate);
    const d = buf.getChannelData(0);

    for (let i = 0; i < d.length; i++) {
      const t = i / audioCtx.sampleRate;
      const env = Math.exp(-t * 50);
      d[i] = env * velocity * 0.4 * (
        Math.sin(2 * Math.PI * 300 * t) * 0.3 +
        (Math.random() * 2 - 1) * 0.5
      );
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buf;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.05 + velocity * 0.06;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start(now);
  }, []);

  // =============================================
  // DEVICE ORIENTATION
  // =============================================
  const handleOrientation = useCallback((e) => {
    hasGyroRef.current = true;
    const beta = e.beta || 0;
    const gamma = e.gamma || 0;

    // Normalize: centered around natural hold angle
    tiltRef.current.y = Math.max(-1, Math.min(1, (beta - 30) / 50));
    tiltRef.current.x = Math.max(-1, Math.min(1, gamma / 40));
  }, []);

  const initOrientation = useCallback(() => {
    // iOS 13+ requires permission request (must be triggered by user gesture)
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            hasGyroRef.current = true;
          }
        })
        .catch(() => {});
    } else if ('DeviceOrientationEvent' in window) {
      // Android and older iOS - just add listener
      window.addEventListener('deviceorientation', handleOrientation);
      hasGyroRef.current = true;
    }
  }, [handleOrientation]);

  // Try to initialize orientation on mount for Android/older browsers
  useEffect(() => {
    // For non-iOS devices, we can add the listener immediately
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  // =============================================
  // PHYSICS
  // =============================================
  const updatePhysics = useCallback((dt) => {
    const tube = tubeRef.current;
    const seeds = seedsRef.current;
    const pegs = pegsRef.current;
    const tilt = tiltRef.current;

    const gStrength = 800;
    const gx = tilt.x * gStrength * 0.3;
    const gy = tilt.y * gStrength + gStrength * 0.15;

    const damping = 0.988;
    const friction = 0.92;
    const bounciness = 0.22;

    seeds.forEach(seed => {
      seed.vx += gx * dt * seed.mass;
      seed.vy += gy * dt * seed.mass;
      seed.vx *= damping;
      seed.vy *= damping;
      seed.x += seed.vx * dt;
      seed.y += seed.vy * dt;

      const speed = Math.sqrt(seed.vx * seed.vx + seed.vy * seed.vy);

      // Trail
      if (speed > 25) {
        seed.trail.push({ x: seed.x, y: seed.y, life: 1 });
        if (seed.trail.length > 5) seed.trail.shift();
      }
      seed.trail.forEach(t => t.life -= dt * 5);
      seed.trail = seed.trail.filter(t => t.life > 0);

      // Wall collisions
      if (seed.x - seed.radius < tube.left) {
        seed.x = tube.left + seed.radius;
        const impactV = Math.abs(seed.vx);
        seed.vx = -seed.vx * bounciness;
        seed.vy *= friction;
        if (impactV > 12) {
          playWallBounce(Math.min(impactV / 180, 1));
          if (impactV > 30) haptic.selection();
        }
      }
      if (seed.x + seed.radius > tube.right) {
        seed.x = tube.right - seed.radius;
        const impactV = Math.abs(seed.vx);
        seed.vx = -seed.vx * bounciness;
        seed.vy *= friction;
        if (impactV > 12) {
          playWallBounce(Math.min(impactV / 180, 1));
          if (impactV > 30) haptic.selection();
        }
      }

      // Top/bottom caps
      if (seed.y - seed.radius < tube.top) {
        seed.y = tube.top + seed.radius;
        const impactV = Math.abs(seed.vy);
        seed.vy = -seed.vy * bounciness;
        seed.vx += (Math.random() - 0.5) * 15;
        if (impactV > 15) {
          playWallBounce(Math.min(impactV / 150, 1));
          haptic.soft();
        }
      }
      if (seed.y + seed.radius > tube.bottom) {
        seed.y = tube.bottom - seed.radius;
        const impactV = Math.abs(seed.vy);
        seed.vy = -seed.vy * bounciness * 0.4;
        seed.vx *= friction;
        if (impactV > 8) {
          playWallBounce(Math.min(impactV / 180, 0.7));
          if (impactV > 25) haptic.selection();
        }
      }

      // Peg collisions
      pegs.forEach(peg => {
        const dx = seed.x - peg.x;
        const dy = seed.y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = seed.radius + peg.radius;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          seed.x += nx * overlap;
          seed.y += ny * overlap;

          const dot = seed.vx * nx + seed.vy * ny;
          seed.vx -= 2 * dot * nx * (1 - bounciness);
          seed.vy -= 2 * dot * ny * (1 - bounciness);
          seed.vx += (Math.random() - 0.5) * 12;
          seed.vy += (Math.random() - 0.5) * 8;

          const impactV = Math.abs(dot);
          const now = performance.now();

          if (impactV > 6 && now - seed.lastBounce > 25) {
            seed.lastBounce = now;
            peg.lastHit = now;

            const vol = Math.min(impactV / 140, 1);
            playSeedImpact(seed, vol, peg.y);

            if (vol > 0.3) haptic.selection();

            // Spawn dust
            spawnDust(peg.x, peg.y, vol);
          }
        }
      });
    });
  }, [playSeedImpact, playWallBounce]);

  const spawnDust = useCallback((x, y, intensity) => {
    const count = 1 + Math.floor(intensity * 2);
    for (let i = 0; i < count; i++) {
      dustRef.current.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 15 * intensity,
        vy: (Math.random() - 0.5) * 15 * intensity - 8,
        life: 1,
        decay: 0.025 + Math.random() * 0.03,
        size: 1 + Math.random() * 2.5,
        hue: primaryHue,
      });
    }
  }, [primaryHue]);

  // =============================================
  // DRAW
  // =============================================
  const draw = useCallback((ctx, dt) => {
    const { W, H } = dimsRef.current;
    const tube = tubeRef.current;
    const seeds = seedsRef.current;
    const pegs = pegsRef.current;
    const dust = dustRef.current;
    const h = primaryHue;

    ctx.clearRect(0, 0, W, H);

    // Activity level
    const activity = seeds.reduce((sum, s) =>
      sum + Math.min(Math.sqrt(s.vx * s.vx + s.vy * s.vy) / 100, 1), 0) / seeds.length;

    // Background
    const bgL = 2 + activity * 3;
    ctx.fillStyle = `hsl(${h}, 15%, ${bgL}%)`;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow
    if (activity > 0.01) {
      const ambGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
      ambGrad.addColorStop(0, `hsla(${h}, 35%, 40%, ${activity * 0.05})`);
      ambGrad.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Tube
    const cornerR = tube.width * 0.5;

    ctx.save();
    ctx.shadowColor = `hsla(${h}, 30%, 40%, ${0.05 + activity * 0.08})`;
    ctx.shadowBlur = 25;

    ctx.beginPath();
    ctx.roundRect(tube.left - 2, tube.top - 2, tube.width + 4, tube.height + 4, cornerR);
    const tubeGrad = ctx.createLinearGradient(tube.left, 0, tube.right, 0);
    tubeGrad.addColorStop(0, `hsla(${h}, 20%, 12%, 0.6)`);
    tubeGrad.addColorStop(0.3, `hsla(${h}, 15%, 8%, 0.8)`);
    tubeGrad.addColorStop(0.5, `hsla(${h}, 10%, 5%, 0.9)`);
    tubeGrad.addColorStop(0.7, `hsla(${h}, 15%, 8%, 0.8)`);
    tubeGrad.addColorStop(1, `hsla(${h}, 20%, 12%, 0.6)`);
    ctx.fillStyle = tubeGrad;
    ctx.fill();
    ctx.restore();

    // Tube border
    ctx.beginPath();
    ctx.roundRect(tube.left, tube.top, tube.width, tube.height, cornerR);
    ctx.strokeStyle = `hsla(${h}, 35%, 45%, ${0.12 + activity * 0.12})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner glow
    if (activity > 0.02) {
      const innerGlow = ctx.createRadialGradient(
        tube.centerX, (tube.top + tube.bottom) / 2, tube.width * 0.3,
        tube.centerX, (tube.top + tube.bottom) / 2, tube.height * 0.5
      );
      innerGlow.addColorStop(0, `hsla(${h}, 40%, 50%, ${activity * 0.05})`);
      innerGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = innerGlow;
      ctx.fillRect(tube.left, tube.top, tube.width, tube.height);
    }

    // Caps
    ctx.beginPath();
    ctx.ellipse(tube.centerX, tube.top, tube.width / 2, tube.width * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${h}, 15%, 15%, 0.8)`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${h}, 30%, 40%, 0.15)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(tube.centerX, tube.bottom, tube.width / 2, tube.width * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${h}, 15%, 15%, 0.8)`;
    ctx.fill();
    ctx.stroke();

    // Pegs
    const now = performance.now();
    pegs.forEach(peg => {
      const timeSinceHit = now - peg.lastHit;
      const hitGlow = timeSinceHit < 250 ? (1 - timeSinceHit / 250) : 0;

      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
      const brightness = 18 + hitGlow * 35;
      ctx.fillStyle = `hsla(${h}, 30%, ${brightness}%, ${0.25 + hitGlow * 0.5})`;
      ctx.fill();

      if (hitGlow > 0.01) {
        const glowGrad = ctx.createRadialGradient(peg.x, peg.y, 0, peg.x, peg.y, 10 + hitGlow * 8);
        glowGrad.addColorStop(0, `hsla(${h}, 45%, 55%, ${hitGlow * 0.25})`);
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 10 + hitGlow * 8, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }
    });

    // Seeds
    seeds.forEach(seed => {
      const speed = Math.sqrt(seed.vx * seed.vx + seed.vy * seed.vy);
      const motionGlow = Math.min(speed / 180, 1);

      // Trail
      seed.trail.forEach(t => {
        if (t.life <= 0) return;
        ctx.beginPath();
        ctx.arc(t.x, t.y, seed.radius * 0.5 * t.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${seed.hue}, ${seed.sat}%, ${seed.lightness}%, ${t.life * 0.12})`;
        ctx.fill();
      });

      // Glow
      if (motionGlow > 0.1) {
        const sg = ctx.createRadialGradient(seed.x, seed.y, 0, seed.x, seed.y, seed.radius * 3.5);
        sg.addColorStop(0, `hsla(${seed.hue}, ${seed.sat + 10}%, ${seed.lightness + 15}%, ${motionGlow * 0.12})`);
        sg.addColorStop(1, 'hsla(0,0%,0%,0)');
        ctx.beginPath();
        ctx.arc(seed.x, seed.y, seed.radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }

      // Body
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, seed.radius, 0, Math.PI * 2);
      const seedL = seed.lightness + motionGlow * 18;
      ctx.fillStyle = `hsla(${seed.hue}, ${seed.sat}%, ${seedL}%, ${0.55 + motionGlow * 0.3})`;
      ctx.fill();
    });

    // Dust
    for (let i = dust.length - 1; i >= 0; i--) {
      const p = dust[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 12 * dt;
      p.life -= p.decay;

      if (p.life <= 0) {
        dust.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 30%, 50%, ${p.life * 0.25})`;
      ctx.fill();
    }
  }, [primaryHue]);

  // =============================================
  // MAIN LOOP
  // =============================================
  const update = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { W, H } = dimsRef.current;

    if (!lastFrameRef.current) lastFrameRef.current = ts;
    const dt = Math.min((ts - lastFrameRef.current) / 1000, 0.033);
    lastFrameRef.current = ts;

    sessionTimeRef.current += dt;

    // Show hint
    if (!hintShownRef.current && sessionTimeRef.current > 2 && sessionTimeRef.current < 8) {
      setShowHint(true);
    } else if (sessionTimeRef.current >= 8) {
      setShowHint(false);
      hintShownRef.current = true;
    }

    // Sub-step physics
    const steps = 3;
    const subDt = dt / steps;
    for (let i = 0; i < steps; i++) {
      updatePhysics(subDt);
    }

    draw(ctx, dt);
    animationRef.current = requestAnimationFrame(update);
  }, [updatePhysics, draw]);

  // =============================================
  // TOUCH FALLBACK (for browsers without gyro)
  // =============================================
  const handleTouch = useCallback((e) => {
    if (hasGyroRef.current) return;
    if (!isInitialized) initAudio();

    const { W, H } = dimsRef.current;
    const touch = e.touches ? e.touches[0] : e;
    tiltRef.current.x = (touch.clientX / W - 0.5) * 2;
    tiltRef.current.y = (touch.clientY / H - 0.5) * 2;
  }, [isInitialized, initAudio]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (!isInitialized) {
      initAudio();
      // iOS requires orientation permission from user gesture
      initOrientation();
    } else {
      // Ensure audio context is resumed (iOS requirement)
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
    handleTouch(e);
  }, [isInitialized, initAudio, initOrientation, handleTouch]);

  // =============================================
  // LIFECYCLE
  // =============================================
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [resize, update]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#030306',
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouch}
        onMouseDown={handleTouchStart}
        onMouseMove={(e) => e.buttons === 1 && handleTouch(e)}
      />

      {/* Vignette */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 5,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(3,3,6,0.55) 55%, rgba(3,3,6,0.98) 82%)',
      }} />

      {/* Label */}
      <div style={{
        position: 'fixed',
        top: '6%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center',
        pointerEvents: 'none',
        opacity: 0.7,
      }}>
        <div style={{
          fontSize: 'clamp(1.4rem, 4.5vw, 2rem)',
          letterSpacing: '0.3em',
          textTransform: 'lowercase',
          color: `hsla(${primaryHue}, 45%, 60%, 0.9)`,
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
        }}>
          rain stick
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        fontWeight: 300,
        fontSize: 12,
        color: `hsla(${primaryHue}, 30%, 45%, 0.5)`,
        letterSpacing: '0.2em',
        opacity: showHint ? 0.5 : 0,
        transition: 'opacity 2s ease',
        pointerEvents: 'none',
        textAlign: 'center',
        fontFamily: '"Jost", sans-serif',
      }}>
        tilt slowly
      </div>
    </div>
  );
}
