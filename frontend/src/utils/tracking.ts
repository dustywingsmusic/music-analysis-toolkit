/**
 * Google Analytics tracking utilities with Advanced Consent Mode
 *
 * In Advanced Consent Mode, Google Analytics is always loaded and configured.
 * When consent is denied, GA automatically sends cookieless pings instead of full events.
 * This enables behavioral modeling while respecting user privacy choices.
 */

import { AnalyticsManager } from './analyticsManager';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

/**
 * Track navigation clicks
 * @param label - Descriptive label for the navigation item clicked
 */
export function trackNavClick(label: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    // In Advanced Consent Mode, always send events to GA
    // GA will handle consent internally (full event vs cookieless ping)
    window.gtag('event', 'navigation_click', {
      event_category: 'Navigation',
      event_label: label
    });
  }
}

/**
 * Track MIDI input events
 * @param label - Descriptive label for the MIDI input event
 * @param value - Optional value associated with the MIDI event
 */
export function trackMidiInput(label: string, value?: number): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'midi_input', {
      event_category: 'MIDI',
      event_label: label,
      value: value
    });
  }
}

/**
 * Track form submissions with callback
 * @param label - Descriptive label for the form
 * @param callback - Optional callback to execute after tracking
 */
export function trackFormSubmit(label: string, callback?: () => void): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_submit', {
      event_category: 'Forms',
      event_label: label,
      event_callback: callback || (() => {})
    });
  } else if (callback) {
    // If gtag is not available, still execute the callback
    callback();
  }
}

/**
 * Track button clicks and interactions
 * @param label - Descriptive label for the button/interaction
 * @param category - Category for the interaction (defaults to 'Interaction')
 */
export function trackInteraction(label: string, category: string = 'Interaction'): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', {
      event_category: category,
      event_label: label
    });
  }
}

/**
 * Track tool usage and analysis actions
 * @param tool - Name of the tool being used
 * @param action - Action performed with the tool
 */
export function trackToolUsage(tool: string, action: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'tool_usage', {
      event_category: 'Tools',
      event_label: `${tool} - ${action}`
    });
  }
}
