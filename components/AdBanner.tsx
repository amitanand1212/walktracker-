import { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  BannerAd,
  BannerAdSize,
} from "react-native-google-mobile-ads";
import { BANNER_AD_UNIT_ID } from "@/ads/config";

/**
 * Anchored adaptive banner shown above the bottom tab bar.
 * Stays collapsed until an ad actually loads, so it never leaves an empty gap
 * (e.g. in Expo Go, where native ads are unavailable).
 */
export default function AdBanner() {
  const [loaded, setLoaded] = useState(false);

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
