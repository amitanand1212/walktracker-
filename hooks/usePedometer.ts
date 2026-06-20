import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useWalkStore } from "@/store/useWalkStore";

type Status = "idle" | "checking" | "unavailable" | "tracking";

// --- Step-detection tuning ---------------------------------------------------
const UPDATE_MS = 80; // sampling interval (~12.5 Hz)
const PEAK_THRESHOLD = 1.18; // acceleration magnitude (in g) to register a peak
const RESET_THRESHOLD = 1.05; // must drop below this before the next peak counts
const MIN_STEP_INTERVAL = 260; // ms between steps (caps cadence, kills jitter)
const SMOOTHING = 0.4; // low-pass factor for the magnitude signal

/**
 * Live step counting built on the device accelerometer (expo-sensors).
 *
 * Why the accelerometer instead of `Pedometer`:
 *   - Every phone has an accelerometer; many lack a dedicated step-counter.
 *   - It needs no ACTIVITY_RECOGNITION permission, so it also works in Expo Go.
 *
 * Algorithm: low-pass the acceleration magnitude, then count a step each time
 * the smoothed signal rises through PEAK_THRESHOLD (after having dropped back
 * below RESET_THRESHOLD), debounced by MIN_STEP_INTERVAL.
 */
export function usePedometer() {
  const addSteps = useWalkStore((s) => s.addSteps);
  const [status, setStatus] = useState<Status>("idle");
  const [enabled, setEnabled] = useState(false);

  const subRef = useRef<{ remove: () => void } | null>(null);
  const smoothRef = useRef(1);
  const armedRef = useRef(true); // ready to register the next peak
  const lastStepRef = useRef(0);

  const stop = useCallback(() => {
    subRef.current?.remove();
    subRef.current = null;
    smoothRef.current = 1;
    armedRef.current = true;
    lastStepRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      setStatus((prev) => (prev === "unavailable" ? prev : "idle"));
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus("checking");

      let available = false;
      try {
        available = await Accelerometer.isAvailableAsync();
      } catch {
        available = false;
      }
      if (cancelled) return;
      if (!available) {
        setStatus("unavailable");
        setEnabled(false);
        Alert.alert(
          "No motion sensor",
          "This device has no accelerometer, so live counting isn't available. Use the +steps buttons instead."
        );
        return;
      }

      Accelerometer.setUpdateInterval(UPDATE_MS);
      subRef.current = Accelerometer.addListener(({ x, y, z }) => {
        const mag = Math.sqrt(x * x + y * y + z * z);
        const smooth =
          smoothRef.current + SMOOTHING * (mag - smoothRef.current);
        smoothRef.current = smooth;

        const now = Date.now();
        if (
          armedRef.current &&
          smooth > PEAK_THRESHOLD &&
          now - lastStepRef.current > MIN_STEP_INTERVAL
        ) {
          armedRef.current = false;
          lastStepRef.current = now;
          addSteps(1);
        } else if (smooth < RESET_THRESHOLD) {
          armedRef.current = true; // re-arm once we're back near rest
        }
      });
      setStatus("tracking");
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
