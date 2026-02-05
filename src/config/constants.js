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
  { key: 'corpusStellae', name: 'Star Body' },
  { key: 'machinaTemporis', name: 'Clockwork' },
  { key: 'oceanusProfundus', name: 'Deep Ocean' },
  { key: 'aquaVitae', name: 'Water of Life' },
  { key: 'arborMundi', name: 'World Tree' },
  { key: 'crystallumInfinitum', name: 'Crystal' },
  { key: 'nervusCosmicus', name: 'Neural' },
  { key: 'portaDimensionum', name: 'Portal' },
  { key: 'templumSonorum', name: 'Sound Temple' },
  { key: 'caelumMechanicum', name: 'Orrery' },
  { key: 'labyrinthisSacrum', name: 'Labyrinth' },
];

export const gazeShapes = [
  { key: 'torus', name: 'Torus', create: () => new THREE.TorusGeometry(1, 0.4, 16, 100) },
  { key: 'torusKnot', name: 'Knot', create: () => new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16) },
];

// ============================================================================
// MUSIC CONSTANTS
// ============================================================================
export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const KEY_FREQUENCIES = {
  'C': 130.81, 'C#': 138.59, 'D': 146.83, 'D#': 155.56, 'E': 164.81, 'F': 174.61,
  'F#': 185.00, 'G': 196.00, 'G#': 207.65, 'A': 220.00, 'A#': 233.08, 'B': 246.94
};

export const SCALE_TYPES = [
  { name: 'major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
  { name: 'harmonic minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { name: 'melodic minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
  { name: 'pentatonic major', intervals: [0, 2, 4, 7, 9] },
  { name: 'pentatonic minor', intervals: [0, 3, 5, 7, 10] },
  { name: 'blues', intervals: [0, 3, 5, 6, 7, 10] },
  { name: 'whole tone', intervals: [0, 2, 4, 6, 8, 10] },
  { name: 'insen', intervals: [0, 1, 5, 7, 8] },
  { name: 'hijaz', intervals: [0, 1, 4, 5, 7, 8, 11] },
  { name: 'hungarian minor', intervals: [0, 2, 3, 6, 7, 8, 11] },
];
