import React from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';
import { allQuotes, allThemes, allSchools } from './data/quotes';
import { breathTechniques } from './data/breathTechniques';
import { haptic } from './config/haptic';
import { gazeModes, BREATH_CYCLE, BREATH_SPEED, KEYS, KEY_FREQUENCIES, SCALE_TYPES, isMobile } from './config/constants';
import GazeMode from './components/GazeMode';

// Destructure React hooks for compatibility with original code
const { useState, useEffect, useRef, useCallback } = React;

// ============================================================================
// MANTRA MODE - Geometry Generators
// ============================================================================

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// I Am Grateful For This Moment - 42 elements (6 words × 7 cycles)
// SUNRISE OVER MOUNTAINS - dawn breaking, birds rising, the gift of a new day
const generateFlowerOfLife = (cx, cy) => {
  const elements = [];

  // The rising sun - half circle at horizon (1 large arc suggested by dots)
  elements.push({ type: 'circle', x: cx, y: cy + 20, radius: 45 }); // sun body

  // Sun rays reaching upward and outward - 12 rays of morning light
  for (let i = 0; i < 12; i++) {
    const angle = -Math.PI + (i / 11) * Math.PI; // upper hemisphere only
    const inner = 50;
    const outer = 85 + Math.sin(i * 0.7) * 20;
    elements.push({ type: 'line', x1: cx + Math.cos(angle) * inner, y1: cy + 20 + Math.sin(angle) * inner, x2: cx + Math.cos(angle) * outer, y2: cy + 20 + Math.sin(angle) * outer });
  }

  // Mountain range silhouette - 6 peaks across the horizon
  elements.push({ type: 'line', x1: cx - 130, y1: cy + 40, x2: cx - 80, y2: cy - 30 }); // left peak up
  elements.push({ type: 'line', x1: cx - 80, y1: cy - 30, x2: cx - 50, y2: cy + 20 }); // left peak down
  elements.push({ type: 'line', x1: cx - 50, y1: cy + 20, x2: cx - 10, y2: cy - 50 }); // center-left peak up
  elements.push({ type: 'line', x1: cx - 10, y1: cy - 50, x2: cx + 30, y2: cy + 10 }); // center peak down
  elements.push({ type: 'line', x1: cx + 30, y1: cy + 10, x2: cx + 70, y2: cy - 25 }); // right peak up
  elements.push({ type: 'line', x1: cx + 70, y1: cy - 25, x2: cx + 130, y2: cy + 40 }); // right slope down

  // Birds in flight - 6 V-shapes rising with the dawn (12 lines)
  const birdPositions = [{x: -60, y: -70}, {x: -20, y: -90}, {x: 30, y: -75}, {x: 70, y: -95}, {x: -40, y: -110}, {x: 50, y: -115}];
  birdPositions.forEach(pos => {
    elements.push({ type: 'line', x1: cx + pos.x - 12, y1: cy + pos.y + 5, x2: cx + pos.x, y2: cy + pos.y });
    elements.push({ type: 'line', x1: cx + pos.x, y1: cy + pos.y, x2: cx + pos.x + 12, y2: cy + pos.y + 5 });
  });

  // Stars fading in morning sky - 5 dots
  elements.push({ type: 'dot', x: cx - 90, y: cy - 100, radius: 2 });
  elements.push({ type: 'dot', x: cx + 100, y: cy - 85, radius: 2.5 });
  elements.push({ type: 'dot', x: cx - 30, y: cy - 130, radius: 2 });
  elements.push({ type: 'dot', x: cx + 60, y: cy - 120, radius: 1.5 });
  elements.push({ type: 'dot', x: cx - 110, y: cy - 60, radius: 2 });

  // Horizon line
  elements.push({ type: 'line', x1: cx - 130, y1: cy + 40, x2: cx + 130, y2: cy + 40 });

  // Clouds touched by dawn light - 4 small clusters
  elements.push({ type: 'dot', x: cx - 100, y: cy - 40, radius: 4 });
  elements.push({ type: 'dot', x: cx - 85, y: cy - 35, radius: 3 });
  elements.push({ type: 'dot', x: cx + 90, y: cy - 50, radius: 5 });
  elements.push({ type: 'dot', x: cx + 110, y: cy - 45, radius: 3 });

  // The grateful heart - center of the sun
  elements.push({ type: 'dot', x: cx, y: cy + 20, radius: 8, isCenter: true });
  return elements;
};

// Good Fortune Flows Towards Loved Ones And I - 32 elements (8 words × 4 cycles)
// FRUIT TREE - branches heavy with gifts, fortune flowing to loved ones
const generateSpiralGalaxy = (cx, cy) => {
  const elements = [];

  // Tree trunk - strong and rooted (2 lines)
  elements.push({ type: 'line', x1: cx - 8, y1: cy + 80, x2: cx - 5, y2: cy + 20 });
  elements.push({ type: 'line', x1: cx + 8, y1: cy + 80, x2: cx + 5, y2: cy + 20 });

  // Main branches spreading outward (6 branches)
  elements.push({ type: 'branch', x1: cx, y1: cy + 20, angle: -Math.PI/2 - 0.8, length: 55, curve: -0.3, thickness: 2 });
  elements.push({ type: 'branch', x1: cx, y1: cy + 20, angle: -Math.PI/2 + 0.8, length: 55, curve: 0.3, thickness: 2 });
  elements.push({ type: 'branch', x1: cx, y1: cy, angle: -Math.PI/2 - 0.4, length: 70, curve: -0.2, thickness: 2 });
  elements.push({ type: 'branch', x1: cx, y1: cy, angle: -Math.PI/2 + 0.4, length: 70, curve: 0.2, thickness: 2 });
  elements.push({ type: 'branch', x1: cx, y1: cy - 15, angle: -Math.PI/2 - 0.15, length: 50, curve: -0.1, thickness: 1.5 });
  elements.push({ type: 'branch', x1: cx, y1: cy - 15, angle: -Math.PI/2 + 0.15, length: 50, curve: 0.1, thickness: 1.5 });

  // Fruits hanging from branches - 16 abundant circles (4 more for 8-word mantra)
  const fruitPos = [
    {x: -70, y: -40}, {x: -55, y: -65}, {x: -35, y: -50}, {x: -45, y: -85},
    {x: 70, y: -40}, {x: 55, y: -70}, {x: 35, y: -55}, {x: 50, y: -90},
    {x: -15, y: -75}, {x: 15, y: -80}, {x: 0, y: -95}, {x: -25, y: -100},
    {x: 25, y: -105}, {x: -60, y: -80}, {x: 60, y: -85}, {x: 0, y: -65}
  ];
  fruitPos.forEach(pos => {
    elements.push({ type: 'circle', x: cx + pos.x, y: cy + pos.y, radius: 10 });
  });

  // Leaves among the fruit - 6 small petals
  elements.push({ type: 'petal', cx: cx - 60, cy: cy - 55, angle: Math.PI * 0.3, innerRadius: 0, outerRadius: 12, width: 0.4 });
  elements.push({ type: 'petal', cx: cx + 65, cy: cy - 55, angle: Math.PI * 0.7, innerRadius: 0, outerRadius: 12, width: 0.4 });
  elements.push({ type: 'petal', cx: cx - 30, cy: cy - 90, angle: Math.PI * 0.4, innerRadius: 0, outerRadius: 10, width: 0.4 });
  elements.push({ type: 'petal', cx: cx + 30, cy: cy - 95, angle: Math.PI * 0.6, innerRadius: 0, outerRadius: 10, width: 0.4 });
  elements.push({ type: 'petal', cx: cx, cy: cy - 110, angle: -Math.PI/2, innerRadius: 0, outerRadius: 8, width: 0.4 });
  elements.push({ type: 'petal', cx: cx + 20, cy: cy - 105, angle: Math.PI * 0.55, innerRadius: 0, outerRadius: 9, width: 0.4 });

  // Ground line
  elements.push({ type: 'line', x1: cx - 50, y1: cy + 85, x2: cx + 50, y2: cy + 85 });

  // Root extending down
  elements.push({ type: 'dot', x: cx, y: cy + 95, radius: 4 });

  // The receiving self - root center
  elements.push({ type: 'dot', x: cx, y: cy + 80, radius: 7, isCenter: true });
  return elements;
};

