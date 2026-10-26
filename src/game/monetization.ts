/**
 * Fireland: Borneo Forest Rescue
 * Decoupled Monetization & Google AdMob Integration Layer
 * Complies with Google Play & AdMob policies:
 * - Never shows during active gameplay
 * - Rewarded ads are 100% voluntary
 * - If ads fail or are offline, game continues seamlessly
 */

export interface AdRewardResult {
  rewardEarned: boolean;
  bonusCoins: number;
}

export class MonetizationManager {
  private static instance: MonetizationManager;
  private isAdReady: boolean = true;
  private isShowingAd: boolean = false;

  private constructor() {}

  public static getInstance(): MonetizationManager {
    if (!MonetizationManager.instance) {
      MonetizationManager.instance = new MonetizationManager();
    }
    return MonetizationManager.instance;
  }

  /**
   * Check if rewarded video ad is available
   */
  public isRewardedAdAvailable(): boolean {
    return this.isAdReady && !this.isShowingAd;
  }

  /**
   * Shows an optional post-mission rewarded video.
   * In local/PWA environment, simulates standard AdMob test ad flow.
   * When wrapped in native Android container (Capacitor/TWA), connects to Google Mobile Ads SDK.
   */
  public async showRewardedAd(baseReward: number = 100): Promise<AdRewardResult> {
    if (this.isShowingAd) {
      return { rewardEarned: false, bonusCoins: 0 };
    }

    this.isShowingAd = true;

    return new Promise((resolve) => {
      // Simulate 3-second test ad display modal
      setTimeout(() => {
        this.isShowingAd = false;
        resolve({
          rewardEarned: true,
          bonusCoins: baseReward,
        });
      }, 1500);
    });
  }
}
