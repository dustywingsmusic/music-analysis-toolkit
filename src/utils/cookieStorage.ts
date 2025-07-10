// Cookie-based storage utility to replace localStorage for persistent data
// Handles JSON serialization/deserialization and cookie size limitations

interface CookieOptions {
  expires?: Date;
  maxAge?: number; // in seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class CookieStorage {
  private static readonly MAX_COOKIE_SIZE = 4000; // Leave some buffer under 4KB limit
  private static readonly DEFAULT_EXPIRY_DAYS = 30;

  /**
   * Set a cookie with JSON data
   */
  static setItem(key: string, value: any, options?: CookieOptions): boolean {
    try {
      const jsonString = JSON.stringify(value);
      
      // Check size limitation
      if (jsonString.length > this.MAX_COOKIE_SIZE) {
        console.warn(`Cookie ${key} exceeds size limit (${jsonString.length} > ${this.MAX_COOKIE_SIZE}). Data will be truncated.`);
        
        // For history data, keep only the most recent entries
        if (key.includes('history') && Array.isArray(value)) {
          const truncatedValue = this.truncateHistoryArray(value);
          return this.setItem(key, truncatedValue, options);
        }
        
        // For other data types, we'll still try to store but warn
        console.warn(`Attempting to store oversized data for ${key}`);
      }

      const defaultOptions: CookieOptions = {
        expires: new Date(Date.now() + this.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        path: '/',
        sameSite: 'lax'
      };

      const finalOptions = { ...defaultOptions, ...options };
      
      let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(jsonString)}`;
      
      if (finalOptions.expires) {
        cookieString += `; expires=${finalOptions.expires.toUTCString()}`;
      }
      
      if (finalOptions.maxAge) {
        cookieString += `; max-age=${finalOptions.maxAge}`;
      }
      
      if (finalOptions.path) {
        cookieString += `; path=${finalOptions.path}`;
      }
      
      if (finalOptions.domain) {
        cookieString += `; domain=${finalOptions.domain}`;
      }
      
      if (finalOptions.secure) {
        cookieString += `; secure`;
      }
      
      if (finalOptions.sameSite) {
        cookieString += `; samesite=${finalOptions.sameSite}`;
      }

      document.cookie = cookieString;
      return true;
    } catch (error) {
      console.error(`Failed to set cookie ${key}:`, error);
      return false;
    }
  }

  /**
   * Get and parse JSON data from cookie
   */
  static getItem(key: string): any | null {
    try {
      const encodedKey = encodeURIComponent(key);
      const cookies = document.cookie.split(';');
      
      for (let cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.trim().split('=');
        
        if (cookieKey === encodedKey && cookieValue) {
          const decodedValue = decodeURIComponent(cookieValue);
          return JSON.parse(decodedValue);
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get cookie ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a cookie
   */
  static removeItem(key: string): void {
    try {
      document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.error(`Failed to remove cookie ${key}:`, error);
    }
  }

  /**
   * Check if cookies are available
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__cookie_test__';
      this.setItem(testKey, 'test');
      const result = this.getItem(testKey) === 'test';
      this.removeItem(testKey);
      return result;
    } catch {
      return false;
    }
  }

  /**
   * Truncate history array to fit within cookie size limits
   */
  private static truncateHistoryArray(historyArray: any[]): any[] {
    // Start with the most recent entries and keep adding until we approach the size limit
    const maxEntries = Math.min(historyArray.length, 20); // Start with reasonable limit
    
    for (let i = maxEntries; i > 0; i--) {
      const truncated = historyArray.slice(0, i);
      const testSize = JSON.stringify(truncated).length;
      
      if (testSize <= this.MAX_COOKIE_SIZE) {
        if (i < historyArray.length) {
          console.info(`History truncated from ${historyArray.length} to ${i} entries to fit cookie size limit`);
        }
        return truncated;
      }
    }
    
    // If even 1 entry is too large, return empty array
    console.warn('History entries are too large for cookie storage, returning empty array');
    return [];
  }

  /**
   * Get all cookies as an object
   */
  static getAllItems(): Record<string, any> {
    const result: Record<string, any> = {};
    
    try {
      const cookies = document.cookie.split(';');
      
      for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        
        if (key && value) {
          try {
            const decodedKey = decodeURIComponent(key);
            const decodedValue = decodeURIComponent(value);
            result[decodedKey] = JSON.parse(decodedValue);
          } catch {
            // Skip invalid JSON cookies
          }
        }
      }
    } catch (error) {
      console.error('Failed to get all cookies:', error);
    }
    
    return result;
  }

  /**
   * Clear all application cookies (based on key patterns)
   */
  static clearAppData(keyPattern: string = 'music-tool-'): void {
    try {
      const cookies = document.cookie.split(';');
      
      for (let cookie of cookies) {
        const [key] = cookie.trim().split('=');
        
        if (key) {
          const decodedKey = decodeURIComponent(key);
          if (decodedKey.includes(keyPattern)) {
            this.removeItem(decodedKey);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear app data:', error);
    }
  }
}

export default CookieStorage;