// I Am Worthy Of Love - 35 elements (5 words × 7 cycles)
// BLOOMING ROSE - spiral petals unfurling, the courage to open
const generateLotusBlossom = (cx, cy) => {
  const elements = [];

  // Rose center - tight spiral bud (golden spiral with 8 points)
  for (let i = 0; i < 8; i++) {
    const angle = i * 0.8 - Math.PI / 2;
    const r = 5 + i * 3;
    elements.push({ type: 'dot', x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, radius: 2 + i * 0.3 });
  }

  // Inner petals - 5 tight curves (one for each word)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    elements.push({ type: 'petal', cx, cy, angle, innerRadius: 15, outerRadius: 40, width: 0.5 });
  }

  // Middle petals - 8 opening wider
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2 + 0.2;
    elements.push({ type: 'petal', cx, cy, angle, innerRadius: 35, outerRadius: 75, width: 0.4 });
  }

  // Outer petals - 7 fully opened
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
    elements.push({ type: 'petal', cx, cy, angle, innerRadius: 65, outerRadius: 115, width: 0.35 });
  }

  // Stem below - connection to earth (3 lines)
  elements.push({ type: 'line', x1: cx, y1: cy + 50, x2: cx - 5, y2: cy + 100 });
  elements.push({ type: 'line', x1: cx - 5, y1: cy + 100, x2: cx - 8, y2: cy + 140 });
  elements.push({ type: 'branch', x1: cx - 5, y1: cy + 90, angle: Math.PI * 0.7, length: 25, curve: 0.3, thickness: 1 });

  // Two leaves on stem
  elements.push({ type: 'petal', cx: cx - 25, cy: cy + 95, angle: Math.PI * 0.8, innerRadius: 0, outerRadius: 20, width: 0.5 });
  elements.push({ type: 'petal', cx: cx + 15, cy: cy + 110, angle: Math.PI * 0.2, innerRadius: 0, outerRadius: 18, width: 0.5 });

  // Thorns - vulnerability (2)
  elements.push({ type: 'dot', x: cx + 8, y: cy + 85, radius: 2 });
  elements.push({ type: 'dot', x: cx - 6, y: cy + 105, radius: 2 });

  // The worthy heart - center of the rose
  elements.push({ type: 'dot', x: cx, y: cy, radius: 6, isCenter: true });
  return elements;
};

// Peace Begins Within - 21 elements (3 words × 7 cycles)
// LOTUS OF PEACE - flower floating on still water with perfect reflection
// Bilateral symmetry above and below the water line, peace radiating outward
const generateMandalaStar = (cx, cy) => {
  const elements = [];

  // Water line - the mirror of stillness (perfectly centered)
  elements.push({ type: 'line', x1: cx - 100, y1: cy, x2: cx + 100, y2: cy });

  // Lotus flower above water - symmetric petals (5 petals)
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i - 2) * 0.35; // spread across top
    elements.push({ type: 'petal', cx, cy: cy - 15, angle, innerRadius: 8, outerRadius: 45, width: 0.35 });
  }

  // Lotus center - the peace within
  elements.push({ type: 'circle', x: cx, y: cy - 15, radius: 15 });

  // Reflection below water - mirrored petals (5 petals, inverted)
  for (let i = 0; i < 5; i++) {
    const angle = Math.PI / 2 + (i - 2) * 0.35; // spread across bottom
    elements.push({ type: 'petal', cx, cy: cy + 15, angle, innerRadius: 8, outerRadius: 40, width: 0.3 });
  }

  // Reflection of center - slightly smaller/fainter
  elements.push({ type: 'circle', x: cx, y: cy + 15, radius: 12 });

  // Concentric ripples on water - perfect circles (3 circles)
  elements.push({ type: 'circle', x: cx, y: cy, radius: 55 });
  elements.push({ type: 'circle', x: cx, y: cy, radius: 75 });
  elements.push({ type: 'circle', x: cx, y: cy, radius: 95 });

  // Outermost ripple
  elements.push({ type: 'circle', x: cx, y: cy, radius: 115 });

  // The peaceful heart - at the center where flower meets reflection
  elements.push({ type: 'dot', x: cx, y: cy, radius: 6, isCenter: true });
  return elements;
};

// I Am Calm And Centered - 35 elements (5 words × 7 cycles)
// SACRED MOUNTAIN - immovable, eternal, touching the sky
// The mountain does not strive - it simply IS, calm and centered
const generateSacredSpiral = (cx, cy) => {
  const elements = [];

  // Mountain peak silhouette - the great triangle (4 lines)
  elements.push({ type: 'line', x1: cx - 120, y1: cy + 80, x2: cx - 30, y2: cy - 60 }); // left slope to sub-peak
  elements.push({ type: 'line', x1: cx - 30, y1: cy - 60, x2: cx, y2: cy - 100 }); // to summit
  elements.push({ type: 'line', x1: cx, y1: cy - 100, x2: cx + 25, y2: cy - 55 }); // summit to right ridge
  elements.push({ type: 'line', x1: cx + 25, y1: cy - 55, x2: cx + 120, y2: cy + 80 }); // right slope down

  // Snow cap on peak (3 lines suggesting snow line)
  elements.push({ type: 'line', x1: cx - 40, y1: cy - 45, x2: cx - 15, y2: cy - 70 });
  elements.push({ type: 'line', x1: cx - 15, y1: cy - 70, x2: cx + 12, y2: cy - 42 });
  elements.push({ type: 'line', x1: cx - 25, y1: cy - 55, x2: cx + 18, y2: cy - 48 });

  // Distant mountain range behind (4 lines)
  elements.push({ type: 'line', x1: cx - 130, y1: cy + 80, x2: cx - 100, y2: cy + 30 });
  elements.push({ type: 'line', x1: cx - 100, y1: cy + 30, x2: cx - 70, y2: cy + 50 });
  elements.push({ type: 'line', x1: cx + 80, y1: cy + 40, x2: cx + 105, y2: cy + 25 });
  elements.push({ type: 'line', x1: cx + 105, y1: cy + 25, x2: cx + 130, y2: cy + 80 });

  // Ground/horizon line
  elements.push({ type: 'line', x1: cx - 130, y1: cy + 80, x2: cx + 130, y2: cy + 80 });

  // Clouds drifting past (4 small circles)
  elements.push({ type: 'circle', x: cx - 80, y: cy - 30, radius: 12 });
  elements.push({ type: 'circle', x: cx - 65, y: cy - 25, radius: 10 });
  elements.push({ type: 'circle', x: cx + 75, y: cy - 20, radius: 11 });
  elements.push({ type: 'circle', x: cx + 90, y: cy - 15, radius: 9 });

  // Pine trees at base (6 small triangular suggestions using lines)
  elements.push({ type: 'line', x1: cx - 90, y1: cy + 80, x2: cx - 85, y2: cy + 55 });
  elements.push({ type: 'line', x1: cx - 85, y1: cy + 55, x2: cx - 80, y2: cy + 80 });
  elements.push({ type: 'line', x1: cx - 65, y1: cy + 80, x2: cx - 60, y2: cy + 50 });
  elements.push({ type: 'line', x1: cx - 60, y1: cy + 50, x2: cx - 55, y2: cy + 80 });
  elements.push({ type: 'line', x1: cx + 70, y1: cy + 80, x2: cx + 75, y2: cy + 52 });
  elements.push({ type: 'line', x1: cx + 75, y1: cy + 52, x2: cx + 80, y2: cy + 80 });

  // Stars appearing in clear sky (5 dots)
  elements.push({ type: 'dot', x: cx - 100, y: cy - 80, radius: 2 });
  elements.push({ type: 'dot', x: cx + 95, y: cy - 85, radius: 2.5 });
  elements.push({ type: 'dot', x: cx - 50, y: cy - 110, radius: 2 });
  elements.push({ type: 'dot', x: cx + 40, y: cy - 105, radius: 1.5 });
  elements.push({ type: 'dot', x: cx + 110, y: cy - 50, radius: 2 });

  // Meditation stones at foreground (4 circles)
  elements.push({ type: 'circle', x: cx - 20, y: cy + 95, radius: 8 });
  elements.push({ type: 'circle', x: cx + 5, y: cy + 100, radius: 6 });
  elements.push({ type: 'circle', x: cx + 25, y: cy + 97, radius: 7 });
  elements.push({ type: 'circle', x: cx - 45, y: cy + 100, radius: 5 });

  // The mountain's heart - the centered self
  elements.push({ type: 'dot', x: cx, y: cy - 100, radius: 7, isCenter: true });
  return elements;
};

