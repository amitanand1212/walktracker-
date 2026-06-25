import Constants, { ExecutionEnvironment } from "expo-constants";

/**
 * Ads (react-native-google-mobile-ads) ship a native module that is NOT present
 * in Expo Go. Importing the library there throws
 * "RNGoogleMobileAdsModule could not be found". So we only touch the library
 * when running outside Expo Go (dev build, preview, or production).
 */
export const adsAvailable =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
