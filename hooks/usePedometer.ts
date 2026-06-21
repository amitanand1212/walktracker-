import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, PermissionsAndroid, Platform } from "react-native";
import { StepCounter } from "@/modules/step-counter";
import { useWalkStore } from "@/store/useWalkStore";

type Status = "idle" | "checking" | "unavailable" | "tracking";

// --- Accelerometer fallback tuning (Expo Go / no hardware step counter) ------
const UPDATE_MS = 80; // sampling interval (~12.5 Hz)
const PEAK_THRESHOLD = 1.18; // acceleration magnitude (in g) to register a peak
const RESET_THRESHOLD = 1.05; // must drop below this before the next peak counts
const MIN_STEP_INTERVAL = 260; // ms between steps (caps cadence, kills jitter)
const SMOOTHING = 0.4; // low-pass factor for the magnitude signal

// Decided once per launch: a dev/prod build on a phone with a step-counter
// sensor uses the native foreground service; everything else (Expo Go, iOS,
// emulators without the sensor) uses the accelerometer.
const USE_SERVICE = StepCounter.isAvailable();

/**
 * Live step counting.
 *
 * Preferred path (USE_SERVICE): an Android foreground service reads the
 * hardware step counter and keeps running with the app backgrounded. The store
 * is kept in sync from the service's absolute "steps today" value.
 *
 * Fallback path: low-pass the accelerometer magnitude and count peaks. Works in
 * Expo Go without permissions, but only while the app is in the foreground.
 */
export function usePedometer() {
  const addSteps = useWalkStore((s) => s.addSteps);
  const setSteps = useWalkStore((s) => s.setSteps);
  // Toggle state lives in the store so it persists and defaults to on.
  const enabled = useWalkStore((s) => s.tracking);
  const setEnabled = useWalkStore((s) => s.setTracking);
  const hydrated = useWalkStore((s) => s.hydrated);
  const [status, setStatus] = useState<Status>("idle");

  /* ----------------------- native foreground service ---------------------- */
  useEffect(() => {
    if (!USE_SERVICE || !hydrated) return;

    if (!enabled) {
      StepCounter.stop().catch(() => {});
      setStatus((prev) => (prev === "unavailable" ? prev : "idle"));
      return;
    }

    let cancelled = false;
    let stepSub: { remove: () => void } | null = null;
    let appSub: { remove: () => void } | null = null;

    const sync = async () => {
      const s = await StepCounter.getTodaySteps();
      if (!cancelled) setSteps(s);
    };

    (async () => {
      setStatus("checking");

      const granted = await requestAndroidPermissions();
      if (cancelled) return;
      if (!granted) {
        setEnabled(false);
        setStatus("idle");
        Alert.alert(
          "Permission needed",
          "Allow physical activity access so Walk Tracker can count your steps in the background."
        );
        return;
      }

      const started = await StepCounter.start();
      if (cancelled) return;
      if (!started) {
        setEnabled(false);
        setStatus("unavailable");
        return;
      }

      setStatus("tracking");
      await sync();
      stepSub = StepCounter.addListener((e) => setSteps(e.steps));
      // Re-sync whenever the app returns to the foreground.
      appSub = AppState.addEventListener("change", (state) => {
        if (state === "active") sync();
      });
    })();

    return () => {
      cancelled = true;
      stepSub?.remove();
      appSub?.remove();
    };
  }, [enabled, hydrated, setSteps]);

  /* ------------------------- accelerometer fallback ----------------------- */
  const subRef = useRef<{ remove: () => void } | null>(null);
  const smoothRef = useRef(1);
  const armedRef = useRef(true);
  const lastStepRef = useRef(0);

  const stopAccel = useCallback(() => {
    subRef.current?.remove();
    subRef.current = null;
    smoothRef.current = 1;
    armedRef.current = true;
    lastStepRef.current = 0;
  }, []);

  useEffect(() => {
    if (USE_SERVICE || !hydrated) return;

    if (!enabled) {
      stopAccel();
      setStatus((prev) => (prev === "unavailable" ? prev : "idle"));
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus("checking");
      try {
        Accelerometer.setUpdateInterval(UPDATE_MS);
        const sub = Accelerometer.addListener(({ x, y, z }) => {
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
            armedRef.current = true;
          }
        });
        if (cancelled) {
          sub.remove();
          return;
        }
        subRef.current = sub;
        setStatus("tracking");
      } catch {
        if (cancelled) return;
        setStatus("unavailable");
        setEnabled(false);
        Alert.alert(
          "No motion sensor",
          "Couldn't start the accelerometer on this device. Use the +steps buttons instead."
        );
      }
    })();

    return () => {
      cancelled = true;
      stopAccel();
    };
  }, [enabled, hydrated, addSteps, stopAccel]);

  useEffect(() => stopAccel, [stopAccel]);

  // `background` is true when the native foreground service is driving counting
  // (works with the app closed); false on the foreground-only accelerometer.
  return { status, enabled, setEnabled, background: USE_SERVICE };
}

async function requestAndroidPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const perms: string[] = [PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION];
    if (PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) {
      perms.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    const res = await PermissionsAndroid.requestMultiple(perms as any);
    return (
      res[PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION] ===
      PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}
