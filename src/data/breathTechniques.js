// ============================================================================
// BREATHWORK TECHNIQUES
// ============================================================================

const breathTechniques = {
  box: {
    name: 'Box Breathing',
    description: 'Navy SEAL calm focus',
    recommendedCycles: 8, // ~2 min - Navy SEAL standard session
    phases: [
      { name: 'inhale', label: 'inhale', duration: 4 },
      { name: 'holdFull', label: 'hold', duration: 4 },
      { name: 'exhale', label: 'exhale', duration: 4 },
      { name: 'holdEmpty', label: 'hold', duration: 4 },
    ],
    color: { inhale: '#1a3a4a', holdFull: '#2a4a3a', exhale: '#2a3a4a', holdEmpty: '#1a2a3a' },
  },
  ocean: {
    name: 'Ocean Breath',
    description: 'Slow, wave-like rhythm',
    recommendedCycles: 8, // ~2.4 min - Ujjayi pranayama
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 6 },
      { name: 'holdFull', label: 'Pause', duration: 2 },
      { name: 'exhale', label: 'Exhale', duration: 8 },
      { name: 'holdEmpty', label: 'Rest', duration: 2 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#2a4a5a', exhale: '#1a2a4a', holdEmpty: '#1a2a3a' },
  },
  // PARASYMPATHETIC ACTIVATION TECHNIQUES

  physiologicalSigh: {
    name: 'Physiological Sigh',
    description: 'Fastest way to calm (Huberman)',
    recommendedCycles: 10, // Huberman: 5 min for lasting benefit
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 2 },
      { name: 'inhale', label: 'Sip more air', duration: 1 },
      { name: 'exhale', label: 'Long exhale', duration: 6 },
      { name: 'holdEmpty', label: 'Rest', duration: 1 },
    ],
    color: { inhale: '#1a3a5a', exhale: '#1a2a4a', holdEmpty: '#1a2a3a' },
  },

  twoToOne: {
    name: '2:1 Breathing',
    description: 'Exhale double the inhale',
    recommendedCycles: 10, // ~2 min
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'exhale', label: 'Slow exhale', duration: 8 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#1a2a3a' },
  },

  fourSixBreath: {
    name: '4-6 Anxiety Relief',
    description: 'Quick parasympathetic shift',
    recommendedCycles: 10, // ~1.6 min - quick relief
    phases: [
      { name: 'inhale', label: 'Inhale', duration: 4 },
      { name: 'exhale', label: 'Exhale', duration: 6 },
    ],
    color: { inhale: '#2a3a4a', exhale: '#1a2a4a' },
  },

  deepBelly: {
    name: 'Diaphragmatic',
    description: 'Deep belly breathing',
    recommendedCycles: 8, // ~1.7 min
    phases: [
      { name: 'inhale', label: 'Fill belly', duration: 5 },
      { name: 'holdFull', label: 'Pause', duration: 2 },
      { name: 'exhale', label: 'Release', duration: 6 },
    ],
    color: { inhale: '#1a4a3a', holdFull: '#2a4a4a', exhale: '#1a3a3a' },
  },


  vagalTone: {
    name: 'Vagal Toning',
    description: 'Activates vagus nerve',
    recommendedCycles: 6, // ~1.8 min - vagus activation
    phases: [
      { name: 'inhale', label: 'Deep inhale', duration: 4 },
      { name: 'holdFull', label: 'Brief hold', duration: 2 },
      { name: 'exhale', label: 'Humming exhale', duration: 10 },
      { name: 'holdEmpty', label: 'Natural pause', duration: 2 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#2a4a5a', exhale: '#1a2a5a', holdEmpty: '#1a2a3a' },
  },

  alternate: {
    name: 'Alternate Nostril',
    description: 'Nadi Shodhana - balances',
    recommendedCycles: 5, // ~2 min - traditional practice
    phases: [
      { name: 'inhale', label: 'Left in', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 4 },
      { name: 'exhale', label: 'Right out', duration: 4 },
      { name: 'inhale', label: 'Right in', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 4 },
      { name: 'exhale', label: 'Left out', duration: 4 },
    ],
    color: { inhale: '#1a3a5a', holdFull: '#2a4a4a', exhale: '#1a2a4a' },
  },


  cooling: {
    name: 'Sitali Cooling',
    description: 'Cools body and mind',
    recommendedCycles: 8, // ~1.6 min
    phases: [
      { name: 'inhale', label: 'Roll tongue, inhale through mouth', duration: 4 },
      { name: 'holdFull', label: 'Hold', duration: 2 },
      { name: 'exhale', label: 'Nose exhale', duration: 6 },
    ],
    color: { inhale: '#1a4a5a', holdFull: '#2a5a5a', exhale: '#1a3a4a' },
  },

  antiAnxiety: {
    name: 'Anti-Anxiety',
    description: 'Long exhale with pause',
    recommendedCycles: 8, // ~2 min
    phases: [
      { name: 'inhale', label: 'Gentle inhale', duration: 3 },
      { name: 'exhale', label: 'Extended exhale', duration: 9 },
      { name: 'holdEmpty', label: 'Natural rest', duration: 3 },
    ],
    color: { inhale: '#1a3a4a', exhale: '#1a2a3a', holdEmpty: '#0a1a2a' },
  },
};

export { breathTechniques };
