import { adsAvailable } from "@/ads/env";

/**
 * Initialize ads in a policy-compliant way:
 *   1. Gather user consent via Google's UMP (User Messaging Platform). This is
 *      required by AdMob policy for users in the EEA / UK before serving
 *      personalized ads. If you haven't configured a GDPR message in AdMob
 *      (Privacy & messaging), this resolves as a no-op for everyone else.
 *   2. Initialize the Mobile Ads SDK once consent is resolved.
 *
 * Skipped entirely in Expo Go (native module unavailable). The library is
 * required lazily so it is never imported there.
 */
export async function initAds(): Promise<void> {
  if (!adsAvailable) return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: mobileAds, AdsConsent } = require("react-native-google-mobile-ads");

  try {
    await AdsConsent.gatherConsent();
  } catch {
    // No consent form configured, or UMP unavailable.
  }

  try {
    await mobileAds().initialize();
  } catch {
    // SDK init failed; ads simply won't show.
  }
}
