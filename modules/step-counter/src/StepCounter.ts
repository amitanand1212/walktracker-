import { requireNativeModule } from "expo";
import { Platform } from "react-native";

export type StepUpdateEvent = { steps: number; date: string };

type NativeStepCounter = {
  isAvailable(): boolean;
  isRunning(): boolean;
  getTodaySteps(): Promise<number>;
  start(): Promise<boolean>;
  stop(): Promise<void>;
  addListener(
    event: "onStepUpdate",
    listener: (e: StepUpdateEvent) => void
  ): { remove: () => void };
};

// The native module only exists in a dev/production build on Android. In Expo
// Go (or on iOS) requireNativeModule throws, so we degrade to `null` and the
// caller falls back to the accelerometer-based counter.
let native: NativeStepCounter | null = null;
if (Platform.OS === "android") {
  try {
    native = requireNativeModule("StepCounter") as unknown as NativeStepCounter;
  } catch {
    native = null;
  }
}

/**
 * Thin, crash-safe wrapper around the native foreground-service step counter.
 * Every method is a no-op (sensible default) when the native module is absent,
 * so the rest of the app never has to branch on platform/build type.
 */
export const StepCounter = {
  /** True when a hardware step-counter sensor + native module are present. */
  isAvailable(): boolean {
    try {
      return !!native && native.isAvailable();
    } catch {
      return false;
    }
  },

  isRunning(): boolean {
    try {
      return native?.isRunning() ?? false;
    } catch {
      return false;
    }
  },

  getTodaySteps(): Promise<number> {
    return native?.getTodaySteps() ?? Promise.resolve(0);
  },

  /** Starts the foreground service. Resolves false if it couldn't start. */
  start(): Promise<boolean> {
    return native?.start() ?? Promise.resolve(false);
  },

  stop(): Promise<void> {
    return native?.stop() ?? Promise.resolve();
  },

  addListener(cb: (e: StepUpdateEvent) => void): { remove: () => void } {
    if (!native) return { remove() {} };
    return native.addListener("onStepUpdate", cb);
  },
};
