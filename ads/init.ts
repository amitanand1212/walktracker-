import mobileAds, { AdsConsent } from "react-native-google-mobile-ads";

/**
 * Initialize ads in a policy-compliant way:
 *   1. Gather user consent via Google's UMP (User Messaging Platform). This is
 *      required by AdMob policy for users in the EEA / UK before serving
 *      personalized ads. If you haven't configured a GDPR message in AdMob
 *      (Privacy & messaging), this resolves as a no-op for everyone else.
 *   2. Initialize the Mobile Ads SDK once consent is resolved.
 *
 * Safe to call on every launch; unavailable / no-op in Expo Go, so it's guarded.
 */
export async function initAds(): Promise<void> {
  try {
    await AdsConsent.gatherConsent();
  } catch {
    // No consent form configured, or running where UMP is unavailable.
  }

  try {
    await mobileAds().initialize();
  } catch {
    // Native module unavailable (e.g. Expo Go).
  }
}
