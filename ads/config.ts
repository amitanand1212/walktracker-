import { TestIds } from "react-native-google-mobile-ads";

/**
 * Ad unit IDs.
 *
 * In development we use Google's official TEST ad unit, and in production we use
 * the real AdMob unit. This is required by AdMob policy: never load or click
 * your own LIVE ads while testing, or your account can be suspended.
 *
 * The matching App ID lives in app.json (`react-native-google-mobile-ads`
 * plugin → androidAppId / iosAppId).
 */
const PROD_BANNER_AD_UNIT_ID = "ca-app-pub-7760368408975742/2736205475";

export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : PROD_BANNER_AD_UNIT_ID;