// I Am Loving Awareness - 28 elements (4 words × 7 cycles)
// INFINITE HEART - love and awareness as one radiating field
// Ram Dass's teaching: awareness that IS love, expanding infinitely
const generateInfinityLoop = (cx, cy) => {
  const elements = [];

  // Infinity symbol - love and awareness intertwined (8 line segments)
  // Left loop
  elements.push({ type: 'line', x1: cx - 25, y1: cy, x2: cx - 50, y2: cy - 25 });
  elements.push({ type: 'line', x1: cx - 50, y1: cy - 25, x2: cx - 70, y2: cy });
  elements.push({ type: 'line', x1: cx - 70, y1: cy, x2: cx - 50, y2: cy + 25 });
  elements.push({ type: 'line', x1: cx - 50, y1: cy + 25, x2: cx - 25, y2: cy });
  // Right loop
  elements.push({ type: 'line', x1: cx + 25, y1: cy, x2: cx + 50, y2: cy + 25 });
  elements.push({ type: 'line', x1: cx + 50, y1: cy + 25, x2: cx + 70, y2: cy });
  elements.push({ type: 'line', x1: cx + 70, y1: cy, x2: cx + 50, y2: cy - 25 });
  elements.push({ type: 'line', x1: cx + 50, y1: cy - 25, x2: cx + 25, y2: cy });

  // Radiating circles of awareness - 4 expanding rings
  elements.push({ type: 'circle', x: cx, y: cy, radius: 35 });
  elements.push({ type: 'circle', x: cx, y: cy, radius: 55 });
  elements.push({ type: 'circle', x: cx, y: cy, radius: 75 });
  elements.push({ type: 'circle', x: cx, y: cy, radius: 95 });

  // Light points along infinity - consciousness flowing (8 dots)
  const infPoints = [
    {x: -60, y: 0}, {x: -45, y: -20}, {x: -45, y: 20}, {x: -30, y: 0},
    {x: 60, y: 0}, {x: 45, y: -20}, {x: 45, y: 20}, {x: 30, y: 0}
  ];
  infPoints.forEach(p => {
    elements.push({ type: 'dot', x: cx + p.x, y: cy + p.y, radius: 3 });
  });

  // Outer radiance - love extending everywhere (4 dots)
  elements.push({ type: 'dot', x: cx, y: cy - 85, radius: 4 });
  elements.push({ type: 'dot', x: cx, y: cy + 85, radius: 4 });
  elements.push({ type: 'dot', x: cx - 85, y: cy, radius: 4 });
  elements.push({ type: 'dot', x: cx + 85, y: cy, radius: 4 });

  // The center - where love and awareness are one
  elements.push({ type: 'dot', x: cx, y: cy, radius: 6, isCenter: true });
  return elements;
};

// I Trust The Process - 28 elements (4 words × 7 cycles)
// COMPASS - trusting the inner guide to show the way
// The needle always points true, trust in the direction
const generateFallingLeaves = (cx, cy) => {
  const elements = [];

  // Outer compass ring (1 circle)
  elements.push({ type: 'circle', x: cx, y: cy, radius: 90 });

  // Inner compass ring (1 circle)
  elements.push({ type: 'circle', x: cx, y: cy, radius: 75 });

  // Cardinal direction lines - N, S, E, W (4 lines)
  elements.push({ type: 'line', x1: cx, y1: cy - 75, x2: cx, y2: cy - 55 }); // North
  elements.push({ type: 'line', x1: cx, y1: cy + 75, x2: cx, y2: cy + 55 }); // South
  elements.push({ type: 'line', x1: cx - 75, y1: cy, x2: cx - 55, y2: cy }); // West
  elements.push({ type: 'line', x1: cx + 75, y1: cy, x2: cx + 55, y2: cy }); // East

  // Intercardinal lines - NE, NW, SE, SW (4 shorter lines)
  const diag = 53;
  const diagInner = 40;
  elements.push({ type: 'line', x1: cx - diag, y1: cy - diag, x2: cx - diagInner, y2: cy - diagInner });
  elements.push({ type: 'line', x1: cx + diag, y1: cy - diag, x2: cx + diagInner, y2: cy - diagInner });
  elements.push({ type: 'line', x1: cx - diag, y1: cy + diag, x2: cx - diagInner, y2: cy + diagInner });
  elements.push({ type: 'line', x1: cx + diag, y1: cy + diag, x2: cx + diagInner, y2: cy + diagInner });

  // Compass needle - pointing North (2 lines forming arrow)
  elements.push({ type: 'line', x1: cx, y1: cy, x2: cx, y2: cy - 45 }); // needle shaft north
  elements.push({ type: 'line', x1: cx, y1: cy, x2: cx, y2: cy + 30 }); // needle shaft south
  // Needle point
  elements.push({ type: 'line', x1: cx - 8, y1: cy - 35, x2: cx, y2: cy - 50 });
  elements.push({ type: 'line', x1: cx + 8, y1: cy - 35, x2: cx, y2: cy - 50 });

  // Degree markers around the rim (8 dots)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    elements.push({ type: 'dot', x: cx + Math.cos(angle) * 82, y: cy + Math.sin(angle) * 82, radius: 2 });
  }

  // North star marker (1 larger dot)
  elements.push({ type: 'dot', x: cx, y: cy - 100, radius: 4 });

  // Inner decoration circle (1 circle)
  elements.push({ type: 'circle', x: cx, y: cy, radius: 25 });

  // The trusting heart - at the compass center
  elements.push({ type: 'dot', x: cx, y: cy, radius: 6, isCenter: true });
  return elements;
};

