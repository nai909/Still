/**
 * Custom hook for ambient breathing animation
 * The heartbeat of the Still meditation app
 *
 * Breathing cycle: Inhale 5s (0->1), Exhale 6s (1->0), Total 11s
 */

import { useState, useEffect, useRef } from 'react';

/** Duration of inhale phase in milliseconds */
const INHALE_DURATION = 5000;

/** Duration of exhale phase in milliseconds */
const EXHALE_DURATION = 6000;

/**
 * Hook that provides a continuous breathing animation cycle
 * @returns {Object} Breathing state
 * @returns {number} breathPhase - Value from 0-1 representing breath fullness (1 = full inhale)
 * @returns {boolean} isInhaling - Whether currently in inhale phase
 * @returns {number} breathCycleCount - Number of complete breath cycles since mount
 */
export const useBreathing = () => {
  const [breathPhase, setBreathPhase] = useState(0);
  const [isInhaling, setIsInhaling] = useState(true);
  const breathCycleCount = useRef(0);

  useEffect(() => {
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
  }, []);

  return {
    breathPhase,
    isInhaling,
    breathCycleCount: breathCycleCount.current
  };
};

export default useBreathing;
