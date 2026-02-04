import * as THREE from 'three';

// ============================================================================
// COLOR PALETTE
// ============================================================================
export const PALETTE = {
  purple: '#7B68EE',
  steelBlue: '#4A90A4',
  sage: '#6B8E6B',
  orange: '#E07B53',
  sand: '#D4A574',
  gray: '#8B8B8B',
  teal: '#7FDBCA',
  // HSL hues for animations
  hues: {
    purple: 255,
    steelBlue: 191,
    sage: 120,
    orange: 17,
    sand: 31,
    teal: 162,
  }
};

// ============================================================================
// BREATH TIMING
// ============================================================================
// Breath cycle: 5s inhale, 6s exhale = ~5.5 breaths/min (parasympathetic optimal)
export const BREATH_CYCLE = 11; // seconds for full cycle
export const BREATH_SPEED = (2 * Math.PI) / BREATH_CYCLE;

// ============================================================================
// MOBILE OPTIMIZATION
// ============================================================================
export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
export const MOBILE_SPEED = isMobile ? 0.6 : 1;  // Slower animations on mobile
export const MOBILE_PARTICLES = isMobile ? 0.4 : 1;  // Fewer particles on mobile
export const MOBILE_PIXEL_RATIO = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);

// ============================================================================
// GAZE MODES
// ============================================================================
export const gazeModes = [
  { key: 'geometry', name: 'Torus' },
  { key: 'tree', name: 'Fractal Tree' },
  { key: 'fern', name: 'Fern' },
  { key: 'succulent', name: 'Succulent' },
  { key: 'dandelion', name: 'Dandelion' },
  { key: 'lungs', name: 'Lungs' },
  { key: 'ripples', name: 'Ripples' },
  { key: 'jellyfish2d', name: 'Deep Sea' },
  { key: 'mushrooms', name: 'Mushrooms' },
  { key: 'koiPond', name: 'Koi Pond' },
  { key: 'flowerOfLife', name: 'Flower of Life' },
  { key: 'lavaTouch', name: 'Lava Lamp' },
  { key: 'mountains', name: 'Mountains' },
  { key: 'maloka', name: 'Maloka' },
  { key: 'underwater', name: 'Abyss' },
  { key: 'lotus', name: 'Lotus' },
];

export const gazeShapes = [
  { key: 'torus', name: 'Torus', create: () => new THREE.TorusGeometry(1, 0.4, 16, 100) },
  { key: 'torusKnot', name: 'Knot', create: () => new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16) },
];