// I Forgive and Release - 28 elements (4 words × 7 cycles)
// OPENING HANDS RELEASING LIGHT - forgiveness as letting go
// Two hands open upward, releasing sparks of light into the infinite
const generateForgivenessRelease = (cx, cy) => {
  const elements = [];

  // Left hand - palm opening upward (6 lines forming hand)
  elements.push({ type: 'line', x1: cx - 70, y1: cy + 40, x2: cx - 55, y2: cy }); // wrist to palm
  elements.push({ type: 'line', x1: cx - 55, y1: cy, x2: cx - 70, y2: cy - 30 }); // thumb
  elements.push({ type: 'line', x1: cx - 55, y1: cy, x2: cx - 55, y2: cy - 45 }); // index
  elements.push({ type: 'line', x1: cx - 55, y1: cy, x2: cx - 45, y2: cy - 50 }); // middle
  elements.push({ type: 'line', x1: cx - 55, y1: cy, x2: cx - 35, y2: cy - 45 }); // ring
  elements.push({ type: 'line', x1: cx - 55, y1: cy, x2: cx - 30, y2: cy - 35 }); // pinky

  // Right hand - mirrored (6 lines)
  elements.push({ type: 'line', x1: cx + 70, y1: cy + 40, x2: cx + 55, y2: cy });
  elements.push({ type: 'line', x1: cx + 55, y1: cy, x2: cx + 70, y2: cy - 30 });
  elements.push({ type: 'line', x1: cx + 55, y1: cy, x2: cx + 55, y2: cy - 45 });
  elements.push({ type: 'line', x1: cx + 55, y1: cy, x2: cx + 45, y2: cy - 50 });
  elements.push({ type: 'line', x1: cx + 55, y1: cy, x2: cx + 35, y2: cy - 45 });
  elements.push({ type: 'line', x1: cx + 55, y1: cy, x2: cx + 30, y2: cy - 35 });

  // Light being released - ascending particles (10 dots rising)
  elements.push({ type: 'dot', x: cx, y: cy - 20, radius: 5 });
  elements.push({ type: 'dot', x: cx - 15, y: cy - 40, radius: 4 });
  elements.push({ type: 'dot', x: cx + 15, y: cy - 45, radius: 4 });
  elements.push({ type: 'dot', x: cx, y: cy - 60, radius: 3.5 });
  elements.push({ type: 'dot', x: cx - 25, y: cy - 70, radius: 3 });
  elements.push({ type: 'dot', x: cx + 25, y: cy - 75, radius: 3 });
  elements.push({ type: 'dot', x: cx - 10, y: cy - 85, radius: 2.5 });
  elements.push({ type: 'dot', x: cx + 10, y: cy - 90, radius: 2.5 });
  elements.push({ type: 'dot', x: cx, y: cy - 100, radius: 2 });
  elements.push({ type: 'dot', x: cx, y: cy - 115, radius: 1.5 });

  // The forgiving heart - at the center between the hands
  elements.push({ type: 'dot', x: cx, y: cy + 10, radius: 6, isCenter: true });
  return elements;
};

// I Accept Myself Completely - 28 elements (4 words × 7 cycles)
// EMBRACING SELF - two figures mirrored, hands meeting at center
// Perfect bilateral symmetry: self and reflection as one unified whole
const generateSelfAcceptance = (cx, cy) => {
  const elements = [];

  // Central mirror/divide line - vertical axis of reflection
  elements.push({ type: 'line', x1: cx, y1: cy - 100, x2: cx, y2: cy + 80 });

  // Left figure - the self
  elements.push({ type: 'circle', x: cx - 35, y: cy - 50, radius: 15 }); // head
  elements.push({ type: 'line', x1: cx - 35, y1: cy - 35, x2: cx - 35, y2: cy + 20 }); // body
  elements.push({ type: 'line', x1: cx - 35, y1: cy + 20, x2: cx - 50, y2: cy + 60 }); // left leg
  elements.push({ type: 'line', x1: cx - 35, y1: cy + 20, x2: cx - 20, y2: cy + 60 }); // right leg
  elements.push({ type: 'line', x1: cx - 35, y1: cy - 20, x2: cx - 10, y2: cy - 30 }); // arm reaching to center

  // Right figure - the reflection (mirrored)
  elements.push({ type: 'circle', x: cx + 35, y: cy - 50, radius: 15 }); // head
  elements.push({ type: 'line', x1: cx + 35, y1: cy - 35, x2: cx + 35, y2: cy + 20 }); // body
  elements.push({ type: 'line', x1: cx + 35, y1: cy + 20, x2: cx + 50, y2: cy + 60 }); // right leg
  elements.push({ type: 'line', x1: cx + 35, y1: cy + 20, x2: cx + 20, y2: cy + 60 }); // left leg
  elements.push({ type: 'line', x1: cx + 35, y1: cy - 20, x2: cx + 10, y2: cy - 30 }); // arm reaching to center

  // Hands meeting at center - the moment of acceptance (2 dots)
  elements.push({ type: 'dot', x: cx - 8, y: cy - 32, radius: 5 });
  elements.push({ type: 'dot', x: cx + 8, y: cy - 32, radius: 5 });

  // Heart at center - where self meets self (shared heart)
  elements.push({ type: 'circle', x: cx, y: cy - 15, radius: 18 });

  // Light radiating from the union - symmetric (8 small dots)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    elements.push({ type: 'dot', x: cx + Math.cos(angle) * 35, y: cy - 15 + Math.sin(angle) * 35, radius: 2.5 });
  }

  // Ground line - symmetric
  elements.push({ type: 'line', x1: cx - 80, y1: cy + 65, x2: cx + 80, y2: cy + 65 });

  // Additional light particles
  elements.push({ type: 'dot', x: cx - 55, y: cy - 40, radius: 2 });
  elements.push({ type: 'dot', x: cx + 55, y: cy - 40, radius: 2 });
  elements.push({ type: 'dot', x: cx, y: cy - 55, radius: 2.5 });

  // The accepted heart - at the center of union
  elements.push({ type: 'dot', x: cx, y: cy - 15, radius: 6, isCenter: true });
  return elements;
};

// I Am Open To Receive - 35 elements (5 words × 7 cycles)
// LOTUS OPENING TO SUNBEAM - receptivity as spiritual practice
// The flower that opens only in the light, trusting it will come
const generateOpenToReceive = (cx, cy) => {
  const elements = [];

  // Sunbeam descending from above (5 lines radiating down)
  elements.push({ type: 'line', x1: cx, y1: cy - 120, x2: cx, y2: cy - 60 });
  elements.push({ type: 'line', x1: cx - 25, y1: cy - 115, x2: cx - 10, y2: cy - 55 });
  elements.push({ type: 'line', x1: cx + 25, y1: cy - 115, x2: cx + 10, y2: cy - 55 });
  elements.push({ type: 'line', x1: cx - 45, y1: cy - 105, x2: cx - 20, y2: cy - 50 });
  elements.push({ type: 'line', x1: cx + 45, y1: cy - 105, x2: cx + 20, y2: cy - 50 });

  // Light particles descending (5 dots)
  elements.push({ type: 'dot', x: cx, y: cy - 90, radius: 4 });
  elements.push({ type: 'dot', x: cx - 15, y: cy - 80, radius: 3 });
  elements.push({ type: 'dot', x: cx + 15, y: cy - 75, radius: 3 });
  elements.push({ type: 'dot', x: cx - 8, y: cy - 65, radius: 2.5 });
  elements.push({ type: 'dot', x: cx + 10, y: cy - 62, radius: 2.5 });

  // Lotus petals opening upward (10 petals in layers)
  // Inner petals - still partially closed
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2 + 0.4;
    elements.push({ type: 'petal', cx, cy: cy + 20, angle, innerRadius: 8, outerRadius: 30, width: 0.4 });
  }
  // Outer petals - fully open
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    elements.push({ type: 'petal', cx, cy: cy + 20, angle, innerRadius: 25, outerRadius: 60, width: 0.35 });
  }

  // Water surface the lotus floats on (3 lines)
  elements.push({ type: 'line', x1: cx - 100, y1: cy + 70, x2: cx - 30, y2: cy + 70 });
  elements.push({ type: 'line', x1: cx + 30, y1: cy + 70, x2: cx + 100, y2: cy + 70 });
  elements.push({ type: 'line', x1: cx - 70, y1: cy + 85, x2: cx + 70, y2: cy + 85 });

  // Lotus pad leaves (2 circles)
  elements.push({ type: 'circle', x: cx - 65, y: cy + 60, radius: 25 });
  elements.push({ type: 'circle', x: cx + 70, y: cy + 55, radius: 22 });

  // Water ripples (3 lines)
  elements.push({ type: 'line', x1: cx - 40, y1: cy + 75, x2: cx + 40, y2: cy + 75 });
  elements.push({ type: 'line', x1: cx - 25, y1: cy + 80, x2: cx + 25, y2: cy + 80 });
  elements.push({ type: 'line', x1: cx - 55, y1: cy + 90, x2: cx + 55, y2: cy + 90 });

  // The receptive heart of the lotus
  elements.push({ type: 'dot', x: cx, y: cy + 20, radius: 7, isCenter: true });
  return elements;
};

