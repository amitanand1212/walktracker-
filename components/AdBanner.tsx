import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { adsAvailable } from "@/ads/env";
import { BANNER_AD_UNIT_ID } from "@/ads/config";

/**
 * Anchored adaptive banner shown above the bottom tab bar.
 *
 * Renders nothing in Expo Go (no native ads module). Outside Expo Go it stays
 * collapsed until an ad actually loads, so it never leaves an empty gap.
 */
export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

  if (!adsAvailable) return null;

  // Lazy require so the native module is only loaded where it exists.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { BannerAd, BannerAdSize } = require("react-native-google-mobile-ads");

  return (
    <View style={[styles.wrap, !loaded && styles.collapsed]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: "#fff",
  },
  collapsed: { height: 0, overflow: "hidden" },
});
