import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { allQuotes, allThemes, allSchools } from './data/quotes';
import { breathTechniques } from './data/breathTechniques';
import { haptic } from './config/haptic';
import { gazeModes } from './config/constants';
import GazeMode from './components/GazeMode';
import StringsMode from './components/StringsMode';
import DroneMode from './components/DroneMode';

// Destructure React hooks for compatibility with original code
const { useState, useEffect, useRef, useCallback } = React;

// ============================================================================
// THEME SYSTEM
// ============================================================================

const themes = {
  void: {
    name: 'Void',
    bg: '#000',
    text: '#E8E4DC',
    textMuted: '#7a7570',
    accent: '#7FDBCA',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
  },
  cosmos: {
    name: 'Cosmos',
    bg: '#000',
    text: '#E4E0E8',
    textMuted: '#8080A0',
    accent: '#7FDBCA',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
  },
  dawn: {
    name: 'Dawn',
    bg: '#000',
    text: '#E8E4DC',
    textMuted: '#7a7570',
    accent: '#7FDBCA',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
  },
};

// ============================================================================
// SETTINGS
// ============================================================================

const defaultSettings = {
  theme: 'void',
  scrollSpeed: 1,
  depthEffect: true,
  particles: false,
  reducedMotion: false,
  breathMode: false,      // Quotes advance with breath
  autoAdvance: false,     // Auto-advance quotes
  autoAdvanceInterval: 20, // Seconds between quotes
  primaryHue: 162,        // App color scheme (162 = teal)
};

// Color presets for the app
const COLOR_PRESETS = [
  { name: 'Teal', hue: 162, hex: '#7FDBCA' },
  { name: 'Ocean', hue: 195, hex: '#7FC8DB' },
  { name: 'Violet', hue: 270, hex: '#A87FDB' },
  { name: 'Rose', hue: 340, hex: '#DB7F9E' },
  { name: 'Sage', hue: 140, hex: '#7FDB9E' },
  { name: 'Amber', hue: 40, hex: '#DBC07F' },
];

const STORAGE_KEYS = {
  SAVED_QUOTES: 'still_saved_quotes',
  SETTINGS: 'still_settings',
};

// ============================================================================
// UTILITIES
// ============================================================================

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const loadSavedQuotes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_QUOTES);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveSavedQuotes = (quotes) => {
  try { localStorage.setItem(STORAGE_KEYS.SAVED_QUOTES, JSON.stringify(quotes)); } catch {}
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = saved ? JSON.parse(saved) : defaultSettings;
    // Check for OS preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settings.reducedMotion = true;
    }
    return settings;
  } catch { return defaultSettings; }
};

const saveSettings = (settings) => {
  try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch {}
};

// ============================================================================
// BREATHWORK VIEW COMPONENT
// ============================================================================