// I Release What No Longer Serves - 42 elements (6 words × 7 cycles)
// BUTTERFLY IN FULL GLORY - perfect bilateral symmetry of transformation
// Wings spread wide in perfect mirror, the beauty of becoming
const generateRelease = (cx, cy) => {
  const elements = [];

  // THE BUTTERFLY - centered, perfectly symmetric
  // Body (3 circles for head, thorax, abdomen - vertical line)
  elements.push({ type: 'circle', x: cx, y: cy - 35, radius: 7 }); // head
  elements.push({ type: 'circle', x: cx, y: cy - 15, radius: 10 }); // thorax
  elements.push({ type: 'circle', x: cx, y: cy + 10, radius: 9 }); // abdomen

  // Antennae - symmetric curves
  elements.push({ type: 'line', x1: cx - 5, y1: cy - 40, x2: cx - 20, y2: cy - 65 });
  elements.push({ type: 'line', x1: cx + 5, y1: cy - 40, x2: cx + 20, y2: cy - 65 });
  // Antenna tips
  elements.push({ type: 'dot', x: cx - 20, y: cy - 65, radius: 3 });
  elements.push({ type: 'dot', x: cx + 20, y: cy - 65, radius: 3 });

  // Upper wings - large, majestic (symmetric petals)
  elements.push({ type: 'petal', cx, cy: cy - 20, angle: Math.PI * 0.72, innerRadius: 12, outerRadius: 65, width: 0.5 });
  elements.push({ type: 'petal', cx, cy: cy - 20, angle: Math.PI * 0.28, innerRadius: 12, outerRadius: 65, width: 0.5 });

  // Lower wings - smaller, symmetric
  elements.push({ type: 'petal', cx, cy: cy, angle: Math.PI * 0.82, innerRadius: 10, outerRadius: 45, width: 0.45 });
  elements.push({ type: 'petal', cx, cy: cy, angle: Math.PI * 0.18, innerRadius: 10, outerRadius: 45, width: 0.45 });

  // Wing patterns - symmetric eye spots (8 dots)
  elements.push({ type: 'dot', x: cx - 40, y: cy - 30, radius: 6 }); // left upper outer
  elements.push({ type: 'dot', x: cx + 40, y: cy - 30, radius: 6 }); // right upper outer
  elements.push({ type: 'dot', x: cx - 25, y: cy - 15, radius: 4 }); // left upper inner
  elements.push({ type: 'dot', x: cx + 25, y: cy - 15, radius: 4 }); // right upper inner
  elements.push({ type: 'dot', x: cx - 30, y: cy + 15, radius: 4 }); // left lower
  elements.push({ type: 'dot', x: cx + 30, y: cy + 15, radius: 4 }); // right lower
  elements.push({ type: 'dot', x: cx - 50, y: cy - 45, radius: 3 }); // left wing tip
  elements.push({ type: 'dot', x: cx + 50, y: cy - 45, radius: 3 }); // right wing tip

  // Wing edge details - symmetric dots along wings
  elements.push({ type: 'dot', x: cx - 55, y: cy - 20, radius: 2.5 });
  elements.push({ type: 'dot', x: cx + 55, y: cy - 20, radius: 2.5 });
  elements.push({ type: 'dot', x: cx - 38, y: cy + 30, radius: 2 });
  elements.push({ type: 'dot', x: cx + 38, y: cy + 30, radius: 2 });

  // Chrysalis shells below - symmetric on both sides (old self released)
  elements.push({ type: 'line', x1: cx - 60, y1: cy + 60, x2: cx - 55, y2: cy + 85 });
  elements.push({ type: 'line', x1: cx - 50, y1: cy + 60, x2: cx - 55, y2: cy + 85 });
  elements.push({ type: 'line', x1: cx + 60, y1: cy + 60, x2: cx + 55, y2: cy + 85 });
  elements.push({ type: 'line', x1: cx + 50, y1: cy + 60, x2: cx + 55, y2: cy + 85 });

  // Light particles above - symmetric (4)
  elements.push({ type: 'dot', x: cx - 70, y: cy - 70, radius: 2 });
  elements.push({ type: 'dot', x: cx + 70, y: cy - 70, radius: 2 });
  elements.push({ type: 'dot', x: cx - 40, y: cy - 85, radius: 2.5 });
  elements.push({ type: 'dot', x: cx + 40, y: cy - 85, radius: 2.5 });

  // Cocoon suggestion below (2 lines)
  elements.push({ type: 'line', x1: cx - 55, y1: cy + 85, x2: cx - 40, y2: cy + 95 });
  elements.push({ type: 'line', x1: cx + 55, y1: cy + 85, x2: cx + 40, y2: cy + 95 });

  // The transformed heart - at the center of the butterfly
  elements.push({ type: 'dot', x: cx, y: cy - 15, radius: 5, isCenter: true });
  return elements;
};

// We Are All One - 28 elements (4 words × 7 cycles)
// FISH SCHOOL - swimming in unity, moving as one
const generateWeAreOne = (cx, cy) => {
  const elements = [];

  // 8 fish arranged in a circle, all swimming the same direction (clockwise)
  // Each fish = circle (body) + petal (tail), facing tangent to the circle
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const radius = 65;
    const fishX = cx + Math.cos(angle) * radius;
    const fishY = cy + Math.sin(angle) * radius;
    const fishAngle = angle + Math.PI / 2; // tangent to circle (swimming direction)

    // Fish body
    elements.push({ type: 'circle', x: fishX, y: fishY, radius: 9 });
    // Fish tail (pointing backward relative to swimming direction)
    const tailX = fishX - Math.cos(fishAngle) * 12;
    const tailY = fishY - Math.sin(fishAngle) * 12;
    elements.push({ type: 'petal', cx: tailX, cy: tailY, angle: fishAngle + Math.PI, innerRadius: 0, outerRadius: 10, width: 0.5 });
  }

  // Central circle - the unity they form
  elements.push({ type: 'circle', x: cx, y: cy, radius: 30 });

  // Inner swirl suggesting circular movement (4 curved lines as dots)
  elements.push({ type: 'dot', x: cx - 15, y: cy - 10, radius: 3 });
  elements.push({ type: 'dot', x: cx + 10, y: cy - 15, radius: 3 });
  elements.push({ type: 'dot', x: cx + 15, y: cy + 10, radius: 3 });
  elements.push({ type: 'dot', x: cx - 10, y: cy + 15, radius: 3 });

  // Bubbles in symmetric pattern (7 dots for 28 total = 4 words × 7 cycles)
  elements.push({ type: 'dot', x: cx, y: cy - 95, radius: 3 });
  elements.push({ type: 'dot', x: cx + 95, y: cy, radius: 2.5 });
  elements.push({ type: 'dot', x: cx, y: cy + 95, radius: 2.5 });
  elements.push({ type: 'dot', x: cx - 95, y: cy, radius: 3 });
  elements.push({ type: 'dot', x: cx + 70, y: cy - 70, radius: 2 });
  elements.push({ type: 'dot', x: cx - 70, y: cy - 70, radius: 2 });
  elements.push({ type: 'dot', x: cx, y: cy + 105, radius: 2.5 });

  // The unified center - the school as ONE
  elements.push({ type: 'dot', x: cx, y: cy, radius: 6, isCenter: true });
  return elements;
};

