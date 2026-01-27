/**
 * Helper utility functions for the Still meditation app
 */

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array (does not mutate original)
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Converts a number to Roman numeral representation
 * @param {number} num - Number to convert (1-20 supported)
 * @returns {string} Roman numeral string, or original number as string if out of range
 */
export const toRoman = (num) => {
  if (num <= 0 || num > 20) return num.toString();
  const numerals = [
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
  ];
  return numerals[num] || num.toString();
};

/**
 * Generates scale frequencies from a musical key and scale type
 * Used for drone/ambient sound generation
 * @param {string} keyName - The musical key (e.g., 'C', 'A', 'F#')
 * @param {Object} scaleType - Scale type object with intervals array
 * @param {number[]} scaleType.intervals - Array of semitone intervals from root
 * @param {number} [octaves=3] - Number of octaves to generate
 * @returns {number[]} Array of frequencies in Hz
 */
export const generateScale = (keyName, scaleType, octaves = 3) => {
  // Key frequencies (C3 to B3)
  const KEY_FREQUENCIES = {
    'C': 130.81, 'C#': 138.59, 'D': 146.83, 'D#': 155.56, 'E': 164.81, 'F': 174.61,
    'F#': 185.00, 'G': 196.00, 'G#': 207.65, 'A': 220.00, 'A#': 233.08, 'B': 246.94
  };

  const baseFreq = KEY_FREQUENCIES[keyName];
  const intervals = scaleType.intervals;
  const frequencies = [];

  for (let octave = 0; octave < octaves; octave++) {
    for (const interval of intervals) {
      const freq = baseFreq * Math.pow(2, octave + interval / 12);
      if (freq < 1200) frequencies.push(freq); // Cap at reasonable frequency
    }
  }
  return frequencies;
};