function BreathworkView({ breathSession, breathTechniques, startBreathSession, stopBreathSession, primaryHue = 162, isActive = false }) {
  const [showUI, setShowUI] = useState(false);
  const [displayedPhase, setDisplayedPhase] = useState('');
  const [phaseOpacity, setPhaseOpacity] = useState(1);
  const [showPhaseText, setShowPhaseText] = useState(true);
  const swipeStartRef = useRef(null);
  const wheelAccumRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const labelTimeoutRef = useRef(null);
  const fadeInTimeoutRef = useRef(null);
  const wasActiveRef = useRef(false);
  const phaseTransitionRef = useRef(null);

  // Reset breath session and show label when view becomes active (fade in then out)
  useEffect(() => {
    // Only trigger when transitioning from inactive to active
    if (isActive && !wasActiveRef.current) {
      stopBreathSession();
      // Fade in after brief delay
      fadeInTimeoutRef.current = setTimeout(() => setShowLabel(true), 50);
      // Fade out after 2 seconds
      labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 2000);
    }
    wasActiveRef.current = isActive;

    return () => {
      if (fadeInTimeoutRef.current) clearTimeout(fadeInTimeoutRef.current);
      if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    };
  }, [isActive, stopBreathSession]);

  // Smooth phase text transitions with fade
  const currentPhaseLabel = breathSession.isActive
    ? breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label || 'breathe'
    : '';

  useEffect(() => {
    if (!breathSession.isActive) {
      setDisplayedPhase('');
      setPhaseOpacity(1);
      return;
    }

    if (currentPhaseLabel !== displayedPhase) {
      // Clear any pending transition
      if (phaseTransitionRef.current) clearTimeout(phaseTransitionRef.current);

      if (displayedPhase === '') {
        // First phase - just fade in
        setDisplayedPhase(currentPhaseLabel);
        setPhaseOpacity(0);
        requestAnimationFrame(() => setPhaseOpacity(1));
      } else {
        // Transition between phases - fade out, then fade in new
        setPhaseOpacity(0);
        phaseTransitionRef.current = setTimeout(() => {
          setDisplayedPhase(currentPhaseLabel);
          requestAnimationFrame(() => setPhaseOpacity(1));
        }, 300); // Wait for fade out
      }
    }

    return () => {
      if (phaseTransitionRef.current) clearTimeout(phaseTransitionRef.current);
    };
  }, [currentPhaseLabel, displayedPhase, breathSession.isActive]);

  // Handle swipe gestures (vertical only - for technique selector)
  const handleTouchStart = useCallback((e) => {
    if (showUI) return;
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, [showUI]);

  const handleTouchEnd = useCallback((e) => {
    if (!swipeStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;
    const deltaTime = Date.now() - swipeStartRef.current.time;
    const screenHeight = window.innerHeight;

    const minSwipeDistance = 50;
    const maxSwipeTime = 500;

    // Vertical swipe UP: open technique selector
    if (deltaY < -minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && deltaTime < maxSwipeTime) {
      if (swipeStartRef.current.y > screenHeight * 0.5) {
        setShowUI(true);
      }
    }
    // Vertical swipe DOWN: close technique selector
    if (deltaY > minSwipeDistance && showUI) {
      setShowUI(false);
    }

    swipeStartRef.current = null;
  }, [showUI]);

  // Two-finger swipe (wheel event on trackpad) for menu only
  const showUIRef = useRef(showUI);
  showUIRef.current = showUI;

  useEffect(() => {
    const handleWheel = (e) => {
      // When menu is open, let scroll pass through naturally
      if (showUIRef.current) return;

      wheelAccumRef.current += e.deltaY;

      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumRef.current = 0;
      }, 200);

      const threshold = 50;

      // Swipe UP = open menu
      if (wheelAccumRef.current > threshold) {
        e.preventDefault();
        setShowUI(true);
        wheelAccumRef.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <main
      onClick={() => { if (!showUI && !breathSession.isActive) { haptic.tap(); startBreathSession(breathSession.technique); } }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        cursor: 'pointer',
      }}
    >
      {/* Visual background - uses GazeMode component with fern visual */}
      <GazeMode
        primaryHue={primaryHue}
        backgroundMode={true}
        currentVisual="lavaTouch"
        breathSession={breathSession}
      />

      {/* Phase text with smooth fade transitions */}
      {breathSession.isActive && displayedPhase && showPhaseText && (
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <div style={{
            color: 'rgba(255, 255, 255, 1)',
            fontSize: '2rem',
            fontFamily: '"Jost", sans-serif',
            fontWeight: 300,
            letterSpacing: '0.3em',
            textTransform: 'lowercase',
            textAlign: 'center',
            maxWidth: '80vw',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.9)',
            opacity: phaseOpacity,
            transform: `scale(${0.95 + phaseOpacity * 0.05})`,
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          }}>
            {displayedPhase}
          </div>
        </div>
      )}

      {/* Technique selector - bottom drawer */}
      {showUI && (
        <>
          {/* Backdrop - tap to close */}
          <div
            onClick={(e) => { e.stopPropagation(); setShowUI(false); }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 10,
              animation: 'fadeInBreath 0.5s ease-out',
            }}
          />
          {/* Bottom drawer */}
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
              animation: 'slideUpBreath 0.5s ease-out',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              touchAction: 'auto',
            }}>
            {/* Title */}
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
              }}>Breathing Techniques</span>
            </div>

            {/* Text toggle - at top */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.85rem',
                fontFamily: '"Jost", sans-serif',
              }}>Show Phase Text</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic.tap();
                  setShowPhaseText(!showPhaseText);
                }}
                style={{
                  width: '48px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: showPhaseText ? `hsla(${primaryHue}, 52%, 68%, 0.8)` : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.3s ease',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: showPhaseText ? '23px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.3s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>

            {/* Scrollable list */}
            <div
              onTouchMove={(e) => e.stopPropagation()}
              style={{
                overflowY: 'auto',
                padding: '0.5rem 0',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
              }}>
              {Object.entries(breathTechniques).map(([key, tech]) => (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic.tap();
                    setTimeout(() => {
                      if (breathSession.isActive) stopBreathSession();
                      startBreathSession(key);
                      setShowUI(false);
                    }, 80);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: breathSession.technique === key ? `hsla(${primaryHue}, 52%, 68%, 0.1)` : 'transparent',
                    border: 'none',
                    borderLeft: breathSession.technique === key ? `3px solid hsla(${primaryHue}, 52%, 68%, 0.6)` : '3px solid transparent',
                    color: breathSession.technique === key ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.6)',
                    padding: '0.85rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: '"Jost", sans-serif',
                    textAlign: 'left',
                    transition: 'all 0.4s ease',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{tech.name}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.25rem' }}>{tech.description || ''}</div>
                </button>
              ))}

              {/* Bottom spacer for scroll */}
              <div style={{ height: 'calc(8rem + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }} />
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes slideUpBreath {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeInBreath {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes breathTextPulse {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}

// ============================================================================
// ZEN WATER BOARD - Draw with water, watch it evaporate
// ============================================================================

function ZenWaterBoard({ primaryHue = 162 }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastPointRef = useRef(null);
  const velocityBufferRef = useRef([]);
  const [boardEmpty, setBoardEmpty] = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

  const FADE_DURATION = 15000;

  const quotes = [
    "begin again.",
    "this moment is enough.",
    "let go.",
    "the obstacle is the path. — marcus aurelius",
    "flow like water. — lao tzu",
    "be here now. — ram dass",
    "what you seek is seeking you. — rumi",
    "let go, or be dragged. — zen proverb",
    "become who you are. — nietzsche",
    "live to the point of tears. — camus",
    "the wound is the place where the light enters you. — rumi",
    "we're all just walking each other home. — ram dass",
    "the cave you fear to enter holds the treasure you seek. — joseph campbell",
    "when I let go of what I am, I become what I might be. — lao tzu",
    "there is a crack in everything. that's how the light gets in. — leonard cohen",
    "the privilege of a lifetime is being who you are. — joseph campbell",
  ];

  const hslToRgba = (h, s, l, a) => `hsla(${h}, ${s}%, ${l}%, ${a})`;
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const lerp = (a, b, t) => a + (b - a) * t;

  const catmullRom = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return {
      x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const drawBrushStroke = useCallback((ctx, points, opacity) => {
    if (points.length < 2) return;

    const path = [];
    for (let i = 0; i < points.length; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[Math.min(points.length - 1, i + 1)];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const steps = i === points.length - 1 ? 1 : 6;
      for (let t = 0; t < steps; t++) {
        const pos = steps === 1 ? p1 : catmullRom(p0, p1, p2, p3, t / steps);
        const width = steps === 1 ? p1.width : lerp(p1.width, p2.width, t / steps);
        const progress = (i + t / steps) / points.length;
        let taper = 1;
        if (progress < 0.08) taper = 0.15 + 0.85 * Math.pow(progress / 0.08, 0.4);
        else if (progress > 0.82) taper = Math.pow(1 - (progress - 0.82) / 0.18, 1.2);
        const bristleVar = 1 + Math.sin(progress * 25 + i) * 0.08 + Math.sin(progress * 47) * 0.05;
        path.push({ x: pos.x, y: pos.y, width: width * taper * bristleVar, progress });
      }
    }
    if (path.length < 2) return;

    const leftEdge = [], rightEdge = [];
    const seed = points[0].x * 1000 + points[0].y;
    const seededRandom = (i) => { const x = Math.sin(seed + i * 9999) * 10000; return x - Math.floor(x); };

    for (let i = 0; i < path.length; i++) {
      const curr = path[i], prev = path[Math.max(0, i - 1)], next = path[Math.min(path.length - 1, i + 1)];
      let dx = next.x - prev.x, dy = next.y - prev.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= len; dy /= len;
      const nx = -dy, ny = dx, halfWidth = curr.width / 2;
      const wobble = Math.sin(i * 0.4 + seededRandom(i) * 2) * curr.width * 0.06 + Math.sin(i * 0.15) * curr.width * 0.04 + Math.sin(i * 0.8 + 2) * curr.width * 0.03;
      leftEdge.push({ x: curr.x + nx * (halfWidth + wobble + seededRandom(i * 2) * curr.width * 0.03), y: curr.y + ny * (halfWidth + wobble + seededRandom(i * 2) * curr.width * 0.03) });
      rightEdge.push({ x: curr.x - nx * (halfWidth - wobble * 0.7 + seededRandom(i * 2 + 1) * curr.width * 0.03), y: curr.y - ny * (halfWidth - wobble * 0.7 + seededRandom(i * 2 + 1) * curr.width * 0.03) });
    }

    // Outer glow
    for (let g = 4; g >= 0; g--) {
      const glowOpacity = opacity * 0.06 * (1 - g * 0.18);
      ctx.beginPath();
      ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
      for (let i = 1; i < leftEdge.length; i++) ctx.quadraticCurveTo(leftEdge[i - 1].x, leftEdge[i - 1].y, (leftEdge[i - 1].x + leftEdge[i].x) / 2, (leftEdge[i - 1].y + leftEdge[i].y) / 2);
      ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
      for (let i = rightEdge.length - 1; i >= 0; i--) ctx.quadraticCurveTo(rightEdge[i].x, rightEdge[i].y, (rightEdge[i].x + rightEdge[Math.max(0, i - 1)].x) / 2, (rightEdge[i].y + rightEdge[Math.max(0, i - 1)].y) / 2);
      ctx.closePath();
      ctx.fillStyle = hslToRgba(primaryHue, 60, 70, glowOpacity);
      ctx.fill();
    }

    // Ink bleed
    for (let i = 0; i < path.length; i += 3) {
      const p = path[i];
      if (p.width < 3) continue;
      for (let b = 0; b < Math.floor(seededRandom(i * 3) * 3); b++) {
        const angle = seededRandom(i * 10 + b) * Math.PI * 2;
        const dist = p.width * 0.4 + seededRandom(i * 10 + b + 100) * p.width * 0.3;
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist, 1 + seededRandom(i * 10 + b + 200) * 3, 0, Math.PI * 2);
        ctx.fillStyle = hslToRgba(primaryHue, 50, 65, opacity * 0.15 * seededRandom(i + b));
        ctx.fill();
      }
    }

    // Main body
    ctx.beginPath();
    ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
    ctx.quadraticCurveTo(path[0].x, path[0].y - path[0].width * 0.3, rightEdge[0].x, rightEdge[0].y);
    for (let i = 1; i < rightEdge.length; i++) ctx.quadraticCurveTo(rightEdge[i - 1].x, rightEdge[i - 1].y, (rightEdge[i - 1].x + rightEdge[i].x) / 2, (rightEdge[i - 1].y + rightEdge[i].y) / 2);
    const endMid = path[path.length - 1], prevEnd = path[path.length - 2];
    const endDx = endMid.x - prevEnd.x, endDy = endMid.y - prevEnd.y, endLen = Math.sqrt(endDx * endDx + endDy * endDy) || 1;
    ctx.lineTo(rightEdge[rightEdge.length - 1].x, rightEdge[rightEdge.length - 1].y);
    ctx.quadraticCurveTo(endMid.x + (endDx / endLen) * endMid.width * 0.5, endMid.y + (endDy / endLen) * endMid.width * 0.5, leftEdge[leftEdge.length - 1].x, leftEdge[leftEdge.length - 1].y);
    for (let i = leftEdge.length - 2; i >= 0; i--) ctx.quadraticCurveTo(leftEdge[i + 1].x, leftEdge[i + 1].y, (leftEdge[i + 1].x + leftEdge[i].x) / 2, (leftEdge[i + 1].y + leftEdge[i].y) / 2);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(path[0].x, path[0].y, path[path.length - 1].x, path[path.length - 1].y);
    gradient.addColorStop(0, hslToRgba(primaryHue, 50, 65, opacity * 0.85));
    gradient.addColorStop(0.3, hslToRgba(primaryHue, 50, 65, opacity * 0.95));
    gradient.addColorStop(0.7, hslToRgba(primaryHue, 45, 55, opacity * 0.9));
    gradient.addColorStop(1, hslToRgba(primaryHue, 45, 55, opacity * 0.75));
    ctx.fillStyle = gradient;
    ctx.fill();

    // Bristle texture
    ctx.save();
    ctx.clip();
    for (let b = 0; b < 5 + Math.floor(points[0].width / 4); b++) {
      const offset = (b / (5 + Math.floor(points[0].width / 4)) - 0.5) * 0.7;
      ctx.beginPath();
      for (let i = 0; i < path.length; i += 2) {
        const p = path[i], prev = path[Math.max(0, i - 2)], next = path[Math.min(path.length - 1, i + 2)];
        let dx = next.x - prev.x, dy = next.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const wander = Math.sin(i * 0.3 + b * 2) * p.width * 0.05;
        const bx = p.x + (-dy / len) * (p.width * offset + wander), by = p.y + (dx / len) * (p.width * offset + wander);
        i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
      }
      ctx.strokeStyle = `rgba(0,0,0,${opacity * (0.08 + seededRandom(b) * 0.1)})`;
      ctx.lineWidth = 0.5 + seededRandom(b + 50);
      ctx.stroke();
    }
    ctx.restore();

    // Ink pool at start
    ctx.beginPath();
    ctx.ellipse(path[0].x, path[0].y, path[0].width * 0.4, path[0].width * 0.35, 0, 0, Math.PI * 2);
    const poolGrad = ctx.createRadialGradient(path[0].x, path[0].y, 0, path[0].x, path[0].y, path[0].width * 0.4);
    poolGrad.addColorStop(0, hslToRgba(primaryHue, 50, 65, opacity * 0.25));
    poolGrad.addColorStop(1, hslToRgba(primaryHue, 50, 65, 0));
    ctx.fillStyle = poolGrad;
    ctx.fill();

    // Center highlight
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      const wobble = Math.sin(i * 0.5) * path[i].width * 0.02;
      ctx.quadraticCurveTo(path[i - 1].x + wobble, path[i - 1].y + wobble, (path[i - 1].x + path[i].x) / 2 + wobble, (path[i - 1].y + path[i].y) / 2 + wobble);
    }
    ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.2})`;
    ctx.lineWidth = 0.75;
    ctx.stroke();
  }, [primaryHue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const render = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, rect.width, rect.height);
      const now = Date.now();
      let hasVisible = false;

      strokesRef.current = strokesRef.current.filter(stroke => {
        const age = now - stroke.createdAt;
        const dur = FADE_DURATION * (0.5 + stroke.wetness * 0.5);
        if (age > dur) return false;
        hasVisible = true;
        const opacity = 1 - easeOutQuart(age / dur);
        if (opacity <= 0.01) return false;
        drawBrushStroke(ctx, stroke.points, opacity);
        return true;
      });

      if (currentStrokeRef.current?.points.length > 1) {
        drawBrushStroke(ctx, currentStrokeRef.current.points, 1);
        hasVisible = true;
      }

      if (!hasVisible && !boardEmpty) {
        setBoardEmpty(true);
        if (Math.random() > 0.6) {
          setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
          setShowQuote(true);
          setTimeout(() => setShowQuote(false), 4500);
        }
      } else if (hasVisible && boardEmpty) {
        setBoardEmpty(false);
        setShowQuote(false);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [drawBrushStroke, boardEmpty]);

  const getPressure = (e) => (e.pressure && e.pressure > 0 && e.pressure !== 0.5) ? e.pressure : (e.touches?.[0]?.force || 0.5);
  const getPosition = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left, y: (e.clientY ?? e.touches?.[0]?.clientY ?? 0) - rect.top };
  };
  const getSmoothedVelocity = (curr, last, dt) => {
    if (!last || dt === 0) return 0;
    const v = Math.sqrt(Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2)) / Math.max(dt, 1);
    velocityBufferRef.current.push(v);
    if (velocityBufferRef.current.length > 5) velocityBufferRef.current.shift();
    return velocityBufferRef.current.reduce((a, b) => a + b, 0) / velocityBufferRef.current.length;
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    velocityBufferRef.current = [];
    const pos = getPosition(e), pressure = getPressure(e);
    currentStrokeRef.current = {
      points: [{ ...pos, pressure, width: (4 + pressure * 28) * 0.4, timestamp: Date.now(), velocity: 0 }],
      wetness: 0.7 + Math.random() * 0.5
    };
    lastPointRef.current = { ...pos, timestamp: Date.now() };
    haptic.tap();
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    e.preventDefault();
    const pos = getPosition(e), pressure = getPressure(e), now = Date.now();
    const timeDelta = now - (lastPointRef.current?.timestamp || now);
    const velocity = getSmoothedVelocity(pos, lastPointRef.current, timeDelta);
    if (lastPointRef.current && Math.sqrt(Math.pow(pos.x - lastPointRef.current.x, 2) + Math.pow(pos.y - lastPointRef.current.y, 2)) < 1.5) return;
    const baseWidth = 4 + pressure * 28;
    const targetWidth = baseWidth * Math.max(0.35, Math.min(1.3, 1.4 - velocity * 0.12));
    const prevWidth = currentStrokeRef.current.points[currentStrokeRef.current.points.length - 1]?.width || targetWidth;
    currentStrokeRef.current.points.push({ ...pos, pressure, width: lerp(prevWidth, targetWidth, 0.35), timestamp: now, velocity });
    currentStrokeRef.current.wetness = Math.min(1.6, currentStrokeRef.current.wetness + pressure * 0.008);
    lastPointRef.current = { ...pos, timestamp: now };
  };

  const handlePointerUp = () => {
    if (currentStrokeRef.current?.points.length > 1) {
      const last = currentStrokeRef.current.points[currentStrokeRef.current.points.length - 1];
      const prev = currentStrokeRef.current.points[currentStrokeRef.current.points.length - 2];
      const dx = last.x - prev.x, dy = last.y - prev.y;
      currentStrokeRef.current.points.push({ x: last.x + dx * 0.3, y: last.y + dy * 0.3, width: last.width * 0.4, pressure: last.pressure * 0.5, timestamp: Date.now() });
      currentStrokeRef.current.points.push({ x: last.x + dx * 0.5, y: last.y + dy * 0.5, width: last.width * 0.1, pressure: last.pressure * 0.2, timestamp: Date.now() });
      // Set createdAt when touch is released so fade starts only after drawing ends
      currentStrokeRef.current.createdAt = Date.now();
      strokesRef.current.push(currentStrokeRef.current);
    }
    isDrawingRef.current = false;
    currentStrokeRef.current = null;
    lastPointRef.current = null;
    velocityBufferRef.current = [];
  };

  return (
    <main style={{ position: 'absolute', inset: 0, zIndex: 2, background: '#000', touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', cursor: 'none', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: `hsla(${primaryHue}, 50%, 65%, 0.4)`,
        fontFamily: '"Jost", sans-serif', fontWeight: 300, letterSpacing: '0.15em', textAlign: 'center',
        padding: '2rem', opacity: showQuote ? 1 : 0, transition: 'opacity 3s ease-in-out',
        pointerEvents: 'none', textTransform: 'lowercase'
      }}>{currentQuote}</div>
      <div className="zen-hint-text" style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        color: `hsla(${primaryHue}, 40%, 60%, 0.2)`, fontSize: '0.7rem', fontFamily: '"Jost", sans-serif',
        letterSpacing: '0.3em', textTransform: 'lowercase', opacity: boardEmpty && !showQuote ? 1 : 0,
        transition: 'opacity 1.5s ease', pointerEvents: 'none'
      }}>draw · watch it fade · begin again</div>

      <style>{`
        @keyframes zenTextPulse {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (max-width: 768px) {
          .zen-hint-text { display: none !important; }
        }
      `}</style>
    </main>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function Still() {
  // Intro state - simple touch to begin
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  // Mode transition state (needed early for intro transition)
  const [modeTransition, setModeTransition] = useState({ active: false, modeName: '' });
  const [visualOpacity, setVisualOpacity] = useState(1);

  // Ref for DroneMode to trigger audio initialization
  const droneModeRef = useRef(null);

  // Called when samples are loaded
  const handleSamplesReady = useCallback(() => {
    // Samples ready - handpan is playable
  }, []);

  // Handle intro touch - start loading and fade to handpan
  const handleIntroTouch = useCallback(() => {
    if (introFading) return;

    // Pre-warm haptics
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

    // Start audio initialization immediately
    if (droneModeRef.current) {
      droneModeRef.current.init();
    }

    // Hide visual initially for transition
    setVisualOpacity(0);

    // Start intro fade out
    setIntroFading(true);

    // After intro fades, show "hum" text on black screen
    setTimeout(() => {
      setShowIntro(false);
      setModeTransition({ active: true, modeName: 'hum' });
    }, 1200);

    // After text fades out, fade in the visual
    setTimeout(() => {
      setModeTransition({ active: false, modeName: '' });
      setVisualOpacity(1);
    }, 1200 + 2500); // intro fade + text animation
  }, [introFading]);

  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [shuffledQuotes, setShuffledQuotes] = useState([]);
  const [view, setView] = useState('hum'); // Start with music/handpan
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState(new Set());
  const [selectedThemes, setSelectedThemes] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [showColorOverlay, setShowColorOverlay] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [showSettingsHint, setShowSettingsHint] = useState(false);
  const [gazeVisual, setGazeVisual] = useState('jellyfish2d'); // Drift mode

  // Shared drone state - one drone controlled by all modes
  const [sharedKey, setSharedKey] = useState(3); // D# default
  const [sharedDroneEnabled, setSharedDroneEnabled] = useState(false);

  // Settings hint timer - shows hint every 20 seconds until settings opened
  useEffect(() => {
    if (hasOpenedSettings) {
      setShowSettingsHint(false);
      return;
    }

    // Track all timeouts for proper cleanup
    let hideTimeout = null;

    // Show hint initially after 5 seconds
    const initialTimeout = setTimeout(() => {
      setShowSettingsHint(true);
      // Hide after 4 seconds (animation duration)
      hideTimeout = setTimeout(() => setShowSettingsHint(false), 4000);
    }, 5000);

    // Then show every 20 seconds
    const intervalId = setInterval(() => {
      if (!hasOpenedSettings) {
        setShowSettingsHint(true);
        hideTimeout = setTimeout(() => setShowSettingsHint(false), 4000);
      }
    }, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [hasOpenedSettings]);

  // Mode transition handler - black screen with text overlay, then visual fades in
  const transitionToMode = useCallback((newMode, modeName) => {
    if (newMode === view) return;

    // First fade out current visual slowly
    setVisualOpacity(0);

    // After visual fades out, show overlay with text
    setTimeout(() => {
      setModeTransition({ active: true, modeName });
    }, 1500);

    // Switch mode while text is visible
    setTimeout(() => {
      setView(newMode);
    }, 2500);

    // After text fades out, remove overlay and fade in new visual
    setTimeout(() => {
      setModeTransition({ active: false, modeName: '' });
      setVisualOpacity(1);
    }, 4000);
  }, [view]);

  // ============================================================================
  // SCROLL STATE
  // ============================================================================

  const [displayProgress, setDisplayProgress] = useState(0);
  const isAnimating = useRef(false);
  const touchHistory = useRef([]);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const lastTouchY = useRef(0);
  const containerRef = useRef(null);

  // Text reveal state (gentle fade-in)
  const [textRevealed, setTextRevealed] = useState(false);
  const revealTimeoutRef = useRef(null);

  // ============================================================================
  // BREATH SESSION STATE (for dedicated breathwork view)
  // ============================================================================

  const [breathSession, setBreathSession] = useState({
    technique: 'calm',
    isActive: false,
    isPaused: false,
    isComplete: false,
    phase: 'inhale',
    phaseIndex: 0,
    phaseProgress: 0,  // 0-1 through current phase
    cycleCount: 0,
    sessionTime: 0,
    totalCycles: 10,
  });
  const breathSessionRef = useRef(null);

  // ============================================================================
  // BREATHING - The heartbeat of the app (ambient background)
  // Inhale: 5s (0→1), Exhale: 6s (1→0), Total cycle: 11s
  // ============================================================================

  const breathCycleCount = useRef(0);

  useEffect(() => {
    const INHALE_DURATION = 5000;
    const EXHALE_DURATION = 6000;

    let animationFrame;
    let startTime = Date.now();
    let inhaling = true;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const duration = inhaling ? INHALE_DURATION : EXHALE_DURATION;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        // Switch breath direction
        inhaling = !inhaling;
        startTime = Date.now();

        // Count complete cycles (after full exhale)
        if (inhaling) {
          breathCycleCount.current++;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [settings.breathMode]);

  // ============================================================================
  // BREATH SESSION CONTROLS (for dedicated breathwork view)
  // ============================================================================

  const startBreathSession = useCallback((techniqueName) => {
    const technique = breathTechniques[techniqueName];
    if (!technique) return;

    haptic.medium(); // Haptic feedback on session start

    setBreathSession({
      technique: techniqueName,
      isActive: true,
      isPaused: false,
      isComplete: false,
      phase: technique.phases[0].name,
      phaseIndex: 0,
      phaseProgress: 0,
      cycleCount: 0,
      sessionTime: 0,
      totalCycles: technique.recommendedCycles || 10,
    });
  }, []);

  const stopBreathSession = useCallback(() => {
    setBreathSession(prev => ({ ...prev, isActive: false, isPaused: false, isComplete: false }));
    if (breathSessionRef.current) {
      cancelAnimationFrame(breathSessionRef.current);
    }
  }, []);

  const togglePauseBreathSession = useCallback(() => {
    setBreathSession(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Breath session animation loop
  useEffect(() => {
    if (!breathSession.isActive || breathSession.isPaused) {
      if (breathSessionRef.current) cancelAnimationFrame(breathSessionRef.current);
      return;
    }

    const technique = breathTechniques[breathSession.technique];
    if (!technique) return;

    let phaseStartTime = Date.now();
    let currentPhaseIndex = breathSession.phaseIndex;
    let currentCycleCount = breathSession.cycleCount;
    let sessionStartTime = Date.now() - (breathSession.sessionTime * 1000);

    const animate = () => {
      const now = Date.now();
      const phase = technique.phases[currentPhaseIndex];
      const phaseDuration = phase.duration * 1000;
      const phaseElapsed = now - phaseStartTime;
      const phaseProgress = Math.min(phaseElapsed / phaseDuration, 1);

      // Update session time
      const sessionTime = (now - sessionStartTime) / 1000;

      // Check if phase complete
      if (phaseProgress >= 1) {
        currentPhaseIndex = (currentPhaseIndex + 1) % technique.phases.length;
        phaseStartTime = now;

        // Count cycle when we return to first phase
        if (currentPhaseIndex === 0) {
          currentCycleCount++;

          // Check if session is complete
          if (currentCycleCount >= breathSession.totalCycles) {
            setBreathSession(prev => ({
              ...prev,
              isActive: false,
              isComplete: true,
              cycleCount: currentCycleCount,
              sessionTime: Math.floor(sessionTime),
            }));
            return; // Stop animation
          }
        }
      }

      setBreathSession(prev => ({
        ...prev,
        phase: technique.phases[currentPhaseIndex].name,
        phaseIndex: currentPhaseIndex,
        phaseProgress: phaseProgress,
        cycleCount: currentCycleCount,
        sessionTime: Math.floor(sessionTime),
      }));

      breathSessionRef.current = requestAnimationFrame(animate);
    };

    breathSessionRef.current = requestAnimationFrame(animate);
    return () => {
      if (breathSessionRef.current) cancelAnimationFrame(breathSessionRef.current);
    };
  }, [breathSession.isActive, breathSession.isPaused, breathSession.technique, breathSession.totalCycles]);

  // Get current theme and color
  const currentTheme = themes[settings.theme] || themes.void;
  const primaryHue = settings.primaryHue || 162;
  const primaryColor = `hsl(${primaryHue}, 52%, 68%)`;

  // Initialize
  useEffect(() => {
    const saved = loadSavedQuotes();
    setSavedQuotes(saved);
    setShuffledQuotes(shuffleArray(allQuotes));
    setSettings(loadSettings());
  }, []);

  // Filter quotes
  const filteredQuotes = shuffledQuotes.filter(q => {
    const schoolMatch = selectedSchools.size === 0 || selectedSchools.has(q.school);
    const themeMatch = selectedThemes.size === 0 || (q.themes && q.themes.some(t => selectedThemes.has(t)));
    const savedMatch = !showSavedOnly || savedQuotes.some(s => s.author + '-' + s.text.substring(0, 30) === q.author + '-' + q.text.substring(0, 30));
    return schoolMatch && themeMatch && savedMatch;
  });

  const currentQuote = filteredQuotes[currentIndex % Math.max(filteredQuotes.length, 1)];

  // ============================================================================
  // TEXT REVEAL - Gentle fade-in, no anxiety
  // ============================================================================

  useEffect(() => {
    if (!currentQuote) return;

    // Clear any existing timeout
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }

    // Start hidden, then fade in after a brief moment
    setTextRevealed(false);
    revealTimeoutRef.current = setTimeout(() => {
      setTextRevealed(true);
    }, 100);

    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, [currentIndex, currentQuote]);

  // ============================================================================
  // SIMPLE SCROLL SYSTEM - Direct, responsive, no fighting physics
  // ============================================================================

  // Go to next/previous quote with smooth CSS transition
  const goToQuote = useCallback((direction) => {
    if (isAnimating.current) return;

    const newIndex = direction > 0
      ? (currentIndex + 1) % filteredQuotes.length
      : Math.max(0, currentIndex - 1);

    if (newIndex === currentIndex) return;

    isAnimating.current = true;
    setDisplayProgress(direction > 0 ? 1 : -1);

    setTimeout(() => {
      setCurrentIndex(newIndex);
      setDisplayProgress(0);
      isAnimating.current = false;
    }, 800); // Slower, like smoke clearing
  }, [currentIndex, filteredQuotes.length]);

  // Breath mode: advance quote every 2 breath cycles (~22s)
  const lastBreathAdvance = useRef(0);
  useEffect(() => {
    if (!settings.breathMode || view !== 'scroll') return;

    const checkBreathAdvance = setInterval(() => {
      if (breathCycleCount.current >= lastBreathAdvance.current + 2) {
        lastBreathAdvance.current = breathCycleCount.current;
        goToQuote(1);
      }
    }, 1000);

    return () => clearInterval(checkBreathAdvance);
  }, [settings.breathMode, view, goToQuote]);

  // Accumulated scroll for threshold detection
  const scrollAccum = useRef(0);
  const SCROLL_THRESHOLD = 80; // Pixels needed to trigger next quote

  // ============================================================================
  // INPUT HANDLERS - Simple and direct
  // ============================================================================

  const wheelAccumX = useRef(0);

  const handleWheel = useCallback((e) => {
    if (view !== 'scroll' || isAnimating.current) return;
    e.preventDefault();

    // Horizontal scroll - change visual
    wheelAccumX.current += e.deltaX;
    if (Math.abs(wheelAccumX.current) > SCROLL_THRESHOLD) {
      const direction = wheelAccumX.current > 0 ? 1 : -1;
      const currentIndex = gazeModes.findIndex(m => m.key === gazeVisual);
      const newIndex = (currentIndex + direction + gazeModes.length) % gazeModes.length;
      setGazeVisual(gazeModes[newIndex].key);
      haptic.tap();
      wheelAccumX.current = 0;
      return;
    }

    // Vertical scroll - change quote
    scrollAccum.current += e.deltaY * settings.scrollSpeed;

    if (scrollAccum.current > SCROLL_THRESHOLD) {
      scrollAccum.current = 0;
      goToQuote(1);
    } else if (scrollAccum.current < -SCROLL_THRESHOLD) {
      scrollAccum.current = 0;
      goToQuote(-1);
    }
  }, [view, settings.scrollSpeed, goToQuote, gazeVisual, setGazeVisual]);

  const handleTouchStart = useCallback((e) => {
    if (view !== 'scroll') return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    lastTouchY.current = e.touches[0].clientY;
    touchHistory.current = [{ y: e.touches[0].clientY, x: e.touches[0].clientX, time: Date.now() }];
  }, [view]);

  const handleTouchMove = useCallback((e) => {
    if (view !== 'scroll' || isAnimating.current) return;
    e.preventDefault();

    const touchY = e.touches[0].clientY;
    const totalDelta = touchStartY.current - touchY;

    // Track for velocity
    touchHistory.current.push({ y: touchY, time: Date.now() });
    touchHistory.current = touchHistory.current.slice(-5);

    // Show visual feedback (subtle parallax)
    const progress = Math.max(-0.5, Math.min(0.5, totalDelta / 300));
    setDisplayProgress(progress);

    lastTouchY.current = touchY;
  }, [view]);

  const handleTouchEnd = useCallback((e) => {
    if (view !== 'scroll' || isAnimating.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = touchStartY.current - endY;

    // Calculate velocity from recent touches
    const recent = touchHistory.current;
    let velocity = 0;
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = last.time - first.time;
      if (dt > 0) velocity = (first.y - last.y) / dt;
    }

    // Check for horizontal swipe first (to change visual)
    const swipeThreshold = 80;
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      // Horizontal swipe detected - change visual
      const direction = deltaX > 0 ? -1 : 1;
      const currentIndex = gazeModes.findIndex(m => m.key === gazeVisual);
      const newIndex = (currentIndex + direction + gazeModes.length) % gazeModes.length;
      setGazeVisual(gazeModes[newIndex].key);
      haptic.tap();
      setDisplayProgress(0);
      return;
    }

    // Vertical swipe - change quote
    const dominated = Math.abs(deltaY) > 50 || Math.abs(velocity) > 0.5;

    if (dominated && (deltaY > 30 || velocity > 0.3)) {
      goToQuote(1);
    } else if (dominated && (deltaY < -30 || velocity < -0.3)) {
      goToQuote(-1);
    } else {
      // Snap back
      setDisplayProgress(0);
    }
  }, [view, goToQuote, gazeVisual, setGazeVisual]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'scroll') return;

      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goToQuote(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToQuote(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, goToQuote]);

  // ============================================================================
  // QUOTE MANAGEMENT
  // ============================================================================

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleSave = (quote) => {
    const quoteId = quote.author + '-' + quote.text.substring(0, 30);
    const isCurrentlySaved = savedQuotes.some(q => q.author + '-' + q.text.substring(0, 30) === quoteId);
    let newSaved;
    if (isCurrentlySaved) {
      newSaved = savedQuotes.filter(q => q.author + '-' + q.text.substring(0, 30) !== quoteId);
      showToast('Removed from saved');
      // Turn off "saved only" filter if no more saved quotes
      if (newSaved.length === 0 && showSavedOnly) {
        setShowSavedOnly(false);
      }
    } else {
      newSaved = [...savedQuotes, quote];
      showToast('Saved to collection');
    }
    setSavedQuotes(newSaved);
    saveSavedQuotes(newSaved);
  };

  const isQuoteSaved = (quote) => {
    if (!quote) return false;
    const quoteId = quote.author + '-' + quote.text.substring(0, 30);
    return savedQuotes.some(q => q.author + '-' + q.text.substring(0, 30) === quoteId);
  };

  const toggleSchool = (school) => {
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(school)) newSet.delete(school);
      else newSet.add(school);
      return newSet;
    });
    setCurrentIndex(0);
    indexRef.current = 0;
    physicsRef.current.position = 0;
    physicsRef.current.velocity = 0;
    applyTransforms(0);
  };

  const toggleTheme = (theme) => {
    setSelectedThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(theme)) newSet.delete(theme);
      else newSet.add(theme);
      return newSet;
    });
    setCurrentIndex(0);
    indexRef.current = 0;
    physicsRef.current.position = 0;
    physicsRef.current.velocity = 0;
    applyTransforms(0);
  };


  // Visual transforms are now handled directly in applyTransforms via refs

  if (!currentQuote) {
    return (
      <div style={{ background: currentTheme.bg, color: currentTheme.text, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Landscape orientation overlay */}
      <div className="landscape-overlay">
        <div className="rotate-icon">📱</div>
        <div className="rotate-message">Please rotate to portrait</div>
      </div>

      {/* Simple intro - touch to begin, then handpan fades in */}
      {showIntro && (
        <div
          onClick={handleIntroTouch}
          onTouchStart={handleIntroTouch}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: introFading ? 0 : 1,
            transition: 'opacity 1.2s ease-out',
          }}
        >
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontFamily: '"Jost", sans-serif',
            fontWeight: 300,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
          }}>
            Still
          </h1>
          <p style={{
            marginTop: '3rem',
            fontSize: '0.9rem',
            fontFamily: '"Jost", sans-serif',
            fontWeight: 300,
            letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'lowercase',
          }}>
            <span style={{ opacity: 0, animation: 'fadeInWord 0.8s ease-out 0.3s forwards' }}>touch </span>
            <span style={{ opacity: 0, animation: 'fadeInWord 0.8s ease-out 0.7s forwards' }}>to </span>
            <span style={{ opacity: 0, animation: 'fadeInWord 0.8s ease-out 1.1s forwards' }}>begin</span>
          </p>
          <style>{`
            @keyframes fadeInWord {
              from { opacity: 0; transform: translateY(5px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          minHeight: '100vh',
          height: '100vh',
          overflow: 'hidden',
          background: currentTheme.bg,
          color: currentTheme.text,
          fontFamily: '"Jost", sans-serif',
          position: 'relative',
          touchAction: view === 'scroll' ? 'none' : 'auto',
          transition: 'background 0.5s ease',
        }}
      >
        {/* Background visual for scroll mode - very dim, slow */}
        {(view === 'scroll' || view === 'filter') && (
          <div style={{ opacity: 0.4 }}>
            <GazeMode
              theme={currentTheme}
              primaryHue={settings.primaryHue}
              backgroundMode={true}
              currentVisual={gazeVisual}
            />
          </div>
        )}

        {/* Vignette */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Header - persistent across all views */}
        <header style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: '1.25rem',
          paddingLeft: 'calc(1.5rem + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(1.5rem + env(safe-area-inset-right, 0px))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          zIndex: 100,
        }}>
          <div style={{ position: 'relative' }}>
            <h1
              onClick={() => {
                haptic.tap();
                setHasOpenedSettings(true);
                setTimeout(() => setShowColorOverlay(true), 80);
              }}
              className={hasOpenedSettings ? '' : 'still-pulse'}
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 1.8rem)',
                fontFamily: '"Jost", sans-serif',
                fontWeight: 400,
                letterSpacing: '0.2em',
                margin: 0,
                cursor: 'pointer',
                color: currentTheme.text,
                opacity: hasOpenedSettings ? 0.9 : undefined,
                lineHeight: 1,
                height: '2.6rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Still
            </h1>
            {/* Settings hint that appears periodically */}
            {!hasOpenedSettings && (
              <div
                className={showSettingsHint ? 'settings-hint-show' : 'settings-hint-hide'}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  fontSize: '0.55rem',
                  fontFamily: '"Jost", sans-serif',
                  letterSpacing: '0.1em',
                  textTransform: 'lowercase',
                  fontWeight: 300,
                  color: `hsla(${primaryHue}, 52%, 68%, 0.7)`,
                  marginTop: '0.3rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => {
                  haptic.tap();
                  setHasOpenedSettings(true);
                  setTimeout(() => setShowColorOverlay(true), 80);
                }}
              >
                tap for settings
              </div>
            )}
          </div>
          {/* Mode menu */}
          <div style={{ position: 'relative' }}>
            {(() => {
              const modes = [
                { key: 'hum', icon: '∿', label: 'Hum' },
                { key: 'strings', icon: '𝄢', label: 'Strings' },
                { key: 'gaze', icon: '◯', label: 'Gaze' },
                { key: 'breathwork', icon: '◎', label: 'Breathe' },
                { key: 'zenboard', icon: '∞', label: 'Impermanence' },
              ];
              const currentMode = modes.find(m => m.key === view) || modes[0];
              return (
                <>
                  {/* Menu button showing current mode icon only */}
                  <button
                    onClick={() => { haptic.tap(); setShowModeMenu(!showModeMenu); }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: currentTheme.text,
                      width: '2.6rem',
                      height: '2.6rem',
                      cursor: 'pointer',
                      fontSize: '1.3rem',
                      transition: 'all 0.3s ease',
                      opacity: 0.9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {currentMode.icon}
                  </button>

                  {/* Dropdown menu */}
                  {showModeMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        onClick={() => setShowModeMenu(false)}
                        style={{
                          position: 'fixed',
                          inset: 0,
                          zIndex: 199,
                        }}
                      />
                      {/* Menu dropdown - icons only, black and white, aligned with button */}
                      <div
                        className="mode-menu-dropdown"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 0.35rem)',
                          right: 0,
                          background: 'rgba(0, 0, 0, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          padding: '0.2rem',
                          zIndex: 200,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.1rem',
                          width: '2.6rem',
                          animation: 'menuFadeIn 0.5s ease-out',
                        }}
                      >
                        {modes.map(({ key, icon, label }, index) => {
                          const isActive = view === key;
                          return (
                            <button
                              key={key}
                              className="mode-menu-item"
                              onClick={() => {
                                haptic.tap();
                                setShowModeMenu(false);
                                setTimeout(() => transitionToMode(key, label), 80);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '2.2rem',
                                height: '2.2rem',
                                padding: 0,
                                background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s ease',
                                opacity: 0,
                                animation: `menuItemReveal 0.6s ease-out ${index * 0.12}s forwards`,
                              }}
                            >
                              {icon}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </header>

        {/* Mode transition overlay - black screen with text (below header) */}
        {modeTransition.active && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              background: '#000',
            }}
          >
            <div
              className="mode-transition-text"
              style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontFamily: '"Jost", sans-serif',
                fontWeight: 300,
                letterSpacing: '0.3em',
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'lowercase',
                animation: 'modeTextSlide 2.5s ease-in-out forwards',
              }}
            >
              {modeTransition.modeName}
            </div>
          </div>
        )}

        {/* Visual content wrapper with fade transition */}
        <div style={{ opacity: visualOpacity, transition: 'opacity 1.5s ease-in-out' }}>

        {/* Zen Water Board - Draw with water on stone */}
        {view === 'zenboard' && (
          <ZenWaterBoard primaryHue={settings.primaryHue} />
        )}

        {/* Main Scroll View (legacy - kept for reference) */}
        {view === 'scroll' && currentQuote && (
          <main style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            {/* Quote Card - emerges like smoke, fades during breath focus */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                maxWidth: '700px',
                padding: '0 2rem',
                textAlign: 'center',
                willChange: 'transform, opacity, filter',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out, filter 0.8s ease-out',
                opacity: Math.abs(displayProgress) > 0.3 ? 0 : 1 - Math.abs(displayProgress) * 2,
                filter: `blur(${Math.abs(displayProgress) * 12}px)`,
                transform: `translate3d(0, ${displayProgress * -40}px, 0) scale(${1 - Math.abs(displayProgress) * 0.05})`,
              }}
            >
              <blockquote style={{
                fontSize: 'clamp(1.6rem, 6vw, 3rem)',
                fontFamily: '"Jost", sans-serif',
                fontWeight: 500,
                lineHeight: 1.6,
                color: currentTheme.text,
                margin: 0,
                letterSpacing: '0.02em',
                textShadow: '0 2px 15px rgba(0,0,0,0.4)',
                opacity: textRevealed ? 1 : 0,
                transform: textRevealed ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              }}>
                {currentQuote.text}
              </blockquote>

              <div className="quote-meta" style={{
                marginTop: '2rem',
                transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
                opacity: textRevealed
                  ? Math.max(0, 1 - Math.abs(displayProgress) * 3)
                  : 0,
                transform: textRevealed ? 'translateY(0)' : 'translateY(8px)',
              }}>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 500,
                  color: currentTheme.textMuted,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {currentQuote.author}
                </div>

                {/* HIDDEN FOR MINIMAL UI - Tags and save/filter buttons preserved for later
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.3rem 0.8rem',
                    background: `hsla(${primaryHue}, 52%, 68%, 0.15)`,
                    borderRadius: '4px',
                    color: primaryColor,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: `1px solid hsla(${primaryHue}, 52%, 68%, 0.25)`,
                  }}>
                    {currentQuote.school}
                  </span>
                  {currentQuote.themes && currentQuote.themes.slice(0, 2).map(theme => (
                    <span key={theme} style={{
                      padding: '0.25rem 0.6rem',
                      background: `hsla(${primaryHue}, 52%, 68%, 0.1)`,
                      borderRadius: '3px',
                      color: `hsla(${primaryHue}, 52%, 68%, 0.7)`,
                      fontSize: '0.65rem',
                      letterSpacing: '0.05em',
                      textTransform: 'lowercase',
                    }}>
                      {theme}
                    </span>
                  ))}
                  <span style={{ fontSize: '0.75rem', color: currentTheme.textMuted }}>{currentQuote.era}</span>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button
                    onClick={() => setTimeout(() => toggleSave(currentQuote), 80)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: isQuoteSaved(currentQuote) ? primaryColor : currentTheme.textMuted,
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{isQuoteSaved(currentQuote) ? '♥' : '♡'}</span>save
                  </button>
                  <button
                    onClick={() => setTimeout(() => setView('filter'), 80)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: (selectedSchools.size > 0 || selectedThemes.size > 0) ? primaryColor : currentTheme.textMuted,
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>◉</span>filter
                  </button>
                </div>
                END HIDDEN FOR MINIMAL UI */}
              </div>
            </div>
          </main>
        )}

        {/* Breathe View */}
        {view === 'breathe' && (
          <main style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            background: breathSession.isActive ? 'transparent' : currentTheme.bg,
            transition: 'background 0.5s ease',
          }}>
            {/* Technique Selection (when not in session) */}
            {!breathSession.isActive && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: currentTheme.textMuted,
                  marginBottom: '2rem',
                }}>
                  Choose Your Breath
                </h2>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxWidth: '320px',
                  margin: '0 auto',
                }}>
                  {Object.entries(breathTechniques).map(([key, tech]) => (
                    <button
                      key={key}
                      onClick={() => startBreathSession(key)}
                      style={{
                        background: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '12px',
                        padding: '1.25rem 1.5rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.5s ease',
                      }}
                    >
                      <div style={{
                        fontSize: '1rem',
                        fontFamily: '"Jost", sans-serif',
                        color: currentTheme.text,
                        marginBottom: '0.25rem',
                      }}>
                        {tech.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: currentTheme.textMuted,
                        fontFamily: '"Jost", sans-serif',
                      }}>
                        {tech.description}
                      </div>
                      <div style={{
                        fontSize: '0.65rem',
                        color: currentTheme.textMuted,
                        marginTop: '0.5rem',
                        opacity: 0.7,
                      }}>
                        {tech.phases.map(p => `${p.label} ${p.duration}s`).join(' → ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Breath Session */}
            {breathSession.isActive && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}>
                {/* Ripples Visualization Background */}
                <GazeMode
                  theme={currentTheme}
                  primaryHue={settings.primaryHue}
                  backgroundMode={false}
                  currentVisual="ripples"
                />

                {/* Phase Label Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    fontSize: '1.8rem',
                    fontFamily: '"Jost", sans-serif',
                    color: currentTheme.text,
                    opacity: 0.85,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}>
                    {breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label}
                  </div>
                </div>

                {/* Controls */}
                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  display: 'flex',
                  gap: '1rem',
                  zIndex: 10,
                }}>
                  <button
                    onClick={togglePauseBreathSession}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text,
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: '"Jost", sans-serif',
                    }}
                  >
                    {breathSession.isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                  <button
                    onClick={stopBreathSession}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.textMuted,
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: '"Jost", sans-serif',
                    }}
                  >
                    ✕ End
                  </button>
                </div>
              </div>
            )}

            {/* Session Complete Screen */}
            {breathSession.isComplete && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                position: 'relative',
                padding: '2rem',
                textAlign: 'center',
              }}>
                {/* Soft glow background */}
                <div style={{
                  position: 'absolute',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${currentTheme.accent}15 0%, transparent 70%)`,
                  animation: 'pulse 4s ease-in-out infinite',
                }} />

                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: currentTheme.textMuted,
                  marginBottom: '1rem',
                }}>
                  Session Complete
                </div>

                <div style={{
                  fontSize: '1.1rem',
                  fontFamily: '"Jost", sans-serif',
                  color: currentTheme.text,
                  marginBottom: '0.5rem',
                  opacity: 0.9,
                }}>
                  {breathSession.cycleCount} breaths · {Math.floor(breathSession.sessionTime / 60)}:{String(breathSession.sessionTime % 60).padStart(2, '0')}
                </div>

                <div style={{
                  fontSize: '1rem',
                  fontFamily: '"Jost", sans-serif',
                  color: currentTheme.textMuted,
                  maxWidth: '280px',
                  lineHeight: 1.6,
                  marginTop: '2rem',
                  marginBottom: '3rem',
                }}>
                  Consider setting your phone aside and carrying this calm with you.
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  width: '100%',
                  maxWidth: '200px',
                }}>
                  <button
                    onClick={() => startBreathSession(breathSession.technique)}
                    style={{
                      background: currentTheme.cardBg,
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text,
                      padding: '0.85rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: '"Jost", sans-serif',
                    }}
                  >
                    Breathe Again
                  </button>
                  <button
                    onClick={stopBreathSession}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: currentTheme.textMuted,
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontFamily: '"Jost", sans-serif',
                      opacity: 0.7,
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </main>
        )}

        {/* Gaze View - Sacred Geometry */}
        {view === 'gaze' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <GazeMode
              theme={currentTheme}
              primaryHue={settings.primaryHue}
              onHueChange={(hue) => {
                const newSettings = { ...settings, primaryHue: hue };
                setSettings(newSettings);
                saveSettings(newSettings);
              }}
              currentVisual={gazeVisual}
              onVisualChange={setGazeVisual}
            />
          </div>
        )}

        {/* Strings - Multi-instrument mode */}
        {view === 'strings' && (
          <StringsMode
            primaryHue={primaryHue}
            currentKey={sharedKey}
            onKeyChange={setSharedKey}
            droneEnabled={sharedDroneEnabled}
            onDroneToggle={setSharedDroneEnabled}
          />
        )}

        {/* Breathwork View is now always mounted below for WebGL warmup */}

        {/* Pre-warmed Lungs GazeMode - always mounted to prevent WebGL lag on first breathwork visit */}
        {/* Hidden when not in breathwork view, but WebGL context stays warm */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: view === 'breathwork' ? 1 : 0,
          pointerEvents: view === 'breathwork' ? 'auto' : 'none',
          zIndex: view === 'breathwork' ? 2 : -1,
        }}>
          <BreathworkView
            breathSession={breathSession}
            breathTechniques={breathTechniques}
            startBreathSession={startBreathSession}
            stopBreathSession={stopBreathSession}
            primaryHue={primaryHue}
            primaryColor={primaryColor}
            isActive={view === 'breathwork'}
          />
        </div>

        {/* Hum Mode - Generative ambient soundscape (always mounted to keep audio playing) */}
        <div style={{
          opacity: !showIntro ? visualOpacity : 0,
          transition: 'opacity 1.5s ease-out',
        }}>
          <DroneMode
            ref={droneModeRef}
            primaryHue={primaryHue}
            primaryColor={primaryColor}
            backgroundMode={view !== 'hum'}
            onSamplesReady={handleSamplesReady}
            currentKey={sharedKey}
            onKeyChange={setSharedKey}
            droneEnabled={sharedDroneEnabled}
            onDroneToggle={setSharedDroneEnabled}
          />
        </div>
        {/* Filter View */}
        {view === 'filter' && (
          <main style={{ position: 'absolute', top: '80px', left: 0, right: 0, bottom: 0, zIndex: 2, padding: '2rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              {/* Saved toggle */}
              <button
                onClick={() => setTimeout(() => setShowSavedOnly(!showSavedOnly), 80)}
                style={{
                  display: 'block',
                  margin: '0 auto 3rem',
                  background: 'transparent',
                  border: 'none',
                  color: showSavedOnly ? primaryColor : currentTheme.textMuted,
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.5s ease',
                  opacity: showSavedOnly ? 1 : 0.6,
                  letterSpacing: '0.1em',
                }}
              >
                ♡ saved only
              </button>

              {/* Schools */}
              <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: currentTheme.textMuted, marginBottom: '1.5rem', textAlign: 'center', fontWeight: 400 }}>schools of thought</h2>
              {selectedSchools.size > 0 && (
                <button onClick={() => setTimeout(() => setSelectedSchools(new Set()), 80)} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: `${primaryColor}80`, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em' }}>clear</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '3rem' }}>
                {allSchools.map(school => {
                  const isSelected = selectedSchools.has(school);
                  return (
                    <button
                      key={school}
                      onClick={() => setTimeout(() => toggleSchool(school), 80)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isSelected ? primaryColor : currentTheme.textMuted,
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.5s ease',
                        opacity: isSelected ? 1 : 0.6,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {school}
                    </button>
                  );
                })}
              </div>

              {/* Themes */}
              <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: currentTheme.textMuted, marginBottom: '1.5rem', textAlign: 'center', fontWeight: 400 }}>themes</h2>
              {selectedThemes.size > 0 && (
                <button onClick={() => setTimeout(() => setSelectedThemes(new Set()), 80)} style={{ display: 'block', margin: '0 auto 1.5rem', background: 'none', border: 'none', color: `${primaryColor}80`, fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em' }}>clear</button>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
                {allThemes.map(theme => {
                  const isSelected = selectedThemes.has(theme);
                  return (
                    <button
                      key={theme}
                      onClick={() => setTimeout(() => toggleTheme(theme), 80)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isSelected ? primaryColor : currentTheme.textMuted,
                        padding: '0.4rem 0.6rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.5s ease',
                        opacity: isSelected ? 1 : 0.5,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {theme}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setTimeout(() => setView('scroll'), 80)}
                style={{
                  display: 'block',
                  margin: '3rem auto 0',
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme.textMuted,
                  padding: '1rem 2rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  transition: 'all 0.5s ease',
                }}
              >
                return
              </button>
            </div>
          </main>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `${currentTheme.text}15`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${currentTheme.border}`,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            color: currentTheme.text,
            fontSize: '0.85rem',
            zIndex: 200,
            animation: 'fadeIn 0.5s ease',
          }}>
            {toast}
          </div>
        )}

        {/* Color Overlay - triggered by tapping STILL logo */}
        {showColorOverlay && (
          <div
            onClick={() => setShowColorOverlay(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.92)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.5rem',
              animation: 'colorOverlayIn 0.6s ease-out',
            }}
          >
            {COLOR_PRESETS.map((preset, i) => (
              <button
                key={preset.hue}
                onClick={(e) => {
                  e.stopPropagation();
                  haptic.tap();
                  const newSettings = { ...settings, primaryHue: preset.hue };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                  setTimeout(() => setShowColorOverlay(false), 500);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: primaryHue === preset.hue
                    ? `hsl(${preset.hue}, 52%, 68%)`
                    : 'rgba(255, 255, 255, 0.25)',
                  fontSize: '1.1rem',
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 300,
                  letterSpacing: '0.3em',
                  textTransform: 'lowercase',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  transition: 'all 0.5s ease',
                  opacity: 0,
                  animation: `colorWordIn 0.6s ease-out ${0.1 + i * 0.08}s forwards`,
                }}
              >
                {preset.name}
              </button>
            ))}

            {/* Gestures info section */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                marginTop: '1rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                opacity: 0,
                animation: `colorWordIn 0.6s ease-out ${0.1 + COLOR_PRESETS.length * 0.08}s forwards`,
              }}
            >
              <div style={{
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '0.65rem',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}>
                gestures
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8rem',
                fontFamily: '"Jost", sans-serif',
                textAlign: 'center',
              }}>
                <div>swipe up — options</div>
                <div>tap instrument name — change sound</div>
                <div>touch + drag — interact</div>
              </div>
              <div style={{
                marginTop: '1.5rem',
                color: `hsla(${primaryHue}, 52%, 68%, 0.8)`,
                fontSize: '1rem',
                fontFamily: '"Jost", sans-serif',
                fontWeight: 300,
                letterSpacing: '0.15em',
                textAlign: 'center',
              }}>
                feel and explore
              </div>
            </div>
          </div>
        )}

        </div>{/* End visual content wrapper */}

        {/* Styles */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
          html, body { overflow: hidden; }
          ::selection { background: rgba(232, 180, 184, 0.3); }
          @keyframes twinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.5; } }
          @keyframes scrollPulse { 0%, 100% { opacity: 0.4; transform: scaleY(1); } 50% { opacity: 0.8; transform: scaleY(1.2); } }
          @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
          @keyframes colorOverlayIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes colorWordIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
          @keyframes fadeInSmooth { from { opacity: 0; } to { opacity: 1; } }
          @keyframes stillPulse { 0%, 100% { text-shadow: 0 0 0 transparent; opacity: 0.7; transform: scale(1); } 50% { text-shadow: 0 0 15px rgba(127, 219, 202, 0.8), 0 0 30px rgba(127, 219, 202, 0.5); opacity: 1; transform: scale(1.04); } }
          .still-pulse { animation: stillPulse 3s ease-in-out infinite; display: inline-block; }
          @keyframes menuFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes menuItemReveal { from { opacity: 0; transform: translateY(-6px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .mode-menu-item:hover { background: rgba(255, 255, 255, 0.08) !important; }
          @keyframes modeTextSlide { 0% { opacity: 0; } 40% { opacity: 1; } 60% { opacity: 1; } 100% { opacity: 0; } }
          @keyframes settingsHintPulse { 0% { opacity: 0; transform: translateY(-5px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-5px); } }
          .settings-hint-show { animation: settingsHintPulse 4s ease-in-out forwards; }
          .settings-hint-hide { opacity: 0; }
          @keyframes introTitleGlow { 0%, 100% { text-shadow: 0 0 40px rgba(127, 200, 180, 0.4), 0 0 80px rgba(127, 200, 180, 0.2); } 50% { text-shadow: 0 0 60px rgba(127, 200, 180, 0.7), 0 0 120px rgba(127, 200, 180, 0.4); } }
          .intro-title-glow { animation: introTitleGlow 4s ease-in-out infinite; }
          @keyframes introTouchPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
          .intro-touch-pulse { animation: introTouchPulse 2.5s ease-in-out infinite; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 2px; }
          .nav-label { display: none; }
          button:hover { filter: brightness(1.1); }
          input[type="range"] {
            -webkit-appearance: none;
            height: 4px;
            border-radius: 2px;
            background: rgba(128,128,128,0.3);
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #E8E6E3;
            cursor: pointer;
          }
        `}</style>
      </div>
    </>
  );
}

export default Still;
