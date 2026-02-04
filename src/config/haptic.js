import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// ============================================================================
// HAPTIC FEEDBACK - Using Capacitor Haptics for native iOS feel
// ============================================================================
export const haptic = {
  // Gentle tap for UI interactions (buttons, selections)
  tap: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),

  // Soft pulse for breath phase transitions
  soft: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),

  // Medium pulse for mode changes
  medium: () => Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}),

  // Selection feedback for scrolling/cycling through options
  selection: () => Haptics.selectionChanged().catch(() => {}),

  // Success feedback for completed actions
  success: () => Haptics.notification({ type: NotificationType.Success }).catch(() => {}),

  // Breath phase haptics
  inhale: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
  exhale: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
  hold: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
};
