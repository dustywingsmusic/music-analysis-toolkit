/**
 * Analytics Manager
 * Handles Google Analytics Advanced Consent Mode
 * 
 * This implementation follows Google's Advanced Consent Mode best practices:
 * - Google Analytics is always loaded and configured
 * - When consent is denied, GA sends cookieless pings for behavioral modeling
 * - Consent state is managed through gtag consent commands
 */

// Extend the global Window interface for gtag
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export class AnalyticsManager {
  private static consentGiven = false;
  private static initialized = false;
  private static readonly GA_MEASUREMENT_ID = 'G-EV1FDWXP7C';

  /**
   * Initialize the analytics manager
   * In Advanced Consent Mode, GA is always configured in index.html
   * This method only manages the consent state
   */
  static initialize(): void {
    if (this.initialized) return;
    
    const consent = localStorage.getItem('cookie-consent');
    this.consentGiven = consent === 'accepted';
    this.initialized = true;
    
    // Note: In Advanced Consent Mode, GA is always configured in index.html
    // This ensures cookieless pings are sent even when consent is denied
  }

  /**
   * Grant consent for analytics
   * Updates consent mode to allow analytics storage and cookies
   */
  static grantConsent(): void {
    this.consentGiven = true;
    localStorage.setItem('cookie-consent', 'accepted');
    
    if (typeof window !== 'undefined' && window.gtag) {
      // Update consent mode for all relevant consent types
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied', // Keep ads denied for privacy
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  /**
   * Revoke consent for analytics
   * Updates consent mode to deny analytics storage, enabling cookieless pings
   */
  static revokeConsent(): void {
    this.consentGiven = false;
    localStorage.setItem('cookie-consent', 'declined');
    
    if (typeof window !== 'undefined' && window.gtag) {
      // Update consent mode to deny all storage
      // GA will continue to send cookieless pings for behavioral modeling
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  /**
   * Check if user has given consent
   */
  static hasConsent(): boolean {
    return this.consentGiven;
  }

  /**
   * Get the current consent status from localStorage
   */
  static getConsentStatus(): 'accepted' | 'declined' | null {
    const consent = localStorage.getItem('cookie-consent');
    return consent as 'accepted' | 'declined' | null;
  }

  /**
   * Get region-specific default consent state
   * Used for GDPR/CCPA compliance
   */
  static getRegionBasedDefaultConsent(): 'granted' | 'denied' {
    try {
      // Detect user's region using timezone as a heuristic
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isEURegion = timezone.includes('Europe') || 
                        timezone.includes('London') || 
                        timezone.includes('Dublin');
      
      // Default to denied for EU regions (GDPR), granted for others (like US)
      return isEURegion ? 'denied' : 'granted';
    } catch (error) {
      // Fallback to denied for privacy if timezone detection fails
      console.warn('Could not detect timezone for consent mode, defaulting to denied');
      return 'denied';
    }
  }

  /**
   * Check if user is in a GDPR region
   */
  static isGDPRRegion(): boolean {
    return this.getRegionBasedDefaultConsent() === 'denied';
  }
}