// Mantra-Visual Pairs
const mantraVisualPairs = [
  { text: 'I am grateful for this moment', words: ['I', 'am', 'grateful', 'for', 'this', 'moment'], generate: generateFlowerOfLife },
  { text: 'Good fortune flows towards loved ones and I', words: ['Good', 'fortune', 'flows', 'towards', 'loved', 'ones', 'and', 'I'], generate: generateSpiralGalaxy },
  { text: 'I am worthy of love', words: ['I', 'am', 'worthy', 'of', 'love'], generate: generateLotusBlossom },
  { text: 'Peace begins within', words: ['Peace', 'begins', 'within'], generate: generateMandalaStar },
  { text: 'I am calm and centered', words: ['I', 'am', 'calm', 'and', 'centered'], generate: generateSacredSpiral },
  { text: 'I am loving awareness', words: ['I', 'am', 'loving', 'awareness'], generate: generateInfinityLoop },
  { text: 'I trust the process', words: ['I', 'trust', 'the', 'process'], generate: generateFallingLeaves },
  { text: 'I forgive and release', words: ['I', 'forgive', 'and', 'release'], generate: generateForgivenessRelease },
  { text: 'I accept myself completely', words: ['I', 'accept', 'myself', 'completely'], generate: generateSelfAcceptance },
  { text: 'I am open to receive', words: ['I', 'am', 'open', 'to', 'receive'], generate: generateOpenToReceive },
  { text: 'I release what no longer serves', words: ['I', 'release', 'what', 'no', 'longer', 'serves'], generate: generateRelease },
  { text: 'We are all one', words: ['We', 'are', 'all', 'one'], generate: generateWeAreOne },
];

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

