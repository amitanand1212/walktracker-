import { Pedometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { useWalkStore } from "@/store/useWalkStore";

type Status = "idle" | "checking" | "unavailable" | "denied" | "tracking";

/**
 * Live step counting via the device pedometer.
 *
 * `Pedometer.watchStepCount` reports the cumulative step count since the
 * subscription started, so we track the last reading and feed only the
 * delta into the store. This combines cleanly with manual quick-adds and
 * avoids double-counting across app restarts (the watch restarts at 0).
 */
export function usePedometer() {
  const addSteps = useWalkStore((s) => s.addSteps);
  const [status, setStatus] = useState<Status>("idle");
  const [enabled, setEnabled] = useState(false);

  const subRef = useRef<{ remove: () => void } | null>(null);
  const lastRef = useRef(0);

  const stop = useCallback(() => {
    subRef.current?.remove();
    subRef.current = null;
    lastRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      // Keep error statuses visible; only clear a successful/in-progress one.
      setStatus((prev) =>
        prev === "tracking" || prev === "checking" ? "idle" : prev
      );
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus("checking");

      let available = false;
      try {
        available = await Pedometer.isAvailableAsync();
      } catch (e) {
        available = false;
      }
      if (cancelled) return;
      if (!available) {
        setStatus("unavailable");
        setEnabled(false);
        Alert.alert(
          "No step sensor",
          Platform.OS === "android"
            ? "This device (or emulator) has no step-counter sensor, so live counting isn't available. Use the +steps buttons instead, or try on a real phone."
            : "This device has no motion/step sensor available. Use the +steps buttons instead."
        );
        return;
      }

      let granted = true;
      try {
        const perm = await Pedometer.requestPermissionsAsync();
        granted = perm.granted;
      } catch (e) {
        granted = false;
      }
      if (cancelled) return;
      if (!granted) {
        setStatus("denied");
        setEnabled(false);
        Alert.alert(
          "Permission needed",
          "Walk Tracker needs motion / physical-activity permission to count steps automatically.",
          [
            { text: "Not now", style: "cancel" },
            { text: "Open settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      lastRef.current = 0;
      try {
        subRef.current = Pedometer.watchStepCount((result) => {
          const total = result.steps ?? 0;
          const delta = total - lastRef.current;
          lastRef.current = total;
          if (delta > 0) addSteps(delta);
        });
        setStatus("tracking");
      } catch (e) {
        setStatus("unavailable");
        setEnabled(false);
        Alert.alert(
          "Couldn't start tracking",
          "The step sensor couldn't be started on this device. You can still log steps manually."
        );
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, addSteps, stop]);

  // Tear down on unmount.
  useEffect(() => stop, [stop]);

  return { status, enabled, setEnabled };
}
