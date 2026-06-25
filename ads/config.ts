/**
 * Ad unit IDs.
 *
 * In development we use Google's official TEST banner unit, and in production we
 * use the real AdMob unit. This is required by AdMob policy: never load or click
 * your own LIVE ads while testing, or your account can be suspended.
 *
 * The IDs are hard-coded (not imported from react-native-google-mobile-ads) so
 * this file can be imported safely in Expo Go, where the native ads module does
 * not exist. The matching App ID lives in app.json.
 */

// Google's official sample/test banner unit — safe to load while developing.
const TEST_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
const PROD_BANNER_AD_UNIT_ID = "ca-app-pub-7760368408975742/2736205475";

export const BANNER_AD_UNIT_ID = __DEV__
  ? TEST_BANNER_AD_UNIT_ID
  : PROD_BANNER_AD_UNIT_ID;