function BreathworkView({ breathSession, breathTechniques, startBreathSession, stopBreathSession, primaryHue = 162, primaryColor = 'hsl(162, 52%, 68%)', isActive = false }) {
  const [showUI, setShowUI] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const swipeStartRef = useRef(null);
  const wheelAccumRef = useRef(0);
  const wheelTimeoutRef = useRef(null);
  const labelTimeoutRef = useRef(null);
  const fadeInTimeoutRef = useRef(null);
  const wasActiveRef = useRef(false);

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
      {/* Visual background - uses GazeMode component with fixed geometry visual */}
      <GazeMode
        primaryHue={primaryHue}
        backgroundMode={true}
        currentVisual="lungs"
        breathSession={breathSession}
      />

      {/* Phase text - positioned in the open space between lung lobes */}
      {breathSession.isActive && (
        <div style={{
          position: 'absolute',
          bottom: '32%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <div style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '1.3rem',
            fontFamily: '"Jost", sans-serif',
            fontWeight: 300,
            letterSpacing: '0.25em',
            textTransform: 'lowercase',
            textAlign: 'center',
            maxWidth: '80vw',
          }}>
            {breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label || 'breathe'}
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
              background: 'rgba(0,0,0,0.5)',
              zIndex: 10,
              animation: 'fadeInBreath 0.5s ease-out',
            }}
          />
          {/* Bottom drawer */}
          <div
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '50vh',
              background: 'rgba(10,10,15,0.95)',
              borderRadius: '20px 20px 0 0',
              backdropFilter: 'blur(20px)',
              border: `1px solid hsla(${primaryHue}, 52%, 68%, 0.12)`,
              borderBottom: 'none',
              zIndex: 11,
              animation: 'slideUpBreath 0.5s ease-out',
              display: 'flex',
              flexDirection: 'column',
              touchAction: 'auto',
            }}>
            {/* Drawer handle */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '0.75rem',
              cursor: 'pointer',
            }} onClick={(e) => { e.stopPropagation(); setShowUI(false); }}>
              <div style={{
                width: '36px',
                height: '4px',
                background: `hsla(${primaryHue}, 52%, 68%, 0.3)`,
                borderRadius: '2px',
              }} />
            </div>

            {/* Title */}
            <div style={{
              textAlign: 'center',
              padding: '0 1rem 0.75rem',
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
// DRONE MODE COMPONENT
// ============================================================================

// Generate scale frequencies from key and scale type
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

// ============================================================================
// HANDPAN VIEW - 3D Interactive Handpan Visualization
// ============================================================================

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

// ============================================================================
// MANTRA MODE - Tap-driven mantra practice with sacred geometry
// ============================================================================

function MantraGeometryCanvas({ elements, revealedCount, isComplete, primaryHue }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const elementAnimations = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Convert HSL hue to RGB for rgba() usage
    const hslToRgb = (h, s, l) => {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      };
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    };
    const [r, g, b] = hslToRgb(primaryHue, 52, 68);
    const themeColor = (opacity) => `rgba(${r}, ${g}, ${b}, ${opacity})`;

    const animate = () => {
      const now = Date.now();
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, width, height);

      const glowPulse = Math.sin(timeRef.current * 1.2) * 0.08 + 0.92;

      if (isComplete) {
        const cx = width / 2;
        const cy = height / 2;
        const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
        bgGlow.addColorStop(0, themeColor(0.08));
        bgGlow.addColorStop(0.5, themeColor(0.02));
        bgGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGlow;
        ctx.fillRect(0, 0, width, height);
      }

      elements.forEach((el, index) => {
        // Show element if revealed, or show isCenter when complete
        if (index >= revealedCount && !(el.isCenter && isComplete)) return;

        if (!elementAnimations.current[index]) {
          elementAnimations.current[index] = { startTime: now, progress: 0 };
        }

        const anim = elementAnimations.current[index];
        const elapsed = (now - anim.startTime) / 1000;
        const duration = 1.2;
        anim.progress = Math.min(1, elapsed / duration);

        const easedProgress = easeOutQuart(anim.progress);
        const opacity = 0.7 * easedProgress * glowPulse;
        const color = themeColor(opacity);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (el.type === 'dot') {
          const rad = el.radius * easedProgress;
          ctx.beginPath();
          ctx.arc(el.x, el.y, rad + 3, 0, Math.PI * 2);
          ctx.fillStyle = themeColor(0.1 * easedProgress);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(el.x, el.y, rad, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        } else if (el.type === 'circle') {
          const arcEnd = Math.PI * 2 * easedProgress;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.radius, -Math.PI / 2, -Math.PI / 2 + arcEnd);
          ctx.stroke();
        } else if (el.type === 'line') {
          const x = el.x1 + (el.x2 - el.x1) * easedProgress;
          const y = el.y1 + (el.y2 - el.y1) * easedProgress;
          ctx.beginPath();
          ctx.moveTo(el.x1, el.y1);
          ctx.lineTo(x, y);
          ctx.stroke();
        } else if (el.type === 'petal') {
          const { cx, cy, angle, innerRadius, outerRadius, width: petalWidth } = el;
          const midRadius = (innerRadius + outerRadius) / 2;
          const spread = petalWidth * easedProgress;
          ctx.beginPath();
          const innerX = cx + Math.cos(angle) * innerRadius;
          const innerY = cy + Math.sin(angle) * innerRadius;
          ctx.moveTo(innerX, innerY);
          const leftMidX = cx + Math.cos(angle - spread) * midRadius;
          const leftMidY = cy + Math.sin(angle - spread) * midRadius;
          const outerX = cx + Math.cos(angle) * outerRadius * easedProgress;
          const outerY = cy + Math.sin(angle) * outerRadius * easedProgress;
          ctx.quadraticCurveTo(leftMidX, leftMidY, outerX, outerY);
          const rightMidX = cx + Math.cos(angle + spread) * midRadius;
          const rightMidY = cy + Math.sin(angle + spread) * midRadius;
          ctx.quadraticCurveTo(rightMidX, rightMidY, innerX, innerY);
          ctx.stroke();
        } else if (el.type === 'wave') {
          const { cx, cy, radius, amplitude, frequency, phase } = el;
          const segments = 72;
          ctx.beginPath();
          for (let i = 0; i <= segments * easedProgress; i++) {
            const a = (i / segments) * Math.PI * 2;
            const wave = Math.sin(a * frequency + phase + timeRef.current) * amplitude;
            const rad = radius + wave;
            const x = cx + Math.cos(a) * rad;
            const y = cy + Math.sin(a) * rad;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else if (el.type === 'droplet') {
          const { x, y, size } = el;
          const s = size * easedProgress;
          ctx.beginPath();
          ctx.moveTo(x, y - s * 1.5);
          ctx.bezierCurveTo(x - s, y - s * 0.5, x - s, y + s * 0.5, x, y + s);
          ctx.bezierCurveTo(x + s, y + s * 0.5, x + s, y - s * 0.5, x, y - s * 1.5);
          ctx.stroke();
        } else if (el.type === 'branch') {
          const { x1, y1, angle, length, curve, thickness } = el;
          const len = length * easedProgress;
          const x2 = x1 + Math.cos(angle) * len;
          const y2 = y1 + Math.sin(angle) * len;
          const cpX = x1 + Math.cos(angle) * len * 0.5 + Math.cos(angle + Math.PI / 2) * curve * len;
          const cpY = y1 + Math.sin(angle) * len * 0.5 + Math.sin(angle + Math.PI / 2) * curve * len;
          ctx.lineWidth = thickness;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cpX, cpY, x2, y2);
          ctx.stroke();
          ctx.lineWidth = 1.5;
        } else if (el.type === 'eyeLid') {
          const { cx, cy, radiusX, radiusY, isTop } = el;
          const segments = 36;
          ctx.beginPath();
          for (let i = 0; i <= segments * easedProgress; i++) {
            const t = i / segments;
            const a = (isTop ? Math.PI : 0) + t * Math.PI;
            const x = cx + Math.cos(a) * radiusX;
            const curveIntensity = Math.sin(t * Math.PI);
            const y = cy + (isTop ? -1 : 1) * curveIntensity * radiusY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else if (el.type === 'lash') {
          const { x, y, angle, length } = el;
          const len = length * easedProgress;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
          ctx.stroke();
        }
      });

      if (isComplete) {
        const cx = width / 2;
        const cy = height / 2;
        const pulseRadius = 155 + Math.sin(timeRef.current * 1.5) * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = themeColor(0.25 * glowPulse);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [elements, revealedCount, isComplete, primaryHue]);

  useEffect(() => {
    elementAnimations.current = {};
  }, [elements]);

  return (
    <canvas
      ref={canvasRef}
      width={350}
      height={350}
      style={{ display: 'block' }}
    />
  );
}

function MantraMode({ primaryHue = 162, primaryColor = 'hsl(162, 52%, 68%)' }) {
  // Load saved mantra index from localStorage
  const getSavedMantraIndex = () => {
    try {
      const saved = localStorage.getItem('mantraIndex');
      if (saved !== null) {
        const idx = parseInt(saved, 10);
        if (!isNaN(idx) && idx >= 0 && idx < mantraVisualPairs.length) {
          return idx;
        }
      }
    } catch (e) {}
    return 0;
  };

  const [elements, setElements] = useState([]);
  const [tapCount, setTapCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const [pairIndex, setPairIndex] = useState(getSavedMantraIndex);
  const [displayWord, setDisplayWord] = useState('');
  const [wordOpacity, setWordOpacity] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const labelTimeoutRef = useRef(null);
  const fadeInTimeoutRef = useRef(null);

  const currentPair = mantraVisualPairs[pairIndex];
  // Don't count isCenter element - it reveals on completion, not on a word
  const totalElements = elements.filter(e => !e.isCenter).length;

  // Save mantra index whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mantraIndex', pairIndex.toString());
    } catch (e) {}
  }, [pairIndex]);

  // Auto-start session and show mode label on mount (fade in then out)
  useEffect(() => {
    // Initialize the mantra session immediately
    const pair = mantraVisualPairs[pairIndex];
    const newElements = pair.generate(175, 175);
    setElements(newElements);
    setStarted(true);

    // Fade in label after brief delay
    fadeInTimeoutRef.current = setTimeout(() => setShowLabel(true), 50);
    // Fade out after 2 seconds
    labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 2000);
    return () => {
      if (fadeInTimeoutRef.current) clearTimeout(fadeInTimeoutRef.current);
      if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    };
  }, []);

  // Handle word fade in/out
  useEffect(() => {
    if (tapCount > 0) {
      const newWord = currentPair.words[(tapCount - 1) % currentPair.words.length];
      setWordOpacity(0);
      const fadeInTimer = setTimeout(() => {
        setDisplayWord(newWord);
        setWordOpacity(1);
      }, 150);
      return () => clearTimeout(fadeInTimer);
    }
  }, [tapCount, currentPair]);

  const initializeSession = (advance = false) => {
    const newPairIndex = advance ? (pairIndex + 1) % mantraVisualPairs.length : pairIndex;
    const pair = mantraVisualPairs[newPairIndex];
    const newElements = pair.generate(175, 175);
    setElements(newElements);
    setPairIndex(newPairIndex);
    setTapCount(0);
    setIsComplete(false);
    setStarted(true);
  };

  const handleTap = () => {
    haptic.tap();
    if (isComplete) {
      initializeSession(true);
      return;
    }
    const nextTapCount = tapCount + 1;
    setTapCount(nextTapCount);
    // Complete when: all elements revealed AND at end of a mantra cycle
    // This ensures the visual finishes on the last word, not mid-mantra
    const wordsLength = currentPair.words.length;
    const atEndOfMantraCycle = nextTapCount % wordsLength === 0;
    if (nextTapCount >= totalElements && atEndOfMantraCycle) {
      setIsComplete(true);
      haptic.success();
    }
  };

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        cursor: 'pointer',
        userSelect: 'none',
        background: '#000',
        fontFamily: "'Jost', system-ui, sans-serif",
        zIndex: 2,
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <MantraGeometryCanvas
          elements={elements}
          revealedCount={tapCount}
          isComplete={isComplete}
          primaryHue={primaryHue}
        />
      </div>

      <div style={{ textAlign: 'center', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {tapCount > 0 && (
          <span
            style={{
              fontSize: '1.875rem',
              letterSpacing: '0.1em',
              color: `hsla(${primaryHue}, 52%, 68%, 0.9)`,
              fontWeight: 300,
              opacity: wordOpacity,
              transition: 'opacity 0.4s ease-in-out',
            }}
          >
            {displayWord}
          </span>
        )}
      </div>
    </div>
  );
}

const DroneMode = React.forwardRef(function DroneMode({ primaryHue = 162, primaryColor = 'hsl(162, 52%, 68%)', backgroundMode = false, onSamplesReady = null }, ref) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [samplesReady, setSamplesReady] = useState(false);
  const samplesReadyRef = useRef(false);
  const samplesLoadedCountRef = useRef(0);
  const totalSamplesToLoad = 20; // Number of handpan samples
  const [currentInstrument, setCurrentInstrument] = useState(0); // handpan
  const [currentTexture, setCurrentTexture] = useState(2); // forest
  const [currentKey, setCurrentKey] = useState(3); // D#
  const [currentScaleType, setCurrentScaleType] = useState(9); // pentatonic major
  const [showLabel, setShowLabel] = useState(false);
  const [showScaleSelector, setShowScaleSelector] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathValue, setBreathValue] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [droneEnabled, setDroneEnabled] = useState(true);
  const droneEnabledRef = useRef(true);

  // Keep ref in sync with state for animation loop access
  useEffect(() => {
    droneEnabledRef.current = droneEnabled;
  }, [droneEnabled]);

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
  const lastTapTimeRef = useRef(0);
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
    { name: 'harp', type: 'sampledHarp' },
    { name: 'cello', type: 'sampledCello' },
    { name: 'flute', type: 'organicFlute' },
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

      // Modulate drone (respects drone toggle)
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

    const targetGain = droneEnabled ? 1 : 0;
    droneOscillatorsRef.current.forEach(node => {
      node.gain.gain.setTargetAtTime(node.baseGain * targetGain, ctxRef.current.currentTime, 0.5);
    });
  }, [droneEnabled, isInitialized]);

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
    if (backgroundMode || showScaleSelector || !ctxRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const swipeThreshold = 50;
    const isSwipe = Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold;

    if (isSwipe && deltaTime < 500) {
      // Regular swipe - change instrument or texture
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe - change instrument
        const dir = deltaX > 0 ? -1 : 1;
        setCurrentInstrument(prev => (prev + dir + instruments.length) % instruments.length);
        displayLabel();
      } else {
        // Vertical swipe - open scale selector
        setShowScaleSelector(true);
      }
    } else {
      // Delegate to the handpan 3D view
      const clientX = touchStartRef.current.x;
      const clientY = touchStartRef.current.y;
      handpanViewRef.current?.handleTap(clientX, clientY);
    }
  }, [backgroundMode, showScaleSelector, playInstrument, breathValue, primaryHue, currentTexture, updateTexture, displayLabel, showPlayedNote, scale]);

  // Handle click (for desktop)
  const handleClick = useCallback((e) => {
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

      // Horizontal swipe when menu is closed = change instrument
      if (!showScaleSelector && Math.abs(wheelAccumXRef.current) > threshold && Math.abs(wheelAccumXRef.current) > Math.abs(wheelAccumYRef.current)) {
        e.preventDefault();
        const dir = wheelAccumXRef.current > 0 ? 1 : -1;
        setCurrentInstrument(prev => (prev + dir + instruments.length) % instruments.length);
        displayLabel();
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
        // Normal scroll: change instrument (horizontal) or texture (vertical)
        if (Math.abs(wheelAccumXRef.current) > Math.abs(wheelAccumYRef.current)) {
          if (Math.abs(wheelAccumXRef.current) > threshold) {
            e.preventDefault();
            const dir = wheelAccumXRef.current > 0 ? 1 : -1;
            setCurrentInstrument(prev => (prev + dir + instruments.length) % instruments.length);
            displayLabel();
            wheelAccumXRef.current = 0;
            wheelAccumYRef.current = 0;
          }
        } else {
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

      {/* Center label - positioned above the handpan */}
      <div
        style={{
          position: 'absolute',
          top: Capacitor.isNativePlatform() ? '22%' : '16%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          opacity: showLabel ? 1 : 0,
          transition: 'opacity 1s ease',
          zIndex: 10,
        }}
      >
        <div style={{
          fontSize: '2rem',
          letterSpacing: '0.3em',
          textTransform: 'lowercase',
          color: '#fff',
          marginBottom: '0.5rem',
          fontWeight: 300,
        }}>
          {instruments[currentInstrument].name}
        </div>
        <div style={{
          fontSize: '0.9rem',
          letterSpacing: '0.3em',
          textTransform: 'lowercase',
          color: '#fff',
        }}>
          {textures[currentTexture].name}
        </div>
        <div style={{
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'lowercase',
          color: '#fff',
          marginTop: '0.75rem',
        }}>
          {KEYS[currentKey].toLowerCase()} {SCALE_TYPES[currentScaleType].name}
        </div>
      </div>

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
              animation: 'fadeInScale 0.3s ease',
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
              animation: 'slideUpScale 0.3s ease',
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function Still() {
  // Intro state - simple touch to begin
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

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
  const [gazeVisual, setGazeVisual] = useState('lavaTouch');

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
  const [showTechniqueMenu, setShowTechniqueMenu] = useState(false);

  // ============================================================================
  // BREATHING - The heartbeat of the app (ambient background)
  // Inhale: 5s (0→1), Exhale: 6s (1→0), Total cycle: 11s
  // ============================================================================

  const [breathPhase, setBreathPhase] = useState(0); // 0-1, where 1 is full inhale
  const [isInhaling, setIsInhaling] = useState(true);
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

      // Smooth easing
      const eased = inhaling
        ? 1 - Math.pow(1 - progress, 3)  // ease-out for inhale
        : Math.pow(1 - progress, 3);      // ease-in for exhale (reverse)

      const phase = inhaling ? eased : 1 - eased;
      setBreathPhase(phase);
      setIsInhaling(inhaling);

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

    let lastTime = Date.now();
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
  const nextQuote = filteredQuotes[(currentIndex + 1) % Math.max(filteredQuotes.length, 1)];

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
                { key: 'breathwork', icon: '◎', label: 'Breathe' },
                { key: 'gaze', icon: '◯', label: 'Gaze' },
                { key: 'zenboard', icon: '∞', label: 'Impermanence' },
                { key: 'mantra', icon: '◇', label: 'Mantra' },
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

        {/* Mantra View - Tap-driven mantra practice */}
        {view === 'mantra' && (
          <MantraMode
            primaryHue={primaryHue}
            primaryColor={primaryColor}
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
          />
        </div>
        {false && view === 'breathwork-old' && (
          <main
            onClick={() => !breathSession.isActive && startBreathSession(breathSession.technique)}
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
            {/* Technique selector - horizontal scroll */}
            <div
              onTouchMove={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '85vw',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '0.5rem',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x',
                overscrollBehavior: 'contain',
              }}>
              <div style={{ display: 'flex', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                {Object.entries(breathTechniques).map(([key, tech]) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (breathSession.isActive) stopBreathSession();
                      startBreathSession(key);
                    }}
                    style={{
                      background: breathSession.technique === key ? `hsla(${primaryHue}, 52%, 68%, 0.15)` : 'transparent',
                      border: breathSession.technique === key ? `1px solid hsla(${primaryHue}, 52%, 68%, 0.3)` : '1px solid rgba(255,255,255,0.08)',
                      color: breathSession.technique === key ? `hsl(${primaryHue}, 52%, 68%)` : 'rgba(255,255,255,0.4)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.65rem',
                      fontFamily: '"Jost", sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    {tech.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pulsing circle */}
            <div style={{
              width: `${140 + (breathSession.isActive ? breathSession.phaseProgress : 0.5) * 100}px`,
              height: `${140 + (breathSession.isActive ? breathSession.phaseProgress : 0.5) * 100}px`,
              borderRadius: '50%',
              background: breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty'
                ? 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 70%)'
                : `radial-gradient(circle, hsla(${primaryHue}, 52%, 68%, 0.15) 0%, hsla(${primaryHue}, 52%, 68%, 0.05) 50%, transparent 70%)`,
              border: `1.5px solid ${breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty' ? 'rgba(255,255,255,0.35)' : `hsla(${primaryHue}, 52%, 68%, 0.3)`}`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out, background 0.3s ease, border-color 0.3s ease',
            }} />

            {/* Phase label */}
            <div style={{
              marginTop: '2.5rem',
              color: breathSession.phase === 'holdFull' || breathSession.phase === 'holdEmpty' ? 'rgba(255,255,255,0.8)' : `hsla(${primaryHue}, 52%, 68%, 0.7)`,
              fontSize: '0.9rem',
              fontFamily: '"Jost", sans-serif',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
            }}>
              {breathSession.isActive
                ? breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.label || ''
                : 'tap to begin'}
            </div>

            {/* Countdown */}
            {breathSession.isActive && (
              <div style={{
                marginTop: '1rem',
                color: 'rgba(255,255,255,0.25)',
                fontSize: '1.5rem',
                fontFamily: '"Jost", sans-serif',
                fontWeight: 300,
              }}>
                {Math.ceil(breathTechniques[breathSession.technique]?.phases[breathSession.phaseIndex]?.duration * (1 - breathSession.phaseProgress)) || ''}
              </div>
            )}
          </main>
        )}

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
              zIndex: 300,
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
                <div>swipe horizontal — change sound or visual</div>
                <div>swipe up — options</div>
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
