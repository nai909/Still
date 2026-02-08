import { useRef, useEffect, useState, useCallback } from 'react';
import { haptic } from '../config/haptic';
import { KEYS, KEY_FREQUENCIES, SCALE_TYPES } from '../config/constants';

// =============================================
// HARP MODE — Meditative Virtual Harp
// Sampled harp with physics-based string visuals
// =============================================

export default function HarpMode({ primaryHue = 220 }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const harpBufferRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);
  const stringsRef = useRef([]);
  const dimsRef = useRef({ W: 0, H: 0 });
  const activeRef = useRef(new Map());
  const lastPluckedRef = useRef(new Map());

  const [currentKey, setCurrentKey] = useState(0); // C
  const [currentScaleType, setCurrentScaleType] = useState(9); // pentatonic major
  const [showDrawer, setShowDrawer] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const labelTimeoutRef = useRef(null);

  // Generate scale frequencies
  const generateScale = useCallback((keyIndex, scaleTypeIndex, octaves = 2) => {
    const keyName = KEYS[keyIndex];
    const baseFreq = KEY_FREQUENCIES[keyName];
    const intervals = SCALE_TYPES[scaleTypeIndex].intervals;
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
    if (W === 0 || H === 0) return;

    const frequencies = generateScale(currentKey, currentScaleType, 2);
    const numStrings = frequencies.length;
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
    if (audioCtxRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;

    // Load harp sample
    fetch('harp.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => { harpBufferRef.current = audioBuffer; })
      .catch(() => {});

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
    masterGain.gain.setTargetAtTime(0.65, audioCtx.currentTime, 1.5);
  }, []);

  // Sampled harp playback - pitch shift from base note (C3 = 130.81Hz)
  const pluckStringAudio = useCallback((string, velocity) => {
    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    const harpBuffer = harpBufferRef.current;
    if (!audioCtx || !masterGain || !harpBuffer) return;

    const now = audioCtx.currentTime;
    const freq = string.freq;
    const baseFreq = 130.81; // C3 - base frequency of the harp sample
    const playbackRate = freq / baseFreq;

    const source = audioCtx.createBufferSource();
    source.buffer = harpBuffer;
    source.playbackRate.value = playbackRate;

    // Filter - brighter for higher strings
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000 + string.normalizedIndex * 6000 + velocity * 2000;
    filter.Q.value = 0.5;

    // Gain envelope
    const gain = audioCtx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(1.0 * velocity, now, 0.01);
    gain.gain.setTargetAtTime(0.7 * velocity, now + 0.1, 0.3);
    gain.gain.setTargetAtTime(0, now + 0.5, 3.0);

    // Stereo panning based on string position
    let output = gain;
    if (audioCtx.createStereoPanner) {
      const panner = audioCtx.createStereoPanner();
      panner.pan.value = (string.normalizedIndex - 0.5) * 1.2;
      gain.connect(panner);
      output = panner;
    }

    source.connect(filter);
    filter.connect(gain);
    output.connect(masterGain);
    source.start(now);

    // Sympathetic resonance
    stringsRef.current.forEach(s => {
      if (s === string) return;
      const ratio = s.freq / string.freq;
      const nearestHarmonic = Math.round(ratio);
      if (nearestHarmonic > 0 && nearestHarmonic <= 4 && Math.abs(ratio - nearestHarmonic) < 0.05) {
        setTimeout(() => {
          s.energy = Math.min(s.energy + velocity * 0.08, 0.3);
          s.glowIntensity = Math.min(s.glowIntensity + 0.15, 0.3);
          exciteStringVisual(s, velocity * 0.15);
        }, 30 + Math.random() * 60);
      }
    });
  }, []);

  const exciteStringVisual = useCallback((string, velocity) => {
    const pluckSeg = Math.floor(string.pluckPoint * string.segments);
    for (let i = 0; i < string.segments; i++) {
      const distFromPluck = Math.abs(i - pluckSeg) / string.segments;
      const displacement = velocity * 12 * Math.max(0, 1 - distFromPluck * 2.5);
      string.displacement[i] += displacement * (Math.random() > 0.5 ? 1 : -1);
    }
  }, []);

  // =============================================
  // PLUCK
  // =============================================
  const pluck = useCallback((string, y, velocity) => {
    string.pluckPoint = Math.max(0.1, Math.min(0.9, (y - string.topY) / (string.bottomY - string.topY)));
    string.energy = Math.min(string.energy + velocity, 1);
    string.glowIntensity = Math.min(velocity + 0.2, 1);
    exciteStringVisual(string, velocity);

    string.ripples.push({
      y,
      spread: 0,
      maxSpread: (string.bottomY - string.topY) * 0.8,
      life: 1,
      velocity,
    });

    pluckStringAudio(string, velocity);

    // Haptic feedback based on string pitch
    if (string.normalizedIndex < 0.33) {
      haptic.medium();
    } else if (string.normalizedIndex < 0.66) {
      haptic.soft();
    } else {
      haptic.tap();
    }
  }, [pluckStringAudio, exciteStringVisual]);

  // =============================================
  // INTERACTION
  // =============================================
  const findNearestString = useCallback((x) => {
    const strings = stringsRef.current;
    const { W } = dimsRef.current;
    let nearest = null;
    let minDist = Infinity;

    strings.forEach(s => {
      const d = Math.abs(x - s.x);
      if (d < minDist) { minDist = d; nearest = s; }
    });

    const maxDist = W / strings.length * 0.8;
    return minDist < maxDist ? nearest : null;
  }, []);

  const handleStart = useCallback((id, x, y) => {
    if (!audioCtxRef.current) initAudio();
    activeRef.current.set(id, { x, y });

    const s = findNearestString(x);
    if (s && y > s.topY && y < s.bottomY) {
      pluck(s, y, 0.6);
      lastPluckedRef.current.set(s.index, performance.now());
    }
  }, [initAudio, findNearestString, pluck]);

  const handleMove = useCallback((id, x, y) => {
    const prev = activeRef.current.get(id);
    if (!prev) return;

    const dx = x - prev.x;
    const strings = stringsRef.current;

    strings.forEach(s => {
      const crossedRight = prev.x < s.x && x >= s.x;
      const crossedLeft = prev.x > s.x && x <= s.x;

      if ((crossedRight || crossedLeft) && y > s.topY && y < s.bottomY) {
        const lastTime = lastPluckedRef.current.get(s.index) || 0;
        if (performance.now() - lastTime < 100) return;
        lastPluckedRef.current.set(s.index, performance.now());

        const velocity = Math.min(Math.abs(dx) / 30, 1) * 0.5 + 0.3;
        pluck(s, y, velocity);
      }
    });

    activeRef.current.set(id, { x, y });
  }, [pluck]);

  const handleEnd = useCallback((id) => {
    activeRef.current.delete(id);
  }, []);

  // =============================================
  // PHYSICS
  // =============================================
  const updatePhysics = useCallback((dt) => {
    const strings = stringsRef.current;
    const c = 0.4;

    strings.forEach(s => {
      const damping = 0.985 + s.normalizedIndex * 0.008;
      const newDisp = new Float32Array(s.segments);

      for (let i = 1; i < s.segments - 1; i++) {
        const accel = c * c * (s.displacement[i - 1] + s.displacement[i + 1] - 2 * s.displacement[i]);
        newDisp[i] = 2 * s.displacement[i] - s.prevDisplacement[i] + accel;
        newDisp[i] *= damping;
      }

      newDisp[0] = 0;
      newDisp[s.segments - 1] = 0;

      s.prevDisplacement = new Float32Array(s.displacement);
      s.displacement = newDisp;

      s.energy *= s.decay;
      if (s.energy < 0.001) s.energy = 0;

      s.glowIntensity *= 0.97;
      if (s.glowIntensity < 0.005) s.glowIntensity = 0;

      for (let ri = s.ripples.length - 1; ri >= 0; ri--) {
        const r = s.ripples[ri];
        r.spread += dt * 400;
        r.life -= dt * 0.5;
        if (r.life <= 0) s.ripples.splice(ri, 1);
      }
    });
  }, []);

  // =============================================
  // DRAW
  // =============================================
  const draw = useCallback((ctx) => {
    const { W, H } = dimsRef.current;
    const strings = stringsRef.current;
    const h = primaryHue;
    const s = 35;
    const l = 50;

    ctx.clearRect(0, 0, W, H);

    // Background
    const totalEnergy = strings.reduce((sum, str) => sum + str.energy, 0) / Math.max(strings.length, 1);
    const bgL = 1.5 + totalEnergy * 3;
    ctx.fillStyle = `hsl(${h}, ${s * 0.3}%, ${bgL}%)`;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow
    if (totalEnergy > 0.01) {
      const ambGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
      const ambA = totalEnergy * 0.06;
      ambGrad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${ambA})`);
      ambGrad.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Draw strings
    strings.forEach(str => {
      // String glow
      if (str.glowIntensity > 0.01) {
        ctx.save();
        ctx.globalAlpha = str.glowIntensity * 0.25;
        ctx.shadowColor = `hsla(${h}, ${s + 20}%, ${l + 20}%, 0.8)`;
        ctx.shadowBlur = 15 + str.glowIntensity * 20;

        ctx.beginPath();
        ctx.moveTo(str.x, str.topY);
        for (let i = 0; i < str.segments; i++) {
          const segY = str.topY + (i / (str.segments - 1)) * (str.bottomY - str.topY);
          const segX = str.x + str.displacement[i];
          ctx.lineTo(segX, segY);
        }
        ctx.strokeStyle = `hsla(${h}, ${s + 20}%, ${l + 25}%, ${0.3 + str.glowIntensity * 0.5})`;
        ctx.lineWidth = str.thickness + str.glowIntensity * 4;
        ctx.stroke();
        ctx.restore();
      }

      // Main string
      ctx.beginPath();
      ctx.moveTo(str.x, str.topY);
      for (let i = 0; i < str.segments; i++) {
        const t = i / (str.segments - 1);
        const segY = str.topY + t * (str.bottomY - str.topY);
        const segX = str.x + str.displacement[i];
        ctx.lineTo(segX, segY);
      }

      const stringL = l * 0.4 + str.glowIntensity * l * 0.6 + 10;
      const stringA = 0.35 + str.energy * 0.5 + str.glowIntensity * 0.15;
      ctx.strokeStyle = `hsla(${h}, ${s}%, ${stringL}%, ${stringA})`;
      ctx.lineWidth = str.thickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Ripples
      str.ripples.forEach(r => {
        if (r.life <= 0) return;
        const rippleAlpha = r.life * 0.4 * r.velocity;
        ctx.beginPath();
        ctx.ellipse(str.x, r.y, 3 + r.spread * 0.1, r.spread, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${h}, ${s + 15}%, ${l + 15}%, ${rippleAlpha})`;
        ctx.lineWidth = 0.5 + r.velocity;
        ctx.stroke();
      });

      // Anchor points
      ctx.beginPath();
      ctx.arc(str.x, str.topY, 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, ${s - 10}%, ${l + 20}%, 0.3)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(str.x, str.bottomY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, ${s - 10}%, ${l + 15}%, 0.2)`;
      ctx.fill();
    });

    // Floating particles
    if (totalEnergy > 0.05) {
      strings.forEach(str => {
        if (str.energy > 0.1 && Math.random() < str.energy * 0.08) {
          const t = Math.random();
          const y = str.topY + t * (str.bottomY - str.topY);
          const seg = Math.floor(t * (str.segments - 1));
          const x = str.x + (str.displacement[seg] || 0);

          ctx.beginPath();
          ctx.arc(
            x + (Math.random() - 0.5) * 8,
            y + (Math.random() - 0.5) * 4,
            0.5 + Math.random() * 1.5,
            0, Math.PI * 2
          );
          ctx.fillStyle = `hsla(${h}, ${s + 10}%, ${l + 20}%, ${str.energy * 0.4})`;
          ctx.fill();
        }
      });
    }
  }, [primaryHue]);

  // =============================================
  // MAIN LOOP
  // =============================================
  const update = useCallback((ts) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!lastFrameRef.current) lastFrameRef.current = ts;
    const dt = Math.min((ts - lastFrameRef.current) / 1000, 0.05);
    lastFrameRef.current = ts;

    // Physics sub-steps
    const subSteps = 3;
    const subDt = dt / subSteps;
    for (let i = 0; i < subSteps; i++) {
      updatePhysics(subDt);
    }

    draw(ctx);
    animationRef.current = requestAnimationFrame(update);
  }, [updatePhysics, draw]);

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

    dimsRef.current = { W, H };
    createStrings();
  }, [createStrings]);

  // Display label temporarily
  const displayLabel = useCallback(() => {
    setShowLabel(true);
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 1500);
  }, []);

  // =============================================
  // LIFECYCLE
  // =============================================
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(update);

    labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 2500);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [resize, update]);

  // Update strings when key/scale changes
  useEffect(() => {
    createStrings();
  }, [currentKey, currentScaleType, createStrings]);

  // Touch handlers
  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      handleStart(touch.identifier, touch.clientX, touch.clientY);
    }
  }, [handleStart]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      handleMove(touch.identifier, touch.clientX, touch.clientY);
    }
  }, [handleMove]);

  const onTouchEnd = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      handleEnd(touch.identifier);
    }
  }, [handleEnd]);

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

      {/* Center label */}
      <div style={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center',
        pointerEvents: 'none',
        opacity: showLabel ? 0.8 : 0,
        transition: 'opacity 1s ease',
      }}>
        <div style={{
          fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
          letterSpacing: '0.3em',
          textTransform: 'lowercase',
          color: `hsla(${primaryHue}, 52%, 68%, 0.9)`,
          fontFamily: '"Jost", sans-serif',
          fontWeight: 300,
          marginBottom: '0.5rem',
        }}>
          harp
        </div>
        <div style={{
          fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)',
          letterSpacing: '0.2em',
          textTransform: 'lowercase',
          color: `hsla(${primaryHue}, 52%, 68%, 0.6)`,
          fontFamily: '"Jost", sans-serif',
        }}>
          {KEYS[currentKey].toLowerCase()} {SCALE_TYPES[currentScaleType].name}
        </div>
      </div>

      {/* Settings hint */}
      <div
        onClick={() => { haptic.tap(); setShowDrawer(true); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); haptic.tap(); setShowDrawer(true); }}
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          color: `hsla(${primaryHue}, 52%, 68%, 0.3)`,
          fontSize: '0.65rem',
          fontFamily: '"Jost", sans-serif',
          letterSpacing: '0.15em',
          textTransform: 'lowercase',
          cursor: 'pointer',
          padding: '8px 16px',
          touchAction: 'auto',
        }}
      >
        tap for settings
      </div>

      {/* Scale selector drawer - matching DroneMode */}
      {showDrawer && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowDrawer(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 100,
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
              zIndex: 101,
              animation: 'slideUpScale 0.5s ease-out',
              maxHeight: '70vh',
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
        @keyframes fadeInScale {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpScale {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
