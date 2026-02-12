import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { allQuotes, allThemes, allSchools } from './data/quotes';
import { breathTechniques } from './data/breathTechniques';
import { haptic } from './config/haptic';
import GazeMode from './components/GazeMode';


// Gaze modes inlined to avoid importing constants.js which pulls in THREE at startup
const gazeModes = [
  { key: 'geometry', name: 'Torus' },
  { key: 'ripples', name: 'Ripples' },
  { key: 'fern', name: 'Fern' },
  { key: 'oceanusProfundus', name: 'Deep Ocean' },
  { key: 'dandelion', name: 'Dandelion' },
  { key: 'fungusDimensio', name: 'Mycelium' },
  { key: 'maloka', name: 'Maloka' },
  { key: 'machinaTemporis', name: 'Clockwork' },
  { key: 'tree', name: 'Branches' },
  { key: 'underwater', name: 'Abyss' },
  { key: 'lavaTouch', name: 'Lava Lamp' },
  { key: 'jellyfish2d', name: 'Drift' },
  { key: 'portaDimensionum', name: 'Portal' },
  { key: 'mountains', name: 'Mountains' },
];

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
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
};

// ============================================================================
// SETTINGS
// ============================================================================

const defaultSettings = {
  theme: 'void',
  reducedMotion: false,
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
  SETTINGS: 'still_settings',
};

// ============================================================================
// UTILITIES
// ============================================================================

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
  const wasActiveRef = useRef(false);
  const phaseTransitionRef = useRef(null);

  // Reset breath session when view becomes active
  useEffect(() => {
    // Only trigger when transitioning from inactive to active
    if (isActive && !wasActiveRef.current) {
      stopBreathSession();
    }
    wasActiveRef.current = isActive;
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
  const [view, setView] = useState('hum'); // Start with music/handpan
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [showColorOverlay, setShowColorOverlay] = useState(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const [showSettingsHint, setShowSettingsHint] = useState(false);
  const [gazeVisual, setGazeVisual] = useState('jellyfish2d'); // Drift mode

  // Shared drone state - one drone controlled by all modes
  const [sharedKey, setSharedKey] = useState(5); // F default
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

  const containerRef = useRef(null);

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
    setSettings(loadSettings());
  }, []);

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
        style={{
          minHeight: '100vh',
          height: '100vh',
          overflow: 'hidden',
          background: currentTheme.bg,
          color: currentTheme.text,
          fontFamily: '"Jost", sans-serif',
          position: 'relative',
          transition: 'background 0.5s ease',
        }}
      >
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
              gap: 'clamp(1rem, 3vh, 2.5rem)',
              padding: '2rem 1rem',
              overflowY: 'auto',
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
                marginTop: 'clamp(0.5rem, 2vh, 1rem)',
                paddingTop: 'clamp(1rem, 2vh, 2rem)',
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
