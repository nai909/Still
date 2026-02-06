import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';
import { haptic } from '../config/haptic';
import {
  PALETTE,
  BREATH_CYCLE,
  BREATH_SPEED,
  gazeModes,
  gazeShapes,
  isMobile,
  MOBILE_SPEED,
  MOBILE_PARTICLES,
  MOBILE_PIXEL_RATIO
} from '../config/constants';
import { breathTechniques } from '../data/breathTechniques';

const { useState, useEffect, useRef, useCallback } = React;

function GazeMode({ theme, primaryHue = 162, onHueChange, backgroundMode = false, currentVisual, onVisualChange, breathSession = null, externalTouchRef = null }) {
  // Use primaryHue throughout for consistent color scheme
  const hue = primaryHue;
  // Background mode: dimmer, slower, no interaction
  const bgOpacity = 1; // Always full opacity
  const bgSpeed = backgroundMode ? 0.3 : 1;
  const containerRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const particleCanvasRef = React.useRef(null);
  const particlesRef = React.useRef([]);
  const frameRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const meshRef = React.useRef(null);
  const clockRef = React.useRef(null);

  // Spring physics for fluid breathing animation
  const scaleRef = React.useRef(1);
  const scaleVelocityRef = React.useRef(0);

  // Keep external breathSession prop in a ref for access in animation loops
  const externalBreathSessionRef = React.useRef(breathSession);
  externalBreathSessionRef.current = breathSession;

  // Use prop if provided, otherwise use internal state
  const [internalMode, setInternalMode] = React.useState('geometry');
  const currentMode = currentVisual !== undefined ? currentVisual : internalMode;
  const setCurrentMode = onVisualChange !== undefined ? onVisualChange : setInternalMode;
  const [currentShape, setCurrentShape] = React.useState('torus');
  const [showUI, setShowUI] = React.useState(false);
  const [selectedTechnique, setSelectedTechnique] = React.useState('relaxation');
  const [showVisualToast, setShowVisualToast] = React.useState(false);
  const toastTimeoutRef = React.useRef(null);

  // Reset scale refs when visual mode changes to prevent fast zoom animation
  React.useEffect(() => {
    scaleRef.current = 1.0;
    scaleVelocityRef.current = 0;
  }, [currentMode]);

  // Breath session state for technique-based breathing
  const breathSessionRef = React.useRef({
    startTime: Date.now(),
    phaseIndex: 0,
    phaseStartTime: Date.now(),
  });

  // State for breath indicator display
  const [breathDisplay, setBreathDisplay] = React.useState({ phase: 0.5, phaseLabel: 'inhale', isHolding: false });

  // ========== TOUCH INTERACTION SYSTEM ==========
  const touchPointsRef = React.useRef([]);
  const ripplesRef = React.useRef([]);
  const swipeStartRef = React.useRef(null);
  const wheelAccumRef = React.useRef(0);
  const wheelTimeoutRef = React.useRef(null);

  // Merge external touches (from parent component like DroneMode)
  React.useEffect(() => {
    if (!externalTouchRef) return;
    const interval = setInterval(() => {
      const touches = externalTouchRef.current || [];
      touches.forEach(touch => {
        const existing = touchPointsRef.current.find(p => p.id === touch.id);
        if (!existing) {
          touchPointsRef.current.push({
            id: touch.id,
            x: touch.x,
            y: touch.y,
            startX: touch.x,
            startY: touch.y,
            velocity: { x: 0, y: 0 },
            active: true,
            startTime: Date.now(),
          });
          // Create ripple for external touches
          ripplesRef.current.push({
            x: touch.x,
            y: touch.y,
            startTime: Date.now(),
            duration: 1500,
            maxRadius: 100,
          });
        }
      });
      // Mark old external touches as inactive
      externalTouchRef.current = touches.filter(t => Date.now() - t.time < 100);
    }, 16);
    return () => clearInterval(interval);
  }, [externalTouchRef]);

  // Cycle to next/previous visual
  const cycleVisual = React.useCallback((direction) => {
    if (backgroundMode) return; // No cycling in background mode
    const currentIndex = gazeModes.findIndex(m => m.key === currentMode);
    let newIndex;
    if (direction > 0) {
      newIndex = (currentIndex + 1) % gazeModes.length;
    } else {
      newIndex = (currentIndex - 1 + gazeModes.length) % gazeModes.length;
    }
    setCurrentMode(gazeModes[newIndex].key);
    setShowVisualToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowVisualToast(false), 1500);
  }, [currentMode, backgroundMode]);

  // Track touch/mouse positions with spring physics
  // Ref to track pending haptic timeout
  const pendingHapticRef = useRef(null);

  const handleInteractionStart = React.useCallback((e) => {
    if (backgroundMode || showUI) return; // No interaction in background mode
    e.preventDefault();
    const touches = e.touches ? Array.from(e.touches) : [{ clientX: e.clientX, clientY: e.clientY, identifier: 'mouse' }];

    // Track swipe start for first touch
    if (touches.length === 1) {
      swipeStartRef.current = { x: touches[0].clientX, y: touches[0].clientY, time: Date.now() };
    }

    touches.forEach(touch => {
      const existing = touchPointsRef.current.find(p => p.id === touch.identifier);
      if (!existing) {
        // Delayed haptic feedback (except lavaTouch which has its own haptics)
        // Wait briefly to see if this is a swipe before triggering haptic
        if (currentMode !== 'lavaTouch') {
          // Clear any existing pending haptic
          if (pendingHapticRef.current) {
            clearTimeout(pendingHapticRef.current);
          }
          pendingHapticRef.current = setTimeout(() => {
            haptic.tap();
            pendingHapticRef.current = null;
          }, 60); // 60ms delay - imperceptible for taps, enough to detect swipes
        }
        touchPointsRef.current.push({
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          startX: touch.clientX,
          startY: touch.clientY,
          velocity: { x: 0, y: 0 },
          active: true,
          startTime: Date.now(),
        });
        // Create ripple
        ripplesRef.current.push({
          x: touch.clientX,
          y: touch.clientY,
          startTime: Date.now(),
          maxRadius: 150,
          duration: 1000,
        });
      }
    });
  }, [backgroundMode, showUI, currentMode]);

  const handleInteractionMove = React.useCallback((e) => {
    if (backgroundMode || showUI) return;
    const touches = e.touches ? Array.from(e.touches) : [{ clientX: e.clientX, clientY: e.clientY, identifier: 'mouse' }];
    touches.forEach(touch => {
      const point = touchPointsRef.current.find(p => p.id === touch.identifier);
      if (point) {
        // Cancel pending haptic if significant movement detected (it's a swipe, not a tap)
        if (pendingHapticRef.current) {
          const deltaX = Math.abs(touch.clientX - point.startX);
          const deltaY = Math.abs(touch.clientY - point.startY);
          if (deltaX > 15 || deltaY > 15) {
            clearTimeout(pendingHapticRef.current);
            pendingHapticRef.current = null;
          }
        }
        point.velocity.x = touch.clientX - point.x;
        point.velocity.y = touch.clientY - point.y;
        point.x = touch.clientX;
        point.y = touch.clientY;
      }
    });
  }, [backgroundMode, showUI]);

  const handleInteractionEnd = React.useCallback((e) => {
    if (backgroundMode) return; // No gesture handling in background mode
    const touches = e.changedTouches ? Array.from(e.changedTouches) : [{ identifier: 'mouse', clientX: e.clientX, clientY: e.clientY }];

    // Check for swipe gesture
    if (swipeStartRef.current && touches.length === 1) {
      const endX = touches[0].clientX;
      const endY = touches[0].clientY;
      const deltaX = endX - swipeStartRef.current.x;
      const deltaY = endY - swipeStartRef.current.y;
      const deltaTime = Date.now() - swipeStartRef.current.time;

      const minSwipeDistance = 60;
      const maxSwipeTime = 400;

      // Detect horizontal swipe: change visual
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < maxSwipeTime) {
        // Cancel any pending haptic since this was a swipe
        if (pendingHapticRef.current) {
          clearTimeout(pendingHapticRef.current);
          pendingHapticRef.current = null;
        }
        // Clear touch points before switching to prevent jarring movement on new visual
        touchPointsRef.current = [];
        cycleVisual(deltaX > 0 ? -1 : 1); // Swipe left = next, swipe right = previous
        swipeStartRef.current = null;
        return; // Don't process further
      }

      swipeStartRef.current = null;
    }

    touches.forEach(touch => {
      const point = touchPointsRef.current.find(p => p.id === touch.identifier);
      if (point) {
        point.active = false;
        point.endTime = Date.now();
      }
    });
    // Clean up old inactive points after decay
    setTimeout(() => {
      touchPointsRef.current = touchPointsRef.current.filter(p => p.active || Date.now() - p.endTime < 2000);
    }, 2000);
  }, [backgroundMode, cycleVisual, showUI]);

  // Two-finger swipe (wheel event on trackpad) to change visuals or open menu
  const showUIRef = React.useRef(showUI);
  showUIRef.current = showUI;
  const backgroundModeRef = React.useRef(backgroundMode);
  backgroundModeRef.current = backgroundMode;
  const wheelAccumXRef = React.useRef(0);

  React.useEffect(() => {
    // Skip wheel handling in background mode
    if (backgroundMode) return;

    const handleWheel = (e) => {
      // When menu is open, let scroll pass through naturally
      if (showUIRef.current) return;

      // Track both horizontal and vertical scroll
      wheelAccumRef.current += e.deltaY;
      wheelAccumXRef.current += e.deltaX;

      clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumRef.current = 0;
        wheelAccumXRef.current = 0;
      }, 200);

      const threshold = 50;

      // Horizontal swipe = change visual
      if (Math.abs(wheelAccumXRef.current) > threshold) {
        e.preventDefault();
        // Clear touch points before switching to prevent jarring movement on new visual
        touchPointsRef.current = [];
        cycleVisual(wheelAccumXRef.current > 0 ? 1 : -1); // Swipe right = next, left = previous
        wheelAccumXRef.current = 0;
        wheelAccumRef.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [backgroundMode, cycleVisual]);

  // Window-level touch event listeners for reliable mobile touch handling
  React.useEffect(() => {
    const handleWindowTouchStart = (e) => {
      if (backgroundModeRef.current || showUIRef.current) return;
      const touches = Array.from(e.touches);

      // Track swipe start for first touch
      if (touches.length === 1) {
        swipeStartRef.current = { x: touches[0].clientX, y: touches[0].clientY, time: Date.now() };
      }

      touches.forEach(touch => {
        const existing = touchPointsRef.current.find(p => p.id === touch.identifier);
        if (!existing) {
          touchPointsRef.current.push({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            startX: touch.clientX,
            startY: touch.clientY,
            velocity: { x: 0, y: 0 },
            active: true,
            startTime: Date.now(),
          });
          ripplesRef.current.push({
            x: touch.clientX,
            y: touch.clientY,
            startTime: Date.now(),
            maxRadius: 150,
            duration: 1000,
          });
        }
      });
    };

    const handleWindowTouchMove = (e) => {
      if (backgroundModeRef.current || showUIRef.current) return;
      const touches = Array.from(e.touches);
      touches.forEach(touch => {
        const point = touchPointsRef.current.find(p => p.id === touch.identifier);
        if (point) {
          point.velocity.x = touch.clientX - point.x;
          point.velocity.y = touch.clientY - point.y;
          point.x = touch.clientX;
          point.y = touch.clientY;
        }
      });
    };

    const handleWindowTouchEnd = (e) => {
      if (backgroundModeRef.current) return;
      const touches = Array.from(e.changedTouches);

      // Check for swipe gesture
      if (swipeStartRef.current && touches.length === 1) {
        const endX = touches[0].clientX;
        const endY = touches[0].clientY;
        const deltaX = endX - swipeStartRef.current.x;
        const deltaY = endY - swipeStartRef.current.y;
        const deltaTime = Date.now() - swipeStartRef.current.time;

        const minSwipeDistance = 60;
        const maxSwipeTime = 400;

        // Detect horizontal swipe: change visual
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && deltaTime < maxSwipeTime) {
          // Clear touch points before switching to prevent jarring movement on new visual
          touchPointsRef.current = [];
          cycleVisual(deltaX > 0 ? -1 : 1);
          swipeStartRef.current = null;
          return;
        }

        swipeStartRef.current = null;
      }

      touches.forEach(touch => {
        const point = touchPointsRef.current.find(p => p.id === touch.identifier);
        if (point) {
          point.active = false;
          point.endTime = Date.now();
        }
      });

      // Clean up old inactive points after decay
      setTimeout(() => {
        touchPointsRef.current = touchPointsRef.current.filter(p => p.active || Date.now() - p.endTime < 2000);
      }, 2000);
    };

    window.addEventListener('touchstart', handleWindowTouchStart, { passive: true });
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleWindowTouchStart);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [cycleVisual]);

  // Helper: Calculate influence of touch points on a position
  const getInteractionInfluence = React.useCallback((x, y, maxRadius = 200) => {
    let totalInfluence = { x: 0, y: 0, strength: 0 };
    const now = Date.now();

    touchPointsRef.current.forEach(point => {
      const dx = x - point.x;
      const dy = y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxRadius) {
        // Decay strength over time after release
        let strength = 1 - dist / maxRadius;
        if (!point.active) {
          const decay = Math.max(0, 1 - (now - point.endTime) / 1500);
          strength *= decay;
        }
        // Spring-like influence (push away slightly, then pull)
        const angle = Math.atan2(dy, dx);
        totalInfluence.x += Math.cos(angle) * strength * 30;
        totalInfluence.y += Math.sin(angle) * strength * 30;
        totalInfluence.strength = Math.max(totalInfluence.strength, strength);
      }
    });

    return totalInfluence;
  }, []);

  // Helper: Draw ripples on canvas
  const drawRipples = React.useCallback((ctx) => {
    const now = Date.now();
    ripplesRef.current = ripplesRef.current.filter(ripple => {
      const age = now - ripple.startTime;
      if (age > ripple.duration) return false;

      const progress = age / ripple.duration;
      const radius = ripple.maxRadius * progress;
      const opacity = (1 - progress) * 0.4;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, 52%, 68%, ${opacity})`;
      ctx.lineWidth = 2 * (1 - progress);
      ctx.stroke();

      return true;
    });
  }, [hue]);

  // Get breath info based on selected technique
  const getBreathInfo = React.useCallback((elapsed) => {
    const technique = breathTechniques[selectedTechnique];
    if (!technique) {
      const phase = Math.sin(elapsed * BREATH_SPEED) * 0.5 + 0.5;
      return { phase, phaseName: phase > 0.5 ? 'inhale' : 'exhale', phaseLabel: phase > 0.5 ? 'inhale' : 'exhale', isInhaling: phase > 0.5 };
    }

    const phases = technique.phases;
    const totalCycleDuration = phases.reduce((sum, p) => sum + p.duration, 0);
    const cycleTime = elapsed % totalCycleDuration;

    let accumulatedTime = 0;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      if (cycleTime < accumulatedTime + p.duration) {
        const phaseProgress = (cycleTime - accumulatedTime) / p.duration;
        const isInhaling = p.name === 'inhale';
        const isHolding = p.name === 'holdFull' || p.name === 'holdEmpty';

        // Calculate visual phase (0-1) based on breath state
        // Apply smooth easing for natural, calming motion (never linear, never jerky)
        // ease-out cubic for inhale (gentle start, soft landing)
        // ease-in cubic for exhale (slow release, gradual descent)
        let visualPhase;
        if (p.name === 'inhale') {
          // ease-out: starts fast, settles gently into full breath
          visualPhase = 1 - Math.pow(1 - phaseProgress, 3);
        } else if (p.name === 'holdFull') {
          visualPhase = 1;
        } else if (p.name === 'exhale') {
          // ease-in: starts slow, accelerates gently through release
          const easedProgress = Math.pow(phaseProgress, 3);
          visualPhase = 1 - easedProgress;
        } else {
          visualPhase = 0;
        }

        return { phase: visualPhase, phaseName: p.name, phaseLabel: p.label, isInhaling, isHolding, phaseProgress };
      }
      accumulatedTime += p.duration;
    }
    return { phase: 0.5, phaseName: 'inhale', phaseLabel: 'inhale', isInhaling: true };
  }, [selectedTechnique]);

  // Simple phase getter for visuals (returns 0-1)
  // When breathSession is provided (from BreathworkView), use it instead of internal timing
  const getBreathPhase = React.useCallback((elapsed) => {
    // Use external breathSession if provided and active (access via ref for animation loops)
    const session = externalBreathSessionRef.current;
    if (session && session.isActive) {
      const { phase, phaseProgress } = session;
      // Convert phase name to visual phase (0-1)
      if (phase === 'inhale') {
        return phaseProgress; // 0 -> 1
      } else if (phase === 'holdFull') {
        return 1;
      } else if (phase === 'exhale') {
        return 1 - phaseProgress; // 1 -> 0
      } else if (phase === 'holdEmpty') {
        return 0;
      }
      return 0.5;
    }
    // Otherwise use internal breath calculation
    return getBreathInfo(elapsed).phase;
  }, [getBreathInfo]);

  // Update breath display for indicator
  React.useEffect(() => {
    const startTime = Date.now();
    let animFrame;
    const updateBreathDisplay = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const info = getBreathInfo(elapsed);
      setBreathDisplay({ phase: info.phase, phaseLabel: info.phaseLabel, isHolding: info.isHolding || false });
      animFrame = requestAnimationFrame(updateBreathDisplay);
    };
    updateBreathDisplay();
    return () => cancelAnimationFrame(animFrame);
  }, [getBreathInfo]);

  // ========== LUNGS WIREFRAME MODE ==========
  React.useEffect(() => {
    if (currentMode !== 'lungs' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -0.5, 8.5);
    camera.lookAt(0, -0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    // Convert HSL hue to hex color for THREE.js
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };
    const dynamicColor = hslToHex(hue, 52, 68);

    const lungsGroup = new THREE.Group();
    scene.add(lungsGroup);

    // In breathe mode, rotate the lungs to an angled view (locked position)
    if (backgroundMode) {
      lungsGroup.rotation.x = 0.35; // Tilt forward to show top perspective
    }

    const allGeometries = [];
    const allMaterials = [];

    // Wireframe material using user's color scheme
    const createWireMaterial = (opacity = 0.85) => {
      const mat = new THREE.MeshBasicMaterial({
        color: dynamicColor,
        wireframe: true,
        transparent: true,
        opacity: opacity,
      });
      allMaterials.push(mat);
      return mat;
    };

    // ========== TRACHEA ==========
    const tracheaGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 16, 12, true);
    allGeometries.push(tracheaGeo);
    const trachea = new THREE.Mesh(tracheaGeo, createWireMaterial());
    trachea.position.y = 1.6;
    lungsGroup.add(trachea);

    // Trachea rings (cartilage)
    for (let i = 0; i < 8; i++) {
      const ringGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 24);
      allGeometries.push(ringGeo);
      const ring = new THREE.Mesh(ringGeo, createWireMaterial());
      ring.position.y = 2.2 - i * 0.2;
      ring.rotation.x = Math.PI / 2;
      lungsGroup.add(ring);
    }

    // ========== MAIN BRONCHI ==========
    // Left main bronchus
    const leftMainPoints = [
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(-0.2, 0.55, 0),
      new THREE.Vector3(-0.4, 0.25, 0),
      new THREE.Vector3(-0.6, 0, 0),
    ];
    const leftMainCurve = new THREE.CatmullRomCurve3(leftMainPoints);
    const leftMainGeo = new THREE.TubeGeometry(leftMainCurve, 12, 0.07, 12, false);
    allGeometries.push(leftMainGeo);
    lungsGroup.add(new THREE.Mesh(leftMainGeo, createWireMaterial()));

    // Left upper lobe bronchus
    const leftUpperPoints = [
      new THREE.Vector3(-0.6, 0, 0),
      new THREE.Vector3(-0.75, 0.15, 0.02),
      new THREE.Vector3(-0.9, 0.3, 0.03),
      new THREE.Vector3(-1.0, 0.45, 0),
    ];
    const leftUpperCurve = new THREE.CatmullRomCurve3(leftUpperPoints);
    const leftUpperGeo = new THREE.TubeGeometry(leftUpperCurve, 10, 0.05, 10, false);
    allGeometries.push(leftUpperGeo);
    lungsGroup.add(new THREE.Mesh(leftUpperGeo, createWireMaterial()));

    // Left lower lobe bronchus
    const leftLowerPoints = [
      new THREE.Vector3(-0.6, 0, 0),
      new THREE.Vector3(-0.75, -0.2, 0.02),
      new THREE.Vector3(-0.9, -0.4, 0.03),
      new THREE.Vector3(-1.0, -0.55, 0),
    ];
    const leftLowerCurve = new THREE.CatmullRomCurve3(leftLowerPoints);
    const leftLowerGeo = new THREE.TubeGeometry(leftLowerCurve, 10, 0.05, 10, false);
    allGeometries.push(leftLowerGeo);
    lungsGroup.add(new THREE.Mesh(leftLowerGeo, createWireMaterial()));

    // Right main bronchus
    const rightMainPoints = [
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(0.2, 0.6, 0),
      new THREE.Vector3(0.4, 0.35, 0),
      new THREE.Vector3(0.55, 0.15, 0),
    ];
    const rightMainCurve = new THREE.CatmullRomCurve3(rightMainPoints);
    const rightMainGeo = new THREE.TubeGeometry(rightMainCurve, 12, 0.07, 12, false);
    allGeometries.push(rightMainGeo);
    lungsGroup.add(new THREE.Mesh(rightMainGeo, createWireMaterial()));

    // Right upper lobe bronchus
    const rightUpperPoints = [
      new THREE.Vector3(0.55, 0.15, 0),
      new THREE.Vector3(0.7, 0.35, 0.02),
      new THREE.Vector3(0.85, 0.5, 0.02),
      new THREE.Vector3(1.0, 0.6, 0),
    ];
    const rightUpperCurve = new THREE.CatmullRomCurve3(rightUpperPoints);
    const rightUpperGeo = new THREE.TubeGeometry(rightUpperCurve, 10, 0.05, 10, false);
    allGeometries.push(rightUpperGeo);
    lungsGroup.add(new THREE.Mesh(rightUpperGeo, createWireMaterial()));

    // Right middle lobe bronchus
    const rightMiddlePoints = [
      new THREE.Vector3(0.55, 0.15, 0),
      new THREE.Vector3(0.7, 0.05, 0.03),
      new THREE.Vector3(0.9, 0, 0.03),
      new THREE.Vector3(1.05, 0, 0),
    ];
    const rightMiddleCurve = new THREE.CatmullRomCurve3(rightMiddlePoints);
    const rightMiddleGeo = new THREE.TubeGeometry(rightMiddleCurve, 10, 0.045, 10, false);
    allGeometries.push(rightMiddleGeo);
    lungsGroup.add(new THREE.Mesh(rightMiddleGeo, createWireMaterial()));

    // Right lower lobe bronchus
    const rightLowerPoints = [
      new THREE.Vector3(0.55, 0.15, 0),
      new THREE.Vector3(0.65, -0.1, 0.02),
      new THREE.Vector3(0.8, -0.35, 0.02),
      new THREE.Vector3(1.0, -0.55, 0),
    ];
    const rightLowerCurve = new THREE.CatmullRomCurve3(rightLowerPoints);
    const rightLowerGeo = new THREE.TubeGeometry(rightLowerCurve, 10, 0.05, 10, false);
    allGeometries.push(rightLowerGeo);
    lungsGroup.add(new THREE.Mesh(rightLowerGeo, createWireMaterial()));

    // ========== LUNG LOBES ==========
    const createLungLobe = (side, lobeType) => {
      const isLeft = side === 'left';
      const sideDir = isLeft ? -1 : 1;

      let params;
      if (lobeType === 'upper') {
        params = {
          x: sideDir * 1.15,
          y: isLeft ? 0.5 : 0.6,
          scaleX: 0.55,
          scaleY: isLeft ? 0.75 : 0.65,
          scaleZ: 0.4,
        };
      } else if (lobeType === 'middle') {
        params = {
          x: sideDir * 1.2,
          y: 0,
          scaleX: 0.5,
          scaleY: 0.4,
          scaleZ: 0.38,
        };
      } else {
        params = {
          x: sideDir * 1.2,
          y: isLeft ? -0.55 : -0.6,
          scaleX: 0.6,
          scaleY: isLeft ? 0.8 : 0.75,
          scaleZ: 0.45,
        };
      }

      const geo = new THREE.SphereGeometry(1, 24, 18);
      allGeometries.push(geo);
      const positions = geo.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        let x = positions[i];
        let y = positions[i + 1];
        let z = positions[i + 2];

        // Flatten medial side
        if ((isLeft && x > 0) || (!isLeft && x < 0)) {
          x *= 0.5;
        }

        // Bulge on lateral side
        if ((isLeft && x < -0.3) || (!isLeft && x > 0.3)) {
          const bulge = 1 + Math.abs(x) * 0.1;
          z *= bulge;
        }

        // Cardiac notch (left lung only)
        if (isLeft && lobeType === 'lower') {
          const notchX = x + 0.4;
          const notchY = y + 0.3;
          const notchDist = Math.sqrt(notchX * notchX + notchY * notchY);
          const notchDepth = Math.exp(-notchDist * notchDist * 4) * 0.35;
          x += notchDepth;
        }

        // Pointed apex for upper lobes
        if (lobeType === 'upper' && y > 0.6) {
          const taper = 1 - (y - 0.6) * 0.5;
          x *= taper;
          z *= taper;
        }

        // Flatten base for lower lobes
        if (lobeType === 'lower' && y < -0.7) {
          y = -0.7 - (y + 0.7) * 0.3;
        }

        positions[i] = x * params.scaleX;
        positions[i + 1] = y * params.scaleY;
        positions[i + 2] = z * params.scaleZ;
      }

      geo.computeVertexNormals();

      const lobe = new THREE.Mesh(geo, createWireMaterial(0.7));
      lobe.position.set(params.x, params.y, 0);
      lobe.userData = { side, lobeType, baseScale: { ...params } };

      return lobe;
    };

    // Create all 5 lobes
    const leftUpper = createLungLobe('left', 'upper');
    const leftLower = createLungLobe('left', 'lower');
    const rightUpper = createLungLobe('right', 'upper');
    const rightMiddle = createLungLobe('right', 'middle');
    const rightLower = createLungLobe('right', 'lower');

    lungsGroup.add(leftUpper);
    lungsGroup.add(leftLower);
    lungsGroup.add(rightUpper);
    lungsGroup.add(rightMiddle);
    lungsGroup.add(rightLower);

    const allLobes = [leftUpper, leftLower, rightUpper, rightMiddle, rightLower];

    // Position the whole group
    lungsGroup.position.y = -0.3;
    meshRef.current = lungsGroup;

    // Spring physics for smooth breathing (prevents glitching on phase transitions)
    let currentBreath = 0.5;
    let breathVelocity = 0;
    const springStiffness = 0.06;
    const springDamping = 0.85;
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);

      const elapsed = clockRef.current.getElapsedTime();
      const targetBreath = getBreathPhase(elapsed);

      // Spring physics for smooth interpolation
      const breathForce = (targetBreath - currentBreath) * springStiffness;
      breathVelocity = (breathVelocity + breathForce) * springDamping;
      currentBreath += breathVelocity;

      // Touch-responsive rotation (same as Torus)
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          lungsGroup.rotation.y += normalizedX * 0.02;
          lungsGroup.rotation.x += normalizedY * 0.02;
        }
      } else if (!backgroundMode) {
        // Auto-rotate when not touching (only in gaze mode)
        lungsGroup.rotation.y += 0.002;
      }

      // Breathing - expand/contract lobes with smoothed value
      const breathExpand = 0.88 + currentBreath * 0.2;
      const verticalExpand = 1 + currentBreath * 0.1;

      allLobes.forEach(lobe => {
        lobe.scale.set(breathExpand, breathExpand * verticalExpand, breathExpand);
        lobe.material.opacity = 0.5 + currentBreath * 0.35;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      allGeometries.forEach(g => g.dispose());
      allMaterials.forEach(m => m.dispose());
      renderer.dispose();
    };
  }, [currentMode, hue, backgroundMode]);

  // ========== SACRED GEOMETRY MODE (TORUS) ==========
  React.useEffect(() => {
    if (currentMode !== 'geometry' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const shapeConfig = gazeShapes.find(s => s.key === currentShape) || gazeShapes[0];
    const geometry = shapeConfig.create();
    // Convert HSL hue to hex color for THREE.js
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };
    const dynamicColor = hslToHex(hue, 52, 68);
    const material = new THREE.MeshBasicMaterial({ color: dynamicColor, wireframe: true, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Set initial state before first render to avoid any startup artifacts
    mesh.scale.setScalar(1.0);
    mesh.material.opacity = 0.75;
    renderer.render(scene, camera);

    // Spring physics for fluid breathing animation (water-like feel)
    let currentScale = 1.0;
    let scaleVelocity = 0;
    let currentOpacity = 0.75;
    let opacityVelocity = 0;
    const springStiffness = 0.04;
    const springDamping = 0.88;

    let frameCount = 0;
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      frameCount++;

      if (frameCount < 3) {
        renderer.render(scene, camera);
        return;
      }

      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      if (meshRef.current) {
        // Touch-responsive rotation
        if (touchPointsRef.current.length > 0) {
          const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
          if (activeTouch) {
            const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
            const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
            meshRef.current.rotation.y += normalizedX * 0.02;
            meshRef.current.rotation.x += normalizedY * 0.02;
          }
        } else {
          meshRef.current.rotation.y += 0.0004;
          meshRef.current.rotation.x += 0.0002;
        }

        // Breath-synced scale with spring physics
        const targetScale = 0.9 + breath * 0.2;
        const targetOpacity = 0.6 + breath * 0.25;

        const scaleForce = (targetScale - currentScale) * springStiffness;
        scaleVelocity = (scaleVelocity + scaleForce) * springDamping;
        currentScale += scaleVelocity;

        const opacityForce = (targetOpacity - currentOpacity) * springStiffness;
        opacityVelocity = (opacityVelocity + opacityForce) * springDamping;
        currentOpacity += opacityVelocity;

        meshRef.current.scale.setScalar(currentScale);
        meshRef.current.material.opacity = currentOpacity;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [currentMode, currentShape, hue]);

  // ========== FRACTAL TREE MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'tree' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 16);
    camera.lookAt(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    const branches = [];
    const leaves = [];

    // Recursive branch creation - organic, contemplative
    const createBranch = (startPos, direction, length, depth, maxDepth) => {
      if (depth > maxDepth || length < 0.05) return;

      const endPos = startPos.clone().add(direction.clone().multiplyScalar(length));

      // Wireframe branches for ethereal feel
      const branchGeom = new THREE.CylinderGeometry(
        0.015 * (maxDepth - depth + 1) * 0.4,
        0.02 * (maxDepth - depth + 1) * 0.4,
        length,
        6
      );

      const t = depth / maxDepth;
      const branchMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 35 + t * 25, 30 + t * 30),
        transparent: true,
        opacity: 0.5 + t * 0.2,
        wireframe: true
      });

      const branch = new THREE.Mesh(branchGeom, branchMat);
      const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
      branch.position.copy(midPoint);
      branch.lookAt(endPos);
      branch.rotateX(Math.PI / 2);
      branch.userData = { depth, phase: Math.random() * Math.PI * 2 };
      treeGroup.add(branch);
      branches.push(branch);

      // Ethereal leaf orbs at tips
      if (depth >= maxDepth - 2) {
        const leafGeom = new THREE.SphereGeometry(0.06 + Math.random() * 0.03, 8, 8);
        const leafMat = new THREE.MeshBasicMaterial({
          color: hslToHex(hue, 55, 55),
          transparent: true,
          opacity: 0.4
        });
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.copy(endPos);
        leaf.userData = { phase: Math.random() * Math.PI * 2 };
        treeGroup.add(leaf);
        leaves.push(leaf);
      }

      // Organic branching
      const branchAngle = 0.45 + Math.random() * 0.25;
      const newLength = length * (0.68 + Math.random() * 0.12);

      const leftDir = direction.clone();
      leftDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), branchAngle);
      leftDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.4);
      createBranch(endPos.clone(), leftDir, newLength, depth + 1, maxDepth);

      const rightDir = direction.clone();
      rightDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -branchAngle);
      rightDir.applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.4);
      createBranch(endPos.clone(), rightDir, newLength, depth + 1, maxDepth);
    };

    createBranch(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 1.4, 0, 6);

    // Set initial state before first render
    treeGroup.scale.setScalar(1.0);
    renderer.render(scene, camera);

    let frameCount = 0;
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      frameCount++;

      // Skip first few frames to let everything settle
      if (frameCount < 3) {
        renderer.render(scene, camera);
        return;
      }

      const elapsed = clockRef.current.getElapsedTime();

      // Touch-responsive rotation - slow and meditative
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          treeGroup.rotation.y += normalizedX * 0.015;
          treeGroup.rotation.x += normalizedY * 0.008;
        }
      } else {
        // Very gentle auto-rotation when not touching
        treeGroup.rotation.y += 0.0002;
      }

      // Breath-synced scale
      const breath = getBreathPhase(elapsed);
      const targetScale = 0.9 + breath * 0.2;
      treeGroup.scale.setScalar(targetScale);

      // Branches sway with breath
      branches.forEach(branch => {
        const sway = Math.sin(elapsed * 0.1 + branch.userData.depth * 0.2 + branch.userData.phase) * 0.004 * branch.userData.depth;
        branch.rotation.z += sway * 0.05;
        branch.material.opacity = 0.7 + breath * 0.2;
      });

      // Leaves pulse with breath
      leaves.forEach(leaf => {
        const pulse = 0.9 + breath * 0.15 + Math.sin(elapsed * 0.15 + leaf.userData.phase) * 0.05;
        leaf.scale.setScalar(pulse);
        leaf.material.opacity = 0.5 + breath * 0.3;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      branches.forEach(b => { b.geometry.dispose(); b.material.dispose(); });
      leaves.forEach(l => { l.geometry.dispose(); l.material.dispose(); });
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== RIPPLES MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'ripples' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const rippleGroup = new THREE.Group();
    scene.add(rippleGroup);

    // Central breathing sphere
    const coreGeom = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 55, 55),
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    rippleGroup.add(core);

    // Ripple rings (torus shapes)
    const ripples = [];
    const maxRipples = 8;
    let lastBreathPeak = 0;

    const createRipple = () => {
      const rippleGeom = new THREE.TorusGeometry(0.1, 0.02, 8, 64);
      const rippleMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 50, 60),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });
      const ripple = new THREE.Mesh(rippleGeom, rippleMat);
      ripple.rotation.x = Math.PI / 2;
      ripple.userData = { born: clockRef.current.getElapsedTime(), maxAge: 20 };
      rippleGroup.add(ripple);
      ripples.push(ripple);

      if (ripples.length > maxRipples) {
        const old = ripples.shift();
        rippleGroup.remove(old);
        old.geometry.dispose();
        old.material.dispose();
      }
    };

    createRipple();

    let lastRippleTime = 0;

    // Spring physics for fluid breathing animation (water-like feel)
    let currentScale = 1.0;
    let scaleVelocity = 0;
    let currentOpacity = 0.6;
    let opacityVelocity = 0;
    const springStiffness = 0.04; // Gentle stiffness for slow, calming motion
    const springDamping = 0.88; // High damping for smooth settling
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime() * bgSpeed;

      // Spawn ripple at fixed interval - floating in space
      const spawnInterval = backgroundMode ? 12 : 6;
      if (elapsed - lastRippleTime > spawnInterval) {
        createRipple();
        lastRippleTime = elapsed;
      }

      // Touch creates ripples
      touchPointsRef.current.forEach(point => {
        if (point.active && !point.rippleSpawned) {
          createRipple();
          point.rippleSpawned = true;
        }
      });

      // Touch-responsive rotation (slower in background mode)
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          rippleGroup.rotation.y += normalizedX * 0.02 * bgSpeed;
          rippleGroup.rotation.x += normalizedY * 0.01 * bgSpeed;
        }
      } else {
        rippleGroup.rotation.y += 0.00015 * bgSpeed;
      }

      // Breath-synced core with spring physics for fluid motion
      const breath = getBreathPhase(elapsed);
      const targetScale = 0.85 + breath * 0.3;
      const targetOpacity = 0.5 + breath * 0.35;

      // Spring physics: smooth interpolation toward target (feels like water)
      const scaleForce = (targetScale - currentScale) * springStiffness;
      scaleVelocity = (scaleVelocity + scaleForce) * springDamping;
      currentScale += scaleVelocity;

      const opacityForce = (targetOpacity - currentOpacity) * springStiffness;
      opacityVelocity = (opacityVelocity + opacityForce) * springDamping;
      currentOpacity += opacityVelocity;

      core.scale.setScalar(currentScale);
      coreMat.opacity = currentOpacity;

      // Animate ripples expanding outward (slower in background mode)
      const realElapsed = clockRef.current.getElapsedTime();
      ripples.forEach(ripple => {
        const age = (realElapsed - ripple.userData.born) * bgSpeed;
        const progress = age / ripple.userData.maxAge;

        if (progress < 1) {
          const radius = 0.3 + progress * 3;
          ripple.scale.set(radius / 0.1, radius / 0.1, 1);
          ripple.material.opacity = (1 - progress) * 0.5;
          ripple.position.y = Math.sin(progress * Math.PI) * 0.2;
        }
      });

      // Clean up old ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const age = (realElapsed - ripples[i].userData.born) * bgSpeed;
        if (age > ripples[i].userData.maxAge) {
          rippleGroup.remove(ripples[i]);
          ripples[i].geometry.dispose();
          ripples[i].material.dispose();
          ripples.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      coreGeom.dispose(); coreMat.dispose();
      ripples.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== FERN MODE (3D Barnsley Fern) ==========
  React.useEffect(() => {
    if (currentMode !== 'fern' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 9);
    camera.lookAt(0, 2.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const fernGroup = new THREE.Group();
    scene.add(fernGroup);

    // Barnsley fern transformation matrices
    const transforms = [
      { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, p: 0.01 },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, p: 0.85 },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07 },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07 },
    ];

    // Generate fern points
    const pointCount = 15000;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);
    let x = 0, y = 0;

    for (let i = 0; i < pointCount; i++) {
      const r = Math.random();
      let t;
      if (r < transforms[0].p) t = transforms[0];
      else if (r < transforms[0].p + transforms[1].p) t = transforms[1];
      else if (r < transforms[0].p + transforms[1].p + transforms[2].p) t = transforms[2];
      else t = transforms[3];

      const nx = t.a * x + t.b * y + t.e;
      const ny = t.c * x + t.d * y + t.f;
      x = nx; y = ny;

      // Scale and position
      const scale = 0.5;
      positions[i * 3] = x * scale + (Math.random() - 0.5) * 0.02;
      positions[i * 3 + 1] = y * scale;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      // Color based on height
      const heightRatio = y / 10;
      const color = new THREE.Color().setHSL(hue / 360, 0.4 + heightRatio * 0.2, 0.35 + heightRatio * 0.25);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const fernGeom = new THREE.BufferGeometry();
    fernGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fernGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const fernMat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const fern = new THREE.Points(fernGeom, fernMat);
    fernGroup.add(fern);

    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Touch-responsive rotation
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          fernGroup.rotation.y += normalizedX * 0.02;
          fernGroup.rotation.x += normalizedY * 0.01;
        }
      } else {
        // Gentle auto-rotation when not touching
        fernGroup.rotation.y += 0.0004;
      }

      // Breath-synced sway
      const breath = getBreathPhase(elapsed);
      const sway = Math.sin(elapsed * 0.15) * 0.02 + breath * 0.015;
      fernGroup.rotation.z = sway;

      // Breath-synced scale
      const targetScale = 0.9 + breath * 0.2;
      fernGroup.scale.setScalar(targetScale);

      // Breath-synced opacity
      fernMat.opacity = 0.65 + breath * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      fernGeom.dispose();
      fernMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== DANDELION MODE (3D with breath-synced seed release) ==========
  React.useEffect(() => {
    if (currentMode !== 'dandelion' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const dandelionGroup = new THREE.Group();
    scene.add(dandelionGroup);

    // Stem
    const stemGeom = new THREE.CylinderGeometry(0.02, 0.03, 3, 8);
    const stemMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 30, 35),
      transparent: true,
      opacity: 0.6
    });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.y = -1.5;
    dandelionGroup.add(stem);

    // Seed head core
    const coreGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 25, 45),
      transparent: true,
      opacity: 0.7
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    dandelionGroup.add(core);

    // Seeds (attached)
    const seedCount = 50;
    const seeds = [];
    const floatingSeeds = [];

    for (let i = 0; i < seedCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / seedCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const seedGroup = new THREE.Group();

      // Pappus (fluffy filaments)
      const filamentCount = 8;
      for (let j = 0; j < filamentCount; j++) {
        const fTheta = (j / filamentCount) * Math.PI * 2;
        const lineGeom = new THREE.BufferGeometry();
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(fTheta) * 0.15, 0.08, Math.sin(fTheta) * 0.15)
        ];
        lineGeom.setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: hslToHex(hue, 40, 70),
          transparent: true,
          opacity: 0.5
        });
        const line = new THREE.Line(lineGeom, lineMat);
        seedGroup.add(line);
      }

      // Position on sphere
      seedGroup.position.set(
        Math.sin(phi) * Math.cos(theta) * 0.5,
        Math.cos(phi) * 0.5,
        Math.sin(phi) * Math.sin(theta) * 0.5
      );
      seedGroup.lookAt(0, 0, 0);
      seedGroup.rotateX(Math.PI);

      seedGroup.userData = {
        attached: true,
        phi, theta,
        velocity: new THREE.Vector3(),
        phase: Math.random() * Math.PI * 2
      };

      dandelionGroup.add(seedGroup);
      seeds.push(seedGroup);
    }

    let lastSeedRelease = 0;
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Touch-responsive rotation - slow and meditative
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          dandelionGroup.rotation.y += normalizedX * 0.015;
          dandelionGroup.rotation.x += normalizedY * 0.008;

          // Release seeds when touched
          seeds.forEach(seed => {
            if (seed.userData.attached) {
              const screenPos = seed.position.clone().applyMatrix4(dandelionGroup.matrixWorld);
              screenPos.project(camera);
              const screenX = (screenPos.x + 1) / 2 * window.innerWidth;
              const screenY = (-screenPos.y + 1) / 2 * window.innerHeight;

              const dx = activeTouch.x - screenX;
              const dy = activeTouch.y - screenY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 100) { // Larger touch radius
                seed.userData.attached = false;
                seed.userData.velocity.set(
                  (Math.random() - 0.5) * 0.012,
                  0.006 + Math.random() * 0.006,
                  (Math.random() - 0.5) * 0.012
                );
                floatingSeeds.push(seed);
              }
            }
          });
        }
      } else {
        // Very gentle auto-rotation when not touching
        dandelionGroup.rotation.y += 0.0002;
      }

      // Release seeds slowly over time - floating in space
      if (elapsed - lastSeedRelease > 5) {
        const attached = seeds.filter(s => s.userData.attached);
        if (attached.length > 0) {
          const toRelease = attached.slice(0, 1);
          toRelease.forEach(seed => {
            seed.userData.attached = false;
            seed.userData.velocity.set(
              (Math.random() - 0.5) * 0.006,
              0.003 + Math.random() * 0.003,
              (Math.random() - 0.5) * 0.006
            );
            floatingSeeds.push(seed);
          });
        }
        lastSeedRelease = elapsed;
      }

      // Breath-synced scale
      const breath = getBreathPhase(elapsed);
      const targetScale = 0.9 + breath * 0.2;
      dandelionGroup.scale.setScalar(targetScale);

      // Animate attached seeds - sway with breath
      seeds.forEach(seed => {
        if (seed.userData.attached) {
          const sway = Math.sin(elapsed * 0.1 + seed.userData.phase) * 0.01 + breath * 0.01;
          seed.rotation.z = sway;
          seed.children.forEach(child => {
            if (child.material) {
              child.material.opacity = 0.5 + breath * 0.3;
            }
          });
        }
      });

      // Animate floating seeds - drift upward very slowly
      floatingSeeds.forEach(seed => {
        seed.position.add(seed.userData.velocity);
        seed.userData.velocity.y += 0.00004; // Very gentle lift
        seed.userData.velocity.x += Math.sin(elapsed + seed.userData.phase) * 0.00008;
        seed.rotation.y += 0.0015;

        // Fade out as they rise
        const fadeStart = 2;
        const opacity = Math.max(0, 0.5 - (seed.position.y - fadeStart) * 0.1);
        seed.children.forEach(child => {
          if (child.material) child.material.opacity = opacity;
        });
      });

      // Reset when all seeds gone
      if (seeds.every(s => !s.userData.attached) && floatingSeeds.every(s => s.position.y > 5)) {
        seeds.forEach((seed, i) => {
          seed.userData.attached = true;
          const phi = seed.userData.phi;
          const theta = seed.userData.theta;
          seed.position.set(
            Math.sin(phi) * Math.cos(theta) * 0.5,
            Math.cos(phi) * 0.5,
            Math.sin(phi) * Math.sin(theta) * 0.5
          );
          seed.lookAt(0, 0, 0);
          seed.rotateX(Math.PI);
        });
        floatingSeeds.length = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      stemGeom.dispose(); stemMat.dispose();
      coreGeom.dispose(); coreMat.dispose();
      seeds.forEach(s => s.children.forEach(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }));
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== SUCCULENT SPIRAL (3D Fibonacci) ==========
  React.useEffect(() => {
    if (currentMode !== 'succulent' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const succulentGroup = new THREE.Group();
    scene.add(succulentGroup);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const leafCount = 60;
    const leaves = [];

    for (let i = 0; i < leafCount; i++) {
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i) * 0.12;
      const height = i * 0.015;

      // Leaf shape - elongated sphere
      const t = i / leafCount;
      const leafSize = 0.08 + (1 - t) * 0.06;
      const leafGeom = new THREE.SphereGeometry(leafSize, 8, 6);
      leafGeom.scale(0.6, 1, 0.4);

      const leafMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 45 + (1 - t) * 15, 35 + (1 - t) * 25),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });

      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      leaf.rotation.y = -angle;
      leaf.rotation.x = 0.3 + t * 0.4;

      leaf.userData = { angle, baseRadius: radius, baseHeight: height, phase: i * 0.1 };
      succulentGroup.add(leaf);
      leaves.push(leaf);
    }

    // Center core
    const coreGeom = new THREE.SphereGeometry(0.08, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 50, 60),
      transparent: true,
      opacity: 0.7
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.y = leafCount * 0.015 + 0.05;
    succulentGroup.add(core);

    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Touch-responsive rotation - slow and meditative
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          succulentGroup.rotation.y += normalizedX * 0.015;
          succulentGroup.rotation.x += normalizedY * 0.008;
        }
      } else {
        // Very gentle auto-rotation when not touching
        succulentGroup.rotation.y += 0.0003;
      }

      // Breath-synced scale
      const breath = getBreathPhase(elapsed);
      const targetScale = 0.9 + breath * 0.2;
      succulentGroup.scale.setScalar(targetScale);

      // Leaves pulse with breath
      leaves.forEach((leaf) => {
        const pulse = 0.9 + breath * 0.15 + Math.sin(elapsed * 0.1 + leaf.userData.phase) * 0.02;
        leaf.scale.setScalar(pulse);
        leaf.material.opacity = 0.55 + breath * 0.3;
      });

      core.scale.setScalar(0.9 + breath * 0.2);
      coreMat.opacity = 0.55 + breath * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      leaves.forEach(l => { l.geometry.dispose(); l.material.dispose(); });
      coreGeom.dispose(); coreMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== JELLYFISH MODE (THREE.JS 3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'jellyfish' || !containerRef.current) return;

    // === COLOR SCHEME (dynamic based on hue) ===
    // Convert HSL to hex for THREE.js
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const COLORS = {
      bell: new THREE.Color(hslToHex(hue, 52, 68)),        // Main color
      tentacle: new THREE.Color(hslToHex(hue, 50, 45)),    // Slightly darker
      accent: new THREE.Color(hslToHex(hue, 60, 80)),      // Brighter accent
      dim: new THREE.Color(hslToHex(hue, 40, 20)),         // Dark version
      background: new THREE.Color('#000000')
    };

    // === STATE ===
    let breathPhase = 'exhale';
    let breathProgress = 1.0;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastInteractionTime = Date.now();
    let isAutoRotating = false;
    let mousePos = new THREE.Vector2();
    let mouse3D = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const clock = new THREE.Clock();
    let bellFlashIntensity = 0;

    // Spring physics for fluid breathing
    let springScaleY = 1.075; // Match target at breath=0.5
    let springScaleXZ = 0.96; // Match target at breath=0.5
    let springVelocityY = 0;
    let springVelocityXZ = 0;
    let springZ = 0;
    let springVelocityZ = 0;

    // === SCENE SETUP ===
    const scene = new THREE.Scene();
    scene.background = COLORS.background;

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';

    // === ORBIT CONTROLS ===
    let controls = null;
    if (OrbitControls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.25;
      controls.minDistance = 1;
      controls.maxDistance = 15;
      controls.enablePan = true;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.3;
    }

    // === JELLYFISH GROUP ===
    const jellyfishGroup = new THREE.Group();
    scene.add(jellyfishGroup);

    // === BELL GEOMETRY (Parametric hemisphere with ruffled edge) ===
    const bellGeometry = new THREE.BufferGeometry();
    const bellSegments = 64;
    const bellRings = 32;
    const bellVertices = [];
    const bellIndices = [];
    const bellUvs = [];

    for (let ring = 0; ring <= bellRings; ring++) {
      const phi = (ring / bellRings) * Math.PI * 0.5; // Hemisphere
      for (let seg = 0; seg <= bellSegments; seg++) {
        const theta = (seg / bellSegments) * Math.PI * 2;

        // Ruffled edge at rim
        let radius = 1.0;
        if (ring > bellRings * 0.7) {
          const edgeFactor = (ring - bellRings * 0.7) / (bellRings * 0.3);
          radius *= 1 + Math.sin(theta * 8) * 0.1 * edgeFactor + Math.sin(theta * 13) * 0.05 * edgeFactor;
        }

        const x = Math.sin(phi) * Math.cos(theta) * radius;
        const y = Math.cos(phi); // Dome on top, opening at bottom
        const z = Math.sin(phi) * Math.sin(theta) * radius;

        bellVertices.push(x, y, z);
        bellUvs.push(seg / bellSegments, ring / bellRings);
      }
    }

    for (let ring = 0; ring < bellRings; ring++) {
      for (let seg = 0; seg < bellSegments; seg++) {
        const a = ring * (bellSegments + 1) + seg;
        const b = a + bellSegments + 1;
        bellIndices.push(a, b, a + 1);
        bellIndices.push(b, b + 1, a + 1);
      }
    }

    bellGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bellVertices, 3));
    bellGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(bellUvs, 2));
    bellGeometry.setIndex(bellIndices);
    bellGeometry.computeVertexNormals();

    const bellMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.bell,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const bell = new THREE.Mesh(bellGeometry, bellMaterial);
    jellyfishGroup.add(bell);

    // Inner bell for depth
    const innerBellGeometry = bellGeometry.clone();
    innerBellGeometry.scale(0.85, 0.85, 0.85);
    const innerBellMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.bell,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const innerBell = new THREE.Mesh(innerBellGeometry, innerBellMaterial);
    jellyfishGroup.add(innerBell);

    // === TENTACLES ===
    const tentacles = [];
    const tentacleCount = 12;
    const tentacleLengths = [1.5, 1.5, 1.5, 1.5, 2.2, 2.2, 2.2, 2.2, 3.0, 3.0, 3.0, 3.0];
    const tentacleSegments = 40;

    for (let i = 0; i < tentacleCount; i++) {
      const angle = (i / tentacleCount) * Math.PI * 2;
      const attachRadius = 0.95;
      const attachX = Math.sin(angle) * attachRadius;
      const attachZ = Math.cos(angle) * attachRadius;
      const length = tentacleLengths[i];

      const points = [];
      const basePoints = [];
      const targetPoints = [];

      for (let j = 0; j <= tentacleSegments; j++) {
        const t = j / tentacleSegments;
        const baseY = -0.2 - t * length;
        const sway = Math.sin(angle + t * 3) * 0.3 * t;

        const point = new THREE.Vector3(
          attachX + sway,
          baseY,
          attachZ + Math.cos(angle + t * 2) * 0.2 * t
        );
        points.push(point.clone());
        basePoints.push(point.clone());
        targetPoints.push(point.clone());
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, tentacleSegments, 0.02, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.tentacle,
        transparent: true,
        opacity: 0.7
      });
      const tentacleMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      jellyfishGroup.add(tentacleMesh);

      tentacles.push({
        mesh: tentacleMesh,
        points,
        basePoints,
        targetPoints,
        angle,
        length,
        noiseOffset: Math.random() * 1000
      });
    }

    // === ORAL ARMS (4 shorter, thicker, ruffled) ===
    const oralArms = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const attachRadius = 0.2;
      const points = [];

      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const spiral = t * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * attachRadius + Math.sin(spiral) * 0.15 * t,
          -0.3 - t * 1.2,
          Math.sin(angle) * attachRadius + Math.cos(spiral) * 0.15 * t
        ));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.tentacle,
        transparent: true,
        opacity: 0.8
      });
      const oralMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
      jellyfishGroup.add(oralMesh);
      oralArms.push({ mesh: oralMesh, points, angle, noiseOffset: Math.random() * 1000 });
    }

    // === BIOLUMINESCENT PARTICLES ===
    const particleCount = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 0.3 + Math.random() * 0.5;
      particlePositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = -Math.cos(phi) * r;
      particlePositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      particleSizes[i] = 0.02 + Math.random() * 0.03;
      particlePhases[i] = Math.random() * Math.PI * 2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: COLORS.accent,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    jellyfishGroup.add(particles);

    // === SIMPLE NOISE FUNCTION ===
    const noise = (x, y, z) => {
      const n = Math.sin(x * 1.3 + y * 2.1) * Math.cos(y * 1.7 + z * 2.3) * Math.sin(z * 1.9 + x * 2.7);
      return n * 0.5 + 0.5;
    };

    // === BREATH SYNC FUNCTION (exported) ===
    const setBreathePhase = (phase, progress) => {
      breathPhase = phase;
      breathProgress = progress;
    };

    // === UPDATE FUNCTION ===
    const updateJellyfish = (deltaTime, elapsed) => {
      // Bell animation based on breath - calculate target values
      let targetScaleY = 1.0;
      let targetScaleXZ = 1.0;
      let targetZ = 0;
      let colorLerp = 0;

      if (breathPhase === 'inhale') {
        targetScaleY = 1.0 + breathProgress * 0.15;
        targetScaleXZ = 1.0 - breathProgress * 0.08;
        targetZ = breathProgress * 0.15;
        colorLerp = breathProgress;
      } else if (breathPhase === 'hold') {
        const pulse = Math.sin(elapsed * 3) * 0.02;
        targetScaleY = 1.15 + pulse;
        targetScaleXZ = 0.92 - pulse * 0.5;
        targetZ = 0.15;
        colorLerp = 1;
      } else { // exhale
        targetScaleY = 1.15 - breathProgress * 0.15;
        targetScaleXZ = 0.92 + breathProgress * 0.08;
        targetZ = 0.15 - breathProgress * 0.15;
        colorLerp = 1 - breathProgress;
      }

      // Spring-damper physics for fluid bell animation
      const springStiffness = 0.02;
      const damping = 0.85;

      const forceY = (targetScaleY - springScaleY) * springStiffness;
      springVelocityY = springVelocityY * damping + forceY;
      springScaleY += springVelocityY;

      const forceXZ = (targetScaleXZ - springScaleXZ) * springStiffness;
      springVelocityXZ = springVelocityXZ * damping + forceXZ;
      springScaleXZ += springVelocityXZ;

      const forceZ = (targetZ - springZ) * springStiffness;
      springVelocityZ = springVelocityZ * damping + forceZ;
      springZ += springVelocityZ;

      // Apply spring-based bell transformations
      bell.scale.set(springScaleXZ, springScaleY, springScaleXZ);
      innerBell.scale.set(springScaleXZ * 0.85, springScaleY * 0.85, springScaleXZ * 0.85);
      jellyfishGroup.position.y = (springScaleY - 1.0) * 0.7;
      jellyfishGroup.position.z = springZ;

      // Constant very gentle rotation for ambient life
      jellyfishGroup.rotation.y = Math.sin(elapsed * 0.08) * 0.1;
      jellyfishGroup.rotation.x = Math.sin(elapsed * 0.06) * 0.05;

      // Color transition
      const currentColor = new THREE.Color().lerpColors(COLORS.dim, COLORS.bell, colorLerp);
      bell.material.color.copy(currentColor);
      innerBell.material.color.copy(currentColor);

      // Bell flash decay
      if (bellFlashIntensity > 0) {
        bellFlashIntensity *= 0.95;
        bell.material.color.lerp(COLORS.accent, bellFlashIntensity);
      }

      // Tentacle animation
      const tentacleDelay = 0.3;
      const delayedProgress = Math.max(0, breathProgress - tentacleDelay);

      tentacles.forEach((tentacle, i) => {
        const noiseVal = noise(elapsed * 0.12 + tentacle.noiseOffset, i * 0.5, 0);
        const swayAmp = isReducedMotion ? 0.05 : (0.1 + noiseVal * 0.1);

        for (let j = 0; j < tentacle.points.length; j++) {
          const t = j / tentacle.points.length;
          const base = tentacle.basePoints[j];

          // Sway based on noise - slow and meditative
          const swayX = Math.sin(elapsed * 0.2 + j * 0.2 + tentacle.angle) * swayAmp * t;
          const swayZ = Math.cos(elapsed * 0.15 + j * 0.3 + tentacle.noiseOffset) * swayAmp * t;

          // Breath response - flare on exhale, stream on inhale
          let breathOffset = 0;
          if (breathPhase === 'exhale') {
            breathOffset = delayedProgress * 0.3 * t;
          } else if (breathPhase === 'inhale') {
            breathOffset = -delayedProgress * 0.2 * t;
          }

          // Mouse avoidance
          let avoidX = 0, avoidZ = 0;
          const pointWorld = tentacle.points[j].clone();
          jellyfishGroup.localToWorld(pointWorld);
          const dist = pointWorld.distanceTo(mouse3D);
          if (dist < 1.5) {
            const pushStrength = (1.5 - dist) * 0.5 * t;
            const dir = pointWorld.clone().sub(mouse3D).normalize();
            avoidX = dir.x * pushStrength;
            avoidZ = dir.z * pushStrength;
          }

          tentacle.targetPoints[j].set(
            base.x + swayX + avoidX + breathOffset * Math.cos(tentacle.angle),
            base.y + (breathPhase === 'exhale' ? breathOffset * 0.5 : -breathOffset * 0.3),
            base.z + swayZ + avoidZ + breathOffset * Math.sin(tentacle.angle)
          );

          // Very slow smooth lerp
          tentacle.points[j].lerp(tentacle.targetPoints[j], 0.015);
        }

        // Rebuild tentacle geometry
        const curve = new THREE.CatmullRomCurve3(tentacle.points);
        const newGeometry = new THREE.TubeGeometry(curve, tentacleSegments, 0.02 * (1 - 0.5 * (breathPhase === 'exhale' ? breathProgress : 0)), 8, false);
        tentacle.mesh.geometry.dispose();
        tentacle.mesh.geometry = newGeometry;

        // Update tentacle color
        const tentacleColor = new THREE.Color().lerpColors(COLORS.dim, COLORS.tentacle, colorLerp);
        tentacle.mesh.material.color.copy(tentacleColor);
      });

      // Oral arms animation - slow and flowing
      oralArms.forEach((arm, i) => {
        for (let j = 1; j < arm.points.length; j++) {
          const t = j / arm.points.length;
          const sway = Math.sin(elapsed * 0.12 + j * 0.4 + arm.noiseOffset) * 0.08 * t;
          arm.points[j].x += sway * 0.005;
          arm.points[j].z += Math.cos(elapsed * 0.1 + j * 0.3) * 0.08 * t * 0.005;
        }
        const curve = new THREE.CatmullRomCurve3(arm.points);
        const newGeometry = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
        arm.mesh.geometry.dispose();
        arm.mesh.geometry = newGeometry;
        arm.mesh.material.color.copy(new THREE.Color().lerpColors(COLORS.dim, COLORS.tentacle, colorLerp));
      });

      // Particle shimmer - slow
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const shimmer = Math.sin(elapsed * 0.6 + particlePhases[i]) * 0.5 + 0.5;
        particleSizes[i] = (0.02 + shimmer * 0.03) * (0.5 + colorLerp * 0.5);
      }
      particles.material.opacity = 0.3 + colorLerp * 0.5;
      particles.geometry.attributes.position.needsUpdate = true;

      // Ambient drift - very slow
      if (!isReducedMotion) {
        jellyfishGroup.position.x += Math.sin(elapsed * 0.04) * 0.0001;
        jellyfishGroup.position.z += Math.cos(elapsed * 0.03) * 0.0001;
      }

      // Auto-rotate after idle
      const now = Date.now();
      if (now - lastInteractionTime > 8000 && !isReducedMotion && controls) {
        if (!isAutoRotating) {
          isAutoRotating = true;
          controls.autoRotate = true;
        }
      }

    };

    // === INTERACTION HANDLERS ===
    const onMouseMove = (event) => {
      mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(plane, mouse3D);

      lastInteractionTime = Date.now();
      if (isAutoRotating && controls) {
        isAutoRotating = false;
        controls.autoRotate = false;
      }
    };

    const onTouchMove = (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mousePos.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mousePos.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mousePos, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        raycaster.ray.intersectPlane(plane, mouse3D);
      }
      lastInteractionTime = Date.now();
    };

    const onClick = (event) => {
      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObject(bell);
      if (intersects.length > 0) {
        bellFlashIntensity = 1.0;
        if (navigator.vibrate) navigator.vibrate(10);
      }
      lastInteractionTime = Date.now();
    };

    const onDoubleClick = () => {
      // Reset camera
      const startPos = camera.position.clone();
      const startTarget = controls ? controls.target.clone() : new THREE.Vector3(0, 0, 0);
      const endPos = new THREE.Vector3(0, 0, 5);
      const endTarget = new THREE.Vector3(0, 0, 0);

      let t = 0;
      const animateReset = () => {
        t += 0.02;
        if (t >= 1) {
          camera.position.copy(endPos);
          if (controls) controls.target.copy(endTarget);
          return;
        }
        const ease = 1 - Math.pow(1 - t, 3);
        camera.position.lerpVectors(startPos, endPos, ease);
        if (controls) controls.target.lerpVectors(startTarget, endTarget, ease);
        requestAnimationFrame(animateReset);
      };
      animateReset();
    };

    const onKeyDown = (event) => {
      const rotateAmount = 0.1;
      switch(event.key) {
        case 'ArrowLeft':
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotateAmount);
          break;
        case 'ArrowRight':
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotateAmount);
          break;
        case 'ArrowUp':
          camera.position.y += 0.2;
          break;
        case 'ArrowDown':
          camera.position.y -= 0.2;
          break;
        case '+':
        case '=':
          camera.position.multiplyScalar(0.9);
          break;
        case '-':
          camera.position.multiplyScalar(1.1);
          break;
        case ' ':
          onDoubleClick();
          break;
      }
      lastInteractionTime = Date.now();
    };

    // === RESIZE HANDLER ===
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // === ANIMATION LOOP ===
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const deltaTime = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update breath from app's breath cycle
      const breathCycle = getBreathPhase(elapsed);
      if (breathCycle < 0.45) {
        setBreathePhase('inhale', breathCycle / 0.45);
      } else if (breathCycle < 0.55) {
        setBreathePhase('hold', (breathCycle - 0.45) / 0.1);
      } else {
        setBreathePhase('exhale', (breathCycle - 0.55) / 0.45);
      }

      // Touch-responsive rotation - slow and meditative
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          jellyfishGroup.rotation.y += normalizedX * 0.015;
          jellyfishGroup.rotation.x += normalizedY * 0.008;
        }
        lastInteractionTime = Date.now();
      } else {
        // Very gentle auto-rotation when not touching
        jellyfishGroup.rotation.y += 0.0004;
      }

      updateJellyfish(deltaTime, elapsed);
      if (controls) controls.update();
      renderer.render(scene, camera);
    };

    // === EVENT LISTENERS ===
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);

    // Start animation
    animate();

    // === CLEANUP ===
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);

      // Dispose geometries and materials
      bell.geometry.dispose();
      bell.material.dispose();
      innerBell.geometry.dispose();
      innerBell.material.dispose();
      tentacles.forEach(t => {
        t.mesh.geometry.dispose();
        t.mesh.material.dispose();
      });
      oralArms.forEach(a => {
        a.mesh.geometry.dispose();
        a.mesh.material.dispose();
      });
      particles.geometry.dispose();
      particles.material.dispose();

      if (controls) controls.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== DEEP SEA MODE (2D Jellyfish) ==========
  React.useEffect(() => {
    if (currentMode !== 'jellyfish2d' || !canvasRef.current) return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let startTime = Date.now();

    // Use main PALETTE colors - teal as primary (matches other visuals)
    const JELLY_COLORS = {
      primary: { h: hue, s: 52, l: 68 },    // Main color
      deep: { h: hue, s: 50, l: 50 },       // Deeper shade
      accent: { h: hue, s: 60, l: 75 },     // Lighter accent
      sand: { h: hue, s: 50, l: 65 }        // Accent for spots
    };

    // Thin trailing tentacle class with verlet physics
    class Tentacle {
      constructor(parent, index, totalCount, segments, segmentLength) {
        this.parent = parent;
        this.index = index;
        this.segments = segments;
        this.segmentLength = segmentLength;
        this.points = [];
        this.oldPoints = [];

        // Distribute around bell margin
        const angleOffset = (index / totalCount) * Math.PI * 2;
        this.angleOffset = angleOffset;
        const attachRadius = 0.95; // Attach at bell rim
        const startX = Math.cos(angleOffset) * parent.size * attachRadius;
        const startY = Math.sin(angleOffset) * parent.size * 0.15; // Slight vertical spread

        // Initialize with natural hanging curve
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const sway = Math.sin(angleOffset + i * 0.2) * (5 + i * 1.5);
          this.points.push({
            x: parent.position.x + startX + sway,
            y: parent.position.y + parent.bellHeight + i * segmentLength + startY
          });
          this.oldPoints.push({
            x: this.points[i].x - sway * 0.05,
            y: this.points[i].y - 0.3
          });
        }
      }

      update(pulse, elapsed) {
        const expansion = 1 + pulse * 0.12;
        const attachRadius = 0.95;

        // First point follows bell rim
        const rimX = Math.cos(this.angleOffset) * this.parent.size * attachRadius * expansion;
        const rimY = Math.sin(this.angleOffset) * this.parent.size * 0.15;
        this.points[0].x = this.parent.position.x + rimX;
        this.points[0].y = this.parent.position.y + this.parent.bellHeight * 0.3 + rimY;

        // Verlet integration with drag
        for (let i = 1; i < this.segments; i++) {
          const p = this.points[i];
          const old = this.oldPoints[i];

          const vx = (p.x - old.x) * 0.97; // High drag for slow flow
          const vy = (p.y - old.y) * 0.97;

          old.x = p.x;
          old.y = p.y;

          p.x += vx;
          p.y += vy + 0.015; // Very gentle gravity

          // Gentle organic sway
          const swayAmp = 0.04 * (1 + i * 0.1);
          p.x += Math.sin(elapsed * 0.5 + i * 0.3 + this.index * 0.5) * swayAmp;
        }

        // Constraint iterations
        for (let j = 0; j < 3; j++) {
          for (let i = 1; i < this.segments; i++) {
            const p1 = this.points[i - 1];
            const p2 = this.points[i];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) continue;

            const diff = this.segmentLength - dist;
            const percent = diff / dist / 2;

            const offsetX = dx * percent;
            const offsetY = dy * percent;

            if (i > 1) {
              p1.x -= offsetX;
              p1.y -= offsetY;
            }
            p2.x += offsetX;
            p2.y += offsetY;
          }
        }
      }

      draw(ctx, glow) {
        if (this.points.length < 2) return;

        // Draw thin tentacle with taper
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length - 1; i++) {
          const xc = (this.points[i].x + this.points[i + 1].x) / 2;
          const yc = (this.points[i].y + this.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }
        ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);

        // Gradient stroke - sage to teal at tips
        const gradient = ctx.createLinearGradient(
          this.points[0].x, this.points[0].y,
          this.points[this.points.length - 1].x, this.points[this.points.length - 1].y
        );
        gradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, ${JELLY_COLORS.primary.l}%, ${0.4 + glow * 0.2})`);
        gradient.addColorStop(0.7, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, ${JELLY_COLORS.primary.l + 10}%, ${0.25})`);
        gradient.addColorStop(1, `hsla(${JELLY_COLORS.accent.h}, ${JELLY_COLORS.accent.s}%, ${JELLY_COLORS.accent.l}%, ${0.15})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bioluminescent tip glow
        const tipIdx = this.points.length - 1;
        const tip = this.points[tipIdx];
        const tipGlow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 4);
        tipGlow.addColorStop(0, `hsla(${JELLY_COLORS.accent.h}, 60%, 70%, ${0.3 * glow})`);
        tipGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = tipGlow;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      applyForce(fx, fy, strength) {
        for (let i = 1; i < this.points.length; i++) {
          this.points[i].x += fx * strength * (i / this.points.length);
          this.points[i].y += fy * strength * (i / this.points.length);
        }
      }
    }

    // Frilly oral arm class
    class OralArm {
      constructor(parent, index, totalCount) {
        this.parent = parent;
        this.index = index;
        this.segments = 18;
        this.segmentLength = 5;
        this.points = [];
        this.oldPoints = [];
        this.frillPhases = [];

        const angleOffset = (index / totalCount) * Math.PI * 2;
        this.angleOffset = angleOffset;
        const attachRadius = 0.2;
        const startX = Math.cos(angleOffset) * parent.size * attachRadius;

        for (let i = 0; i < this.segments; i++) {
          const sway = Math.sin(angleOffset + i * 0.4) * 8;
          this.points.push({
            x: parent.position.x + startX + sway,
            y: parent.position.y + parent.bellHeight * 0.5 + i * this.segmentLength
          });
          this.oldPoints.push({
            x: this.points[i].x - sway * 0.05,
            y: this.points[i].y - 0.2
          });
          this.frillPhases.push(Math.random() * Math.PI * 2);
        }
      }

      update(pulse, elapsed) {
        const attachRadius = 0.2;
        const startX = Math.cos(this.angleOffset) * this.parent.size * attachRadius;

        this.points[0].x = this.parent.position.x + startX;
        this.points[0].y = this.parent.position.y + this.parent.bellHeight * 0.4;

        for (let i = 1; i < this.segments; i++) {
          const p = this.points[i];
          const old = this.oldPoints[i];

          const vx = (p.x - old.x) * 0.96;
          const vy = (p.y - old.y) * 0.96;

          old.x = p.x;
          old.y = p.y;

          p.x += vx;
          p.y += vy + 0.02;

          // Slower sway for oral arms
          const swayAmp = 0.08 * (1 + i * 0.05);
          p.x += Math.sin(elapsed * 0.3 + i * 0.5 + this.index * 1.2) * swayAmp;
        }

        // Constraints
        for (let j = 0; j < 3; j++) {
          for (let i = 1; i < this.segments; i++) {
            const p1 = this.points[i - 1];
            const p2 = this.points[i];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) continue;

            const diff = this.segmentLength - dist;
            const percent = diff / dist / 2;

            if (i > 1) {
              p1.x -= dx * percent;
              p1.y -= dy * percent;
            }
            p2.x += dx * percent;
            p2.y += dy * percent;
          }
        }
      }

      draw(ctx, elapsed, glow) {
        if (this.points.length < 2) return;

        // Draw frilly ribbon shape
        for (let i = 0; i < this.points.length - 1; i++) {
          const p1 = this.points[i];
          const p2 = this.points[i + 1];
          const t = i / (this.points.length - 1);

          // Width tapers and has frill
          const baseWidth = 6 * (1 - t * 0.5);
          const frillWave = Math.sin(elapsed * 1.5 + i * 0.8 + this.frillPhases[i]) * 3;
          const width = baseWidth + Math.abs(frillWave);

          // Calculate perpendicular
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;

          // Draw segment as quad
          ctx.beginPath();
          ctx.moveTo(p1.x + nx * width, p1.y + ny * width);
          ctx.lineTo(p2.x + nx * width * 0.9, p2.y + ny * width * 0.9);
          ctx.lineTo(p2.x - nx * width * 0.9, p2.y - ny * width * 0.9);
          ctx.lineTo(p1.x - nx * width, p1.y - ny * width);
          ctx.closePath();

          const alpha = (0.4 - t * 0.2) + glow * 0.15;
          ctx.fillStyle = `hsla(${JELLY_COLORS.deep.h}, ${JELLY_COLORS.deep.s}%, ${JELLY_COLORS.deep.l}%, ${alpha})`;
          ctx.fill();

          // Frill edge highlight in sand color
          ctx.strokeStyle = `hsla(${JELLY_COLORS.sand.h}, ${JELLY_COLORS.sand.s}%, ${JELLY_COLORS.sand.l}%, ${alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      applyForce(fx, fy, strength) {
        for (let i = 1; i < this.points.length; i++) {
          this.points[i].x += fx * strength * (i / this.points.length) * 0.7;
          this.points[i].y += fy * strength * (i / this.points.length) * 0.7;
        }
      }
    }

    // Jellyfish class - anatomically accurate
    class Jellyfish {
      constructor(x, y, size) {
        this.position = { x, y };
        this.size = size;
        this.bellHeight = size * 0.6; // Slightly flattened dome
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.003 + Math.random() * 0.002; // Very slow pulse
        this.driftVelocity = { x: (Math.random() - 0.5) * 0.02, y: -0.005 - Math.random() * 0.005 }; // Very gentle drift
        this.lastPulse = 0;

        this.glow = 0.6;
        this.following = false;
        this.bellSegments = 48; // Smooth bell curve

        // Bioluminescent spots inside bell
        this.bioSpots = [];
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 0.5 + 0.2;
          this.bioSpots.push({
            angle,
            radius: r,
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.008 + 0.004
          });
        }

        // Create many thin trailing tentacles (24-32)
        this.tentacles = [];
        const tentacleCount = 24 + Math.floor(Math.random() * 8);
        for (let i = 0; i < tentacleCount; i++) {
          // Variable lengths - some 2x, some 4x bell size
          const lengthMult = 2 + Math.random() * 2;
          const segCount = Math.floor(12 + lengthMult * 4);
          this.tentacles.push(new Tentacle(this, i, tentacleCount, segCount, 4));
        }

        // Create 4-6 frilly oral arms
        this.oralArms = [];
        const oralCount = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < oralCount; i++) {
          this.oralArms.push(new OralArm(this, i, oralCount));
        }
      }

      update(elapsed) {
        // Natural ambient pulse - floating in space, no breath sync
        this.pulsePhase += this.pulseSpeed;
        const pulse = Math.sin(this.pulsePhase);

        // Very gentle upward thrust on pulse peak
        if (pulse > 0.9 && this.lastPulse <= 0.9) {
          this.driftVelocity.y -= 0.02 + Math.random() * 0.01;
          this.driftVelocity.x += (Math.random() - 0.5) * 0.015;
        }
        this.lastPulse = pulse;

        // Apply physics
        this.position.x += this.driftVelocity.x;
        this.position.y += this.driftVelocity.y;

        // High friction and very gentle buoyancy (rise)
        this.driftVelocity.x *= 0.995;
        this.driftVelocity.y *= 0.995;
        this.driftVelocity.y -= 0.0005; // Very gentle rise (buoyancy)

        // Boundaries - wrap from top to bottom (swimming upward)
        if (this.position.y < -this.size * 4) this.position.y = canvas.height + this.size * 3;
        if (this.position.y > canvas.height + this.size * 4) this.position.y = canvas.height + this.size * 2;
        if (this.position.x < -this.size * 2) this.position.x = canvas.width + this.size;
        if (this.position.x > canvas.width + this.size * 2) this.position.x = -this.size;

        // Decay glow
        if (!this.following) this.glow = this.glow * 0.99 + 0.6 * 0.01;

        // Update appendages
        this.tentacles.forEach(t => t.update(pulse, elapsed));
        this.oralArms.forEach(o => o.update(pulse, elapsed));
      }

      draw(ctx, elapsed) {
        const pulse = Math.sin(this.pulsePhase);
        const expansion = 1 + pulse * 0.12;

        // Draw tentacles FIRST (behind everything)
        this.tentacles.forEach(t => t.draw(ctx, this.glow));

        // Draw oral arms (behind bell but in front of tentacles)
        this.oralArms.forEach(o => o.draw(ctx, elapsed, this.glow));

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Outer glow (bioluminescence)
        const glowGradient = ctx.createRadialGradient(0, this.bellHeight * 0.3, 0, 0, this.bellHeight * 0.3, this.size * 2);
        glowGradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 20}%, 70%, ${0.12 * this.glow})`);
        glowGradient.addColorStop(0.5, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 50%, ${0.04 * this.glow})`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, this.bellHeight * 0.3, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw bell dome - organic curve bulging UPWARD
        ctx.beginPath();
        // Start at left rim
        ctx.moveTo(-this.size * expansion, this.bellHeight * 0.3);
        // Curve up to apex (above origin) then down to right rim
        ctx.bezierCurveTo(
          -this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1), // left control
          this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1),  // right control
          this.size * expansion, this.bellHeight * 0.3                               // end at right rim
        );
        // Close bottom with slight curve inward
        ctx.quadraticCurveTo(0, this.bellHeight * 0.5, -this.size * expansion, this.bellHeight * 0.3);

        // Multi-layer translucent fill
        const bellGradient = ctx.createRadialGradient(0, 0, 0, 0, this.bellHeight * 0.2, this.size * 1.2);
        bellGradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s - 5}%, 75%, ${0.35 + this.glow * 0.15})`);
        bellGradient.addColorStop(0.4, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 60%, ${0.25 + this.glow * 0.1})`);
        bellGradient.addColorStop(0.8, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 5}%, 50%, ${0.15})`);
        bellGradient.addColorStop(1, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 40%, ${0.08})`);
        ctx.fillStyle = bellGradient;
        ctx.fill();

        // Inner mesoglea layer (subsurface effect)
        ctx.save();
        ctx.scale(0.88, 0.88);
        ctx.beginPath();
        ctx.moveTo(-this.size * expansion, this.bellHeight * 0.25);
        ctx.bezierCurveTo(
          -this.size * expansion * 0.65, -this.bellHeight * 0.65 * (1 - pulse * 0.1),
          this.size * expansion * 0.65, -this.bellHeight * 0.65 * (1 - pulse * 0.1),
          this.size * expansion, this.bellHeight * 0.25
        );
        ctx.quadraticCurveTo(0, this.bellHeight * 0.4, -this.size * expansion, this.bellHeight * 0.25);

        const innerGradient = ctx.createRadialGradient(0, -this.bellHeight * 0.2, 0, 0, this.bellHeight * 0.1, this.size * 0.9);
        innerGradient.addColorStop(0, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s - 10}%, 85%, ${0.25 + this.glow * 0.2})`);
        innerGradient.addColorStop(0.6, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 70%, ${0.12})`);
        innerGradient.addColorStop(1, `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 5}%, 55%, ${0.05})`);
        ctx.fillStyle = innerGradient;
        ctx.fill();
        ctx.restore();

        // Radial canals (4 visible internal lines)
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, -this.bellHeight * 0.3);
          const endX = Math.cos(angle) * this.size * 0.75 * expansion;
          const endY = this.bellHeight * 0.2;
          const ctrlX = Math.cos(angle) * this.size * 0.4;
          const ctrlY = 0;
          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          ctx.strokeStyle = `hsla(${JELLY_COLORS.primary.h + 10}, 35%, 75%, ${0.2 + this.glow * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';

        // Gonads (4 horseshoe organs)
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const cx = Math.cos(angle) * this.size * 0.4;
          const cy = -this.bellHeight * 0.1 + Math.sin(angle) * this.size * 0.08;

          ctx.beginPath();
          ctx.arc(cx, cy, this.size * 0.15, Math.PI * 0.3, Math.PI * 0.7, false);
          ctx.strokeStyle = `hsla(${JELLY_COLORS.sand.h}, ${JELLY_COLORS.sand.s}%, ${JELLY_COLORS.sand.l}%, ${0.4 + this.glow * 0.2})`;
          ctx.lineWidth = this.size * 0.06;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Gonad glow
          const gonadGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.size * 0.2);
          gonadGlow.addColorStop(0, `hsla(${JELLY_COLORS.sand.h}, ${JELLY_COLORS.sand.s + 10}%, 75%, ${0.2 * this.glow})`);
          gonadGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = gonadGlow;
          ctx.beginPath();
          ctx.arc(cx, cy, this.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bioluminescent spots (pulsing)
        ctx.globalCompositeOperation = 'lighter';
        this.bioSpots.forEach(spot => {
          const spotPulse = Math.sin(elapsed * spot.speed * 60 + spot.phase) * 0.5 + 0.5;
          const x = Math.cos(spot.angle) * this.size * spot.radius * expansion * 0.6;
          const y = -this.bellHeight * spot.radius * 0.4;

          const spotGlow = ctx.createRadialGradient(x, y, 0, x, y, spot.size * 4);
          spotGlow.addColorStop(0, `hsla(${JELLY_COLORS.sand.h}, 70%, 85%, ${0.35 * spotPulse * this.glow})`);
          spotGlow.addColorStop(0.5, `hsla(${JELLY_COLORS.primary.h}, 50%, 65%, ${0.12 * spotPulse})`);
          spotGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = spotGlow;
          ctx.beginPath();
          ctx.arc(x, y, spot.size * 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';

        // Bell rim (margin) - thicker, more opaque
        ctx.beginPath();
        ctx.moveTo(-this.size * expansion, this.bellHeight * 0.3);
        ctx.bezierCurveTo(
          -this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1),
          this.size * expansion * 0.7, -this.bellHeight * 0.8 * (1 - pulse * 0.1),
          this.size * expansion, this.bellHeight * 0.3
        );
        ctx.strokeStyle = `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s + 10}%, 80%, ${0.5 + this.glow * 0.25})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Subtle outer glow on rim
        ctx.strokeStyle = `hsla(${JELLY_COLORS.primary.h}, ${JELLY_COLORS.primary.s}%, 70%, ${0.15 + this.glow * 0.1})`;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.restore();
      }

      applyForce(fx, fy) {
        this.driftVelocity.x += fx * 0.04;
        this.driftVelocity.y += fy * 0.04;
        this.tentacles.forEach(t => t.applyForce(fx, fy, 0.4));
        this.oralArms.forEach(o => o.applyForce(fx, fy, 0.3));
      }
    }

    // Plankton particle class
    class Plankton {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speed = (Math.random() * 0.15 + 0.05) * MOBILE_SPEED;
        this.angle = Math.random() * Math.PI * 2;
        this.wobble = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update(elapsed) {
        this.wobble += 0.01;
        this.x += Math.cos(this.angle + Math.sin(this.wobble) * 0.3) * this.speed;
        this.y += Math.sin(this.angle) * this.speed * 0.3 - 0.05;

        if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${JELLY_COLORS.primary.h}, 40%, 60%, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize - fewer jellyfish, larger and more majestic, starting from bottom
    const jellies = [];
    const jellyCount = Math.min(Math.floor(canvas.width / 400) + 1, 3);
    for (let i = 0; i < jellyCount; i++) {
      jellies.push(new Jellyfish(
        canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
        canvas.height * 0.6 + Math.random() * canvas.height * 0.3 + i * 80,  // Start visible, in lower portion
        70 + Math.random() * 40
      ));
    }

    const plankton = [];
    for (let i = 0; i < 40; i++) {
      plankton.push(new Plankton());
    }

    // Water currents from touch
    const currents = [];

    // God rays
    const rays = [];
    for (let i = 0; i < 4; i++) {
      rays.push({
        x: Math.random() * canvas.width,
        width: Math.random() * 80 + 40,
        opacity: Math.random() * 0.04 + 0.01,
        speed: Math.random() * 0.1 + 0.05
      });
    }

    let lastTouchPos = null;

    // Touch handlers for jellyfish
    const handleJellyTouch = (x, y) => {
      jellies.forEach(jelly => {
        const dist = Math.hypot(x - jelly.position.x, y - jelly.position.y);

        if (dist < jelly.size * 1.2) {
          // Touched the jellyfish - glow and follow
          jelly.following = true;
          jelly.glow = 1.0;
        } else if (dist < jelly.size * 3) {
          // Near - gently drift away
          const angle = Math.atan2(jelly.position.y - y, jelly.position.x - x);
          jelly.applyForce(Math.cos(angle) * 0.03, Math.sin(angle) * 0.03);
          jelly.pulseSpeed = 0.006;
        }
      });

      // Create current
      currents.push({ x, y, radius: 0, strength: 1, direction: { x: 0, y: 0 } });
    };

    const handleJellyMove = (x, y) => {
      // Following jellyfish move toward finger - very gently
      jellies.filter(j => j.following).forEach(jelly => {
        const dx = x - jelly.position.x;
        const dy = y - jelly.position.y;
        jelly.driftVelocity.x += dx * 0.0008;
        jelly.driftVelocity.y += dy * 0.0008;
      });

      // Update current direction - much gentler
      if (currents.length > 0 && lastTouchPos) {
        const current = currents[currents.length - 1];
        current.direction.x = (x - lastTouchPos.x) * 0.1;
        current.direction.y = (y - lastTouchPos.y) * 0.1;
      }
      lastTouchPos = { x, y };
    };

    const handleJellyEnd = () => {
      jellies.forEach(jelly => {
        jelly.following = false;
        jelly.pulseSpeed = 0.003 + Math.random() * 0.002;
      });
      lastTouchPos = null;
    };

    // Apply currents to jellies
    const applyCurrent = () => {
      currents.forEach((current, idx) => {
        current.radius += 2;
        current.strength *= 0.95;

        jellies.forEach(jelly => {
          const dist = Math.hypot(current.x - jelly.position.x, current.y - jelly.position.y);
          if (dist < current.radius && dist > current.radius - 60) {
            const influence = current.strength * (1 - dist / Math.max(current.radius, 1)) * 0.15;
            jelly.applyForce(current.direction.x * influence, current.direction.y * influence);
          }
        });

        if (current.strength < 0.02) currents.splice(idx, 1);
      });
    };

    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      // Check for touch interactions
      touchPointsRef.current.forEach(point => {
        if (point.active) {
          if (!point.jellyTouched) {
            handleJellyTouch(point.x, point.y);
            point.jellyTouched = true;
          }
          handleJellyMove(point.x, point.y);
        } else if (point.jellyTouched) {
          handleJellyEnd();
          point.jellyTouched = false;
        }
      });

      // Background gradient (dark, matching app theme)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#000');
      bgGradient.addColorStop(0.5, '#000');
      bgGradient.addColorStop(1, '#000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Breath-synced god rays
      const breath = getBreathPhase(elapsed);
      ctx.globalCompositeOperation = 'lighter';
      rays.forEach(ray => {
        ray.x += ray.speed;
        if (ray.x > canvas.width + ray.width) ray.x = -ray.width;

        const rayGradient = ctx.createLinearGradient(ray.x, 0, ray.x + ray.width, canvas.height);
        rayGradient.addColorStop(0, `rgba(127, 180, 170, ${ray.opacity * (0.6 + breath * 0.4)})`);
        rayGradient.addColorStop(0.3, `rgba(80, 140, 130, ${ray.opacity * (0.3 + breath * 0.3)})`);
        rayGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(ray.x, 0);
        ctx.lineTo(ray.x + ray.width, 0);
        ctx.lineTo(ray.x + ray.width * 1.5, canvas.height);
        ctx.lineTo(ray.x - ray.width * 0.5, canvas.height);
        ctx.closePath();
        ctx.fillStyle = rayGradient;
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';

      // Plankton
      plankton.forEach(p => {
        p.update(elapsed);
        p.draw(ctx);
      });

      // Apply currents
      applyCurrent();

      // Update and draw jellyfish
      jellies.forEach(jelly => {
        jelly.update(elapsed);
        jelly.draw(ctx, elapsed);
      });

      // Touch ripples
      drawRipples(ctx);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [currentMode, getInteractionInfluence, drawRipples]);
  // ========== FLOWER OF LIFE MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'flowerOfLife' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    // Convert HSL hue to hex color
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const dynamicColor = hslToHex(hue, 52, 68);
    const material = new THREE.MeshBasicMaterial({ color: dynamicColor, wireframe: true, transparent: true, opacity: 0.8 });

    // Create flower of life pattern with ring geometries
    const group = new THREE.Group();
    const ringRadius = 0.6;
    const tubeRadius = 0.015;
    const segments = 64;
    const geometries = [];

    // Circle positions for flower of life pattern
    const circlePositions = [
      { x: 0, y: 0 }, // Center
    ];

    // First ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      circlePositions.push({
        x: Math.cos(angle) * ringRadius,
        y: Math.sin(angle) * ringRadius
      });
    }

    // Second ring (12 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      circlePositions.push({
        x: Math.cos(angle) * ringRadius * 2,
        y: Math.sin(angle) * ringRadius * 2
      });
      const betweenAngle = angle + Math.PI / 6;
      circlePositions.push({
        x: Math.cos(betweenAngle) * ringRadius * Math.sqrt(3),
        y: Math.sin(betweenAngle) * ringRadius * Math.sqrt(3)
      });
    }

    // Create a ring for each circle position
    circlePositions.forEach(pos => {
      const geometry = new THREE.TorusGeometry(ringRadius, tubeRadius, 16, segments);
      geometries.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, pos.y, 0);
      group.add(mesh);
    });

    scene.add(group);
    meshRef.current = group;

    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      if (meshRef.current) {
        // Touch-responsive rotation
        if (touchPointsRef.current.length > 0) {
          const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
          if (activeTouch) {
            const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
            const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
            meshRef.current.rotation.y += normalizedX * 0.02;
            meshRef.current.rotation.x += normalizedY * 0.02;
          }
        } else {
          // Gentle auto-rotation when not touching
          meshRef.current.rotation.y += 0.0004;
          meshRef.current.rotation.x += 0.0002;
          meshRef.current.rotation.z += 0.00012;
        }

        // Breath-synced scale
        const breath = getBreathPhase(elapsed);
        const targetScale = 0.9 + breath * 0.2;
        meshRef.current.scale.setScalar(targetScale);

        // Breath-synced opacity
        material.opacity = 0.55 + breath * 0.3;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometries.forEach(g => g.dispose());
      material.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== KOI POND MODE (3D) ==========
  React.useEffect(() => {
    if (currentMode !== 'koiPond' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const pondGroup = new THREE.Group();
    scene.add(pondGroup);

    // Create stylized koi fish
    const fishArray = [];
    const numFish = 7;

    const createKoi = (index) => {
      const fishGroup = new THREE.Group();

      // Body - elongated ellipsoid
      const bodyGeom = new THREE.SphereGeometry(0.3, 16, 12);
      bodyGeom.scale(1.8, 0.5, 0.8);

      // Fish colors - variations of the primary hue
      const colorVariant = index % 4;
      let bodyColor;
      if (colorVariant === 0) {
        bodyColor = hslToHex(hue, 70, 55); // Primary bright
      } else if (colorVariant === 1) {
        bodyColor = hslToHex(hue, 50, 45); // Primary muted
      } else if (colorVariant === 2) {
        bodyColor = hslToHex(hue, 60, 65); // Primary light
      } else {
        bodyColor = hslToHex(hue, 40, 35); // Primary dark
      }

      const bodyMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
        transparent: true,
        opacity: 0.75
      });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      fishGroup.add(body);

      // Tail fin - flowing shape
      const tailGeom = new THREE.ConeGeometry(0.2, 0.5, 8);
      tailGeom.rotateX(Math.PI / 2);
      const tailMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
        transparent: true,
        opacity: 0.6
      });
      const tail = new THREE.Mesh(tailGeom, tailMat);
      tail.position.set(-0.55, 0, 0);
      fishGroup.add(tail);

      // Dorsal fin
      const dorsalGeom = new THREE.ConeGeometry(0.08, 0.25, 4);
      const dorsalMat = new THREE.MeshBasicMaterial({
        color: bodyColor,
        transparent: true,
        opacity: 0.5
      });
      const dorsal = new THREE.Mesh(dorsalGeom, dorsalMat);
      dorsal.position.set(0, 0.2, 0);
      fishGroup.add(dorsal);

      // Random starting position and movement parameters
      const angle = (index / numFish) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1.5;
      fishGroup.position.set(
        Math.cos(angle) * radius,
        -0.2 + Math.random() * 0.15,
        Math.sin(angle) * radius
      );

      fishGroup.userData = {
        baseAngle: angle,
        orbitRadius: radius,
        speed: 0.05 + Math.random() * 0.03, // Much slower swimming
        wobblePhase: Math.random() * Math.PI * 2,
        depthPhase: Math.random() * Math.PI * 2,
        tail: tail
      };

      pondGroup.add(fishGroup);
      return fishGroup;
    };

    for (let i = 0; i < numFish; i++) {
      fishArray.push(createKoi(i));
    }

    // Water surface - subtle rippling plane
    const waterGeom = new THREE.PlaneGeometry(10, 10, 32, 32);
    const waterMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 40, 20),
      transparent: true,
      opacity: 0.3,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.1;
    pondGroup.add(water);

    // Lily pads - circular shapes
    const lilyPads = [];
    const numLilies = 5;
    for (let i = 0; i < numLilies; i++) {
      const lilyGeom = new THREE.CircleGeometry(0.25 + Math.random() * 0.15, 12);
      const lilyMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 30, 25),
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const lily = new THREE.Mesh(lilyGeom, lilyMat);
      lily.rotation.x = -Math.PI / 2;
      const lilyAngle = Math.random() * Math.PI * 2;
      const lilyRadius = 1 + Math.random() * 2.5;
      lily.position.set(
        Math.cos(lilyAngle) * lilyRadius,
        0.12,
        Math.sin(lilyAngle) * lilyRadius
      );
      lily.userData = { phase: Math.random() * Math.PI * 2 };
      pondGroup.add(lily);
      lilyPads.push(lily);
    }

    // Touch ripple rings
    const rippleRings = [];
    const createRipple = (x, z) => {
      const ringGeom = new THREE.RingGeometry(0.1, 0.15, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 50, 60),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.15, z);
      ring.userData = { age: 0, startRadius: 0.1 };
      pondGroup.add(ring);
      rippleRings.push(ring);
    };

    // Raycaster for touch-to-world coordinate conversion
    const raycaster = new THREE.Raycaster();
    const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1); // Water at y=0.1
    const intersectPoint = new THREE.Vector3();

    let lastTouchTime = 0;
    let feedPoint = null; // Point where fish should swim towards (like feeding)
    let feedTime = 0; // When feed point was created
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Touch-responsive camera rotation - slow and meditative
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          pondGroup.rotation.y += normalizedX * 0.015;
          camera.position.y = 5 + normalizedY * 0.5;
          camera.lookAt(0, 0, 0);

          // Create ripples at touch location using raycasting
          if (elapsed - lastTouchTime > 0.5) {
            // Convert screen coordinates to normalized device coordinates (-1 to 1)
            const ndcX = (activeTouch.x / window.innerWidth) * 2 - 1;
            const ndcY = -(activeTouch.y / window.innerHeight) * 2 + 1;

            // Set up raycaster from camera through touch point
            raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

            // Find intersection with water plane
            if (raycaster.ray.intersectPlane(waterPlane, intersectPoint)) {
              // Account for pond group rotation when placing ripple
              const localPoint = intersectPoint.clone();
              localPoint.applyMatrix4(pondGroup.matrixWorld.clone().invert());
              createRipple(localPoint.x, localPoint.z);

              // Set feed point for fish to swim towards
              feedPoint = { x: localPoint.x, z: localPoint.z };
              feedTime = elapsed;
            }
            lastTouchTime = elapsed;
          }
        }
      } else {
        pondGroup.rotation.y += 0.0001;
      }

      // Clear feed point after 4 seconds (fish lose interest)
      if (feedPoint && elapsed - feedTime > 4) {
        feedPoint = null;
      }

      // Breath-synced scale
      const breath = getBreathPhase(elapsed);
      const targetScale = 0.95 + breath * 0.1;
      pondGroup.scale.setScalar(targetScale);

      // Animate fish with breath-synced speed
      fishArray.forEach((fish, index) => {
        const data = fish.userData;
        const speedMod = 0.35 + breath * 0.15; // Speed varies with breath

        let targetX, targetZ;

        if (feedPoint) {
          // Swim towards feed point (like feeding fish)
          // Each fish approaches from slightly different angle with delay
          const delay = index * 0.3;
          const feedStrength = Math.max(0, 1 - (elapsed - feedTime - delay) * 0.15);
          if (feedStrength > 0) {
            // Add slight offset so fish don't all pile up at same spot
            const offsetAngle = (index / fishArray.length) * Math.PI * 2;
            const offsetDist = 0.3;
            targetX = feedPoint.x + Math.cos(offsetAngle) * offsetDist;
            targetZ = feedPoint.z + Math.sin(offsetAngle) * offsetDist;

            // Blend between feed target and normal swimming based on strength
            const t = elapsed * data.speed * speedMod + data.baseAngle;
            const normalX = Math.sin(t) * data.orbitRadius;
            const normalZ = Math.sin(t * 2) * data.orbitRadius * 0.5;
            targetX = targetX * feedStrength + normalX * (1 - feedStrength);
            targetZ = targetZ * feedStrength + normalZ * (1 - feedStrength);
          } else {
            // Normal swimming
            const t = elapsed * data.speed * speedMod + data.baseAngle;
            targetX = Math.sin(t) * data.orbitRadius;
            targetZ = Math.sin(t * 2) * data.orbitRadius * 0.5;
          }
        } else {
          // Figure-8 swimming pattern - slow and graceful
          const t = elapsed * data.speed * speedMod + data.baseAngle;
          targetX = Math.sin(t) * data.orbitRadius;
          targetZ = Math.sin(t * 2) * data.orbitRadius * 0.5;
        }

        // Smooth position update (faster when feeding)
        const moveSpeed = feedPoint ? 0.025 : 0.008;
        fish.position.x += (targetX - fish.position.x) * moveSpeed;
        fish.position.z += (targetZ - fish.position.z) * moveSpeed;

        // Depth variation with breath
        const depthWave = Math.sin(elapsed * 0.15 + data.depthPhase) * 0.1;
        fish.position.y = -0.15 + depthWave + breath * 0.02;

        // Face direction of movement
        const dx = targetX - fish.position.x;
        const dz = targetZ - fish.position.z;
        if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
          const targetAngle = Math.atan2(dz, dx);
          // Smooth rotation towards target
          const angleDiff = targetAngle - fish.rotation.y;
          fish.rotation.y += angleDiff * 0.05;
        }

        // Tail waggle - faster when swimming to food
        const waggleSpeed = feedPoint ? 4 : 2.5;
        data.tail.rotation.y = Math.sin(elapsed * waggleSpeed * speedMod + data.wobblePhase) * 0.2;

        // Body undulation - gentle
        fish.rotation.z = Math.sin(elapsed * 1.2 * speedMod + data.wobblePhase) * 0.03;
      });

      // Animate water surface with breath
      const positions = waterGeom.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 1];
        positions[i + 2] = Math.sin(x * 2 + elapsed * 0.3) * 0.015 +
                          Math.cos(z * 2 + elapsed * 0.2) * 0.015 +
                          breath * 0.01;
      }
      waterGeom.attributes.position.needsUpdate = true;
      waterMat.opacity = 0.25 + breath * 0.15;

      // Animate lily pads with breath
      lilyPads.forEach(lily => {
        const bob = Math.sin(elapsed * 0.25 + lily.userData.phase) * 0.015;
        lily.position.y = 0.1 + bob + breath * 0.03;
        lily.rotation.z = Math.sin(elapsed * 0.1 + lily.userData.phase) * 0.03;
      });

      // Animate and cleanup ripples
      for (let i = rippleRings.length - 1; i >= 0; i--) {
        const ring = rippleRings[i];
        ring.userData.age += 0.016;
        const age = ring.userData.age;
        const newRadius = ring.userData.startRadius + age * 1.5;
        ring.scale.setScalar(1 + age * 8);
        ring.material.opacity = Math.max(0, 0.6 - age * 0.8);

        if (age > 1) {
          pondGroup.remove(ring);
          ring.geometry.dispose();
          ring.material.dispose();
          rippleRings.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Dispose geometries and materials
      fishArray.forEach(fish => {
        fish.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      });
      waterGeom.dispose();
      waterMat.dispose();
      lilyPads.forEach(lily => {
        lily.geometry.dispose();
        lily.material.dispose();
      });
      rippleRings.forEach(ring => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== LAVA TOUCH MODE (Interactive lava lamp with burst-on-touch) ==========
  React.useEffect(() => {
    if (currentMode !== 'lavaTouch' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'auto'; // Enable for raycasting
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // 3D noise function for organic deformation
    const noise3D = (x, y, z) => {
      const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
      const perm = [...p, ...p];
      const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
      const lerp = (t, a, b) => a + t * (b - a);
      const grad = (hash, x, y, z) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z);
      const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
      const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
      return lerp(w, lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x-1, y, z)),
        lerp(u, grad(perm[AB], x, y-1, z), grad(perm[BB], x-1, y-1, z))),
        lerp(v, lerp(u, grad(perm[AA+1], x, y, z-1), grad(perm[BA+1], x-1, y, z-1)),
          lerp(u, grad(perm[AB+1], x, y-1, z-1), grad(perm[BB+1], x-1, y-1, z-1))));
    };

    const lavaGroup = new THREE.Group();
    scene.add(lavaGroup);

    // Blob data
    const blobs = [];
    const MIN_RADIUS = 0.15;
    const MAX_BLOBS = 12;

    // Create a blob
    const createBlob = (x, y, z, radius) => {
      const geometry = new THREE.IcosahedronGeometry(radius, 4);
      const originalPositions = geometry.attributes.position.array.slice();
      geometry.userData = { originalPositions };

      const material = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 52, 68),
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);

      const blob = {
        mesh,
        radius,
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.002
        ),
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.05 + Math.random() * 0.04, // Much slower floating
        wobbleSpeed: 0.1 + Math.random() * 0.06, // Much slower wobble
        wobbleIntensity: 0.12 + Math.random() * 0.08,
        hue: hue,
      };

      blobs.push(blob);
      lavaGroup.add(mesh);
      return blob;
    };

    // Split a blob into smaller pieces
    const splitBlob = (blob) => {
      const index = blobs.indexOf(blob);
      if (index === -1) return;

      // Haptic feedback
      haptic.medium();

      // Calculate split - separate into 2-3 smaller blobs if large enough
      const newRadius = blob.radius * 0.6;

      if (newRadius >= MIN_RADIUS && blobs.length < MAX_BLOBS) {
        // Create 2-3 child blobs
        const numChildren = blob.radius > 0.35 ? 3 : 2;
        for (let i = 0; i < numChildren; i++) {
          const angle = (i / numChildren) * Math.PI * 2 + Math.random() * 0.5;
          const offset = blob.radius * 0.8;
          const childX = blob.position.x + Math.cos(angle) * offset;
          const childY = blob.position.y + Math.sin(angle) * offset * 0.5;
          const childZ = blob.position.z + (Math.random() - 0.5) * 0.3;

          const childBlob = createBlob(childX, childY, childZ, newRadius * (0.8 + Math.random() * 0.4));
          // Give children outward velocity
          childBlob.velocity.set(
            Math.cos(angle) * 0.03,
            Math.sin(angle) * 0.02 + 0.01,
            (Math.random() - 0.5) * 0.02
          );
        }
      }

      // Remove original blob
      lavaGroup.remove(blob.mesh);
      blob.mesh.geometry.dispose();
      blob.mesh.material.dispose();
      blobs.splice(index, 1);

      // Spawn new blob at bottom if we're running low
      if (blobs.length < 4) {
        setTimeout(() => {
          if (currentMode === 'lavaTouch' && blobs.length < MAX_BLOBS) {
            createBlob(
              (Math.random() - 0.5) * 2.5,
              -3 - Math.random(),
              (Math.random() - 0.5) * 1.5,
              0.35 + Math.random() * 0.25
            );
          }
        }, 800 + Math.random() * 600);
      }
    };

    // Initial blobs
    for (let i = 0; i < 6; i++) {
      createBlob(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 1.5,
        0.35 + Math.random() * 0.25
      );
    }

    // Glow particles
    const glowParticleCount = 150;
    const glowGeom = new THREE.BufferGeometry();
    const glowPositions = new Float32Array(glowParticleCount * 3);
    const glowVelocities = [];

    for (let i = 0; i < glowParticleCount; i++) {
      const i3 = i * 3;
      glowPositions[i3] = (Math.random() - 0.5) * 6;
      glowPositions[i3 + 1] = (Math.random() - 0.5) * 6;
      glowPositions[i3 + 2] = (Math.random() - 0.5) * 3;
      glowVelocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.003,
        phase: Math.random() * Math.PI * 2
      });
    }

    glowGeom.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
    const glowMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 45, 60),
      size: 0.02,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const glowParticles = new THREE.Points(glowGeom, glowMat);
    lavaGroup.add(glowParticles);

    // Raycaster for touch interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      event.preventDefault();

      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = blobs.map(b => b.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const hitBlob = blobs.find(b => b.mesh === hitMesh);
        if (hitBlob) {
          splitBlob(hitBlob);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('touchstart', handlePointerDown, { passive: false });

    let animationId;
    let isMounted = true;

    // Spring physics for ultra-smooth breath transitions
    let currentBreath = 0.5;
    let breathVelocity = 0;
    const springStiffness = 0.003; // Very gentle spring
    const springDamping = 0.92;    // High damping for smooth motion

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      const targetBreath = getBreathPhase(elapsed);

      // Spring physics: naturally smooths any discontinuities
      const breathForce = (targetBreath - currentBreath) * springStiffness;
      breathVelocity = (breathVelocity + breathForce) * springDamping;
      currentBreath += breathVelocity;

      // Clamp to valid range
      currentBreath = Math.max(0, Math.min(1, currentBreath));
      const easedBreath = currentBreath;

      // Breath-synced scale using eased value (exaggerated range: 0.75 to 1.25)
      const targetScale = 0.75 + easedBreath * 0.5;
      lavaGroup.scale.setScalar(targetScale);

      // Breath-synced camera z-position (closer on inhale, further on exhale)
      // Exhale (breath=0): z=11 (far), Inhale (breath=1): z=7 (close)
      camera.position.z = 11 - easedBreath * 4;

      // Touch-responsive rotation - slow and meditative
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          lavaGroup.rotation.y += normalizedX * 0.015;
          lavaGroup.rotation.x += normalizedY * 0.008;
        }
      } else {
        // Very gentle auto-rotation when not touching
        lavaGroup.rotation.y += 0.00015;
      }

      // Animate blobs - slow and meditative, ambient movement
      blobs.forEach((blob) => {
        // Lava lamp physics - very slow vertical oscillation
        const verticalOsc = Math.sin(elapsed * blob.floatSpeed + blob.phase) * 0.3;
        blob.position.y += (verticalOsc - (blob.position.y - blob.mesh.position.y)) * 0.008;

        // Very gentle drift
        blob.position.x += Math.sin(elapsed * 0.03 + blob.phase * 1.5) * 0.0004;
        blob.position.z += Math.cos(elapsed * 0.02 + blob.phase * 0.7) * 0.0002;

        // Apply velocity
        blob.position.add(blob.velocity);
        blob.velocity.multiplyScalar(0.98);

        // Soft boundaries
        if (blob.position.y > 2.2) blob.velocity.y -= 0.0003;
        if (blob.position.y < -2.2) blob.velocity.y += 0.0003;
        if (blob.position.x > 1.8) blob.velocity.x -= 0.0002;
        if (blob.position.x < -1.8) blob.velocity.x += 0.0002;
        if (blob.position.z > 1) blob.velocity.z -= 0.0001;
        if (blob.position.z < -1) blob.velocity.z += 0.0001;

        // Update blob position
        blob.mesh.position.x = blob.position.x;
        blob.mesh.position.y = blob.position.y;
        blob.mesh.position.z = blob.position.z;

        // Hyperelastic deformation - ambient wobble
        const geometry = blob.mesh.geometry;
        const positions = geometry.attributes.position.array;
        const originalPositions = geometry.userData.originalPositions;
        const normal = new THREE.Vector3();

        for (let i = 0; i < positions.length; i += 3) {
          const ox = originalPositions[i];
          const oy = originalPositions[i + 1];
          const oz = originalPositions[i + 2];
          normal.set(ox, oy, oz).normalize();

          const noiseVal = noise3D(
            ox * 1.5 + blob.phase,
            oy * 1.5 + elapsed * blob.wobbleSpeed,
            oz * 1.5 + elapsed * 0.05
          );

          const displacement = noiseVal * blob.wobbleIntensity;
          positions[i] = ox + normal.x * displacement;
          positions[i + 1] = oy + normal.y * displacement;
          positions[i + 2] = oz + normal.z * displacement;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Breath-synced scale (using eased value for organic motion)
        blob.mesh.scale.setScalar(0.8 + easedBreath * 0.35);

        // Breath-synced opacity (using eased value for organic motion)
        blob.mesh.material.opacity = 0.55 + easedBreath * 0.3;
      });

      // Animate glow particles - slow drift
      const glowPositionsArr = glowGeom.attributes.position.array;
      for (let i = 0; i < glowParticleCount; i++) {
        const i3 = i * 3;
        const vel = glowVelocities[i];
        glowPositionsArr[i3] += vel.x * 0.4 + Math.sin(elapsed * 0.1 + vel.phase) * 0.0008;
        glowPositionsArr[i3 + 1] += vel.y * 0.4 + Math.cos(elapsed * 0.07 + vel.phase) * 0.0008;
        glowPositionsArr[i3 + 2] += vel.z * 0.4;

        if (glowPositionsArr[i3] > 3) glowPositionsArr[i3] = -3;
        if (glowPositionsArr[i3] < -3) glowPositionsArr[i3] = 3;
        if (glowPositionsArr[i3 + 1] > 3) glowPositionsArr[i3 + 1] = -3;
        if (glowPositionsArr[i3 + 1] < -3) glowPositionsArr[i3 + 1] = 3;
        if (glowPositionsArr[i3 + 2] > 1.5) glowPositionsArr[i3 + 2] = -1.5;
        if (glowPositionsArr[i3 + 2] < -1.5) glowPositionsArr[i3 + 2] = 1.5;
      }
      glowGeom.attributes.position.needsUpdate = true;
      glowMat.opacity = 0.25 + easedBreath * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('touchstart', handlePointerDown);
      cancelAnimationFrame(animationId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      blobs.forEach(blob => {
        blob.mesh.geometry.dispose();
        blob.mesh.material.dispose();
      });
      glowGeom.dispose();
      glowMat.dispose();
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);


  // ========== MOUNTAINS LANDSCAPE MODE ==========
  // Vast peaks in eternal stillness - the sublime scale of nature
  React.useEffect(() => {
    if (currentMode !== 'mountains' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'auto';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // Simple noise function for terrain
    const noise = (x, z) => {
      const n1 = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2;
      const n2 = Math.sin(x * 0.2 + 1) * Math.cos(z * 0.3 + 2) * 4;
      const n3 = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 6;
      return n1 + n2 + n3;
    };

    // Create mountain range - multiple layers for depth
    const mountainLayers = [];

    for (let layer = 0; layer < 4; layer++) {
      const zOffset = -layer * 15;
      const width = 40;
      const depth = 20;
      const segmentsW = 60;
      const segmentsD = 30;

      const geometry = new THREE.PlaneGeometry(width, depth, segmentsW, segmentsD);
      geometry.rotateX(-Math.PI / 2);

      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        // Height based on noise, scaled by layer (further = taller)
        const height = noise(x * 0.3 + layer * 5, z * 0.3) * (1 + layer * 0.5);
        positions[i + 1] = Math.max(0, height);
      }
      geometry.computeVertexNormals();

      const lightness = 30 - layer * 5;
      const saturation = 30 - layer * 5;
      const material = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, saturation, lightness),
        wireframe: true,
        transparent: true,
        opacity: 0.6 - layer * 0.1
      });

      const mountain = new THREE.Mesh(geometry, material);
      mountain.position.z = zOffset - 15;
      mountain.position.y = -3;
      scene.add(mountain);
      mountainLayers.push({ mesh: mountain, geometry, material, layer });
    }

    // Floating mist particles
    const mistCount = 300;
    const mistPositions = new Float32Array(mistCount * 3);
    const mistData = [];

    for (let i = 0; i < mistCount; i++) {
      mistPositions[i * 3] = (Math.random() - 0.5) * 40;
      mistPositions[i * 3 + 1] = Math.random() * 4;
      mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;

      mistData.push({
        speed: 0.005 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }

    const mistGeom = new THREE.BufferGeometry();
    mistGeom.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));
    const mistMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 20, 60),
      size: 0.15,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const mist = new THREE.Points(mistGeom, mistMat);
    scene.add(mist);

    // Distant stars
    const starCount = 200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 1] = 10 + Math.random() * 30;
      starPositions[i * 3 + 2] = -50 - Math.random() * 50;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.4
    });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    // Roaming state
    let moveX = 0, moveZ = 0;
    let targetMoveX = 0, targetMoveZ = 0;
    let lookAngle = 0, targetLookAngle = 0;
    let lookPitch = 0, targetLookPitch = 0;
    const clock = new THREE.Clock();
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch controls direction and movement - very slow and gentle
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          targetLookAngle = (activeTouch.x / window.innerWidth - 0.5) * Math.PI * 0.3;
          const verticalPos = activeTouch.y / window.innerHeight;
          targetLookPitch = (verticalPos - 0.5) * 0.1;
          const forwardSpeed = 0.005 + (1 - verticalPos) * 0.01;
          targetMoveZ = -forwardSpeed;
        }
      } else {
        // Very gentle autonomous movement - floating in space
        targetLookAngle = Math.sin(elapsed * 0.01) * 0.15;
        targetLookPitch = Math.sin(elapsed * 0.008) * 0.02;
        targetMoveZ = -0.004;
      }

      // Very slow interpolation for smooth, meditative movement
      lookAngle += (targetLookAngle - lookAngle) * 0.005;
      lookPitch += (targetLookPitch - lookPitch) * 0.005;
      moveZ += (targetMoveZ - moveZ) * 0.008;

      // Move in the direction we're facing
      camera.position.x += Math.sin(lookAngle) * moveZ;
      camera.position.z += Math.cos(lookAngle) * moveZ;

      // Keep camera at consistent height
      camera.position.y = 2 + Math.sin(elapsed * 0.1) * 0.2;

      // Apply look direction
      camera.rotation.y = lookAngle;
      camera.rotation.x = lookPitch;

      // Mountains pulse with breath
      mountainLayers.forEach((m, i) => {
        m.mesh.position.y = -3 + breath * 0.1;
        m.material.opacity = 0.25 + breath * 0.15 - i * 0.04;
      });

      // Mist drifts with breath
      const mPos = mistGeom.attributes.position.array;
      for (let i = 0; i < mistCount; i++) {
        const d = mistData[i];
        mPos[i * 3] += d.speed;
        mPos[i * 3 + 1] += Math.sin(elapsed + d.phase) * 0.003 + breath * 0.002;
        if (mPos[i * 3] > 20) mPos[i * 3] = -20;
      }
      mistGeom.attributes.position.needsUpdate = true;
      mistMat.opacity = 0.1 + breath * 0.15;

      // Stars pulse with breath
      starMat.opacity = 0.25 + breath * 0.2 + Math.sin(elapsed * 0.5) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      mountainLayers.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
      mistGeom.dispose(); mistMat.dispose();
      starGeom.dispose(); starMat.dispose();
      if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== MALOKA MODE ==========
  // Full ceremonial ayahuasca space - visionary and immersive
  React.useEffect(() => {
    if (currentMode !== 'maloka' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 4);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'auto';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const allGeometries = [];
    const allMaterials = [];
    const animatedElements = [];

    // Maloka structure - posts that form the walls
    const structureGroup = new THREE.Group();
    const postCount = 12;
    const radius = 8;
    const postHeight = 5;

    for (let i = 0; i < postCount; i++) {
      const angle = (i / postCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Vertical posts
      const postMat = new THREE.LineBasicMaterial({
        color: hslToHex(hue, 50, 45),
        transparent: true,
        opacity: 0.5
      });
      allMaterials.push(postMat);
      const postGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(x * 0.95, postHeight, z * 0.95)
      ]);
      allGeometries.push(postGeometry);
      const post = new THREE.Line(postGeometry, postMat);
      structureGroup.add(post);

      // Roof beams to center
      const roofPoints = [];
      for (let j = 0; j <= 8; j++) {
        const t = j / 8;
        const rx = x * 0.95 * (1 - t);
        const rz = z * 0.95 * (1 - t);
        const ry = postHeight + t * 3;
        roofPoints.push(new THREE.Vector3(rx, ry, rz));
      }
      const roofGeo = new THREE.BufferGeometry().setFromPoints(roofPoints);
      allGeometries.push(roofGeo);
      const roofMat = new THREE.LineBasicMaterial({
        color: hslToHex(hue, 45, 40),
        transparent: true,
        opacity: 0.35
      });
      allMaterials.push(roofMat);
      const roofBeam = new THREE.Line(roofGeo, roofMat);
      structureGroup.add(roofBeam);
    }
    scene.add(structureGroup);

    // Pulsing rings from center
    const pulseRings = [];
    for (let i = 0; i < 5; i++) {
      const ringGeo = new THREE.RingGeometry(0.1, 0.15, 32);
      ringGeo.rotateX(-Math.PI / 2);
      allGeometries.push(ringGeo);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 60, 55),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      allMaterials.push(ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.02;
      pulseRings.push({ mesh: ring, progress: i * 0.2, material: ringMat });
      scene.add(ring);
    }

    // Shipibo kené floor patterns - minimal and calm
    const patternGroup = new THREE.Group();

    // Concentric morphing circles
    for (let ring = 1; ring <= 20; ring++) {
      const ringRadius = ring * 0.35;
      const points = [];
      const segments = 80 + ring * 4;
      const zigzagAmp = 0.03 + (ring % 4) * 0.015;

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const zigzag = Math.sin(i * 0.5 + ring) * zigzagAmp;
        const r = ringRadius + zigzag;
        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          0.01,
          Math.sin(angle) * r
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      allGeometries.push(geometry);
      const mat = new THREE.LineBasicMaterial({
        color: hslToHex(hue, 60, 50 + (ring % 3) * 5),
        transparent: true,
        opacity: 0.4 + (ring % 4) * 0.08
      });
      allMaterials.push(mat);
      const line = new THREE.Line(geometry, mat);
      line.userData.ring = ring;
      line.userData.baseRadius = ringRadius;
      animatedElements.push(line);
      patternGroup.add(line);
    }

    // Sacred geometry radiating lines
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const points = [];

      for (let j = 0; j < 40; j++) {
        const dist = 0.3 + j * 0.18;
        const wave = Math.sin(j * 0.3 + i * 0.2) * 0.04;
        const a = angle + wave;
        points.push(new THREE.Vector3(
          Math.cos(a) * dist,
          0.01,
          Math.sin(a) * dist
        ));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      allGeometries.push(geo);
      const mat = new THREE.LineBasicMaterial({
        color: hslToHex(hue, 55, 50),
        transparent: true,
        opacity: i % 4 === 0 ? 0.5 : 0.3
      });
      allMaterials.push(mat)
      const line = new THREE.Line(geo, mat);
      animatedElements.push(line);
      patternGroup.add(line);
    }

    scene.add(patternGroup);

    // Central fire with more embers
    const pitPoints = [];
    const pitRadius = 0.4;
    for (let i = 0; i <= 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const wave = Math.sin(i * 3) * 0.05;
      pitPoints.push(new THREE.Vector3(
        Math.cos(angle) * (pitRadius + wave),
        0.02,
        Math.sin(angle) * (pitRadius + wave)
      ));
    }
    const pitGeo = new THREE.BufferGeometry().setFromPoints(pitPoints);
    allGeometries.push(pitGeo);
    const pitMat = new THREE.LineBasicMaterial({ color: hslToHex(hue, 70, 50), transparent: true, opacity: 0.4 });
    allMaterials.push(pitMat);
    const pit = new THREE.Line(pitGeo, pitMat);
    scene.add(pit);

    // Fire logs arranged in a pile - prominent feature
    const logGroup = new THREE.Group();
    const logGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.5, 8);
    allGeometries.push(logGeo);
    const logMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 30, 25),
      transparent: true,
      opacity: 0.8
    });
    allMaterials.push(logMat);

    // Create 6 logs in a teepee/pile arrangement
    for (let i = 0; i < 6; i++) {
      const log = new THREE.Mesh(logGeo, logMat);
      const angle = (i / 6) * Math.PI * 2;
      log.position.x = Math.cos(angle) * 0.12;
      log.position.z = Math.sin(angle) * 0.12;
      log.position.y = 0.15;
      log.rotation.z = Math.PI * 0.15;
      log.rotation.y = angle + Math.PI / 2;
      log.rotation.x = Math.PI * 0.1;
      logGroup.add(log);
    }
    scene.add(logGroup);

    // Core fire glow at center - smaller so logs are the feature
    const glowGeo = new THREE.SphereGeometry(0.06, 16, 16);
    allGeometries.push(glowGeo);
    const glowMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 80, 60),
      transparent: true,
      opacity: 0.5
    });
    allMaterials.push(glowMat);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.12;
    scene.add(glow);

    // Embers particle system - larger, slower rising particles
    const emberCount = 30;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities = [];
    const emberLifetimes = [];

    for (let i = 0; i < emberCount; i++) {
      // Start at fire center
      emberPositions[i * 3] = (Math.random() - 0.5) * 0.2;
      emberPositions[i * 3 + 1] = Math.random() * 0.3;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      emberVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: 0.003 + Math.random() * 0.005,
        z: (Math.random() - 0.5) * 0.003
      });
      emberLifetimes.push(Math.random());
    }

    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    allGeometries.push(emberGeo);
    const emberMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 90, 55),
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    allMaterials.push(emberMat);
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // Sparks particle system - slower, calmer
    const sparkCount = 15;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = [];
    const sparkLifetimes = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = (Math.random() - 0.5) * 0.15;
      sparkPositions[i * 3 + 1] = Math.random() * 0.2;
      sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
      sparkVelocities.push({
        x: (Math.random() - 0.5) * 0.006,
        y: 0.006 + Math.random() * 0.008,
        z: (Math.random() - 0.5) * 0.006
      });
      sparkLifetimes.push(Math.random());
    }

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    allGeometries.push(sparkGeo);
    const sparkMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 100, 70),
      size: 0.02,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    allMaterials.push(sparkMat);
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // === FLOATING SHIPIBO KENÉ PATTERNS ===
    // These fade in and out slowly, drifting through the maloka
    const floatingKene = [];
    const keneCount = 8;
    const TEAL_BRIGHT = hslToHex(hue, 70, 60);
    const MAGENTA = 0xff00ff;

    for (let k = 0; k < keneCount; k++) {
      const keneGroup = new THREE.Group();

      // Random position in the maloka space
      const angle = (k / keneCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 2 + Math.random() * 4;
      const height = 1.5 + Math.random() * 3;

      keneGroup.position.set(
        Math.cos(angle) * dist,
        height,
        Math.sin(angle) * dist
      );

      const keneSize = 0.15 + Math.random() * 0.15;
      const keneType = k % 4;

      if (keneType === 0) {
        // Diamond/rhombus pattern
        const diamondPts = [
          new THREE.Vector3(0, keneSize, 0),
          new THREE.Vector3(keneSize, 0, 0),
          new THREE.Vector3(0, -keneSize, 0),
          new THREE.Vector3(-keneSize, 0, 0),
          new THREE.Vector3(0, keneSize, 0),
        ];
        const diamondGeo = new THREE.BufferGeometry().setFromPoints(diamondPts);
        allGeometries.push(diamondGeo);
        const diamondMat = new THREE.LineBasicMaterial({
          color: k % 2 === 0 ? MAGENTA : TEAL_BRIGHT,
          transparent: true,
          opacity: 0
        });
        allMaterials.push(diamondMat);
        keneGroup.add(new THREE.Line(diamondGeo, diamondMat));

        // Inner cross
        const crossH = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-keneSize * 0.5, 0, 0),
          new THREE.Vector3(keneSize * 0.5, 0, 0),
        ]);
        const crossV = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -keneSize * 0.5, 0),
          new THREE.Vector3(0, keneSize * 0.5, 0),
        ]);
        allGeometries.push(crossH, crossV);
        const crossMat = new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0 });
        allMaterials.push(crossMat);
        keneGroup.add(new THREE.Line(crossH, crossMat));
        keneGroup.add(new THREE.Line(crossV, crossMat));
      } else if (keneType === 1) {
        // Meander/labyrinth fragment
        const meanderPts = [];
        let mx = -keneSize;
        let my = -keneSize;
        meanderPts.push(new THREE.Vector3(mx, my, 0));
        for (let step = 0; step < 6; step++) {
          if (step % 2 === 0) mx += keneSize * 0.4;
          else my += keneSize * 0.4;
          meanderPts.push(new THREE.Vector3(mx, my, 0));
        }
        const meanderGeo = new THREE.BufferGeometry().setFromPoints(meanderPts);
        allGeometries.push(meanderGeo);
        const meanderMat = new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0 });
        allMaterials.push(meanderMat);
        keneGroup.add(new THREE.Line(meanderGeo, meanderMat));
      } else if (keneType === 2) {
        // Eye motif (common in Shipibo art)
        const eyePts = [];
        for (let e = 0; e <= 20; e++) {
          const et = e / 20;
          const ex = (et - 0.5) * keneSize * 2;
          const ey = Math.sin(et * Math.PI) * keneSize * 0.5;
          eyePts.push(new THREE.Vector3(ex, ey, 0));
        }
        for (let e = 20; e >= 0; e--) {
          const et = e / 20;
          const ex = (et - 0.5) * keneSize * 2;
          const ey = -Math.sin(et * Math.PI) * keneSize * 0.5;
          eyePts.push(new THREE.Vector3(ex, ey, 0));
        }
        const eyeGeo = new THREE.BufferGeometry().setFromPoints(eyePts);
        allGeometries.push(eyeGeo);
        const eyeMat = new THREE.LineBasicMaterial({ color: MAGENTA, transparent: true, opacity: 0 });
        allMaterials.push(eyeMat);
        keneGroup.add(new THREE.Line(eyeGeo, eyeMat));

        // Center dot
        const dotGeo = new THREE.SphereGeometry(keneSize * 0.15, 8, 8);
        allGeometries.push(dotGeo);
        const dotMat = new THREE.MeshBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0 });
        allMaterials.push(dotMat);
        keneGroup.add(new THREE.Mesh(dotGeo, dotMat));
      } else {
        // Four-pointed cross/star
        for (let arm = 0; arm < 4; arm++) {
          const armAngle = (arm / 4) * Math.PI * 2;
          const armPts = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(Math.cos(armAngle) * keneSize, Math.sin(armAngle) * keneSize, 0),
          ];
          const armGeo = new THREE.BufferGeometry().setFromPoints(armPts);
          allGeometries.push(armGeo);
          const armMat = new THREE.LineBasicMaterial({ color: TEAL_BRIGHT, transparent: true, opacity: 0 });
          allMaterials.push(armMat);
          keneGroup.add(new THREE.Line(armGeo, armMat));
        }
      }

      scene.add(keneGroup);
      floatingKene.push({
        group: keneGroup,
        baseY: height,
        baseAngle: angle,
        dist: dist,
        phase: Math.random() * Math.PI * 2,
        fadePhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.0003 + Math.random() * 0.0003,
        bobSpeed: 0.3 + Math.random() * 0.3,
      });
    }

    const clock = new THREE.Clock();

    // Camera look controls
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    const baseCameraY = 1.2;
    const baseCameraZ = 4;
    let animationId;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Touch-based look controls (gentle, meditative pace)
      const touchPoints = touchPointsRef.current;
      if (touchPoints.length > 0) {
        const touch = touchPoints[0];
        const normalizedX = (touch.x / window.innerWidth - 0.5) * 2;
        const normalizedY = (touch.y / window.innerHeight - 0.5) * 2;
        targetRotationY = normalizedX * Math.PI * 0.2;
        targetRotationX = normalizedY * Math.PI * 0.1;
      } else {
        targetRotationY *= 0.98;
        targetRotationX *= 0.98;
      }

      currentRotationX += (targetRotationX - currentRotationX) * 0.02;
      currentRotationY += (targetRotationY - currentRotationY) * 0.02;

      // Camera breathing and subtle FOV shift
      const breathY = Math.sin(elapsed * 0.3) * 0.08;
      const breathZ = Math.sin(elapsed * 0.25) * 0.15;
      camera.position.y = baseCameraY + breathY + breath * 0.1;
      camera.position.z = baseCameraZ + breathZ - breath * 0.2;
      camera.fov = 75 + breath * 5; // FOV expands on inhale
      camera.updateProjectionMatrix();

      const lookX = Math.sin(currentRotationY) * 5;
      const lookY = 1 - currentRotationX * 2;
      const lookZ = -Math.cos(currentRotationY) * 5;
      camera.lookAt(lookX, lookY, lookZ);

      // Glow pulsing
      glow.scale.setScalar(1 + breath * 0.4 + Math.sin(elapsed * 2) * 0.1);
      glowMat.opacity = 0.5 + breath * 0.4;

      // Animate embers rising
      const emberPos = embers.geometry.attributes.position.array;
      for (let i = 0; i < emberCount; i++) {
        emberLifetimes[i] += 0.002;
        if (emberLifetimes[i] > 1) {
          // Reset ember to fire center
          emberPos[i * 3] = (Math.random() - 0.5) * 0.2;
          emberPos[i * 3 + 1] = Math.random() * 0.1;
          emberPos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          emberVelocities[i] = {
            x: (Math.random() - 0.5) * 0.003,
            y: 0.003 + Math.random() * 0.005,
            z: (Math.random() - 0.5) * 0.003
          };
          emberLifetimes[i] = 0;
        }
        // Apply velocity with gentle drift
        emberPos[i * 3] += emberVelocities[i].x + Math.sin(elapsed * 0.5 + i) * 0.0005;
        emberPos[i * 3 + 1] += emberVelocities[i].y;
        emberPos[i * 3 + 2] += emberVelocities[i].z + Math.cos(elapsed * 0.5 + i) * 0.0005;
      }
      embers.geometry.attributes.position.needsUpdate = true;
      emberMat.opacity = 0.6 + breath * 0.3;

      // Animate sparks rising (slow and calm)
      const sparkPos = sparks.geometry.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        sparkLifetimes[i] += 0.004;
        if (sparkLifetimes[i] > 1) {
          // Reset spark to fire center
          sparkPos[i * 3] = (Math.random() - 0.5) * 0.15;
          sparkPos[i * 3 + 1] = Math.random() * 0.15;
          sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
          sparkVelocities[i] = {
            x: (Math.random() - 0.5) * 0.006,
            y: 0.006 + Math.random() * 0.008,
            z: (Math.random() - 0.5) * 0.006
          };
          sparkLifetimes[i] = 0;
        }
        // Apply velocity with gentle drift
        sparkPos[i * 3] += sparkVelocities[i].x + Math.sin(elapsed * 0.5 + i) * 0.001;
        sparkPos[i * 3 + 1] += sparkVelocities[i].y;
        sparkPos[i * 3 + 2] += sparkVelocities[i].z + Math.cos(elapsed * 0.5 + i) * 0.001;
      }
      sparks.geometry.attributes.position.needsUpdate = true;
      sparkMat.opacity = 0.7 + breath * 0.2;

      // Pulse floor patterns with breath (slow, meditative)
      animatedElements.forEach((child, i) => {
        if (child.material && child.material.opacity !== undefined) {
          const baseOpacity = 0.4;
          const wave = Math.sin(elapsed * 0.3 + i * 0.1) * 0.1;
          child.material.opacity = baseOpacity + breath * 0.2 + wave;
        }
        // Scale rings outward with breath
        if (child.userData.baseRadius) {
          const scale = 1 + breath * 0.03 + Math.sin(elapsed * 0.2 + child.userData.ring * 0.1) * 0.01;
          child.scale.setScalar(scale);
        }
      });

      // Very subtle pattern rotation
      patternGroup.rotation.y += 0.0001;

      // Pulsing rings expanding outward (slow, meditative)
      pulseRings.forEach((r) => {
        r.progress += 0.002 * (1 + breath * 0.3);
        if (r.progress > 1) r.progress = 0;

        const scale = 0.5 + r.progress * 6;
        r.mesh.scale.setScalar(scale);
        r.material.opacity = (1 - r.progress) * 0.3 * (0.5 + breath * 0.5);
      });

      // Animate floating Shipibo kené patterns
      floatingKene.forEach((kene) => {
        // Slow drift around the maloka
        kene.baseAngle += kene.driftSpeed;

        // Update position with gentle bobbing
        kene.group.position.x = Math.cos(kene.baseAngle) * kene.dist;
        kene.group.position.z = Math.sin(kene.baseAngle) * kene.dist;
        kene.group.position.y = kene.baseY + Math.sin(elapsed * kene.bobSpeed + kene.phase) * 0.3;

        // Slow rotation
        kene.group.rotation.y = elapsed * 0.1 + kene.phase;
        kene.group.rotation.z = Math.sin(elapsed * 0.2 + kene.phase) * 0.1;

        // Fade in and out slowly (15-20 second cycle)
        const fadeValue = (Math.sin(elapsed * 0.15 + kene.fadePhase) + 1) * 0.5;
        const targetOpacity = fadeValue * 0.5 * (0.6 + breath * 0.4);

        // Apply opacity to all children
        kene.group.children.forEach(child => {
          if (child.material) {
            child.material.opacity = targetOpacity;
          }
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      allGeometries.forEach(g => g.dispose());
      allMaterials.forEach(m => m.dispose());
      if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== UNDERWATER / ABYSS MODE ==========
  // Deep ocean depths - pressure, silence, bioluminescence
  React.useEffect(() => {
    if (currentMode !== 'underwater' || !containerRef.current || typeof THREE === 'undefined') return;

    // Clear any residual touch data from navigation
    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'auto';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // Bioluminescent particles floating
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    const particleData = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

      particleData.push({
        velocity: {
          x: (Math.random() - 0.5) * 0.005,
          y: 0.002 + Math.random() * 0.005,
          z: (Math.random() - 0.5) * 0.005
        },
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 1
      });
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: hslToHex(hue, 60, 65),
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Jellyfish-like creatures
    const jellyfish = [];
    const jellyCount = 5;
    for (let i = 0; i < jellyCount; i++) {
      const group = new THREE.Group();

      // Bell
      const bellGeom = new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const bellMat = new THREE.MeshBasicMaterial({
        color: hslToHex(hue, 50, 55),
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const bell = new THREE.Mesh(bellGeom, bellMat);
      group.add(bell);

      // Tendrils
      const tendrilCount = 8;
      const tendrils = [];
      for (let j = 0; j < tendrilCount; j++) {
        const points = [];
        const angle = (j / tendrilCount) * Math.PI * 2;
        const tendrilLength = 1 + Math.random() * 0.5;
        for (let k = 0; k <= 15; k++) {
          const t = k / 15;
          points.push(new THREE.Vector3(
            Math.cos(angle) * 0.2 * (1 - t * 0.5),
            -t * tendrilLength,
            Math.sin(angle) * 0.2 * (1 - t * 0.5)
          ));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const tendrilGeom = new THREE.TubeGeometry(curve, 15, 0.02, 4, false);
        const tendrilMat = new THREE.MeshBasicMaterial({
          color: hslToHex(hue, 45, 50),
          transparent: true,
          opacity: 0.3
        });
        const tendril = new THREE.Mesh(tendrilGeom, tendrilMat);
        group.add(tendril);
        tendrils.push({ mesh: tendril, geometry: tendrilGeom, material: tendrilMat, points });
      }

      group.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        -5 - Math.random() * 10
      );
      group.userData = {
        velocity: { x: (Math.random() - 0.5) * 0.01, y: 0.005 + Math.random() * 0.01, z: (Math.random() - 0.5) * 0.01 },
        pulsePhase: Math.random() * Math.PI * 2,
        tendrils
      };

      scene.add(group);
      jellyfish.push({ group, bell, bellGeom, bellMat, tendrils });
    }

    // Distant seafloor hints
    const floorGeom = new THREE.PlaneGeometry(50, 50, 20, 20);
    floorGeom.rotateX(-Math.PI / 2);
    const floorPositions = floorGeom.attributes.position.array;
    for (let i = 0; i < floorPositions.length; i += 3) {
      floorPositions[i + 1] = Math.random() * 0.5;
    }
    const floorMat = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 30, 20),
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.position.y = -10;
    floor.position.z = -10;
    scene.add(floor);

    let lookX = 0, lookY = 0;
    let targetLookX = 0, targetLookY = 0;
    const clock = new THREE.Clock();

    let animationId;
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Very slow touch look - gentle underwater exploration
      if (touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          targetLookX = (activeTouch.x / window.innerWidth - 0.5) * Math.PI * 0.2;
          targetLookY = (activeTouch.y / window.innerHeight - 0.5) * Math.PI * 0.1;
        }
      } else {
        // Very gentle autonomous drift - floating in space
        targetLookX = Math.sin(elapsed * 0.015) * 0.1;
        targetLookY = Math.sin(elapsed * 0.01) * 0.05;
      }

      // Very slow interpolation
      lookX += (targetLookX - lookX) * 0.005;
      lookY += (targetLookY - lookY) * 0.005;
      camera.rotation.y = lookX;
      camera.rotation.x = lookY;

      // Particles drift upward
      const pos = particleGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        pos[i * 3] += p.velocity.x + Math.sin(elapsed + p.phase) * 0.002;
        pos[i * 3 + 1] += p.velocity.y;
        pos[i * 3 + 2] += p.velocity.z;

        // Reset if out of bounds
        if (pos[i * 3 + 1] > 8) {
          pos[i * 3 + 1] = -8;
          pos[i * 3] = (Math.random() - 0.5) * 20;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;
      particleMat.opacity = 0.3 + breath * 0.3;

      // Jellyfish swim and pulse with breath
      jellyfish.forEach(jf => {
        const ud = jf.group.userData;

        // Movement with breath influence
        jf.group.position.x += ud.velocity.x;
        jf.group.position.y += ud.velocity.y * (0.5 + breath * 0.5);
        jf.group.position.z += ud.velocity.z;

        // Wrap around
        if (jf.group.position.y > 6) {
          jf.group.position.y = -6;
          jf.group.position.x = (Math.random() - 0.5) * 12;
        }

        // Pulsing with breath
        const pulse = Math.sin(elapsed * 2 + ud.pulsePhase) * 0.5 + 0.5;
        const breathScale = 0.9 + breath * 0.2;
        jf.bell.scale.set((1 + pulse * 0.2) * breathScale, (1 - pulse * 0.15) * breathScale, (1 + pulse * 0.2) * breathScale);
        jf.bellMat.opacity = 0.3 + breath * 0.2 + pulse * 0.1;
      });

      // Floor pulses with breath
      floorMat.opacity = 0.08 + breath * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      isMounted = false;
      cancelAnimationFrame(animationId);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== LOTUS MODE ==========
  // 3D lotus with full orbit controls
  React.useEffect(() => {
    if (currentMode !== 'lotus' || !containerRef.current || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'auto';
    rendererRef.current = renderer;

    // Orbit controls for full rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.25;
    controls.enableZoom = true;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(hslToHex(hue, 30, 90), 1.5, 100);
    mainLight.position.set(0, 10, 5);
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(hslToHex(hue, 60, 60), 0.8, 50);
    rimLight.position.set(-5, 2, -5);
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(hslToHex(hue, 50, 50), 0.4, 30);
    bottomLight.position.set(0, -5, 0);
    scene.add(bottomLight);

    // Lotus group
    const lotusGroup = new THREE.Group();
    scene.add(lotusGroup);

    // Create petal geometry
    function createPetalGeometry() {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.15, 0.3, 0.12, 0.7, 0, 1);
      shape.bezierCurveTo(-0.12, 0.7, -0.15, 0.3, 0, 0);

      const extrudeSettings = {
        steps: 1,
        depth: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.02,
        bevelSegments: 3
      };

      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    const petalGeometry = createPetalGeometry();
    const allGeometries = [petalGeometry];
    const allMaterials = [];

    // Petal layers
    const layers = [
      { count: 8, radius: 0.3, height: 0, scale: 0.8, baseAngle: 75, lightness: 55 },
      { count: 8, radius: 0.5, height: 0.1, scale: 1.0, baseAngle: 65, lightness: 58 },
      { count: 12, radius: 0.7, height: 0.15, scale: 1.1, baseAngle: 55, lightness: 62 },
      { count: 12, radius: 0.9, height: 0.2, scale: 1.25, baseAngle: 45, lightness: 66 },
      { count: 16, radius: 1.1, height: 0.22, scale: 1.4, baseAngle: 35, lightness: 70 },
      { count: 16, radius: 1.3, height: 0.2, scale: 1.5, baseAngle: 25, lightness: 75 },
    ];

    const allPetals = [];

    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2;
        const offsetAngle = layerIndex % 2 === 0 ? 0 : Math.PI / layer.count;

        const petalMaterial = new THREE.MeshStandardMaterial({
          color: hslToHex(hue, 50, layer.lightness),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          roughness: 0.3,
          metalness: 0.1,
          emissive: new THREE.Color(hslToHex(hue, 40, layer.lightness * 0.3)),
        });
        allMaterials.push(petalMaterial);

        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.set(
          Math.cos(angle + offsetAngle) * layer.radius,
          layer.height,
          Math.sin(angle + offsetAngle) * layer.radius
        );
        petal.scale.set(layer.scale, layer.scale, layer.scale);
        petal.userData = {
          baseAngle: layer.baseAngle,
          orbitAngle: angle + offsetAngle,
          radius: layer.radius,
          layerIndex,
          petalIndex: i
        };
        petal.rotation.y = -(angle + offsetAngle) + Math.PI;
        petal.rotation.x = THREE.MathUtils.degToRad(layer.baseAngle);

        lotusGroup.add(petal);
        allPetals.push(petal);
      }
    });

    // Center stamen cluster
    const stamenGroup = new THREE.Group();
    const stamenCount = 30;

    for (let i = 0; i < stamenCount; i++) {
      const stamenGeometry = new THREE.CylinderGeometry(0.015, 0.01, 0.3, 8);
      allGeometries.push(stamenGeometry);
      const stamenMaterial = new THREE.MeshStandardMaterial({
        color: hslToHex(hue, 70, 60),
        emissive: hslToHex(hue, 60, 40),
        emissiveIntensity: 0.3,
        roughness: 0.4,
      });
      allMaterials.push(stamenMaterial);

      const stamen = new THREE.Mesh(stamenGeometry, stamenMaterial);
      const angle = (i / stamenCount) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 0.08 + Math.random() * 0.12;
      const heightVar = Math.random() * 0.1;

      stamen.position.set(
        Math.cos(angle) * radius,
        0.15 + heightVar,
        Math.sin(angle) * radius
      );
      stamen.rotation.x = (Math.random() - 0.5) * 0.4;
      stamen.rotation.z = (Math.random() - 0.5) * 0.4;

      const tipGeometry = new THREE.SphereGeometry(0.025, 8, 8);
      allGeometries.push(tipGeometry);
      const tipMaterial = new THREE.MeshStandardMaterial({
        color: hslToHex(hue, 65, 65),
        emissive: hslToHex(hue, 55, 50),
        emissiveIntensity: 0.5,
      });
      allMaterials.push(tipMaterial);
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.y = 0.15;
      stamen.add(tip);

      stamen.userData = { baseHeight: 0.15 + heightVar };
      stamenGroup.add(stamen);
    }
    lotusGroup.add(stamenGroup);

    // Central glow
    const glowGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    allGeometries.push(glowGeometry);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: hslToHex(hue, 40, 90),
      transparent: true,
      opacity: 0.6,
    });
    allMaterials.push(glowMaterial);
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowSphere.position.y = 0.1;
    lotusGroup.add(glowSphere);

    // Water base
    const waterGeometry = new THREE.CircleGeometry(5, 64);
    allGeometries.push(waterGeometry);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: hslToHex(hue, 30, 10),
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    allMaterials.push(waterMaterial);
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.3;
    scene.add(water);

    const clock = new THREE.Clock();

    let animationId;
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      controls.update();

      // Bloom petals with breath
      const bloomAmount = 0.3 + breath * 0.7;
      allPetals.forEach((petal) => {
        const { baseAngle, layerIndex } = petal.userData;
        const targetAngle = baseAngle * (1 - bloomAmount * 0.6);
        const currentAngle = THREE.MathUtils.degToRad(targetAngle);
        const wave = Math.sin(elapsed * 1.5 + layerIndex * 0.5 + petal.userData.petalIndex * 0.3) * 0.03;
        petal.rotation.x = currentAngle + wave;
        petal.material.emissiveIntensity = 0.05 + breath * 0.15;
      });

      // Animate stamens
      stamenGroup.children.forEach((stamen, i) => {
        const wave = Math.sin(elapsed * 2 + i * 0.5) * 0.015;
        stamen.position.y = stamen.userData.baseHeight + breath * 0.08 + wave;
      });

      // Glow pulse
      glowSphere.scale.setScalar(1 + breath * 0.3);
      glowMaterial.opacity = 0.4 + breath * 0.4;

      // Animate lights
      rimLight.intensity = 0.6 + breath * 0.4;
      bottomLight.intensity = 0.3 + breath * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      isMounted = false;
      cancelAnimationFrame(animationId);
      allGeometries.forEach(g => g.dispose());
      allMaterials.forEach(m => m.dispose());
      if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== HEART GARDEN MODE ==========
  // A loving-kindness meditation with a growing garden
  // Adapted from Ven. Ayya Khema's "Garden in Your Heart"
  const [gardenStage, setGardenStage] = React.useState(0);
  const [gardenGuidanceIndex, setGardenGuidanceIndex] = React.useState(0);
  const [gardenGuidanceOpacity, setGardenGuidanceOpacity] = React.useState(0);
  const [gardenLinesRead, setGardenLinesRead] = React.useState(0);
  const [gardenComplete, setGardenComplete] = React.useState(false);
  const [gardenTransitioning, setGardenTransitioning] = React.useState(false);
  const gardenCanvasRef = React.useRef(null);

  // Meditation stages - adapted from Ayya Khema's teaching
  const meditationStages = React.useMemo(() => [
    {
      id: 'intro',
      guidance: [
        "Put your attention on the breath for a few moments.",
        "Let each inhale be so gentle it barely stirs the hairs in your nose.",
        "Let the breath be smooth and natural."
      ]
    },
    {
      id: 'garden',
      guidance: [
        "Imagine a garden growing.",
        "An abundance of fruits and vegetables.",
        "Tomatoes ripening in the sun. Leafy greens. Squash on the vine.",
        "This garden is nourished by your attention and care.",
        "Tend it gently. Watch it grow."
      ]
    },
    {
      id: 'self',
      guidance: [
        "Walk through your garden and harvest something for yourself.",
        "Choose whatever calls to you.",
        "You have tended this garden. You deserve its fruits.",
        "Let yourself be nourished by your own care."
      ]
    },
    {
      id: 'beloved',
      guidance: [
        "Think of someone you love deeply.",
        "Walk through your garden and harvest a gift for them.",
        "Perhaps their favorite fruit. Something that would make them smile.",
        "See yourself handing them this gift from the garden in your heart.",
        "Notice how it feels to give."
      ]
    },
    {
      id: 'parents',
      guidance: [
        "Think of your parents, or those who raised you.",
        "Whether still alive or passed, they exist in your heart.",
        "Harvest the ripest, most perfect offering from the garden in your heart.",
        "Hand it to them with gratitude.",
        "Even if complicated, offer this gift freely."
      ]
    },
    {
      id: 'friends',
      guidance: [
        "Think of your good friends, your relatives.",
        "For each one, harvest a gift from the garden in your heart.",
        "The more you give, the more it grows.",
        "See each person receiving with joy.",
        "Feel the warmth spreading outward."
      ]
    },
    {
      id: 'neutral',
      guidance: [
        "Think of people you see in daily life.",
        "The mail carrier. The grocery clerk. A neighbor.",
        "For each, harvest something from the garden in your heart.",
        "They too need nourishment.",
        "Offer freely, expecting nothing."
      ]
    },
    {
      id: 'difficult',
      guidance: [
        "Now think of someone difficult in your life.",
        "Or someone you feel indifferent toward.",
        "This is the harder practice.",
        "Harvest a gift for this person from the garden in your heart.",
        "Hand it to them with respect.",
        "Feel the relief of letting go."
      ]
    },
    {
      id: 'all',
      guidance: [
        "Now let the garden expand beyond all boundaries.",
        "Open the gates and let everyone enter.",
        "All beings everywhere — human, animal, seen and unseen.",
        "Each one takes what they need.",
        "And the garden grows more abundant with every gift.",
        "There is no scarcity here. Only overflow.",
        "May all beings be nourished."
      ]
    },
    {
      id: 'return',
      guidance: [
        "Bring your attention back to yourself.",
        "Notice that the garden in your heart is undiminished.",
        "Giving has only made it more abundant.",
        "This garden lives within you always.",
        "Tend it daily. It will nourish you in return."
      ]
    }
  ], []);

  const gardenTotalLines = React.useMemo(() =>
    meditationStages.reduce((acc, stage) => acc + stage.guidance.length, 0), [meditationStages]);


  // Reset garden state when mode changes
  React.useEffect(() => {
    if (currentMode === 'heartGarden') {
      setGardenStage(0);
      setGardenGuidanceIndex(0);
      setGardenLinesRead(0);
      setGardenComplete(false);
      setGardenTransitioning(false);
      // Fade in first guidance after a brief delay
      setTimeout(() => setGardenGuidanceOpacity(1), 500);
    } else {
      setGardenGuidanceOpacity(0);
    }
  }, [currentMode]);

  // Tap to advance guidance
  const advanceGardenGuidance = React.useCallback(() => {
    if (gardenComplete || gardenTransitioning) return;

    const stage = meditationStages[gardenStage];
    if (!stage) return;

    // Lock to prevent rapid taps
    setGardenTransitioning(true);

    // Fade out current text gracefully
    setGardenGuidanceOpacity(0);

    // Wait for fade out to complete before changing text
    setTimeout(() => {
      if (gardenGuidanceIndex < stage.guidance.length - 1) {
        // More lines in current stage
        setGardenGuidanceIndex(prev => prev + 1);
      } else if (gardenStage < meditationStages.length - 1) {
        // Move to next stage
        setGardenStage(prev => prev + 1);
        setGardenGuidanceIndex(0);
      } else {
        // Meditation complete
        setGardenComplete(true);
      }
      setGardenLinesRead(prev => prev + 1);

      // Small delay before fading in new text for smoother feel
      setTimeout(() => {
        setGardenGuidanceOpacity(1);
        // Unlock after fade in completes
        setTimeout(() => setGardenTransitioning(false), 800);
      }, 100);
    }, 800);
  }, [gardenStage, gardenGuidanceIndex, gardenComplete, gardenTransitioning, meditationStages]);

  // Ref to track progress for animation without causing restarts
  const gardenLinesReadRef = React.useRef(0);
  React.useEffect(() => {
    gardenLinesReadRef.current = gardenLinesRead;
  }, [gardenLinesRead]);

  // ========== HEART GARDEN MODE (Sacred Botanical Schematic) ==========
  React.useEffect(() => {
    if (currentMode !== 'heartGarden' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x000000, 0.0004);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 200, 800);
    camera.lookAt(0, -100, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    // HSL to Hex helper
    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    // Dynamic colors based on hue
    const primaryColor = hslToHex(hue, 52, 68);
    const primaryDark = hslToHex(hue, 52, 45);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryFaint = hslToHex(hue, 40, 35);
    const accentColor = hslToHex(hue, 60, 55); // Consistent with main hue

    // Materials - increased opacity for better visibility
    const inkMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 1.0 });
    const inkMedMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.8 });
    const inkLightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const inkDashMat = new THREE.LineDashedMaterial({ color: primaryLight, transparent: true, opacity: 0.5, dashSize: 3, gapSize: 2 });
    const greenMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 1.0 });
    const greenLightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.85 });
    const greenFaintMat = new THREE.LineBasicMaterial({ color: primaryFaint, transparent: true, opacity: 0.6 });
    const goldMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Helper functions
    const createRing = (radius, y, segments = 64, mat = inkMedMat) => {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return new THREE.Line(geo, mat);
    };

    const createDot = (x, y, z, radius = 1.5, color = primaryColor) => {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const geo = new THREE.SphereGeometry(radius, 8, 8);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      return mesh;
    };

    const createSmallCube = (x, y, z, size = 3, color = primaryColor) => {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.6 });
      const geo = new THREE.BoxGeometry(size, size, size);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      return mesh;
    };

    const createCurve = (points, mat = greenMat, segments = 50) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const pts = curve.getPoints(segments);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return new THREE.Line(geo, mat);
    };

    // === PROGRESSIVE BUILD SYSTEM ===
    // Helper to set opacity on all materials in a group
    const setGroupOpacity = (group, opacity) => {
      group.traverse((child) => {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => {
              if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
              m.opacity = m.userData.baseOpacity * opacity;
            });
          } else {
            if (child.material.userData.baseOpacity === undefined) {
              child.material.userData.baseOpacity = child.material.opacity;
            }
            child.material.opacity = child.material.userData.baseOpacity * opacity;
          }
        }
      });
    };

    // Current opacity values for smooth lerping
    // Start with seed visible, then roots grow down, then plant grows up
    const groupOpacities = {
      seed: 1, seedOrbits: 0,
      plantStem: 0, plantLeaves: 0, plantBud: 0,
      pyramidMain: 0, pyramidRings: 0,
      baseBox: 0, baseDetails: 0,
      rootCoilMain: 0, rootCoilDetails: 0,
      rootsTaproot: 0, rootsBranches: 0, rootsOrbits: 0,
      fernsLeft: 0, fernsRight: 0,
      torusMain: 0, torusFlower: 0, torusCore: 0,
      vortexFunnels: 0, vortexLines: 0,
      flowers: 0, particles: 0
    };

    // === 1. TORUS ENERGY SPHERE (top) ===
    const torusGroup = new THREE.Group();
    torusGroup.position.y = 220;
    mainGroup.add(torusGroup);

    // Sub-group: Main torus meshes
    const torusMainGroup = new THREE.Group();
    torusGroup.add(torusMainGroup);

    const torusGeo = new THREE.TorusGeometry(80, 35, 16, 40);
    const torusMesh = new THREE.Mesh(torusGeo, new THREE.MeshBasicMaterial({
      color: primaryDark, wireframe: true, transparent: true, opacity: 0.4
    }));
    torusMainGroup.add(torusMesh);

    const torus2Geo = new THREE.TorusGeometry(80, 35, 12, 32);
    const torus2Mesh = new THREE.Mesh(torus2Geo, new THREE.MeshBasicMaterial({
      color: primaryLight, wireframe: true, transparent: true, opacity: 0.25
    }));
    torus2Mesh.rotation.y = Math.PI / 4;
    torusMainGroup.add(torus2Mesh);

    // Third torus for more density
    const torus3Geo = new THREE.TorusGeometry(80, 35, 10, 28);
    const torus3Mesh = new THREE.Mesh(torus3Geo, new THREE.MeshBasicMaterial({
      color: primaryColor, wireframe: true, transparent: true, opacity: 0.2
    }));
    torus3Mesh.rotation.y = Math.PI / 2;
    torus3Mesh.rotation.x = 0.3;
    torusMainGroup.add(torus3Mesh);

    // Inner concentric rings
    for (let i = 1; i <= 5; i++) {
      torusMainGroup.add(createRing(i * 10, 0, 48, inkLightMat));
    }

    // Sub-group: Core sphere and icosahedron
    const torusCoreGroup = new THREE.Group();
    torusGroup.add(torusCoreGroup);

    const coreSphereGeo = new THREE.SphereGeometry(10, 16, 16);
    const coreSphereMesh = new THREE.Mesh(coreSphereGeo, new THREE.MeshBasicMaterial({
      color: accentColor, wireframe: true, transparent: true, opacity: 0.65
    }));
    torusCoreGroup.add(coreSphereMesh);

    // Inner icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(6, 0);
    const icoMesh = new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({
      color: accentColor, wireframe: true, transparent: true, opacity: 0.85
    }));
    torusCoreGroup.add(icoMesh);

    // Central dot
    torusCoreGroup.add(createDot(0, 0, 0, 2.5, accentColor));

    // Sub-group: Flower/radial pattern
    const torusFlowerGroup = new THREE.Group();
    torusGroup.add(torusFlowerGroup);

    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2;
      const r = 50;
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(a) * r * 0.5, Math.sin(a + 0.3) * 8, Math.sin(a) * r * 0.5),
        new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
      ];
      torusFlowerGroup.add(createCurve(pts, greenFaintMat, 20));
      torusFlowerGroup.add(createDot(Math.cos(a) * r, 0, Math.sin(a) * r, 1.5, primaryColor));
    }

    // Stamen lines between petals
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2 + Math.PI / petalCount;
      const r = 30;
      const stamenPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * r, 4, Math.sin(a) * r)];
      const stamenGeo = new THREE.BufferGeometry().setFromPoints(stamenPts);
      torusFlowerGroup.add(new THREE.Line(stamenGeo, inkLightMat));
      torusFlowerGroup.add(createDot(Math.cos(a) * r, 4, Math.sin(a) * r, 1, primaryLight));
    }

    // === 2. VORTEX FUNNELS ===
    const vortexGroup = new THREE.Group();
    mainGroup.add(vortexGroup);

    // Sub-group: Funnels
    const vortexFunnelsGroup = new THREE.Group();
    vortexGroup.add(vortexFunnelsGroup);

    const createVortexFunnel = (x, y) => {
      const group = new THREE.Group();
      group.position.set(x, y, 0);
      const rings = 10, topR = 4, bottomR = 40, height = 70;

      for (let i = 0; i <= rings; i++) {
        const t = i / rings;
        const r = topR + (bottomR - topR) * t;
        const ry = -height / 2 + height * t;
        group.add(createRing(r, ry, 24, inkMedMat));
      }

      for (let j = 0; j < 12; j++) {
        const a = (j / 12) * Math.PI * 2;
        const pts = [];
        for (let i = 0; i <= rings; i++) {
          const t = i / rings;
          const r = topR + (bottomR - topR) * t;
          const ry = -height / 2 + height * t;
          pts.push(new THREE.Vector3(Math.cos(a) * r, ry, Math.sin(a) * r));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        group.add(new THREE.Line(geo, inkLightMat));
      }
      return group;
    };

    vortexFunnelsGroup.add(createVortexFunnel(-160, 320));
    vortexFunnelsGroup.add(createVortexFunnel(160, 320));

    // Sub-group: Connection lines and cubes
    const vortexLinesGroup = new THREE.Group();
    vortexGroup.add(vortexLinesGroup);

    vortexLinesGroup.add(createCurve([
      new THREE.Vector3(-160, 355, 0), new THREE.Vector3(-130, 280, 20),
      new THREE.Vector3(-90, 240, 10), new THREE.Vector3(-60, 220, 0)
    ], inkMat));
    vortexLinesGroup.add(createCurve([
      new THREE.Vector3(160, 355, 0), new THREE.Vector3(130, 280, -20),
      new THREE.Vector3(90, 240, -10), new THREE.Vector3(60, 220, 0)
    ], inkMat));

    // Junction cubes
    vortexLinesGroup.add(createSmallCube(-160, 355, 0, 4));
    vortexLinesGroup.add(createSmallCube(160, 355, 0, 4));
    vortexLinesGroup.add(createSmallCube(-60, 220, 0, 4));
    vortexLinesGroup.add(createSmallCube(60, 220, 0, 4));

    // === 3. PYRAMID VESSEL ===
    const pyramidGroup = new THREE.Group();
    mainGroup.add(pyramidGroup);

    const pyH = 180, pyW = 100, pyTop = 150, pyBot = pyTop - pyH;

    // Sub-group: Main pyramid structure
    const pyramidMainGroup = new THREE.Group();
    pyramidGroup.add(pyramidMainGroup);

    const pyGeo = new THREE.ConeGeometry(pyW, pyH, 4, 1, true);
    const pyMesh = new THREE.Mesh(pyGeo, new THREE.MeshBasicMaterial({
      color: primaryColor, wireframe: true, transparent: true, opacity: 0.6
    }));
    pyMesh.position.y = pyTop - pyH / 2;
    pyMesh.rotation.y = Math.PI / 4;
    pyramidMainGroup.add(pyMesh);

    // Pyramid edges
    const apexY = pyTop;
    const baseCorners = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      baseCorners.push(new THREE.Vector3(Math.cos(a) * pyW, pyBot, Math.sin(a) * pyW));
    }
    for (const corner of baseCorners) {
      const pts = [new THREE.Vector3(0, apexY, 0), corner];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      pyramidMainGroup.add(new THREE.Line(geo, inkMat));
    }
    for (let i = 0; i < 4; i++) {
      const pts = [baseCorners[i], baseCorners[(i + 1) % 4]];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      pyramidMainGroup.add(new THREE.Line(geo, inkMat));
    }

    // Junction cubes
    pyramidMainGroup.add(createSmallCube(0, apexY, 0, 5));
    for (const c of baseCorners) pyramidMainGroup.add(createSmallCube(c.x, c.y, c.z, 5));

    // Central axis
    const axisPts = [new THREE.Vector3(0, apexY + 30, 0), new THREE.Vector3(0, pyBot - 30, 0)];
    const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPts);
    const axisLine = new THREE.Line(axisGeo, inkDashMat);
    axisLine.computeLineDistances();
    pyramidMainGroup.add(axisLine);

    // Sub-group: Ring guides
    const pyramidRingsGroup = new THREE.Group();
    pyramidGroup.add(pyramidRingsGroup);

    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const y = pyTop - t * pyH;
      const r = pyW * t;
      pyramidRingsGroup.add(createRing(r, y, 32, inkLightMat));
    }

    // === 4. SEED (center) ===
    const seedGroup = new THREE.Group();
    seedGroup.position.y = pyTop - pyH * 0.55;
    pyramidGroup.add(seedGroup);

    // Main seed (always visible)
    const seedCoreGroup = new THREE.Group();
    seedGroup.add(seedCoreGroup);

    const seedGeo = new THREE.SphereGeometry(18, 16, 16);
    const seedMesh = new THREE.Mesh(seedGeo, new THREE.MeshBasicMaterial({
      color: primaryDark, wireframe: true, transparent: true, opacity: 0.6
    }));
    seedCoreGroup.add(seedMesh);

    const embryoGeo = new THREE.SphereGeometry(10, 12, 12);
    const embryoMesh = new THREE.Mesh(embryoGeo, new THREE.MeshBasicMaterial({
      color: primaryColor, wireframe: true, transparent: true, opacity: 0.5
    }));
    seedCoreGroup.add(embryoMesh);
    seedCoreGroup.add(createDot(0, 0, 0, 3, accentColor));

    // Sub-group: Energy orbits (controlled separately)
    const seedOrbitsGroup = new THREE.Group();
    seedGroup.add(seedOrbitsGroup);

    for (let i = 0; i < 3; i++) {
      const orbitGeo = new THREE.TorusGeometry(28 + i * 6, 0.3, 4, 48);
      const orbitMesh = new THREE.Mesh(orbitGeo, new THREE.MeshBasicMaterial({
        color: primaryLight, wireframe: true, transparent: true, opacity: 0.45
      }));
      orbitMesh.rotation.x = Math.PI / 2 + (i - 1) * 0.4;
      orbitMesh.rotation.z = i * 0.5;
      seedOrbitsGroup.add(orbitMesh);
    }

    // Orbital dots
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      seedOrbitsGroup.add(createDot(Math.cos(a) * 30, Math.sin(a) * 12, Math.sin(a) * 30, 1.5, primaryDark));
    }

    // === 5. PLANT GROWING FROM SEED ===
    const plantGroup = new THREE.Group();
    pyramidGroup.add(plantGroup);

    const stemBaseY = seedGroup.position.y;
    const stemTopY = apexY + 15;

    // Sub-group: Stem
    const plantStemGroup = new THREE.Group();
    plantGroup.add(plantStemGroup);

    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, stemBaseY - 10, 0),
      new THREE.Vector3(2, stemBaseY + 20, 1),
      new THREE.Vector3(-1, stemBaseY + 50, -1),
      new THREE.Vector3(1, stemBaseY + 80, 2),
      new THREE.Vector3(-1, stemBaseY + 110, -1),
      new THREE.Vector3(0, stemTopY, 0)
    ]);
    const stemTubeGeo = new THREE.TubeGeometry(stemCurve, 40, 1.2, 6, false);
    const stemTube = new THREE.Mesh(stemTubeGeo, new THREE.MeshBasicMaterial({
      color: primaryColor, wireframe: true, transparent: true, opacity: 0.65
    }));
    plantStemGroup.add(stemTube);

    const stemPts = stemCurve.getPoints(50);
    const stemLineGeo = new THREE.BufferGeometry().setFromPoints(stemPts);
    plantStemGroup.add(new THREE.Line(stemLineGeo, greenMat));

    // Leaves
    const createLeaf3D = (x, y, z, rotY, rotZ, scale = 1) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.rotation.y = rotY;
      group.rotation.z = rotZ;
      group.scale.setScalar(scale);

      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(8, 5, 20, 4, 30, 0);
      shape.bezierCurveTo(20, -4, 8, -5, 0, 0);

      const leafGeo = new THREE.ShapeGeometry(shape, 8);
      const leafMesh = new THREE.Mesh(leafGeo, new THREE.MeshBasicMaterial({
        color: primaryLight, wireframe: true, transparent: true, opacity: 0.55, side: THREE.DoubleSide
      }));
      group.add(leafMesh);

      const veinPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(28, 0, 0)];
      const veinGeo = new THREE.BufferGeometry().setFromPoints(veinPts);
      group.add(new THREE.Line(veinGeo, greenMat));

      for (let i = 0.2; i < 0.9; i += 0.2) {
        const vx = 30 * i;
        const vw = Math.sin(i * Math.PI) * 4;
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(vx, 0, 0), new THREE.Vector3(vx + 3, vw, 0)
        ]), greenFaintMat));
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(vx, 0, 0), new THREE.Vector3(vx + 3, -vw, 0)
        ]), greenFaintMat));
      }
      return group;
    };

    // Sub-group: Leaves
    const plantLeavesGroup = new THREE.Group();
    plantGroup.add(plantLeavesGroup);

    const leafPositions = [
      { y: stemBaseY + 25, rz: -0.8, rz2: 0.8 },
      { y: stemBaseY + 50, rz: -1.0, rz2: 0.6 },
      { y: stemBaseY + 75, rz: -0.7, rz2: 0.9 },
      { y: stemBaseY + 100, rz: -1.1, rz2: 0.5 },
    ];
    for (let i = 0; i < leafPositions.length; i++) {
      const lp = leafPositions[i];
      const sc = 1.2 - i * 0.15;
      plantLeavesGroup.add(createLeaf3D(2, lp.y, 2, i * 1.2, lp.rz, sc));
      plantLeavesGroup.add(createLeaf3D(-2, lp.y, -2, i * 1.2 + Math.PI, lp.rz2, sc * 0.9));
    }

    // Sub-group: Bud
    const plantBudGroup = new THREE.Group();
    plantGroup.add(plantBudGroup);

    const budGeo = new THREE.SphereGeometry(5, 8, 8);
    const budMesh = new THREE.Mesh(budGeo, new THREE.MeshBasicMaterial({
      color: primaryColor, wireframe: true, transparent: true, opacity: 0.6
    }));
    budMesh.position.set(0, stemTopY + 2, 0);
    budMesh.scale.set(1, 1.4, 1);
    plantBudGroup.add(budMesh);
    plantBudGroup.add(createDot(0, stemTopY + 8, 0, 2, accentColor));

    // === 6. BASE BOX ===
    const baseGroup = new THREE.Group();
    mainGroup.add(baseGroup);

    const baseW = 130, baseH = 50, baseD = 80;
    const baseCY = pyBot - baseH / 2;

    // Sub-group: Main box
    const baseBoxGroup = new THREE.Group();
    baseGroup.add(baseBoxGroup);

    const baseGeo = new THREE.BoxGeometry(baseW * 2, baseH, baseD * 2);
    const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({
      color: primaryColor, wireframe: true, transparent: true, opacity: 0.5
    }));
    baseMesh.position.y = baseCY;
    baseBoxGroup.add(baseMesh);

    // Sub-group: Corner details
    const baseDetailsGroup = new THREE.Group();
    baseGroup.add(baseDetailsGroup);

    const bx = baseW, by = baseH / 2, bz = baseD;
    const boxCorners = [
      [-bx, baseCY + by, -bz], [bx, baseCY + by, -bz],
      [-bx, baseCY + by, bz], [bx, baseCY + by, bz],
      [-bx, baseCY - by, -bz], [bx, baseCY - by, -bz],
      [-bx, baseCY - by, bz], [bx, baseCY - by, bz],
    ];
    for (const c of boxCorners) baseDetailsGroup.add(createSmallCube(c[0], c[1], c[2], 4));

    baseDetailsGroup.add(createDot(-bx, baseCY, 0, 2.5));
    baseDetailsGroup.add(createDot(bx, baseCY, 0, 2.5));
    baseDetailsGroup.add(createDot(0, baseCY, -bz, 2.5));
    baseDetailsGroup.add(createDot(0, baseCY, bz, 2.5));

    // === 7. ROOT COIL ===
    const rootCoilGroup = new THREE.Group();
    rootCoilGroup.position.y = baseCY;
    baseGroup.add(rootCoilGroup);

    // Sub-group: Main coils
    const rootCoilMainGroup = new THREE.Group();
    rootCoilGroup.add(rootCoilMainGroup);

    const coilPts = [];
    const coilTurns = 6, coilLen = 200, coilR = 18;
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const x = -coilLen / 2 + coilLen * t;
      const a = t * coilTurns * Math.PI * 2;
      const y = Math.sin(a) * coilR;
      const z = Math.cos(a) * coilR;
      coilPts.push(new THREE.Vector3(x, y, z));
    }
    rootCoilMainGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(coilPts), inkMedMat));

    const coilPts2 = [];
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const x = -coilLen / 2 + coilLen * t;
      const a = t * coilTurns * Math.PI * 2 + Math.PI;
      const y = Math.sin(a) * coilR * 0.7;
      const z = Math.cos(a) * coilR * 0.7;
      coilPts2.push(new THREE.Vector3(x, y, z));
    }
    rootCoilMainGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(coilPts2), inkLightMat));

    rootCoilMainGroup.add(createCurve([
      new THREE.Vector3(-coilLen / 2 - 20, 0, 0),
      new THREE.Vector3(-coilLen / 4, 3, 5),
      new THREE.Vector3(0, -2, -3),
      new THREE.Vector3(coilLen / 4, 4, 4),
      new THREE.Vector3(coilLen / 2 + 20, 0, 0)
    ], greenMat, 40));

    // Sub-group: Coil details (bulb and leaves)
    const rootCoilDetailsGroup = new THREE.Group();
    rootCoilGroup.add(rootCoilDetailsGroup);

    const bulbGeo = new THREE.SphereGeometry(10, 10, 10);
    const bulbMesh = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({
      color: primaryDark, wireframe: true, transparent: true, opacity: 0.6
    }));
    bulbMesh.position.set(-coilLen / 2 - 20, 0, 0);
    bulbMesh.scale.set(1.3, 1, 1);
    rootCoilDetailsGroup.add(bulbMesh);

    rootCoilDetailsGroup.add(createLeaf3D(-40, 5, 8, 0, -0.5, 0.5));
    rootCoilDetailsGroup.add(createLeaf3D(30, -3, -6, Math.PI, 0.4, 0.4));

    // === 8. LOWER ROOT NETWORK ===
    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = baseCY - baseH / 2;
    mainGroup.add(lowerGroup);

    // Sub-group: Taproot
    const rootsTaprootGroup = new THREE.Group();
    lowerGroup.add(rootsTaprootGroup);

    rootsTaprootGroup.add(createCurve([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-2, -40, 3),
      new THREE.Vector3(1, -80, -2),
      new THREE.Vector3(0, -120, 0)
    ], inkMat, 30));
    rootsTaprootGroup.add(createDot(0, -140, 0, 3, primaryDark));

    // Sub-group: Branching roots
    const rootsBranchesGroup = new THREE.Group();
    lowerGroup.add(rootsBranchesGroup);

    // Recursive roots
    const create3DRoot = (startX, startY, startZ, length, angleXZ, depth = 0, maxD = 4) => {
      if (depth > maxD) return;
      const endX = startX + Math.cos(angleXZ) * length;
      const endY = startY - length * 0.8;
      const endZ = startZ + Math.sin(angleXZ) * length * 0.3;

      const pts = [
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3((startX + endX) / 2 + (Math.random() - 0.5) * 10, (startY + endY) / 2, (startZ + endZ) / 2 + (Math.random() - 0.5) * 10),
        new THREE.Vector3(endX, endY, endZ)
      ];
      const opacity = 0.8 - depth * 0.12;
      const mat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: Math.max(0.25, opacity) });
      rootsBranchesGroup.add(createCurve(pts, mat, 15));

      const branches = depth < 2 ? 3 : 2;
      for (let i = 0; i < branches; i++) {
        const newAngle = angleXZ + (Math.random() - 0.5) * 1.5;
        create3DRoot(endX, endY, endZ, length * 0.6, newAngle, depth + 1, maxD);
      }
    };

    create3DRoot(-20, -15, -15, 40, -0.8, 0, 3);
    create3DRoot(20, -15, 15, 40, 0.8, 0, 3);
    create3DRoot(-10, -50, 10, 30, -1.2, 0, 2);
    create3DRoot(10, -50, -10, 30, 1.2, 0, 2);
    create3DRoot(0, -90, 0, 25, 0, 0, 2);

    // Sub-group: Orbital ellipses and dots
    const rootsOrbitsGroup = new THREE.Group();
    lowerGroup.add(rootsOrbitsGroup);

    for (let i = 0; i < 3; i++) {
      const r = 120 + i * 50;
      const pts = [];
      for (let j = 0; j <= 64; j++) {
        const a = (j / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, -60 - i * 15, Math.sin(a) * r * 0.4));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineDashedMaterial({
        color: primaryLight, transparent: true, opacity: 0.4 - i * 0.08, dashSize: 5, gapSize: 4
      });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      rootsOrbitsGroup.add(line);
    }

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      rootsOrbitsGroup.add(createDot(Math.cos(a) * 170, -75, Math.sin(a) * 68, 2, primaryLight));
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      rootsOrbitsGroup.add(createSmallCube(Math.cos(a) * 120, -60, Math.sin(a) * 48, 3.5, primaryLight));
    }

    // === 9. FERNS ===
    const createFern3D = (x, y, z, rotY, scale = 1) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.rotation.y = rotY;
      group.scale.setScalar(scale);

      const length = 80;
      const mainPts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(length * 0.3, length * 0.15, 0),
        new THREE.Vector3(length * 0.7, length * 0.35, 0),
        new THREE.Vector3(length, length * 0.3, 0)
      ];
      group.add(createCurve(mainPts, greenMat, 30));

      for (let i = 0.1; i < 0.95; i += 0.08) {
        const t = i;
        const sx = length * t;
        const sy = length * 0.35 * Math.sin(t * Math.PI * 0.8);
        const leafLen = length * 0.25 * Math.sin(t * Math.PI);

        group.add(createCurve([
          new THREE.Vector3(sx, sy, 0),
          new THREE.Vector3(sx + leafLen * 0.5, sy + leafLen * 0.6, leafLen * 0.2),
          new THREE.Vector3(sx + leafLen, sy + leafLen * 0.2, 0)
        ], greenLightMat, 8));

        group.add(createCurve([
          new THREE.Vector3(sx, sy, 0),
          new THREE.Vector3(sx + leafLen * 0.5, sy - leafLen * 0.4, -leafLen * 0.2),
          new THREE.Vector3(sx + leafLen, sy - leafLen * 0.1, 0)
        ], greenFaintMat, 8));
      }
      return group;
    };

    const fernGroup = new THREE.Group();
    mainGroup.add(fernGroup);

    // Sub-group: Left ferns
    const fernsLeftGroup = new THREE.Group();
    fernGroup.add(fernsLeftGroup);
    fernsLeftGroup.add(createFern3D(-180, 60, 40, -0.3, 1.0));
    fernsLeftGroup.add(createFern3D(-200, 30, -30, -0.8, 0.85));
    fernsLeftGroup.add(createFern3D(-160, 0, 60, 0.2, 0.7));

    // Sub-group: Right ferns
    const fernsRightGroup = new THREE.Group();
    fernGroup.add(fernsRightGroup);
    fernsRightGroup.add(createFern3D(180, 60, -40, Math.PI + 0.3, 1.0));
    fernsRightGroup.add(createFern3D(200, 30, 30, Math.PI + 0.8, 0.85));
    fernsRightGroup.add(createFern3D(160, 0, -60, Math.PI - 0.2, 0.7));

    // === 10. FLOWER DIAGRAMS ===
    const createFlowerDiagram3D = (x, y, z, scale = 1) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.scale.setScalar(scale);

      const petals = 6, r = 20;
      for (let i = 0; i < petals; i++) {
        const a = (i / petals) * Math.PI * 2;
        const px = Math.cos(a) * r;
        const pz = Math.sin(a) * r;
        group.add(createCurve([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(px * 0.5, 5, pz * 0.5),
          new THREE.Vector3(px, 0, pz)
        ], greenFaintMat, 10));
        group.add(createDot(px, 0, pz, 1.5, primaryColor));
      }

      group.add(createRing(r, 0, 24, greenFaintMat));
      group.add(createRing(r * 0.5, 0, 16, greenLightMat));
      group.add(createDot(0, 0, 0, 2.5, accentColor));

      return group;
    };

    const flowerDiagramGroup = new THREE.Group();
    mainGroup.add(flowerDiagramGroup);
    flowerDiagramGroup.add(createFlowerDiagram3D(-250, 300, -60, 1.2));
    flowerDiagramGroup.add(createFlowerDiagram3D(250, 300, 60, 1.2));

    // === 11. AMBIENT FLOATING PARTICLES ===
    const particleCount3D = 80;
    const particleGeo3D = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount3D * 3);
    const particleVelocities3D = [];

    for (let i = 0; i < particleCount3D; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 400;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 600 + 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      particleVelocities3D.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.15 + 0.05,
        z: (Math.random() - 0.5) * 0.1
      });
    }
    particleGeo3D.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat3D = new THREE.PointsMaterial({ color: accentColor, size: 1.5, transparent: true, opacity: 0.7 });
    const particles3D = new THREE.Points(particleGeo3D, particleMat3D);
    mainGroup.add(particles3D);

    // === AUTO-ROTATION ===
    let rotationY = 0;
    const zoomDistance = 1100;

    // Spring physics
    let currentScale = 1.0;
    let scaleVelocity = 0;
    const springStiffness = 0.04;
    const springDamping = 0.88;

    let animationId;
    let isMounted = true;
    let time = 0;

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      time += 0.005;

      const elapsed = clockRef.current.getElapsedTime();
      const breath = getBreathPhase(elapsed);

      // Auto-rotate
      rotationY += 0.001;

      // Camera orbit
      camera.position.x = Math.sin(rotationY) * zoomDistance;
      camera.position.y = 200;
      camera.position.z = Math.cos(rotationY) * zoomDistance;
      camera.lookAt(0, -100, 0);

      // Breath-synced scale
      const targetScale = 0.95 + breath * 0.1;
      const scaleForce = (targetScale - currentScale) * springStiffness;
      scaleVelocity = (scaleVelocity + scaleForce) * springDamping;
      currentScale += scaleVelocity;
      mainGroup.scale.setScalar(currentScale);

      // Animate torus rotation
      torusMesh.rotation.y = time * 0.3;
      torus2Mesh.rotation.y = -time * 0.2 + Math.PI / 4;
      torus3Mesh.rotation.y = time * 0.15 + Math.PI / 2;
      torus3Mesh.rotation.x = 0.3 + Math.sin(time) * 0.1;

      // Inner icosahedron rotation
      icoMesh.rotation.x = time * 0.5;
      icoMesh.rotation.y = time * 0.7;

      // Seed orbit animation
      seedOrbitsGroup.children.forEach((child, i) => {
        if (child.geometry && child.geometry.type === 'TorusGeometry') {
          child.rotation.z = time * (0.3 + i * 0.12);
        }
      });

      // Core sphere pulse with breath
      const pulse = 1 + breath * 0.1;
      coreSphereMesh.scale.setScalar(pulse);

      // Animate 3D particles
      const pos = particles3D.geometry.attributes.position.array;
      for (let i = 0; i < particleCount3D; i++) {
        pos[i * 3] += particleVelocities3D[i].x;
        pos[i * 3 + 1] += particleVelocities3D[i].y;
        pos[i * 3 + 2] += particleVelocities3D[i].z;
        if (pos[i * 3 + 1] > 400) {
          pos[i * 3 + 1] = -200;
          pos[i * 3] = (Math.random() - 0.5) * 400;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
        }
      }
      particles3D.geometry.attributes.position.needsUpdate = true;

      // === PROGRESSIVE BUILD - Update opacities based on meditation progress ===
      const totalLines = 50; // Total lines in meditation
      const linesRead = gardenLinesReadRef.current;
      const progress = Math.min(linesRead / totalLines, 1);

      // Define when each element should appear (progress thresholds)
      // Smooth fade-in over ~3 lines (6% progress)
      const fade = (p, start) => {
        const end = start + 0.06;
        if (p < start) return 0;
        if (p > end) return 1;
        const t = (p - start) / (end - start);
        return t * t * (3 - 2 * t); // smoothstep for gentle fade
      };

      // Target opacities based on meditation progress
      // 22 sub-elements spread across 50 lines = new element every ~2.3 lines
      // Natural growth: seed → roots → plant → bloom
      const targets = {
        seed: 1,                              // Always visible
        rootsTaproot: fade(progress, 0.02),   // Line 1: Taproot appears
        rootsBranches: fade(progress, 0.06),  // Line 3: Branches spread
        rootsOrbits: fade(progress, 0.10),    // Line 5: Root orbits
        rootCoilMain: fade(progress, 0.14),   // Line 7: Main coils
        rootCoilDetails: fade(progress, 0.18),// Line 9: Coil details
        baseBox: fade(progress, 0.22),        // Line 11: Base box
        baseDetails: fade(progress, 0.26),    // Line 13: Base corners
        seedOrbits: fade(progress, 0.30),     // Line 15: Seed energy orbits
        plantStem: fade(progress, 0.34),      // Line 17: Plant stem grows
        plantLeaves: fade(progress, 0.38),    // Line 19: Leaves unfold
        plantBud: fade(progress, 0.42),       // Line 21: Bud forms
        pyramidMain: fade(progress, 0.46),    // Line 23: Pyramid structure
        pyramidRings: fade(progress, 0.50),   // Line 25: Pyramid rings
        fernsLeft: fade(progress, 0.54),      // Line 27: Left ferns
        fernsRight: fade(progress, 0.58),     // Line 29: Right ferns
        torusMain: fade(progress, 0.62),      // Line 31: Torus meshes
        torusFlower: fade(progress, 0.66),    // Line 33: Torus flower pattern
        torusCore: fade(progress, 0.70),      // Line 35: Torus core
        vortexFunnels: fade(progress, 0.74),  // Line 37: Vortex funnels
        vortexLines: fade(progress, 0.78),    // Line 39: Vortex connections
        flowers: fade(progress, 0.84),        // Line 42: Flower diagrams
        particles: fade(progress, 0.92)       // Line 46: Floating particles
      };

      // Smooth lerp for gentle transitions
      const lerpSpeed = 0.08;
      for (const key in groupOpacities) {
        groupOpacities[key] += (targets[key] - groupOpacities[key]) * lerpSpeed;
      }

      // Apply opacities to all sub-groups
      // Seed core is always visible, orbits fade in separately
      setGroupOpacity(seedCoreGroup, groupOpacities.seed);
      setGroupOpacity(seedOrbitsGroup, groupOpacities.seedOrbits);

      // Roots sub-groups
      setGroupOpacity(rootsTaprootGroup, groupOpacities.rootsTaproot);
      setGroupOpacity(rootsBranchesGroup, groupOpacities.rootsBranches);
      setGroupOpacity(rootsOrbitsGroup, groupOpacities.rootsOrbits);

      // Root coil sub-groups
      setGroupOpacity(rootCoilMainGroup, groupOpacities.rootCoilMain);
      setGroupOpacity(rootCoilDetailsGroup, groupOpacities.rootCoilDetails);

      // Base sub-groups
      setGroupOpacity(baseBoxGroup, groupOpacities.baseBox);
      setGroupOpacity(baseDetailsGroup, groupOpacities.baseDetails);

      // Plant sub-groups
      setGroupOpacity(plantStemGroup, groupOpacities.plantStem);
      setGroupOpacity(plantLeavesGroup, groupOpacities.plantLeaves);
      setGroupOpacity(plantBudGroup, groupOpacities.plantBud);

      // Pyramid sub-groups
      setGroupOpacity(pyramidMainGroup, groupOpacities.pyramidMain);
      setGroupOpacity(pyramidRingsGroup, groupOpacities.pyramidRings);

      // Fern sub-groups
      setGroupOpacity(fernsLeftGroup, groupOpacities.fernsLeft);
      setGroupOpacity(fernsRightGroup, groupOpacities.fernsRight);

      // Torus sub-groups
      setGroupOpacity(torusMainGroup, groupOpacities.torusMain);
      setGroupOpacity(torusFlowerGroup, groupOpacities.torusFlower);
      setGroupOpacity(torusCoreGroup, groupOpacities.torusCore);

      // Vortex sub-groups
      setGroupOpacity(vortexFunnelsGroup, groupOpacities.vortexFunnels);
      setGroupOpacity(vortexLinesGroup, groupOpacities.vortexLines);

      // Flowers
      setGroupOpacity(flowerDiagramGroup, groupOpacities.flowers);

      // Particles opacity via material
      particleMat3D.opacity = groupOpacities.particles;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentMode, hue, getBreathPhase]);

  // ========== CORPUS STELLAE (Star Body / Vitruvian) ==========
  React.useEffect(() => {
    if (currentMode !== 'corpusStellae' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.00035);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 80, 500);
    camera.lookAt(0, 80, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, radius = 1.5, mat = accentDotMat) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 8), mat);
      mesh.position.set(x, y, z);
      return mesh;
    }

    function createSmallCube(x, y, z, size = 3, color = primaryColor) {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
      mesh.position.set(x, y, z);
      return mesh;
    }

    function createCurve(points, mat = tealMat, segments = 50) {
      const curve = new THREE.CatmullRomCurve3(points);
      const pts = curve.getPoints(segments);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    // === CROWN — SPIRAL GALAXY ===
    const crownGroup = new THREE.Group();
    crownGroup.position.y = 280;
    mainGroup.add(crownGroup);

    for (let arm = 0; arm < 3; arm++) {
      const armOffset = (arm / 3) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const r = 5 + t * 90;
        const a = armOffset + t * Math.PI * 3;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      crownGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealMat));
    }

    for (let i = 1; i <= 6; i++) {
      crownGroup.add(createRing(i * 15, 0, 48, tealDimMat));
    }

    const nebulaSphere = new THREE.Mesh(
      new THREE.SphereGeometry(12, 16, 16),
      new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.3 })
    );
    crownGroup.add(nebulaSphere);

    const dodeca = new THREE.Mesh(
      new THREE.DodecahedronGeometry(7, 0),
      new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.5 })
    );
    crownGroup.add(dodeca);
    crownGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    for (let i = 0; i < 15; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 20 + Math.random() * 70;
      crownGroup.add(createDot(Math.cos(a) * r, 0, Math.sin(a) * r, 1, accentDotMat));
    }

    // === SPINE — CENTRAL COLUMN ===
    const spineGroup = new THREE.Group();
    mainGroup.add(spineGroup);

    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 260, 0), new THREE.Vector3(1, 220, 1),
      new THREE.Vector3(-1, 180, -1), new THREE.Vector3(0, 140, 0),
      new THREE.Vector3(1, 100, 1), new THREE.Vector3(-1, 60, -1),
      new THREE.Vector3(0, 35, 0),
    ]);
    const spineTube = new THREE.Mesh(
      new THREE.TubeGeometry(spineCurve, 60, 2, 6, false),
      new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.2 })
    );
    spineGroup.add(spineTube);
    spineGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(spineCurve.getPoints(80)), tealBrightMat));

    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      const y = 260 - t * 280;
      const r = 6 + Math.sin(t * Math.PI) * 4;
      spineGroup.add(createRing(r, y, 12, tealDimMat));
    }

    // === CHAKRA POINTS ===
    const chakraData = [
      { y: 260, r: 14 }, { y: 225, r: 12 }, { y: 195, r: 11 },
      { y: 155, r: 16 }, { y: 115, r: 13 }, { y: 75, r: 11 }, { y: 35, r: 12 },
    ];
    const chakraMeshes = [];
    chakraData.forEach((ch, ci) => {
      const group = new THREE.Group();
      group.position.y = ch.y;
      mainGroup.add(group);

      const outerSphere = new THREE.Mesh(
        new THREE.SphereGeometry(ch.r, 12, 12),
        new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.15 })
      );
      group.add(outerSphere);

      const octa = new THREE.Mesh(
        new THREE.OctahedronGeometry(ch.r * 0.45, 0),
        new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.4 })
      );
      group.add(octa);

      const pCount = 4 + ci;
      for (let p = 0; p < pCount; p++) {
        const a = (p / pCount) * Math.PI * 2;
        const r = ch.r * 1.2;
        group.add(createCurve([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(a) * r * 0.6, 3, Math.sin(a) * r * 0.6),
          new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r),
        ], tealDimMat, 12));
        group.add(createDot(Math.cos(a) * r, 0, Math.sin(a) * r, 1, accentDotMat));
      }
      group.add(createRing(ch.r * 1.4, 0, 32, tealDimMat));
      group.add(createDot(0, 0, 0, 2, coreDotMat));
      chakraMeshes.push({ group, outerSphere, octa });
    });

    // === ENERGY CHANNELS ===
    const idaPts = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const y = 260 - t * 230;
      const a = t * Math.PI * 3.5;
      const r = 25 + Math.sin(t * Math.PI) * 10;
      idaPts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    mainGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(idaPts), tealDarkMat));

    const pingPts = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const y = 260 - t * 230;
      const a = t * Math.PI * 3.5 + Math.PI;
      const r = 25 + Math.sin(t * Math.PI) * 10;
      pingPts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    mainGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pingPts), tealDarkMat));

    // === RIBCAGE ===
    const ribGroup = new THREE.Group();
    ribGroup.position.y = 155;
    mainGroup.add(ribGroup);

    for (let i = 0; i < 12; i++) {
      const t = (i - 5.5) / 6;
      const ry = t * 50;
      const ribWidth = (1 - Math.abs(t) * 0.6) * 70;
      const ribDepth = (1 - Math.abs(t) * 0.5) * 40;
      const ribPts = [];
      for (let j = 0; j <= 32; j++) {
        const a = (j / 32) * Math.PI;
        ribPts.push(new THREE.Vector3(Math.sin(a) * ribWidth, ry, -Math.cos(a) * ribDepth + ribDepth * 0.3));
      }
      ribGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ribPts), i % 3 === 0 ? tealMat : tealDimMat));
    }

    // === VITRUVIAN ARMS ===
    const armGroup = new THREE.Group();
    armGroup.position.y = 180;
    mainGroup.add(armGroup);

    function createArm(side) {
      const s = side;
      const armCurve = [
        new THREE.Vector3(s * 15, 0, 0), new THREE.Vector3(s * 50, -10, 10),
        new THREE.Vector3(s * 90, -30, 5), new THREE.Vector3(s * 120, -15, 0),
      ];
      armGroup.add(createCurve(armCurve, tealMat, 30));
      const curve = new THREE.CatmullRomCurve3(armCurve);
      armGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, 1.5, 5, false),
        new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.12 })
      ));
      armCurve.forEach(p => armGroup.add(createDot(p.x, p.y, p.z, 2, accentDotMat)));

      for (let f = 0; f < 5; f++) {
        const spread = (f - 2) * 0.25;
        const fLen = 15 + (f === 2 ? 5 : 0);
        const base = armCurve[3];
        const fingerEnd = new THREE.Vector3(
          base.x + s * Math.cos(spread) * fLen,
          base.y + Math.sin(spread) * fLen * 0.5 - 5,
          base.z + Math.sin(spread + s) * 5
        );
        armGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([base, fingerEnd]), tealDimMat));
        armGroup.add(createDot(fingerEnd.x, fingerEnd.y, fingerEnd.z, 0.8, accentDotMat));
      }
    }
    createArm(1);
    createArm(-1);

    // === LEGS ===
    const legGroup = new THREE.Group();
    legGroup.position.y = 20;
    mainGroup.add(legGroup);

    function createLeg(side) {
      const s = side;
      const legCurve = [
        new THREE.Vector3(s * 12, 0, 0), new THREE.Vector3(s * 18, -60, 5),
        new THREE.Vector3(s * 15, -120, 3), new THREE.Vector3(s * 15, -170, 0),
        new THREE.Vector3(s * 20, -180, 8),
      ];
      legGroup.add(createCurve(legCurve, tealMat, 30));
      const curve = new THREE.CatmullRomCurve3(legCurve);
      legGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(curve, 25, 2, 5, false),
        new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.12 })
      ));
      [0, 2, 3].forEach(idx => legGroup.add(createDot(legCurve[idx].x, legCurve[idx].y, legCurve[idx].z, 2.5, accentDotMat)));
      legGroup.add(createRing(6, -120, 12, tealDimMat).translateX(s * 15).translateZ(3));
    }
    createLeg(1);
    createLeg(-1);

    // === VITRUVIAN CIRCLE ===
    const vitruvianGroup = new THREE.Group();
    vitruvianGroup.position.y = 130;
    mainGroup.add(vitruvianGroup);

    const greatCircle = new THREE.Mesh(
      new THREE.TorusGeometry(200, 0.8, 4, 80),
      new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.18 })
    );
    greatCircle.rotation.x = Math.PI / 2;
    vitruvianGroup.add(greatCircle);

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      vitruvianGroup.add(createSmallCube(Math.cos(a) * 200, 0, Math.sin(a) * 200, 4, primaryColor));
    }

    // === CONSTELLATION SPHERE ===
    const celestialSphere = new THREE.Mesh(
      new THREE.SphereGeometry(250, 10, 10),
      new THREE.MeshBasicMaterial({ color: primaryDim, wireframe: true, transparent: true, opacity: 0.06 })
    );
    celestialSphere.position.y = 130;
    mainGroup.add(celestialSphere);

    // === PARTICLES ===
    const particleCount = 50;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 500;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 600 + 100;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 500;
      particleVelocities.push({ x: (Math.random() - 0.5) * 0.08, y: (Math.random() - 0.5) * 0.12 + 0.06, z: (Math.random() - 0.5) * 0.08 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: primaryLight, size: 1.5, transparent: true, opacity: 0.35 }));
    mainGroup.add(particles);

    // === ANIMATION ===
    let time = 0;
    let animId;
    let rotCurrent = { x: 0.1, y: 0 };
    let frameCount = 0; // Skip touch rotation for first frames to avoid swipe interference

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      nebulaSphere.rotation.y = time * 0.3;
      dodeca.rotation.x = time * 0.5;
      dodeca.rotation.y = time * 0.7;

      const breath = Math.sin(time * 2);
      chakraMeshes.forEach((ch, i) => {
        ch.octa.rotation.x = time * (0.3 + i * 0.08);
        ch.octa.rotation.y = time * (0.2 + i * 0.1);
        ch.outerSphere.scale.setScalar(1 + breath * 0.08);
      });

      celestialSphere.rotation.y = time * 0.05;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (pos[i * 3 + 1] > 450) {
          pos[i * 3 + 1] = -150;
          pos[i * 3] = (Math.random() - 0.5) * 500;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 500;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== MACHINA TEMPORIS (Clockwork) ==========
  React.useEffect(() => {
    if (currentMode !== 'machinaTemporis' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.0004);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 60, 500);
    camera.lookAt(0, 40, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createSmallCube(x, y, z, s = 3, color = primaryColor) {
      const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createCurve(points, mat = tealMat, segments = 50) {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments)), mat);
    }

    // === ARMILLARY SPHERE ===
    const armillaryGroup = new THREE.Group();
    armillaryGroup.position.y = 120;
    mainGroup.add(armillaryGroup);

    const ringData = [
      { r: 100, tiltX: 0, tiltZ: 0 }, { r: 100, tiltX: Math.PI / 6, tiltZ: 0.3 },
      { r: 100, tiltX: -Math.PI / 4, tiltZ: -0.2 }, { r: 95, tiltX: Math.PI / 3, tiltZ: 0.5 },
      { r: 90, tiltX: -Math.PI / 6, tiltZ: 0.8 }, { r: 85, tiltX: Math.PI / 2.5, tiltZ: -0.4 },
    ];
    const armillaryRings = [];
    ringData.forEach((rd, i) => {
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(rd.r, i === 0 ? 1.2 : 0.8, 6, 64),
        new THREE.MeshBasicMaterial({ color: primaryDim, wireframe: true, transparent: true, opacity: 0.2 })
      );
      torus.rotation.x = rd.tiltX;
      torus.rotation.z = rd.tiltZ;
      armillaryGroup.add(torus);
      armillaryRings.push(torus);
    });

    const zodiacRing = new THREE.Mesh(
      new THREE.TorusGeometry(105, 3, 4, 64),
      new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.15 })
    );
    zodiacRing.rotation.x = 0.1;
    armillaryGroup.add(zodiacRing);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      armillaryGroup.add(createSmallCube(Math.cos(a) * 108, 0, Math.sin(a) * 108, 4, i % 3 === 0 ? primaryLight : primaryColor));
    }

    const poleGeo = new THREE.CylinderGeometry(1, 1, 220, 6);
    armillaryGroup.add(new THREE.Mesh(poleGeo,
      new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.2 })));

    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(15, 14, 14),
      new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.2 })
    );
    armillaryGroup.add(centerSphere);

    const innerIco = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8, 0),
      new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.45 })
    );
    armillaryGroup.add(innerIco);
    armillaryGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    const orbitalBodies = [];
    const orbitData = [{ r: 35, speed: 1.2, size: 3 }, { r: 55, speed: 0.7, size: 4 }, { r: 75, speed: 0.4, size: 3.5 }];
    orbitData.forEach((od) => {
      armillaryGroup.add(createRing(od.r, 0, 48, tealDimMat));
      const body = createDot(od.r, 0, 0, od.size, accentDotMat);
      armillaryGroup.add(body);
      orbitalBodies.push({ mesh: body, r: od.r, speed: od.speed, angle: Math.random() * Math.PI * 2 });
    });

    // === GEARS ===
    function createGear(x, y, z, radius, teeth, mat = tealMat) {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.add(createRing(radius, 0, 48, mat));
      group.add(createRing(radius * 0.4, 0, 24, tealDimMat));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const pts = [
          new THREE.Vector3(Math.cos(a) * radius * 0.4, 0, Math.sin(a) * radius * 0.4),
          new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDimMat));
      }
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        const inner = radius;
        const outer = radius + 4;
        const pts = [
          new THREE.Vector3(Math.cos(a - 0.04) * inner, 0, Math.sin(a - 0.04) * inner),
          new THREE.Vector3(Math.cos(a - 0.02) * outer, 0, Math.sin(a - 0.02) * outer),
          new THREE.Vector3(Math.cos(a + 0.02) * outer, 0, Math.sin(a + 0.02) * outer),
          new THREE.Vector3(Math.cos(a + 0.04) * inner, 0, Math.sin(a + 0.04) * inner),
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
      }
      group.add(createDot(0, 0, 0, 2, accentDotMat));
      return group;
    }

    const gearGroup = new THREE.Group();
    gearGroup.position.set(-180, 120, 0);
    mainGroup.add(gearGroup);
    const gear1 = createGear(0, 0, 0, 40, 20, tealMat);
    const gear2 = createGear(0, -70, 0, 28, 14, tealDarkMat);
    const gear3 = createGear(0, -120, 0, 18, 10, tealDimMat);
    gearGroup.add(gear1, gear2, gear3);

    const gearGroupR = new THREE.Group();
    gearGroupR.position.set(180, 120, 0);
    mainGroup.add(gearGroupR);
    const gearR1 = createGear(0, 0, 0, 35, 18, tealMat);
    const gearR2 = createGear(0, -60, 0, 25, 12, tealDarkMat);
    const gearR3 = createGear(0, -105, 0, 20, 10, tealDimMat);
    const gearR4 = createGear(0, -140, 0, 14, 8, tealDimMat);
    gearGroupR.add(gearR1, gearR2, gearR3, gearR4);

    // === HOURGLASS ===
    const hourglassGroup = new THREE.Group();
    hourglassGroup.position.y = -80;
    mainGroup.add(hourglassGroup);

    const glassH = 80, glassR = 40, neckR = 5;
    function createHourglassHalf(flip) {
      const pts = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const r = neckR + (glassR - neckR) * Math.pow(t, 0.7);
        pts.push(new THREE.Vector2(r, t * glassH * flip));
      }
      return new THREE.Mesh(new THREE.LatheGeometry(pts, 16),
        new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.15 }));
    }
    hourglassGroup.add(createHourglassHalf(1));
    hourglassGroup.add(createHourglassHalf(-1));
    hourglassGroup.add(createRing(neckR, 0, 16, tealBrightMat));
    hourglassGroup.add(createDot(0, 0, 0, 2, coreDotMat));

    // Sand particles
    const sandCount = 60;
    const sandGeo = new THREE.BufferGeometry();
    const sandPositions = new Float32Array(sandCount * 3);
    const sandVelocities = [];
    for (let i = 0; i < sandCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 3;
      sandPositions[i * 3] = Math.cos(a) * r;
      sandPositions[i * 3 + 1] = Math.random() * glassH * 0.8;
      sandPositions[i * 3 + 2] = Math.sin(a) * r;
      sandVelocities.push({ speed: 0.3 + Math.random() * 0.5 });
    }
    sandGeo.setAttribute("position", new THREE.BufferAttribute(sandPositions, 3));
    const sandParticles = new THREE.Points(sandGeo,
      new THREE.PointsMaterial({ color: primaryLight, size: 1.2, transparent: true, opacity: 0.6 }));
    hourglassGroup.add(sandParticles);

    // === PENDULUM ===
    const pendulumGroup = new THREE.Group();
    pendulumGroup.position.y = -180;
    mainGroup.add(pendulumGroup);
    pendulumGroup.add(createDot(0, 50, 0, 3, accentDotMat));
    pendulumGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 50, 0), new THREE.Vector3(0, -50, 0)]), tealMat));
    const bob = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 3, 16),
      new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.25 })
    );
    bob.position.y = -50;
    pendulumGroup.add(bob);
    pendulumGroup.add(createDot(0, -50, 0, 2.5, coreDotMat));

    // === DIALS ===
    function createDial(x, y, z, radius, divisions) {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.add(createRing(radius, 0, 64, tealMat));
      group.add(createRing(radius * 0.85, 0, 48, tealDarkMat));
      for (let i = 0; i < divisions; i++) {
        const a = (i / divisions) * Math.PI * 2;
        const inner = i % (divisions / 4) === 0 ? radius * 0.7 : radius * 0.82;
        const pts = [
          new THREE.Vector3(Math.cos(a) * inner, 0, Math.sin(a) * inner),
          new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
          i % (divisions / 4) === 0 ? tealBrightMat : tealDimMat));
      }
      const handMesh = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, radius * 0.75)]),
        tealBrightMat);
      group.add(handMesh);
      group.userData.hand = handMesh;
      group.add(createDot(0, 0, 0, 2.5, coreDotMat));
      return group;
    }
    const dialL = createDial(-200, 280, 0, 45, 24);
    const dialR = createDial(200, 280, 0, 35, 60);
    const dialBot = createDial(0, -300, 0, 50, 12);
    mainGroup.add(dialL, dialR, dialBot);

    // === PARTICLES ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 400;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 700 + 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      particleVelocities.push({ x: (Math.random() - 0.5) * 0.08, y: (Math.random() - 0.5) * 0.1 + 0.04, z: (Math.random() - 0.5) * 0.08 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: primaryLight, size: 1.5, transparent: true, opacity: 0.35 }));
    mainGroup.add(particles);

    // === ANIMATION ===
    let time = 0;
    let animId;
    let frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      armillaryRings.forEach((ring, i) => ring.rotation.y += 0.001 * (1 + i * 0.3) * (i % 2 === 0 ? 1 : -1));
      zodiacRing.rotation.y += 0.0005;
      innerIco.rotation.x = time * 0.5;
      innerIco.rotation.y = time * 0.7;
      centerSphere.scale.setScalar(1 + Math.sin(time * 2) * 0.08);

      orbitalBodies.forEach((ob) => {
        ob.angle += ob.speed * 0.003;
        ob.mesh.position.x = Math.cos(ob.angle) * ob.r;
        ob.mesh.position.z = Math.sin(ob.angle) * ob.r;
      });

      gear1.rotation.y = time * 0.4;
      gear2.rotation.y = -time * 0.57;
      gear3.rotation.y = time * 0.8;
      gearR1.rotation.y = -time * 0.35;
      gearR2.rotation.y = time * 0.5;
      gearR3.rotation.y = -time * 0.7;
      gearR4.rotation.y = time * 1.0;

      dialL.userData.hand.rotation.y = time * 0.1;
      dialR.userData.hand.rotation.y = time * 1.2;
      dialBot.userData.hand.rotation.y = time * 0.008;

      pendulumGroup.rotation.z = Math.sin(time * 1.5) * 0.25;

      const sPos = sandParticles.geometry.attributes.position.array;
      for (let i = 0; i < sandCount; i++) {
        sPos[i * 3 + 1] -= sandVelocities[i].speed * 0.3;
        if (sPos[i * 3 + 1] < -glassH * 0.7) {
          sPos[i * 3 + 1] = glassH * 0.6;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 3;
          sPos[i * 3] = Math.cos(a) * r;
          sPos[i * 3 + 2] = Math.sin(a) * r;
        }
      }
      sandParticles.geometry.attributes.position.needsUpdate = true;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (pos[i * 3 + 1] > 400) {
          pos[i * 3 + 1] = -250;
          pos[i * 3] = (Math.random() - 0.5) * 400;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== OCEANUS PROFUNDUS (Deep Ocean) ==========
  React.useEffect(() => {
    if (currentMode !== 'oceanusProfundus' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000205, 0.0003);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 60, 500);
    camera.lookAt(0, 20, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createCurve(points, mat = tealMat, segments = 50) {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments)), mat);
    }

    let tseed = 42;
    function tRand() { tseed = (tseed * 16807) % 2147483647; return (tseed - 1) / 2147483646; }

    // === JELLYFISH CATHEDRAL ===
    const jellyGroup = new THREE.Group();
    jellyGroup.position.y = 180;
    mainGroup.add(jellyGroup);

    for (let layer = 0; layer < 4; layer++) {
      const r = 70 - layer * 8;
      const bellMesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16 - layer * 2, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
        new THREE.MeshBasicMaterial({ color: layer === 0 ? primaryColor : (layer === 1 ? primaryDark : primaryDim), wireframe: true, transparent: true, opacity: 0.15 - layer * 0.03 })
      );
      jellyGroup.add(bellMesh);
    }

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const phi = t * Math.PI * 0.6;
        const r = 70;
        pts.push(new THREE.Vector3(Math.sin(phi) * Math.cos(a) * r, Math.cos(phi) * r, Math.sin(phi) * Math.sin(a) * r));
      }
      jellyGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealDarkMat));
    }

    for (let i = 1; i <= 5; i++) {
      const phi = (i / 8) * Math.PI * 0.6;
      const ringR = Math.sin(phi) * 70;
      const ringY = Math.cos(phi) * 70;
      jellyGroup.add(createRing(ringR, ringY, 32, tealDimMat));
    }

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = 40;
      jellyGroup.add(createCurve([
        new THREE.Vector3(0, 50, 0),
        new THREE.Vector3(Math.cos(a) * r * 0.4, 30, Math.sin(a) * r * 0.4),
        new THREE.Vector3(Math.cos(a) * r, 5, Math.sin(a) * r),
      ], tealDimMat, 15));
      jellyGroup.add(createDot(Math.cos(a) * r, 5, Math.sin(a) * r, 2, accentDotMat));
    }

    const jellyCore = new THREE.Mesh(
      new THREE.SphereGeometry(10, 12, 12),
      new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.3 })
    );
    jellyCore.position.y = 40;
    jellyGroup.add(jellyCore);
    jellyGroup.add(createDot(0, 40, 0, 3, coreDotMat));

    // Tentacles
    for (let t = 0; t < 16; t++) {
      const baseA = (t / 16) * Math.PI * 2;
      const baseR = 55 + tRand() * 15;
      const length = 120 + tRand() * 80;
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const st = s / 8;
        pts.push(new THREE.Vector3(
          Math.cos(baseA) * baseR * (1 - st * 0.3) + tRand() * 15 * st,
          -st * length,
          Math.sin(baseA) * baseR * (1 - st * 0.3) + tRand() * 15 * st
        ));
      }
      jellyGroup.add(createCurve(pts, t % 3 === 0 ? tealMat : tealDarkMat, 20));
    }

    for (let oa = 0; oa < 4; oa++) {
      const a = (oa / 4) * Math.PI * 2 + Math.PI / 8;
      const pts = [];
      for (let s = 0; s <= 12; s++) {
        const st = s / 12;
        const ruffle = Math.sin(st * Math.PI * 4) * 15 * st;
        pts.push(new THREE.Vector3(
          Math.cos(a) * (30 + ruffle) * (1 - st * 0.2),
          -st * 150,
          Math.sin(a) * (30 + ruffle) * (1 - st * 0.2)
        ));
      }
      jellyGroup.add(createCurve(pts, tealBrightMat, 30));
    }

    // === NAUTILUS SHELL ===
    const nautilusGroup = new THREE.Group();
    nautilusGroup.position.set(-200, 60, 0);
    mainGroup.add(nautilusGroup);

    const spiralPts = [];
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const a = t * Math.PI * 5;
      const r = Math.pow(1.618, t * 3) * 3;
      spiralPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    nautilusGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(spiralPts), tealMat));
    nautilusGroup.add(createDot(0, 0, 0, 2.5, coreDotMat));

    // === CORAL REEF ===
    const coralGroup = new THREE.Group();
    coralGroup.position.y = -120;
    mainGroup.add(coralGroup);

    const gridSize = 300, gridDiv = 15;
    for (let i = -gridDiv / 2; i <= gridDiv / 2; i++) {
      const x = (i / (gridDiv / 2)) * gridSize;
      coralGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, -gridSize), new THREE.Vector3(x, 0, gridSize)]),
        new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.1 })
      ));
      coralGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-gridSize, 0, x), new THREE.Vector3(gridSize, 0, x)]),
        new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.1 })
      ));
    }

    function createCoral(x, z, height, depth = 0, maxD = 3) {
      if (depth > maxD) return;
      const sway = (tRand() - 0.5) * 10;
      coralGroup.add(createCurve([
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(x + sway * 0.5, height * 0.5, z + sway * 0.3),
        new THREE.Vector3(x + sway, height, z + sway * 0.5),
      ], depth === 0 ? tealMat : tealDarkMat, 10));
      coralGroup.add(createDot(x + sway, height, z + sway * 0.5, 1.5 - depth * 0.3, accentDotMat));
      const branches = depth < 1 ? 3 : 2;
      for (let b = 0; b < branches; b++) {
        const ba = tRand() * Math.PI * 2;
        createCoral(x + sway + Math.cos(ba) * 8, z + sway * 0.5 + Math.sin(ba) * 8, height * 0.6, depth + 1, maxD);
      }
    }
    createCoral(-100, -40, 50, 0, 3);
    createCoral(-60, 30, 40, 0, 2);
    createCoral(80, -30, 55, 0, 3);
    createCoral(120, 20, 35, 0, 2);

    // === FISH SCHOOLS ===
    const fishGroup = new THREE.Group();
    fishGroup.position.y = 100;
    mainGroup.add(fishGroup);

    const fishData = [];
    for (let school = 0; school < 3; school++) {
      const centerA = (school / 3) * Math.PI * 2;
      const centerR = 140 + school * 20;
      const centerY = 20 - school * 30;
      for (let f = 0; f < 8; f++) {
        const offset = { x: (tRand() - 0.5) * 30, y: (tRand() - 0.5) * 15, z: (tRand() - 0.5) * 30 };
        const fishMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(3 + tRand() * 2, 0),
          new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.35 })
        );
        fishMesh.scale.set(2, 0.8, 0.6);
        fishGroup.add(fishMesh);
        fishData.push({ mesh: fishMesh, baseAngle: centerA, radius: centerR, baseY: centerY, offset, speed: 0.2 + tRand() * 0.15, phase: tRand() * Math.PI * 2 });
      }
    }

    // === THERMAL VENTS ===
    const ventGroup = new THREE.Group();
    ventGroup.position.y = -120;
    mainGroup.add(ventGroup);

    const ventPositions = [{ x: -180, z: -60 }, { x: 170, z: 70 }, { x: -20, z: -100 }];
    const ventParticleData = [];
    ventPositions.forEach((vp) => {
      const chimneyPts = [
        new THREE.Vector2(8, 0), new THREE.Vector2(6, 15),
        new THREE.Vector2(5, 30), new THREE.Vector2(4, 45), new THREE.Vector2(3.5, 55),
      ];
      const chimney = new THREE.Mesh(new THREE.LatheGeometry(chimneyPts, 8),
        new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.2 }));
      chimney.position.set(vp.x, 0, vp.z);
      ventGroup.add(chimney);
      ventGroup.add(createDot(vp.x, 55, vp.z, 2, coreDotMat));
      for (let i = 0; i < 20; i++) {
        ventParticleData.push({ x: vp.x, z: vp.z, y: Math.random() * 100 + 55, speed: 0.3 + Math.random() * 0.5, drift: (Math.random() - 0.5) * 0.2, driftZ: (Math.random() - 0.5) * 0.2 });
      }
    });

    const ventParticleGeo = new THREE.BufferGeometry();
    const vpPositions = new Float32Array(ventParticleData.length * 3);
    ventParticleData.forEach((vp, i) => {
      vpPositions[i * 3] = vp.x + (Math.random() - 0.5) * 5;
      vpPositions[i * 3 + 1] = vp.y;
      vpPositions[i * 3 + 2] = vp.z + (Math.random() - 0.5) * 5;
    });
    ventParticleGeo.setAttribute("position", new THREE.BufferAttribute(vpPositions, 3));
    const ventParticles = new THREE.Points(ventParticleGeo,
      new THREE.PointsMaterial({ color: primaryLight, size: 2, transparent: true, opacity: 0.5 }));
    ventGroup.add(ventParticles);

    // === PARTICLES (marine snow) ===
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 500;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 600 + 50;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 500;
      particleVelocities.push({ x: (Math.random() - 0.5) * 0.06, y: -(0.03 + Math.random() * 0.08), z: (Math.random() - 0.5) * 0.06 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo,
      new THREE.PointsMaterial({ color: primaryLight, size: 1.2, transparent: true, opacity: 0.3 }));
    mainGroup.add(particles);

    // === ANIMATION ===
    let time = 0;
    let animId;
    let frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      const pulse = 1 + Math.sin(time * 1.5) * 0.06;
      jellyGroup.children.forEach((child) => {
        if (child.geometry && child.geometry.type === "SphereGeometry" && child !== jellyCore) {
          child.scale.set(pulse, 1, pulse);
        }
      });
      jellyCore.rotation.y = time * 0.5;
      jellyCore.scale.setScalar(1 + Math.sin(time * 2) * 0.1);

      fishData.forEach((fd) => {
        fd.baseAngle += fd.speed * 0.003;
        const x = Math.cos(fd.baseAngle + fd.phase) * fd.radius + fd.offset.x;
        const y = fd.baseY + Math.sin(time * 2 + fd.phase) * 5 + fd.offset.y;
        const z = Math.sin(fd.baseAngle + fd.phase) * fd.radius * 0.6 + fd.offset.z;
        fd.mesh.position.set(x, y, z);
        fd.mesh.rotation.y = fd.baseAngle + fd.phase + Math.PI / 2;
      });

      const vpArr = ventParticles.geometry.attributes.position.array;
      ventParticleData.forEach((vp, i) => {
        vpArr[i * 3] += vp.drift;
        vpArr[i * 3 + 1] += vp.speed;
        vpArr[i * 3 + 2] += vp.driftZ;
        if (vpArr[i * 3 + 1] > 200) {
          vpArr[i * 3] = vp.x + (Math.random() - 0.5) * 5;
          vpArr[i * 3 + 1] = 55;
          vpArr[i * 3 + 2] = vp.z + (Math.random() - 0.5) * 5;
        }
      });
      ventParticles.geometry.attributes.position.needsUpdate = true;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x + Math.sin(time + i) * 0.02;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (pos[i * 3 + 1] < -300) {
          pos[i * 3 + 1] = 350;
          pos[i * 3] = (Math.random() - 0.5) * 500;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 500;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== AQUA VITAE (Water of Life) ==========
  React.useEffect(() => {
    if (currentMode !== 'aquaVitae' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 150, 450);
    camera.lookAt(0, 30, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.6 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.4 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.25 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 444;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    // Water surface grid
    const surfaceGroup = new THREE.Group();
    mainGroup.add(surfaceGroup);
    const gridSize = 300, gridDiv = 30;
    for (let i = 0; i <= gridDiv; i++) {
      const t = (i / gridDiv - 0.5) * gridSize;
      surfaceGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-gridSize / 2, 0, t), new THREE.Vector3(gridSize / 2, 0, t)]), tealDimMat));
      surfaceGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(t, 0, -gridSize / 2), new THREE.Vector3(t, 0, gridSize / 2)]), tealDimMat));
    }

    // Ripples
    const ripples = [];
    const rippleSources = [{ x: 0, z: 0 }, { x: -80, z: 60 }, { x: 70, z: -50 }, { x: -40, z: -80 }, { x: 90, z: 70 }];
    rippleSources.forEach((src, srcIdx) => {
      for (let r = 1; r <= 6; r++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 20, 0.5, 4, 48), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.3 / r }));
        ring.position.set(src.x, 1, src.z);
        ring.rotation.x = Math.PI / 2;
        surfaceGroup.add(ring);
        ripples.push({ mesh: ring, baseRadius: r * 20, source: src, phase: srcIdx * 0.5 + r * 0.3, speed: 0.8 + rand() * 0.4 });
      }
    });

    // H2O molecules
    const moleculeGroup = new THREE.Group();
    moleculeGroup.position.y = 120;
    mainGroup.add(moleculeGroup);

    function createH2O(x, y, z, scale = 1) {
      const mol = new THREE.Group();
      mol.position.set(x, y, z);
      mol.scale.setScalar(scale);
      const oxygen = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 12), new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.35 }));
      mol.add(oxygen);
      mol.add(createDot(0, 0, 0, 3, coreDotMat));
      const angle = 104.5 * Math.PI / 180, bondLength = 20;
      const h1Pos = new THREE.Vector3(Math.sin(angle / 2) * bondLength, Math.cos(angle / 2) * bondLength, 0);
      const h2Pos = new THREE.Vector3(-Math.sin(angle / 2) * bondLength, Math.cos(angle / 2) * bondLength, 0);
      mol.add(new THREE.Mesh(new THREE.SphereGeometry(5, 10, 10), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.3 }))).position.copy(h1Pos);
      mol.add(createDot(h1Pos.x, h1Pos.y, h1Pos.z, 2, accentDotMat));
      mol.add(new THREE.Mesh(new THREE.SphereGeometry(5, 10, 10), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.3 }))).position.copy(h2Pos);
      mol.add(createDot(h2Pos.x, h2Pos.y, h2Pos.z, 2, accentDotMat));
      mol.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), h1Pos]), tealMat));
      mol.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), h2Pos]), tealMat));
      return mol;
    }

    const centralMol = createH2O(0, 0, 0, 1.5);
    moleculeGroup.add(centralMol);

    // Vortex
    const vortexGroup = new THREE.Group();
    vortexGroup.position.set(-100, 0, -80);
    mainGroup.add(vortexGroup);
    for (let layer = 0; layer < 4; layer++) {
      const pts = [];
      const startY = 80 - layer * 30, turns = 3;
      for (let i = 0; i <= 80; i++) {
        const t = i / 80, a = t * turns * Math.PI * 2, r = 40 * (1 - t * 0.7), y = startY - t * 80;
        pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      vortexGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: layer === 0 ? primaryColor : primaryDim, transparent: true, opacity: 0.4 - layer * 0.08 })));
    }
    vortexGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // Snowflakes
    const snowflakeGroup = new THREE.Group();
    snowflakeGroup.position.y = 200;
    mainGroup.add(snowflakeGroup);

    function createSnowflake(x, y, z, size = 30) {
      const flake = new THREE.Group();
      flake.position.set(x, y, z);
      for (let arm = 0; arm < 6; arm++) {
        const a = (arm / 6) * Math.PI * 2;
        flake.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * size, 0, Math.sin(a) * size)]), tealMat));
        flake.add(createDot(Math.cos(a) * size, 0, Math.sin(a) * size, 1.5, accentDotMat));
      }
      flake.add(createDot(0, 0, 0, 2, coreDotMat));
      return flake;
    }

    const snowflakes = [];
    [{ x: 0, y: 0, z: 0, s: 40 }, { x: -100, y: 30, z: 50, s: 25 }, { x: 80, y: -20, z: -40, s: 30 }].forEach(fp => {
      const flake = createSnowflake(fp.x, fp.y, fp.z, fp.s);
      snowflakeGroup.add(flake);
      snowflakes.push({ mesh: flake, rotSpeed: 0.002 + rand() * 0.003 });
    });

    // Rain particles
    const rainCount = 100;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    const rainVelocities = [];
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (rand() - 0.5) * 400;
      rainPositions[i * 3 + 1] = rand() * 300 + 50;
      rainPositions[i * 3 + 2] = (rand() - 0.5) * 400;
      rainVelocities.push({ speed: 1 + rand() * 2 });
    }
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
    const rainParticles = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: primaryLight, size: 1.5, transparent: true, opacity: 0.5 }));
    mainGroup.add(rainParticles);

    let time = 0, animId, frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      ripples.forEach(r => {
        const scale = 1 + Math.sin(time * r.speed + r.phase) * 0.3;
        r.mesh.scale.setScalar(scale);
      });
      centralMol.rotation.y = time * 0.2;
      moleculeGroup.rotation.y = time * 0.05;
      vortexGroup.rotation.y = time * 0.3;
      snowflakes.forEach(s => s.mesh.rotation.y += s.rotSpeed);

      const rainPos = rainParticles.geometry.attributes.position.array;
      for (let i = 0; i < rainCount; i++) {
        rainPos[i * 3 + 1] -= rainVelocities[i].speed;
        if (rainPos[i * 3 + 1] < 0) { rainPos[i * 3 + 1] = 300; rainPos[i * 3] = (rand() - 0.5) * 400; rainPos[i * 3 + 2] = (rand() - 0.5) * 400; }
      }
      rainParticles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => { camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== ARBOR MUNDI (World Tree) ==========
  React.useEffect(() => {
    if (currentMode !== 'arborMundi' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.00035);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 100, 550);
    camera.lookAt(0, 80, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 123;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) { const a = (i / segments) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createCurve(points, mat = tealMat, segments = 50) {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments)), mat);
    }

    // Realm markers
    mainGroup.add(createRing(200, -100, 64, tealDimMat));
    mainGroup.add(createRing(220, 0, 64, tealDarkMat));
    mainGroup.add(createRing(180, 280, 64, tealDimMat));

    // Trunk
    const trunkGroup = new THREE.Group();
    mainGroup.add(trunkGroup);
    const trunkCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -80, 0), new THREE.Vector3(3, -40, 2), new THREE.Vector3(-2, 0, -3), new THREE.Vector3(4, 50, 2), new THREE.Vector3(-3, 100, -2), new THREE.Vector3(2, 150, 3), new THREE.Vector3(0, 200, 0)]);
    for (let layer = 0; layer < 3; layer++) {
      const r = 25 - layer * 5;
      trunkGroup.add(new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 40, r, 12, false), new THREE.MeshBasicMaterial({ color: layer === 0 ? primaryColor : (layer === 1 ? primaryDark : primaryDim), wireframe: true, transparent: true, opacity: 0.12 - layer * 0.03 })));
    }
    trunkGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(trunkCurve.getPoints(60)), tealBrightMat));
    for (let i = 1; i <= 8; i++) trunkGroup.add(createRing(i * 3, -80, 24, i % 2 === 0 ? tealDarkMat : tealDimMat));
    trunkGroup.add(createDot(0, -80, 0, 3, coreDotMat));

    // Branches
    const branchGroup = new THREE.Group();
    branchGroup.position.y = 180;
    mainGroup.add(branchGroup);

    function createBranch(startX, startY, startZ, length, angleH, angleV, depth = 0, maxD = 4) {
      if (depth > maxD) return;
      const endX = startX + Math.cos(angleH) * Math.cos(angleV) * length;
      const endY = startY + Math.sin(angleV) * length;
      const endZ = startZ + Math.sin(angleH) * Math.cos(angleV) * length;
      const midX = (startX + endX) / 2 + (rand() - 0.5) * length * 0.2;
      const midY = (startY + endY) / 2 + rand() * length * 0.1;
      const midZ = (startZ + endZ) / 2 + (rand() - 0.5) * length * 0.2;
      const opacity = 0.5 - depth * 0.1;
      const mat = new THREE.LineBasicMaterial({ color: depth < 2 ? primaryColor : primaryDark, transparent: true, opacity: Math.max(0.1, opacity) });
      branchGroup.add(createCurve([new THREE.Vector3(startX, startY, startZ), new THREE.Vector3(midX, midY, midZ), new THREE.Vector3(endX, endY, endZ)], mat, 12));
      if (depth < maxD) branchGroup.add(createDot(endX, endY, endZ, 1.5 - depth * 0.2, accentDotMat));
      const branches = depth < 2 ? 3 : 2;
      for (let b = 0; b < branches; b++) createBranch(endX, endY, endZ, length * 0.65, angleH + (rand() - 0.5) * 1.2, angleV * 0.7 + (rand() - 0.3) * 0.4, depth + 1, maxD);
    }

    for (let i = 0; i < 8; i++) createBranch(0, 20, 0, 50, (i / 8) * Math.PI * 2, 0.5 + rand() * 0.3, 0, 4);

    // Celestial crown
    const celestialGroup = new THREE.Group();
    celestialGroup.position.y = 350;
    mainGroup.add(celestialGroup);
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(20, 16, 16), new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.25 }));
    celestialGroup.add(sunMesh);
    celestialGroup.add(createDot(0, 0, 0, 4, coreDotMat));

    // Leaf particles
    const leafCount = 100;
    const leafGeo = new THREE.BufferGeometry();
    const leafPositions = new Float32Array(leafCount * 3);
    const leafVelocities = [];
    for (let i = 0; i < leafCount; i++) {
      const a = rand() * Math.PI * 2, r = 30 + rand() * 120;
      leafPositions[i * 3] = Math.cos(a) * r;
      leafPositions[i * 3 + 1] = 200 + rand() * 150;
      leafPositions[i * 3 + 2] = Math.sin(a) * r;
      leafVelocities.push({ x: (rand() - 0.5) * 0.15, y: -(0.05 + rand() * 0.1), z: (rand() - 0.5) * 0.15, phase: rand() * Math.PI * 2 });
    }
    leafGeo.setAttribute("position", new THREE.BufferAttribute(leafPositions, 3));
    const leafParticles = new THREE.Points(leafGeo, new THREE.PointsMaterial({ color: primaryLight, size: 2, transparent: true, opacity: 0.5 }));
    mainGroup.add(leafParticles);

    let time = 0, animId, frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      sunMesh.scale.setScalar(1 + Math.sin(time * 2) * 0.08);

      const lPos = leafParticles.geometry.attributes.position.array;
      for (let i = 0; i < leafCount; i++) {
        lPos[i * 3] += leafVelocities[i].x + Math.sin(time * 2 + leafVelocities[i].phase) * 0.1;
        lPos[i * 3 + 1] += leafVelocities[i].y;
        lPos[i * 3 + 2] += leafVelocities[i].z;
        if (lPos[i * 3 + 1] < -100) { lPos[i * 3 + 1] = 350; const a = rand() * Math.PI * 2, r = 30 + rand() * 100; lPos[i * 3] = Math.cos(a) * r; lPos[i * 3 + 2] = Math.sin(a) * r; }
      }
      leafParticles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => { camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== CRYSTALLUM INFINITUM (Infinite Crystal) ==========
  React.useEffect(() => {
    if (currentMode !== 'crystallumInfinitum' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.0003);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 60, 500);
    camera.lookAt(0, 30, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    // Nested Platonic solids
    const coreGroup = new THREE.Group();
    coreGroup.position.y = 100;
    mainGroup.add(coreGroup);

    const dodeca = new THREE.Mesh(new THREE.DodecahedronGeometry(80, 0), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.12 }));
    coreGroup.add(dodeca);
    const icosa = new THREE.Mesh(new THREE.IcosahedronGeometry(60, 0), new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.15 }));
    coreGroup.add(icosa);
    const octa = new THREE.Mesh(new THREE.OctahedronGeometry(45, 0), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.18 }));
    coreGroup.add(octa);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.2 }));
    coreGroup.add(cube);
    const tetra = new THREE.Mesh(new THREE.TetrahedronGeometry(30, 0), new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.25 }));
    coreGroup.add(tetra);
    const innerSphere = new THREE.Mesh(new THREE.SphereGeometry(15, 16, 16), new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.3 }));
    coreGroup.add(innerSphere);
    coreGroup.add(createDot(0, 0, 0, 4, coreDotMat));

    // Geode below
    const geodeGroup = new THREE.Group();
    geodeGroup.position.y = -80;
    mainGroup.add(geodeGroup);
    const geodeShell = new THREE.Mesh(new THREE.SphereGeometry(100, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.1 }));
    geodeShell.rotation.x = Math.PI;
    geodeGroup.add(geodeShell);
    const centralCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(20, 0), new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.35 }));
    centralCrystal.position.y = -50;
    geodeGroup.add(centralCrystal);
    geodeGroup.add(createDot(0, -50, 0, 3, coreDotMat));

    // Particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    let seed = 777;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (rand() - 0.5) * 400;
      particlePositions[i * 3 + 1] = (rand() - 0.5) * 400 + 50;
      particlePositions[i * 3 + 2] = (rand() - 0.5) * 400;
      particleVelocities.push({ x: (rand() - 0.5) * 0.06, y: (rand() - 0.5) * 0.08, z: (rand() - 0.5) * 0.06 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: primaryLight, size: 1.2, transparent: true, opacity: 0.3 }));
    mainGroup.add(particles);

    let time = 0, animId, frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      dodeca.rotation.y = time * 0.1; dodeca.rotation.x = time * 0.05;
      icosa.rotation.y = -time * 0.15; icosa.rotation.z = time * 0.08;
      octa.rotation.y = time * 0.2; octa.rotation.x = -time * 0.12;
      cube.rotation.y = -time * 0.08; cube.rotation.z = time * 0.06;
      tetra.rotation.y = time * 0.25; tetra.rotation.x = time * 0.18;
      innerSphere.rotation.y = time * 0.3;
      innerSphere.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
      centralCrystal.rotation.y = time * 0.2;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += particleVelocities[i].x;
        pos[i * 3 + 1] += particleVelocities[i].y;
        pos[i * 3 + 2] += particleVelocities[i].z;
        if (Math.abs(pos[i * 3 + 1]) > 250) particleVelocities[i].y *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => { camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== NERVUS COSMICUS (Cosmic Nerve) ==========
  React.useEffect(() => {
    if (currentMode !== 'nervusCosmicus' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 80, 500);
    camera.lookAt(0, 50, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.6 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.4 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 999;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    function createCurve(points, mat = tealMat, segments = 30) {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments)), mat);
    }

    // Neurons
    const neurons = [];
    const neuronGroup = new THREE.Group();
    mainGroup.add(neuronGroup);

    for (let i = 0; i < 60; i++) {
      const theta = rand() * Math.PI * 2, phi = Math.acos(2 * rand() - 1), r = 80 + rand() * 120;
      const yMod = Math.cos(phi) * 0.6 + 0.4, xzMod = Math.sin(phi);
      const x = Math.sin(phi) * Math.cos(theta) * r * xzMod;
      const y = Math.cos(phi) * r * yMod + 80;
      const z = Math.sin(phi) * Math.sin(theta) * r * xzMod;
      const size = 3 + rand() * 5, isMain = rand() > 0.7;
      const neuronMesh = new THREE.Mesh(new THREE.SphereGeometry(size, isMain ? 12 : 8, isMain ? 12 : 8), new THREE.MeshBasicMaterial({ color: isMain ? primaryLight : primaryColor, wireframe: true, transparent: true, opacity: isMain ? 0.4 : 0.25 }));
      neuronMesh.position.set(x, y, z);
      neuronGroup.add(neuronMesh);
      if (isMain) neuronGroup.add(createDot(x, y, z, size * 0.4, coreDotMat));
      neurons.push({ mesh: neuronMesh, pos: new THREE.Vector3(x, y, z), size, isMain, pulsePhase: rand() * Math.PI * 2, pulseSpeed: 0.5 + rand() * 1.5 });
    }

    // Synaptic connections
    const synapseGroup = new THREE.Group();
    mainGroup.add(synapseGroup);
    const connections = [];
    neurons.forEach((n1, i) => {
      const distances = neurons.map((n2, j) => ({ index: j, dist: n1.pos.distanceTo(n2.pos) })).filter(d => d.index !== i).sort((a, b) => a.dist - b.dist);
      const connectCount = 2 + Math.floor(rand() * 3);
      for (let c = 0; c < Math.min(connectCount, distances.length); c++) {
        if (distances[c].dist > 150) continue;
        const n2 = neurons[distances[c].index];
        const mid = new THREE.Vector3().addVectors(n1.pos, n2.pos).multiplyScalar(0.5);
        mid.x += (rand() - 0.5) * 30; mid.y += (rand() - 0.5) * 30; mid.z += (rand() - 0.5) * 30;
        const pts = [n1.pos.clone(), mid, n2.pos.clone()];
        synapseGroup.add(createCurve(pts, n1.isMain ? tealDarkMat : new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.25 }), 20));
        connections.push({ from: i, to: distances[c].index, curve: new THREE.CatmullRomCurve3(pts) });
      }
    });

    // Brainstem
    const brainstemGroup = new THREE.Group();
    mainGroup.add(brainstemGroup);
    const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 200, 0), new THREE.Vector3(3, 150, 2), new THREE.Vector3(-2, 100, -1), new THREE.Vector3(2, 50, 2), new THREE.Vector3(-1, 0, -1), new THREE.Vector3(0, -50, 0)]);
    brainstemGroup.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 40, 8, 8, false), new THREE.MeshBasicMaterial({ color: primaryDark, wireframe: true, transparent: true, opacity: 0.15 })));
    brainstemGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(stemCurve.getPoints(50)), tealBrightMat));
    for (let i = 0; i < 8; i++) { const t = i / 7; const p = stemCurve.getPoint(t); brainstemGroup.add(createDot(p.x, p.y, p.z, 3, i % 2 === 0 ? coreDotMat : accentDotMat)); }

    // Neurotransmitter particles
    const ntCount = 150;
    const ntGeo = new THREE.BufferGeometry();
    const ntPositions = new Float32Array(ntCount * 3);
    const ntData = [];
    for (let i = 0; i < ntCount; i++) {
      const conn = connections[Math.floor(rand() * connections.length)];
      const t = rand();
      const pos = conn.curve.getPoint(t);
      ntPositions[i * 3] = pos.x; ntPositions[i * 3 + 1] = pos.y; ntPositions[i * 3 + 2] = pos.z;
      ntData.push({ connection: conn, t, speed: 0.002 + rand() * 0.008, direction: rand() > 0.5 ? 1 : -1 });
    }
    ntGeo.setAttribute("position", new THREE.BufferAttribute(ntPositions, 3));
    const ntParticles = new THREE.Points(ntGeo, new THREE.PointsMaterial({ color: primaryLight, size: 2, transparent: true, opacity: 0.7 }));
    mainGroup.add(ntParticles);

    let time = 0, animId, frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      neurons.forEach(n => { const pulse = 1 + Math.sin(time * n.pulseSpeed + n.pulsePhase) * 0.15; n.mesh.scale.setScalar(pulse); });

      const ntPos = ntParticles.geometry.attributes.position.array;
      ntData.forEach((nt, i) => {
        nt.t += nt.speed * nt.direction;
        if (nt.t > 1) { nt.t = 0; nt.direction = 1; }
        if (nt.t < 0) { nt.t = 1; nt.direction = -1; }
        const pos = nt.connection.curve.getPoint(nt.t);
        ntPos[i * 3] = pos.x; ntPos[i * 3 + 1] = pos.y; ntPos[i * 3 + 2] = pos.z;
      });
      ntParticles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => { camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== PORTA DIMENSIONUM (Dimensional Portal) ==========
  React.useEffect(() => {
    if (currentMode !== 'portaDimensionum' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.0002);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 100, 500);
    camera.lookAt(0, 50, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.6 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.25 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 666;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createRing(radius, y, segments = 64, mat = tealMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) { const a = (i / segments) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    // Toroidal gateway
    const gatewayGroup = new THREE.Group();
    gatewayGroup.position.y = 80;
    mainGroup.add(gatewayGroup);
    const torusMesh = new THREE.Mesh(new THREE.TorusGeometry(80, 25, 16, 48), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.2 }));
    gatewayGroup.add(torusMesh);
    const innerTorus = new THREE.Mesh(new THREE.TorusGeometry(80, 15, 12, 36), new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.15 }));
    gatewayGroup.add(innerTorus);
    for (let i = 1; i <= 5; i++) gatewayGroup.add(createRing(i * 10, 0, 32, i === 5 ? tealBrightMat : tealDimMat));
    gatewayGroup.add(createDot(0, 0, 0, 5, coreDotMat));

    // Tesseract
    const tesseractGroup = new THREE.Group();
    tesseractGroup.position.y = 80;
    mainGroup.add(tesseractGroup);
    const tesseractSize = 40;
    const tesseractVertices = [];
    for (let w = -1; w <= 1; w += 2) for (let x = -1; x <= 1; x += 2) for (let y = -1; y <= 1; y += 2) for (let z = -1; z <= 1; z += 2) {
      const projFactor = 1 / (2 - w * 0.3);
      tesseractVertices.push(new THREE.Vector3(x * tesseractSize * projFactor, y * tesseractSize * projFactor, z * tesseractSize * projFactor));
    }
    const drawnEdges = new Set();
    tesseractVertices.forEach((v1, i) => {
      tesseractVertices.forEach((v2, j) => {
        if (i >= j) return;
        const dist = v1.distanceTo(v2);
        const edgeKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (dist < tesseractSize * 1.5 && !drawnEdges.has(edgeKey)) {
          drawnEdges.add(edgeKey);
          tesseractGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([v1, v2]), dist < tesseractSize * 0.9 ? tealMat : tealDimMat));
        }
      });
      tesseractGroup.add(createDot(v1.x, v1.y, v1.z, 1.5, accentDotMat));
    });

    // Wormhole tunnel
    const wormholeGroup = new THREE.Group();
    wormholeGroup.position.y = 80;
    mainGroup.add(wormholeGroup);
    const tunnelRings = [];
    for (let i = 0; i < 20; i++) {
      const z = -i * 15;
      const radius = 50 + Math.abs(z) * 0.3;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 1, 4, 32), new THREE.MeshBasicMaterial({ color: i < 5 ? primaryLight : (i < 12 ? primaryColor : primaryDim), wireframe: true, transparent: true, opacity: 0.3 - i * 0.012 }));
      ring.position.z = z;
      wormholeGroup.add(ring);
      tunnelRings.push({ mesh: ring, baseZ: z, baseRadius: radius });
    }

    // Particles
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleData = [];
    for (let i = 0; i < particleCount; i++) {
      const type = rand() > 0.5 ? 'orbit' : 'stream';
      if (type === 'orbit') {
        const a = rand() * Math.PI * 2, r = 60 + rand() * 60;
        particlePositions[i * 3] = Math.cos(a) * r;
        particlePositions[i * 3 + 1] = 80 + (rand() - 0.5) * 40;
        particlePositions[i * 3 + 2] = Math.sin(a) * r;
        particleData.push({ type, angle: a, radius: r, speed: 0.01 + rand() * 0.02 });
      } else {
        particlePositions[i * 3] = (rand() - 0.5) * 20;
        particlePositions[i * 3 + 1] = 80 + (rand() - 0.5) * 100;
        particlePositions[i * 3 + 2] = -rand() * 200;
        particleData.push({ type, speed: 1 + rand() * 3 });
      }
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: primaryLight, size: 2, transparent: true, opacity: 0.6 }));
    mainGroup.add(particles);

    let time = 0, animId, frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.006;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      torusMesh.rotation.x = time * 0.2; torusMesh.rotation.y = time * 0.3;
      innerTorus.rotation.x = -time * 0.3; innerTorus.rotation.y = -time * 0.2;
      tesseractGroup.rotation.x = time * 0.15; tesseractGroup.rotation.y = time * 0.2; tesseractGroup.rotation.z = time * 0.1;
      tunnelRings.forEach((r, i) => r.mesh.scale.setScalar(1 + Math.sin(time * 2 - i * 0.3) * 0.1));

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const pd = particleData[i];
        if (pd.type === 'orbit') { pd.angle += pd.speed; pos[i * 3] = Math.cos(pd.angle) * pd.radius; pos[i * 3 + 2] = Math.sin(pd.angle) * pd.radius; }
        else { pos[i * 3 + 2] -= pd.speed; if (pos[i * 3 + 2] < -300) { pos[i * 3] = (rand() - 0.5) * 20; pos[i * 3 + 1] = 80 + (rand() - 0.5) * 100; pos[i * 3 + 2] = 0; } }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => { camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);
  // ========== LABYRINTHUS SACRUM (Sacred Labyrinth) ==========
  React.useEffect(() => {
    if (currentMode !== 'labyrinthisSacrum' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.0003);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 300, 400);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.5 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.3 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 333;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) { const a = (i / segments) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    // Labyrinth path
    const labyrinthGroup = new THREE.Group();
    mainGroup.add(labyrinthGroup);
    const circuits = 11, maxRadius = 180, pathWidth = maxRadius / (circuits + 1);
    for (let c = 1; c <= circuits; c++) {
      const r = c * pathWidth;
      const openings = [];
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(o => { if (rand() > 0.3) openings.push(o + (rand() - 0.5) * 0.3); });
      const segments = 64;
      let drawing = true;
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        let nearOpening = false;
        openings.forEach(o => { if (Math.abs(a - o) < 0.15 || Math.abs(a - o + Math.PI * 2) < 0.15) nearOpening = true; });
        if (nearOpening && drawing && pts.length > 1) { labyrinthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), c % 2 === 0 ? tealMat : tealDarkMat)); pts.length = 0; drawing = false; }
        else if (!nearOpening && !drawing) drawing = true;
        if (drawing) pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      if (pts.length > 1) labyrinthGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), c % 2 === 0 ? tealMat : tealDarkMat));
    }

    // Rose center
    const roseGroup = new THREE.Group();
    roseGroup.position.y = 1;
    mainGroup.add(roseGroup);
    const roseRadius = pathWidth * 1.5;
    roseGroup.add(createRing(roseRadius, 0, 48, tealBrightMat));
    for (let p = 0; p < 12; p++) {
      const a = (p / 12) * Math.PI * 2, nextA = ((p + 1) / 12) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10, petalA = a + t * (nextA - a), petalR = roseRadius * 0.3 + Math.sin(t * Math.PI) * roseRadius * 0.5; pts.push(new THREE.Vector3(Math.cos(petalA) * petalR, 0, Math.sin(petalA) * petalR)); }
      roseGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), tealMat));
    }
    roseGroup.add(createDot(0, 0, 0, 4, coreDotMat));

    // Pillars
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r = maxRadius + 20;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 60, 6), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.2 }));
      pillar.position.set(Math.cos(a) * r, 30, Math.sin(a) * r);
      mainGroup.add(pillar);
      mainGroup.add(createDot(Math.cos(a) * r, 70, Math.sin(a) * r, 2, coreDotMat));
    }

    // Mandala ceiling
    const ceilingGroup = new THREE.Group();
    ceilingGroup.position.y = 200;
    mainGroup.add(ceilingGroup);
    for (let i = 1; i <= 8; i++) ceilingGroup.add(createRing(i * 25, 0, 48, i % 2 === 0 ? tealMat : tealDimMat));
    const oculusMesh = new THREE.Mesh(new THREE.TorusGeometry(15, 2, 6, 24), new THREE.MeshBasicMaterial({ color: primaryLight, wireframe: true, transparent: true, opacity: 0.3 }));
    oculusMesh.rotation.x = Math.PI / 2;
    ceilingGroup.add(oculusMesh);
    ceilingGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // Particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    for (let i = 0; i < particleCount; i++) {
      const a = rand() * Math.PI * 2, r = rand() * maxRadius;
      particlePositions[i * 3] = Math.cos(a) * r;
      particlePositions[i * 3 + 1] = rand() * 200;
      particlePositions[i * 3 + 2] = Math.sin(a) * r;
      particleVelocities.push({ y: 0.1 + rand() * 0.2 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: primaryLight, size: 1.5, transparent: true, opacity: 0.4 }));
    mainGroup.add(particles);

    let time = 0, animId, frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      roseGroup.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
      ceilingGroup.rotation.y = time * 0.02;
      oculusMesh.rotation.z = time * 0.5;

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += particleVelocities[i].y;
        if (pos[i * 3 + 1] > 200) { pos[i * 3 + 1] = 0; const a = rand() * Math.PI * 2, r = rand() * maxRadius; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 2] = Math.sin(a) * r; }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => { camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== TEMPLUM SONORUM (Temple of Sound) ==========
  React.useEffect(() => {
    if (currentMode !== 'templumSonorum' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 180, 450);
    camera.lookAt(0, 50, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const primaryColor = hslToHex(hue, 70, 60);
    const primaryDark = hslToHex(hue, 60, 40);
    const primaryLight = hslToHex(hue, 52, 78);
    const primaryDim = hslToHex(hue, 40, 25);
    const accentColor = hslToHex(hue, 60, 55);

    const tealMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.6 });
    const tealDarkMat = new THREE.LineBasicMaterial({ color: primaryDark, transparent: true, opacity: 0.4 });
    const tealDimMat = new THREE.LineBasicMaterial({ color: primaryDim, transparent: true, opacity: 0.25 });
    const tealBrightMat = new THREE.LineBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.6 });
    const accentDotMat = new THREE.MeshBasicMaterial({ color: primaryLight, transparent: true, opacity: 0.8 });
    const coreDotMat = new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.9 });

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let seed = 555;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createRing(radius, y, segments = 64, mat = tealDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) { const a = (i / segments) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)); }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    }

    function createDot(x, y, z, r = 1.5, mat = accentDotMat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      m.position.set(x, y, z);
      return m;
    }

    // Singing bowl
    const bowlGroup = new THREE.Group();
    mainGroup.add(bowlGroup);
    const bowlMesh = new THREE.Mesh(new THREE.SphereGeometry(50, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true, transparent: true, opacity: 0.2 }));
    bowlMesh.rotation.x = Math.PI;
    bowlMesh.position.y = 30;
    bowlGroup.add(bowlMesh);
    bowlGroup.add(createRing(50, 30, 48, tealBrightMat));
    const bowlRings = [];
    for (let i = 1; i <= 5; i++) {
      const ring = createRing(50 - i * 8, 30, 32, i === 1 ? tealMat : tealDimMat);
      bowlGroup.add(ring);
      bowlRings.push({ mesh: ring, baseY: 30, phase: i * 0.5 });
    }
    bowlGroup.add(createDot(0, 5, 0, 4, coreDotMat));

    // Circle of fifths
    const circleOfFifthsGroup = new THREE.Group();
    circleOfFifthsGroup.position.set(0, 150, 0);
    mainGroup.add(circleOfFifthsGroup);
    const fifthsRadius = 80;
    circleOfFifthsGroup.add(createRing(fifthsRadius, 0, 48, tealMat));
    circleOfFifthsGroup.add(createRing(fifthsRadius * 0.7, 0, 36, tealDarkMat));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * fifthsRadius, z = Math.sin(a) * fifthsRadius;
      circleOfFifthsGroup.add(createDot(x, 0, z, 3, i % 3 === 0 ? coreDotMat : accentDotMat));
      circleOfFifthsGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, 0, z)]), tealDimMat));
    }
    circleOfFifthsGroup.add(createDot(0, 0, 0, 3, coreDotMat));

    // Standing waves
    const standingWaveGroup = new THREE.Group();
    standingWaveGroup.position.set(0, 80, 100);
    mainGroup.add(standingWaveGroup);
    const waveLength = 150;
    const waves = [];
    for (let mode = 1; mode <= 4; mode++) {
      const y = mode * 25 - 50;
      const wavePts = [];
      for (let i = 0; i <= 60; i++) { const t = i / 60, x = (t - 0.5) * waveLength; wavePts.push(new THREE.Vector3(x, y, 0)); }
      const waveLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wavePts), new THREE.LineBasicMaterial({ color: mode === 1 ? primaryLight : primaryColor, transparent: true, opacity: 0.5 }));
      standingWaveGroup.add(waveLine);
      waves.push({ line: waveLine, mode, pts: wavePts, baseY: y });
      standingWaveGroup.add(createDot(-waveLength / 2, y, 0, 2, accentDotMat));
      standingWaveGroup.add(createDot(waveLength / 2, y, 0, 2, accentDotMat));
    }

    // Resonance rings
    const resonanceRings = [];
    const resonanceGroup = new THREE.Group();
    resonanceGroup.position.y = 30;
    mainGroup.add(resonanceGroup);
    for (let i = 1; i <= 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(50 + i * 25, 0.8, 4, 48), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? primaryColor : primaryDark, wireframe: true, transparent: true, opacity: 0.15 }));
      ring.rotation.x = Math.PI / 2;
      resonanceGroup.add(ring);
      resonanceRings.push({ mesh: ring, baseRadius: 50 + i * 25, phase: i * 0.4 });
    }

    // Particles
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    for (let i = 0; i < particleCount; i++) {
      const a = rand() * Math.PI * 2, r = 50 + rand() * 150;
      particlePositions[i * 3] = Math.cos(a) * r;
      particlePositions[i * 3 + 1] = rand() * 200;
      particlePositions[i * 3 + 2] = Math.sin(a) * r;
      particleVelocities.push({ angle: a, radius: r, speed: 0.01 + rand() * 0.02, ySpeed: (rand() - 0.5) * 0.3 });
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: primaryLight, size: 1.5, transparent: true, opacity: 0.4 }));
    mainGroup.add(particles);

    let time = 0, animId, frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.008;
      frameCount++;

      // Touch-responsive rotation (hold to rotate) - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.02;
          mainGroup.rotation.x += normalizedY * 0.01;
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      bowlRings.forEach(r => { r.mesh.position.y = r.baseY + Math.sin(time * 3 + r.phase) * 2; });
      circleOfFifthsGroup.rotation.y = time * 0.05;

      waves.forEach(w => {
        const positions = w.line.geometry.attributes.position.array;
        for (let i = 0; i <= 60; i++) { const t = i / 60; positions[i * 3 + 1] = w.baseY + Math.sin(t * Math.PI * w.mode) * 15 * Math.sin(time * 2); }
        w.line.geometry.attributes.position.needsUpdate = true;
      });

      resonanceRings.forEach(r => { r.mesh.scale.setScalar(1 + Math.sin(time * 2 + r.phase) * 0.05); });

      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        particleVelocities[i].angle += particleVelocities[i].speed;
        pos[i * 3] = Math.cos(particleVelocities[i].angle) * particleVelocities[i].radius;
        pos[i * 3 + 1] += particleVelocities[i].ySpeed;
        pos[i * 3 + 2] = Math.sin(particleVelocities[i].angle) * particleVelocities[i].radius;
        if (pos[i * 3 + 1] > 220 || pos[i * 3 + 1] < -20) particleVelocities[i].ySpeed *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => { camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== FUNGUS DIMENSIO ==========
  React.useEffect(() => {
    if (currentMode !== 'fungusDimensio' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 100, 350);
    camera.lookAt(0, 80, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const disposables = [];
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Dynamic colors based on hue - consistent with app color scheme
    const PRIMARY = hslToHex(hue, 52, 68);
    const PRIMARY_DARK = hslToHex(hue, 52, 45);
    const PRIMARY_BRIGHT = hslToHex(hue, 52, 78);
    const PRIMARY_DIM = hslToHex(hue, 40, 35);
    const PRIMARY_FAINT = hslToHex(hue, 35, 25);
    const PRIMARY_GLOW = hslToHex(hue, 60, 85);

    const primaryMat = new THREE.LineBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.6 });
    const primaryDarkMat = new THREE.LineBasicMaterial({ color: PRIMARY_DARK, transparent: true, opacity: 0.5 });
    const primaryDimMat = new THREE.LineBasicMaterial({ color: PRIMARY_DIM, transparent: true, opacity: 0.3 });
    const primaryBrightMat = new THREE.LineBasicMaterial({ color: PRIMARY_BRIGHT, transparent: true, opacity: 0.7 });
    disposables.push(primaryMat, primaryDarkMat, primaryDimMat, primaryBrightMat);

    let seed = 5555;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createDot(x, y, z, r = 1.5, color = PRIMARY_BRIGHT) {
      const geo = new THREE.SphereGeometry(r, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      disposables.push(geo, mat);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }

    function createRing(radius, y, segments = 32, mat = primaryDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      return new THREE.Line(geo, mat);
    }

    // === MAIN MUSHROOM ===
    const mushroomGroup = new THREE.Group();
    mainGroup.add(mushroomGroup);

    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(3, 30, 2),
      new THREE.Vector3(-2, 60, -1),
      new THREE.Vector3(1, 90, 2),
      new THREE.Vector3(0, 120, 0),
    ]);

    const stemGeo = new THREE.TubeGeometry(stemCurve, 30, 12, 12, false);
    const stemMat = new THREE.MeshBasicMaterial({ color: PRIMARY, wireframe: true, transparent: true, opacity: 0.15 });
    disposables.push(stemGeo, stemMat);
    mushroomGroup.add(new THREE.Mesh(stemGeo, stemMat));

    const stemLineGeo = new THREE.BufferGeometry().setFromPoints(stemCurve.getPoints(40));
    disposables.push(stemLineGeo);
    mushroomGroup.add(new THREE.Line(stemLineGeo, primaryBrightMat));

    for (let i = 0; i < 8; i++) {
      const t = i / 8;
      const p = stemCurve.getPoint(t);
      mushroomGroup.add(createRing(12 - t * 3, p.y, 16, i % 2 === 0 ? primaryMat : primaryDimMat));
    }

    // === CAP ===
    const capGroup = new THREE.Group();
    capGroup.position.y = 120;
    mushroomGroup.add(capGroup);

    const capRadius = 50;
    const capGeo = new THREE.SphereGeometry(capRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const capMat = new THREE.MeshBasicMaterial({ color: PRIMARY_DARK, wireframe: true, transparent: true, opacity: 0.15 });
    disposables.push(capGeo, capMat);
    capGroup.add(new THREE.Mesh(capGeo, capMat));

    for (let i = 0; i < 6; i++) {
      const t = i / 6;
      const y = Math.cos(t * Math.PI * 0.5) * capRadius * 0.3;
      const r = Math.sin(t * Math.PI * 0.5) * capRadius + capRadius * 0.3;
      capGroup.add(createRing(r, y, 32, i % 2 === 0 ? primaryMat : primaryDimMat));
    }

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= 15; j++) {
        const t = j / 15;
        const phi = t * Math.PI * 0.5;
        pts.push(new THREE.Vector3(
          Math.cos(angle) * Math.sin(phi) * capRadius,
          Math.cos(phi) * capRadius * 0.3,
          Math.sin(angle) * Math.sin(phi) * capRadius
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      capGroup.add(new THREE.Line(geo, primaryDimMat));
    }

    // === GILLS ===
    const gillGroup = new THREE.Group();
    gillGroup.position.y = 115;
    mushroomGroup.add(gillGroup);

    for (let g = 0; g < 48; g++) {
      const angle = (g / 48) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const r = 15 + t * 35;
        const y = -t * 15 - Math.sin(t * Math.PI) * 5;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      gillGroup.add(new THREE.Line(geo, g % 4 === 0 ? primaryMat : primaryDimMat));
    }
    gillGroup.add(createRing(50, -15, 48, primaryDarkMat));

    // === SURROUNDING MUSHROOMS ===
    const shroomPositions = [
      { x: -100, z: 60, h: 80, s: 0.7 },
      { x: 80, z: -50, h: 60, s: 0.5 },
      { x: -60, z: -80, h: 70, s: 0.6 },
      { x: 120, z: 40, h: 50, s: 0.45 },
      { x: -130, z: -30, h: 40, s: 0.35 },
      { x: 50, z: 90, h: 55, s: 0.5 },
    ];

    shroomPositions.forEach(sp => {
      const shroom = new THREE.Group();
      shroom.position.set(sp.x, 0, sp.z);
      shroom.scale.setScalar(sp.s);

      const stemPts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        stemPts.push(new THREE.Vector3(Math.sin(t * 3) * 3, t * sp.h, Math.cos(t * 2) * 2));
      }
      const stemGeo = new THREE.BufferGeometry().setFromPoints(stemPts);
      disposables.push(stemGeo);
      shroom.add(new THREE.Line(stemGeo, primaryMat));

      const capGeo = new THREE.SphereGeometry(25, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const capMat = new THREE.MeshBasicMaterial({ color: PRIMARY_DARK, wireframe: true, transparent: true, opacity: 0.15 });
      disposables.push(capGeo, capMat);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = sp.h;
      shroom.add(cap);
      shroom.add(createDot(0, sp.h + 10, 0, 3, PRIMARY_BRIGHT));
      mainGroup.add(shroom);
    });

    // === MOLECULE ===
    const moleculeGroup = new THREE.Group();
    moleculeGroup.position.set(0, 250, 0);
    mainGroup.add(moleculeGroup);

    const ring6Pts = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ring6Pts.push(new THREE.Vector3(Math.cos(a) * 20, 0, Math.sin(a) * 20));
    }
    const ring6Geo = new THREE.BufferGeometry().setFromPoints(ring6Pts);
    disposables.push(ring6Geo);
    moleculeGroup.add(new THREE.Line(ring6Geo, primaryBrightMat));

    const ring5Pts = [];
    const fusion = ring6Pts[1].clone();
    for (let i = 0; i <= 5; i++) {
      const a = (i / 5) * Math.PI * 2 + Math.PI / 3;
      ring5Pts.push(new THREE.Vector3(fusion.x + Math.cos(a) * 16, 0, fusion.z + Math.sin(a) * 16));
    }
    const ring5Geo = new THREE.BufferGeometry().setFromPoints(ring5Pts);
    const ring5Mat = new THREE.LineBasicMaterial({ color: PRIMARY_DARK, transparent: true, opacity: 0.5 });
    disposables.push(ring5Geo, ring5Mat);
    moleculeGroup.add(new THREE.Line(ring5Geo, ring5Mat));

    ring6Pts.slice(0, 6).forEach((p, i) => {
      moleculeGroup.add(createDot(p.x, p.y, p.z, 3, i === 0 ? PRIMARY_GLOW : PRIMARY_BRIGHT));
    });

    const nPos = ring5Pts[2];
    const methyl1 = new THREE.Vector3(nPos.x + 20, 10, nPos.z + 10);
    const methyl2 = new THREE.Vector3(nPos.x + 20, -10, nPos.z - 10);
    const methylMat = new THREE.LineBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.5 });
    disposables.push(methylMat);

    const m1Geo = new THREE.BufferGeometry().setFromPoints([nPos, methyl1]);
    const m2Geo = new THREE.BufferGeometry().setFromPoints([nPos, methyl2]);
    disposables.push(m1Geo, m2Geo);
    moleculeGroup.add(new THREE.Line(m1Geo, methylMat));
    moleculeGroup.add(new THREE.Line(m2Geo, methylMat));
    moleculeGroup.add(createDot(methyl1.x, methyl1.y, methyl1.z, 2.5, PRIMARY));
    moleculeGroup.add(createDot(methyl2.x, methyl2.y, methyl2.z, 2.5, PRIMARY));
    moleculeGroup.add(createDot(nPos.x, nPos.y, nPos.z, 4, PRIMARY_GLOW));

    // === PORTAL ===
    const portalGroup = new THREE.Group();
    portalGroup.position.y = 350;
    mainGroup.add(portalGroup);

    const portalColors = [PRIMARY_DARK, PRIMARY, PRIMARY_BRIGHT, PRIMARY_GLOW];
    for (let i = 0; i < 8; i++) {
      const mat = new THREE.LineBasicMaterial({ color: portalColors[i % 4], transparent: true, opacity: 0.4 - i * 0.03 });
      disposables.push(mat);
      portalGroup.add(createRing(30 + i * 20, 0, 48, mat));
    }

    const portalSpiral = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      portalSpiral.push(new THREE.Vector3(Math.cos(t * Math.PI * 8) * t * 150, t * 30, Math.sin(t * Math.PI * 8) * t * 150));
    }
    const spiralGeo = new THREE.BufferGeometry().setFromPoints(portalSpiral);
    const spiralMat = new THREE.LineBasicMaterial({ color: PRIMARY_BRIGHT, transparent: true, opacity: 0.3 });
    disposables.push(spiralGeo, spiralMat);
    portalGroup.add(new THREE.Line(spiralGeo, spiralMat));
    portalGroup.add(createDot(0, 0, 0, 6, PRIMARY_BRIGHT));

    // === GEOMETRIC ENTITIES ===
    const entityGroup = new THREE.Group();
    mainGroup.add(entityGroup);

    const entityPositions = [
      { x: -150, y: 200, z: 100, type: 'tetra' },
      { x: 150, y: 180, z: -80, type: 'octa' },
      { x: -80, y: 280, z: -120, type: 'icosa' },
      { x: 100, y: 320, z: 60, type: 'dodeca' },
    ];

    entityPositions.forEach(ep => {
      let geo;
      switch (ep.type) {
        case 'tetra': geo = new THREE.TetrahedronGeometry(15); break;
        case 'octa': geo = new THREE.OctahedronGeometry(15); break;
        case 'icosa': geo = new THREE.IcosahedronGeometry(15); break;
        case 'dodeca': geo = new THREE.DodecahedronGeometry(15); break;
      }
      const mat = new THREE.MeshBasicMaterial({
        color: portalColors[Math.floor(rand() * 4)],
        wireframe: true, transparent: true, opacity: 0.3
      });
      disposables.push(geo, mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(ep.x, ep.y, ep.z);
      mesh.userData = { rotSpeed: 0.01 + rand() * 0.02, floatPhase: rand() * Math.PI * 2, baseY: ep.y };
      entityGroup.add(mesh);
    });

    // === MYCELIUM NETWORK ===
    const myceliumGroup = new THREE.Group();
    myceliumGroup.position.y = -20;
    mainGroup.add(myceliumGroup);

    const nodes = [];
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const r = 30 + rand() * 150;
      nodes.push({ x: Math.cos(a) * r, y: -rand() * 40, z: Math.sin(a) * r });
    }

    nodes.forEach((node, i) => {
      myceliumGroup.add(createDot(node.x, node.y, node.z, 1.5, PRIMARY));
      const dists = nodes.map((n, j) => ({ j, d: Math.sqrt((node.x - n.x) ** 2 + (node.z - n.z) ** 2) }))
        .filter(d => d.j !== i).sort((a, b) => a.d - b.d);
      for (let c = 0; c < 2 && c < dists.length; c++) {
        if (dists[c].d < 80) {
          const target = nodes[dists[c].j];
          const pts = [];
          for (let s = 0; s <= 10; s++) {
            const t = s / 10;
            pts.push(new THREE.Vector3(
              node.x + (target.x - node.x) * t,
              node.y + (target.y - node.y) * t + Math.sin(t * Math.PI) * 5,
              node.z + (target.z - node.z) * t
            ));
          }
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          disposables.push(geo);
          myceliumGroup.add(new THREE.Line(geo, primaryDimMat));
        }
      }
    });

    // === SPORE PARTICLES ===
    const sporeCount = isMobile ? 100 : 200;
    const sporePositions = new Float32Array(sporeCount * 3);
    const sporeColors = new Float32Array(sporeCount * 3);
    const sporeVelocities = [];
    const sporeColorOpts = [PRIMARY_BRIGHT, PRIMARY_GLOW, PRIMARY, PRIMARY_DARK];

    for (let i = 0; i < sporeCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 200;
      sporePositions[i * 3] = Math.cos(a) * r;
      sporePositions[i * 3 + 1] = 100 + rand() * 250;
      sporePositions[i * 3 + 2] = Math.sin(a) * r;
      const col = new THREE.Color(sporeColorOpts[Math.floor(rand() * sporeColorOpts.length)]);
      sporeColors[i * 3] = col.r;
      sporeColors[i * 3 + 1] = col.g;
      sporeColors[i * 3 + 2] = col.b;
      sporeVelocities.push({ x: (rand() - 0.5) * 0.3, y: 0.1 + rand() * 0.3, z: (rand() - 0.5) * 0.3, phase: rand() * Math.PI * 2 });
    }

    const sporeGeo = new THREE.BufferGeometry();
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));
    sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));
    const sporeMat = new THREE.PointsMaterial({ size: 2, transparent: true, opacity: 0.6, vertexColors: true });
    disposables.push(sporeGeo, sporeMat);
    const spores = new THREE.Points(sporeGeo, sporeMat);
    mainGroup.add(spores);

    // === FRACTAL BRANCHES ===
    const fractalGroup = new THREE.Group();
    fractalGroup.position.y = 180;
    mainGroup.add(fractalGroup);

    function drawFractalBranch(x, y, z, length, angle, depth, maxDepth) {
      if (depth > maxDepth) return;
      const endX = x + Math.cos(angle) * length;
      const endY = y + length * 0.7;
      const endZ = z + Math.sin(angle) * length;
      const mat = new THREE.LineBasicMaterial({ color: depth % 2 === 0 ? PRIMARY_DARK : PRIMARY_BRIGHT, transparent: true, opacity: 0.4 - depth * 0.05 });
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, z), new THREE.Vector3(endX, endY, endZ)]);
      disposables.push(mat, geo);
      fractalGroup.add(new THREE.Line(geo, mat));
      drawFractalBranch(endX, endY, endZ, length * 0.65, angle + 0.5, depth + 1, maxDepth);
      drawFractalBranch(endX, endY, endZ, length * 0.65, angle - 0.5, depth + 1, maxDepth);
    }

    for (let b = 0; b < 6; b++) {
      const baseAngle = (b / 6) * Math.PI * 2;
      drawFractalBranch(Math.cos(baseAngle) * 60, 0, Math.sin(baseAngle) * 60, 30, baseAngle, 0, 4);
    }

    let animId;
    let time = 0;
    let frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      const breathPhase = Math.sin(time * BREATH_SPEED * 5);

      // Molecule rotation
      moleculeGroup.rotation.y = time * 0.4;
      moleculeGroup.rotation.z = Math.sin(time * 0.3) * 0.2;

      // Portal rotation and pulse
      portalGroup.rotation.y = time * 0.2;
      portalGroup.scale.setScalar(1 + breathPhase * 0.1);

      // Entity rotation and float
      entityGroup.children.forEach(entity => {
        entity.rotation.x += entity.userData.rotSpeed;
        entity.rotation.y += entity.userData.rotSpeed * 0.7;
        entity.position.y = entity.userData.baseY + Math.sin(time * 2 + entity.userData.floatPhase) * 5;
      });

      // Fractal rotation
      fractalGroup.rotation.y = time * 0.1;

      // Spores rise
      const sPos = spores.geometry.attributes.position.array;
      sporeVelocities.forEach((v, i) => {
        sPos[i * 3] += v.x + Math.sin(time + v.phase) * 0.1;
        sPos[i * 3 + 1] += v.y;
        sPos[i * 3 + 2] += v.z + Math.cos(time + v.phase) * 0.1;
        if (sPos[i * 3 + 1] > 450) {
          sPos[i * 3 + 1] = 100;
          const a = rand() * Math.PI * 2;
          const r = rand() * 100;
          sPos[i * 3] = Math.cos(a) * r;
          sPos[i * 3 + 2] = Math.sin(a) * r;
        }
      });
      spores.geometry.attributes.position.needsUpdate = true;

      // Cap gentle pulse
      capGroup.scale.setScalar(1 + Math.sin(time) * 0.02);

      // Touch-responsive rotation - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.015;
          mainGroup.rotation.x = Math.max(-0.5, Math.min(0.5, mainGroup.rotation.x + normalizedY * 0.008));
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.0008;
      }

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // ========== PEYOTE VISIO ==========
  React.useEffect(() => {
    if (currentMode !== 'peyoteVisio' || !containerRef.current || typeof THREE === 'undefined') return;

    touchPointsRef.current = [];

    const container = containerRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 80, 300);
    camera.lookAt(0, 50, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = 'none';
    rendererRef.current = renderer;

    const hslToHex = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return (Math.round(f(0) * 255) << 16) + (Math.round(f(8) * 255) << 8) + Math.round(f(4) * 255);
    };

    const disposables = [];
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Dynamic colors - consistent with app color scheme
    const PRIMARY = hslToHex(hue, 52, 68);
    const PRIMARY_DARK = hslToHex(hue, 52, 45);
    const PRIMARY_BRIGHT = hslToHex(hue, 52, 78);
    const PRIMARY_DIM = hslToHex(hue, 40, 35);
    const PRIMARY_FAINT = hslToHex(hue, 35, 25);
    const PRIMARY_GLOW = hslToHex(hue, 60, 85);

    const primaryMat = new THREE.LineBasicMaterial({ color: PRIMARY, transparent: true, opacity: 0.6 });
    const primaryDarkMat = new THREE.LineBasicMaterial({ color: PRIMARY_DARK, transparent: true, opacity: 0.5 });
    const primaryDimMat = new THREE.LineBasicMaterial({ color: PRIMARY_DIM, transparent: true, opacity: 0.3 });
    const primaryBrightMat = new THREE.LineBasicMaterial({ color: PRIMARY_BRIGHT, transparent: true, opacity: 0.7 });
    disposables.push(primaryMat, primaryDarkMat, primaryDimMat, primaryBrightMat);

    let seed = 420;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

    function createDot(x, y, z, r = 1.5, color = PRIMARY_BRIGHT) {
      const geo = new THREE.SphereGeometry(r, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      disposables.push(geo, mat);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }

    function createRing(radius, y, segments = 32, mat = primaryDarkMat) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      return new THREE.Line(geo, mat);
    }

    // === MAIN PEYOTE CACTUS ===
    const cactusGroup = new THREE.Group();
    mainGroup.add(cactusGroup);

    const peyoteRadius = 40;
    const peyoteSegments = 8;

    // Ribs
    for (let rib = 0; rib < peyoteSegments; rib++) {
      const angle = (rib / peyoteSegments) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = Math.sin(t * Math.PI * 0.5) * 25;
        const r = peyoteRadius * Math.cos(t * Math.PI * 0.5) + 5;
        const bulge = Math.sin(t * Math.PI) * 8;
        pts.push(new THREE.Vector3(Math.cos(angle) * (r + bulge), y, Math.sin(angle) * (r + bulge)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      cactusGroup.add(new THREE.Line(geo, rib % 2 === 0 ? primaryMat : primaryDarkMat));
    }

    // Horizontal rings
    for (let ring = 0; ring < 6; ring++) {
      const t = ring / 6;
      const y = Math.sin(t * Math.PI * 0.5) * 25;
      const r = peyoteRadius * Math.cos(t * Math.PI * 0.5) + 5;
      const pts = [];
      for (let i = 0; i <= 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        const ribBulge = Math.sin(a * peyoteSegments) * 5;
        pts.push(new THREE.Vector3(Math.cos(a) * (r + ribBulge), y, Math.sin(a) * (r + ribBulge)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      cactusGroup.add(new THREE.Line(geo, primaryDimMat));
    }

    // Woolly center tuft
    const tuftGroup = new THREE.Group();
    tuftGroup.position.y = 25;
    cactusGroup.add(tuftGroup);

    for (let i = 0; i < 20; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 8;
      const h = 3 + rand() * 5;
      const tuftMat = new THREE.LineBasicMaterial({ color: PRIMARY_GLOW, transparent: true, opacity: 0.4 });
      const tuftGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r),
        new THREE.Vector3(Math.cos(a) * r * 0.5, h, Math.sin(a) * r * 0.5),
      ]);
      disposables.push(tuftMat, tuftGeo);
      tuftGroup.add(new THREE.Line(tuftGeo, tuftMat));
    }
    tuftGroup.add(createDot(0, 5, 0, 3, PRIMARY_GLOW));

    // Areoles with spines
    for (let rib = 0; rib < peyoteSegments; rib++) {
      const angle = (rib / peyoteSegments) * Math.PI * 2;
      for (let a = 0; a < 3; a++) {
        const t = 0.2 + a * 0.25;
        const y = Math.sin(t * Math.PI * 0.5) * 25;
        const r = peyoteRadius * Math.cos(t * Math.PI * 0.5) + 8;
        const ax = Math.cos(angle) * r;
        const az = Math.sin(angle) * r;
        cactusGroup.add(createDot(ax, y, az, 1.5, PRIMARY_BRIGHT));

        for (let s = 0; s < 4; s++) {
          const sa = angle + (s - 1.5) * 0.2;
          const sl = 5 + rand() * 3;
          const spineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(ax, y, az),
            new THREE.Vector3(ax + Math.cos(sa) * sl, y + sl * 0.3, az + Math.sin(sa) * sl),
          ]);
          disposables.push(spineGeo);
          cactusGroup.add(new THREE.Line(spineGeo, primaryDimMat));
        }
      }
    }

    // === SURROUNDING BUTTONS ===
    const buttonPositions = [
      { x: -80, z: 40, s: 0.5 },
      { x: 70, z: -30, s: 0.6 },
      { x: -50, z: -70, s: 0.4 },
      { x: 90, z: 50, s: 0.45 },
      { x: -100, z: -20, s: 0.35 },
    ];

    buttonPositions.forEach(bp => {
      const button = new THREE.Group();
      button.position.set(bp.x, 0, bp.z);
      button.scale.setScalar(bp.s);

      const buttonGeo = new THREE.SphereGeometry(30, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const buttonMat = new THREE.MeshBasicMaterial({ color: PRIMARY_DARK, wireframe: true, transparent: true, opacity: 0.2 });
      disposables.push(buttonGeo, buttonMat);
      button.add(new THREE.Mesh(buttonGeo, buttonMat));

      for (let r = 0; r < 8; r++) {
        const a = (r / 8) * Math.PI * 2;
        const ribGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(a) * 30, 0, Math.sin(a) * 30),
          new THREE.Vector3(0, 20, 0),
        ]);
        disposables.push(ribGeo);
        button.add(new THREE.Line(ribGeo, primaryDimMat));
      }
      button.add(createDot(0, 20, 0, 2, PRIMARY_BRIGHT));
      mainGroup.add(button);
    });

    // === MOLECULE ===
    const moleculeGroup = new THREE.Group();
    moleculeGroup.position.y = 120;
    mainGroup.add(moleculeGroup);

    const benzeneRadius = 20;
    const benzenePts = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      benzenePts.push(new THREE.Vector3(Math.cos(a) * benzeneRadius, 0, Math.sin(a) * benzeneRadius));
    }
    const benzeneGeo = new THREE.BufferGeometry().setFromPoints(benzenePts);
    disposables.push(benzeneGeo);
    moleculeGroup.add(new THREE.Line(benzeneGeo, primaryBrightMat));

    const innerPts = [];
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      innerPts.push(new THREE.Vector3(Math.cos(a) * benzeneRadius * 0.7, 0, Math.sin(a) * benzeneRadius * 0.7));
    }
    const innerGeo = new THREE.BufferGeometry().setFromPoints(innerPts);
    disposables.push(innerGeo);
    moleculeGroup.add(new THREE.Line(innerGeo, primaryDimMat));

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      moleculeGroup.add(createDot(Math.cos(a) * benzeneRadius, 0, Math.sin(a) * benzeneRadius, 3, PRIMARY_BRIGHT));
    }

    // Methoxy groups
    const visionMat = new THREE.LineBasicMaterial({ color: PRIMARY_DARK, transparent: true, opacity: 0.5 });
    disposables.push(visionMat);
    [0, 2, 4].forEach(i => {
      const a = (i / 6) * Math.PI * 2;
      const bx = Math.cos(a) * benzeneRadius, bz = Math.sin(a) * benzeneRadius;
      const ox = Math.cos(a) * (benzeneRadius + 15), oz = Math.sin(a) * (benzeneRadius + 15);
      const oGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(bx, 0, bz), new THREE.Vector3(ox, 0, oz)]);
      disposables.push(oGeo);
      moleculeGroup.add(new THREE.Line(oGeo, visionMat));
      moleculeGroup.add(createDot(ox, 0, oz, 3, PRIMARY_DARK));

      const cx = Math.cos(a) * (benzeneRadius + 28), cz = Math.sin(a) * (benzeneRadius + 28);
      const cGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ox, 0, oz), new THREE.Vector3(cx, 0, cz)]);
      disposables.push(cGeo);
      moleculeGroup.add(new THREE.Line(cGeo, primaryDimMat));
      moleculeGroup.add(createDot(cx, 0, cz, 2, PRIMARY));
    });

    // Ethylamine chain
    const chainStart = { x: Math.cos(Math.PI / 6) * benzeneRadius, z: Math.sin(Math.PI / 6) * benzeneRadius };
    const chainPts = [
      new THREE.Vector3(chainStart.x, 0, chainStart.z),
      new THREE.Vector3(chainStart.x + 15, 10, chainStart.z + 10),
      new THREE.Vector3(chainStart.x + 30, 5, chainStart.z + 20),
    ];
    const chainGeo = new THREE.BufferGeometry().setFromPoints(chainPts);
    disposables.push(chainGeo);
    moleculeGroup.add(new THREE.Line(chainGeo, primaryMat));
    chainPts.forEach((p, i) => moleculeGroup.add(createDot(p.x, p.y, p.z, i === 2 ? 4 : 2.5, i === 2 ? PRIMARY_GLOW : PRIMARY_BRIGHT)));

    // === VISION SPIRALS ===
    const spiralGroup = new THREE.Group();
    mainGroup.add(spiralGroup);

    for (let sp = 0; sp < 4; sp++) {
      const spiralPts = [];
      const baseAngle = (sp / 4) * Math.PI * 2;
      const spiralRadius = 100 + sp * 30;
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const a = baseAngle + t * Math.PI * 4;
        const r = spiralRadius * (1 - t * 0.3);
        const y = 50 + t * 150 + Math.sin(t * Math.PI * 6) * 10;
        spiralPts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      const spiralMat = new THREE.LineBasicMaterial({ color: sp % 2 === 0 ? PRIMARY_DARK : PRIMARY, transparent: true, opacity: 0.3 - sp * 0.05 });
      const spiralGeo = new THREE.BufferGeometry().setFromPoints(spiralPts);
      disposables.push(spiralMat, spiralGeo);
      spiralGroup.add(new THREE.Line(spiralGeo, spiralMat));
    }

    // === SACRED GEOMETRY ===
    const geometryGroup = new THREE.Group();
    geometryGroup.position.y = 200;
    mainGroup.add(geometryGroup);

    const flowerRadius = 30;
    for (let ring = 0; ring < 6; ring++) {
      const a = (ring / 6) * Math.PI * 2;
      const cx = Math.cos(a) * flowerRadius, cz = Math.sin(a) * flowerRadius;
      const circlePts = [];
      for (let i = 0; i <= 32; i++) {
        const ca = (i / 32) * Math.PI * 2;
        circlePts.push(new THREE.Vector3(cx + Math.cos(ca) * flowerRadius, 0, cz + Math.sin(ca) * flowerRadius));
      }
      const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePts);
      disposables.push(circleGeo);
      geometryGroup.add(new THREE.Line(circleGeo, primaryDimMat));
    }
    geometryGroup.add(createRing(flowerRadius, 0, 32, primaryMat));
    geometryGroup.add(createDot(0, 0, 0, 4, PRIMARY_GLOW));

    // === DESERT FLOOR ===
    const desertGroup = new THREE.Group();
    desertGroup.position.y = -5;
    mainGroup.add(desertGroup);

    for (let i = -5; i <= 5; i++) {
      const lineGeo1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-200, 0, i * 40), new THREE.Vector3(200, 0, i * 40)]);
      const lineGeo2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 40, 0, -200), new THREE.Vector3(i * 40, 0, 200)]);
      disposables.push(lineGeo1, lineGeo2);
      desertGroup.add(new THREE.Line(lineGeo1, primaryDimMat));
      desertGroup.add(new THREE.Line(lineGeo2, primaryDimMat));
    }

    const mountainPts = [];
    for (let i = 0; i <= 40; i++) {
      const x = (i / 40) * 600 - 300;
      mountainPts.push(new THREE.Vector3(x, Math.sin(i * 0.5) * 30 + Math.sin(i * 0.2) * 50 + 20, -250));
    }
    const mountainGeo = new THREE.BufferGeometry().setFromPoints(mountainPts);
    disposables.push(mountainGeo);
    desertGroup.add(new THREE.Line(mountainGeo, primaryDimMat));

    // === VISION PARTICLES ===
    const visionCount = isMobile ? 75 : 150;
    const visionPositions = new Float32Array(visionCount * 3);
    const visionColors = new Float32Array(visionCount * 3);
    const visionVelocities = [];
    const visionColorOpts = [PRIMARY_BRIGHT, PRIMARY_DARK, PRIMARY, PRIMARY_GLOW];

    for (let i = 0; i < visionCount; i++) {
      const a = rand() * Math.PI * 2;
      const r = 50 + rand() * 150;
      visionPositions[i * 3] = Math.cos(a) * r;
      visionPositions[i * 3 + 1] = rand() * 250 + 30;
      visionPositions[i * 3 + 2] = Math.sin(a) * r;
      const col = new THREE.Color(visionColorOpts[Math.floor(rand() * visionColorOpts.length)]);
      visionColors[i * 3] = col.r;
      visionColors[i * 3 + 1] = col.g;
      visionColors[i * 3 + 2] = col.b;
      visionVelocities.push({ angle: a, speed: 0.002 + rand() * 0.005, ySpeed: (rand() - 0.5) * 0.2, radius: r });
    }

    const visionGeo = new THREE.BufferGeometry();
    visionGeo.setAttribute('position', new THREE.BufferAttribute(visionPositions, 3));
    visionGeo.setAttribute('color', new THREE.BufferAttribute(visionColors, 3));
    const visionParticleMat = new THREE.PointsMaterial({ size: 2.5, transparent: true, opacity: 0.6, vertexColors: true });
    disposables.push(visionGeo, visionParticleMat);
    const visionParticles = new THREE.Points(visionGeo, visionParticleMat);
    mainGroup.add(visionParticles);

    // === ENERGY RINGS ===
    const energyRings = [];
    for (let i = 0; i < 5; i++) {
      const ringMat = new THREE.LineBasicMaterial({ color: i % 2 === 0 ? PRIMARY_DARK : PRIMARY, transparent: true, opacity: 0.2 });
      disposables.push(ringMat);
      const ring = createRing(60 + i * 25, 50 + i * 30, 48, ringMat);
      mainGroup.add(ring);
      energyRings.push({ mesh: ring, baseY: 50 + i * 30, speed: 0.5 + i * 0.2 });
    }

    let animId;
    let time = 0;
    let frameCount = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      frameCount++;

      const breathPhase = Math.sin(time * BREATH_SPEED * 5);

      moleculeGroup.rotation.y = time * 0.3;
      moleculeGroup.rotation.x = Math.sin(time * 0.5) * 0.1;

      geometryGroup.rotation.y = -time * 0.2;
      spiralGroup.rotation.y = time * 0.1;

      energyRings.forEach((er, i) => {
        er.mesh.position.y = er.baseY + Math.sin(time * er.speed + i) * 10;
        er.mesh.scale.setScalar(1 + breathPhase * 0.08);
      });

      const vPos = visionParticles.geometry.attributes.position.array;
      visionVelocities.forEach((v, i) => {
        v.angle += v.speed;
        vPos[i * 3] = Math.cos(v.angle) * v.radius;
        vPos[i * 3 + 1] += v.ySpeed;
        vPos[i * 3 + 2] = Math.sin(v.angle) * v.radius;
        if (vPos[i * 3 + 1] > 280 || vPos[i * 3 + 1] < 30) v.ySpeed *= -1;
      });
      visionParticles.geometry.attributes.position.needsUpdate = true;

      tuftGroup.rotation.z = Math.sin(time) * 0.05;

      // Touch-responsive rotation - skip first 30 frames to avoid swipe interference
      if (frameCount > 30 && touchPointsRef.current.length > 0) {
        const activeTouch = touchPointsRef.current.find(p => p.active) || touchPointsRef.current[0];
        if (activeTouch) {
          const normalizedX = (activeTouch.x / window.innerWidth - 0.5) * 2;
          const normalizedY = (activeTouch.y / window.innerHeight - 0.5) * 2;
          mainGroup.rotation.y += normalizedX * 0.015;
          mainGroup.rotation.x = Math.max(-0.5, Math.min(0.5, mainGroup.rotation.x + normalizedY * 0.008));
        }
      } else if (frameCount > 30) {
        mainGroup.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [currentMode, hue]);

  // Floating particles animation (stars in space effect)
  React.useEffect(() => {
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
    const particleCount = 120;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
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
        p.x += p.vx + Math.sin(time * 0.3 + p.phase) * 0.05;
        p.y += p.vy + Math.cos(time * 0.2 + p.phase) * 0.05;

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
        gradient.addColorStop(0, `hsla(${hue}, 52%, 68%, ${currentOpacity})`);
        gradient.addColorStop(1, `hsla(${hue}, 52%, 68%, 0)`);

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
  }, [hue]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: backgroundMode ? 0 : 2,
        cursor: backgroundMode ? 'default' : 'pointer',
        background: backgroundMode ? 'transparent' : '#000',
        touchAction: 'none',
        opacity: bgOpacity,
        pointerEvents: backgroundMode ? 'none' : 'auto',
        transition: 'opacity 1s ease',
      }}
      onMouseDown={backgroundMode ? undefined : handleInteractionStart}
      onMouseMove={backgroundMode ? undefined : handleInteractionMove}
      onMouseUp={backgroundMode ? undefined : handleInteractionEnd}
      onMouseLeave={backgroundMode ? undefined : handleInteractionEnd}
      onTouchStart={backgroundMode ? undefined : handleInteractionStart}
      onTouchMove={backgroundMode ? undefined : handleInteractionMove}
      onTouchEnd={backgroundMode ? undefined : handleInteractionEnd}
    >
      {/* Three.js container for 3D modes */}
      {(currentMode === 'geometry' || currentMode === 'jellyfish' || currentMode === 'flowerOfLife' ||  currentMode === 'tree' || currentMode === 'fern' || currentMode === 'dandelion' || currentMode === 'succulent' || currentMode === 'ripples' || currentMode === 'lungs' || currentMode === 'koiPond' || currentMode === 'lavaTouch' || currentMode === 'mountains' || currentMode === 'maloka' || currentMode === 'underwater' || currentMode === 'lotus' || currentMode === 'heartGarden' || currentMode === 'corpusStellae' || currentMode === 'machinaTemporis' || currentMode === 'oceanusProfundus' || currentMode === 'aquaVitae' || currentMode === 'arborMundi' || currentMode === 'crystallumInfinitum' || currentMode === 'nervusCosmicus' || currentMode === 'portaDimensionum' || currentMode === 'templumSonorum' || currentMode === 'labyrinthisSacrum' || currentMode === 'fungusDimensio' || currentMode === 'peyoteVisio') && (
        <div ref={containerRef} style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          animation: 'fadeInSmooth 0.4s ease-out',
        }} />
      )}

      {/* Heart Garden tap overlay */}
      {currentMode === 'heartGarden' && (
        <div
          onClick={advanceGardenGuidance}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
        />
      )}


      {/* Heart Garden guidance overlay */}
      {currentMode === 'heartGarden' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pointerEvents: 'none',
            paddingBottom: 'calc(12rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Guidance text */}
          <div
            style={{
              color: `hsla(${hue}, 52%, 78%, 0.95)`,
              fontSize: '1.5rem',
              fontFamily: '"Jost", sans-serif',
              fontWeight: 300,
              lineHeight: 1.8,
              textAlign: 'center',
              maxWidth: '90%',
              padding: '0 1.5rem',
              opacity: gardenGuidanceOpacity,
              transition: 'opacity 0.8s ease-in-out',
              textShadow: '0 2px 20px rgba(0,0,0,0.7)',
            }}
          >
            {gardenComplete
              ? "The garden lives within you always."
              : (meditationStages[gardenStage]?.guidance[gardenGuidanceIndex] || '')}
          </div>

          {/* Tap hint - shown briefly at start */}
          {!gardenComplete && gardenLinesRead === 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
                color: `hsla(${hue}, 52%, 68%, 0.5)`,
                fontSize: '0.75rem',
                fontFamily: '"Jost", sans-serif',
                letterSpacing: '0.15em',
              }}
            >
              tap to continue
            </div>
          )}

          {/* Progress dots - only show on native apps, not web browsers */}
          {typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              {meditationStages.map((stage, i) => (
                <div
                  key={stage.id}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: i <= gardenStage
                      ? `hsla(${hue}, 52%, 68%, ${i === gardenStage ? 0.9 : 0.5})`
                      : `hsla(${hue}, 52%, 68%, 0.2)`,
                    transition: 'background-color 0.5s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating particles overlay (stars in space) */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      {/* Canvas for 2D modes */}
      {currentMode !== 'geometry' && currentMode !== 'jellyfish' && currentMode !== 'flowerOfLife' && currentMode !== 'mushrooms' && currentMode !== 'tree' && currentMode !== 'fern' && currentMode !== 'dandelion' && currentMode !== 'succulent' && currentMode !== 'ripples' && currentMode !== 'lungs' && currentMode !== 'koiPond' && currentMode !== 'lavaTouch' && currentMode !== 'mountains' && currentMode !== 'maloka' && currentMode !== 'underwater' && currentMode !== 'lotus' && currentMode !== 'corpusStellae' && currentMode !== 'machinaTemporis' && currentMode !== 'oceanusProfundus' && currentMode !== 'aquaVitae' && currentMode !== 'arborMundi' && currentMode !== 'crystallumInfinitum' && currentMode !== 'nervusCosmicus' && currentMode !== 'portaDimensionum' && currentMode !== 'templumSonorum' && currentMode !== 'caelumMechanicum' && currentMode !== 'labyrinthisSacrum' && (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
      )}

      {/* Visual name toast - appears briefly when switching visuals (hidden in background mode) */}
      {!backgroundMode && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(4rem + env(safe-area-inset-top, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            opacity: showVisualToast ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
            zIndex: 100,
          }}
        >
          <span
            style={{
              color: `hsla(${hue}, 52%, 68%, 0.85)`,
              fontSize: '0.85rem',
              fontFamily: '"Jost", sans-serif',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {gazeModes.find(m => m.key === currentMode)?.name || ''}
          </span>
        </div>
      )}

      <style>{`
        @keyframes slideUpDrawer {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInSmooth {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gazeTextPulse {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default GazeMode;
export { gazeModes };
