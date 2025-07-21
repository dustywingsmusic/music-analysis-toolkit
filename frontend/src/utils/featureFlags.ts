export interface ConsolidationFeatureFlags {
  CONSOLIDATED_SIDEBAR: {
    enabled: boolean;
    rollout: number;
    criteria?: string[];
    fallback: 'dual_sections' | 'consolidated';
    killSwitch: boolean;
  };
  QUICK_VIEW_DEFAULT: {
    enabled: boolean;
    rollout: number;
  };
  ENHANCED_5_6_ANALYSIS: {
    enabled: boolean;
    rollout: number;
  };
}

export class FeatureFlagService {
  private flags: ConsolidationFeatureFlags;

  constructor() {
    this.flags = this.loadFlags();
  }

  private loadFlags(): ConsolidationFeatureFlags {
    return {
      CONSOLIDATED_SIDEBAR: {
        enabled: process.env.REACT_APP_CONSOLIDATED_SIDEBAR === 'true',
        rollout: parseFloat(process.env.REACT_APP_ROLLOUT_PERCENTAGE || '0'),
        fallback: 'dual_sections',
        killSwitch: process.env.REACT_APP_KILL_SWITCH === 'true'
      },
      QUICK_VIEW_DEFAULT: {
        enabled: true,
        rollout: 1
      },
      ENHANCED_5_6_ANALYSIS: {
        enabled: true,
        rollout: 1
      }
    };
  }

  isConsolidatedSidebarEnabled(userId: string): boolean {
    const flag = this.flags.CONSOLIDATED_SIDEBAR;
    if (flag.killSwitch || !flag.enabled) return false;
    const userHash = this.hashUserId(userId);
    if (userHash > flag.rollout) return false;
    return true;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) / 0xffffffff;
  }
}

export const featureFlags = new FeatureFlagService();
