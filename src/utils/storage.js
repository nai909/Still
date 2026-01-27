/**
 * Storage utilities for the Still meditation app
 * Handles localStorage persistence for quotes and settings
 */

import { STORAGE_KEYS, defaultSettings } from '../data/constants';

/**
 * Loads saved quotes from localStorage
 * @returns {Array} Array of saved quote objects, or empty array if none found
 */
export const loadSavedQuotes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_QUOTES);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * Saves quotes array to localStorage
 * @param {Array} quotes - Array of quote objects to save
 */
export const saveSavedQuotes = (quotes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_QUOTES, JSON.stringify(quotes));
  } catch {}
};

/**
 * Loads settings from localStorage, with OS preference detection for reduced motion
 * @returns {Object} Settings object, falling back to defaultSettings if not found
 */
export const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = saved ? JSON.parse(saved) : defaultSettings;
    // Check for OS preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settings.reducedMotion = true;
    }
    return settings;
  } catch {
    return defaultSettings;
  }
};

/**
 * Saves settings object to localStorage
 * @param {Object} settings - Settings object to persist
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
};
