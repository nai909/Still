/**
 * Custom hook for managing app settings with localStorage persistence
 */

import { useState, useCallback } from 'react';
import { loadSettings, saveSettings } from '../utils/storage';

/**
 * Hook that manages settings state with automatic persistence
 * @returns {Object} Settings state and updater
 * @returns {Object} settings - Current settings object
 * @returns {Function} updateSettings - Function to update settings (partial updates supported)
 */
export const useSettings = () => {
  const [settings, setSettings] = useState(() => loadSettings());

  /**
   * Updates settings with partial object merge and persists to localStorage
   * @param {Object} newSettings - Partial settings object to merge
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  return {
    settings,
    updateSettings
  };
};

export default useSettings;
