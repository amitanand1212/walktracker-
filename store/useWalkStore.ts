import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, subDays } from "date-fns";
import { create } from "zustand";

const STORAGE_KEY = "walk-tracker:data:v1";

export type DayLog = Record<string, number>; // "yyyy-MM-dd" -> steps

type WalkState = {
  goal: number;
  logs: DayLog;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addSteps: (amount: number) => void;
  setSteps: (amount: number) => void;
  setGoal: (goal: number) => void;
  reset: () => void;
};

export const todayKey = () => format(new Date(), "yyyy-MM-dd");

function persist(state: { goal: number; logs: DayLog }) {
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ goal: state.goal, logs: state.logs })
  ).catch(() => {});
}

export const useWalkStore = create<WalkState>((set, get) => ({
  goal: 8000,
  logs: {},
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { goal?: number; logs?: DayLog };
        set({
          goal: parsed.goal ?? 8000,
          logs: parsed.logs ?? {},
          hydrated: true,
        });
        return;
      }
    } catch {
      // ignore corrupt data
    }
    set({ hydrated: true });
  },

  addSteps: (amount) => {
    const key = todayKey();
    const logs = { ...get().logs };
    logs[key] = Math.max(0, (logs[key] ?? 0) + amount);
    set({ logs });
    persist({ goal: get().goal, logs });
  },

  setSteps: (amount) => {
    const key = todayKey();
    const logs = { ...get().logs, [key]: Math.max(0, Math.round(amount)) };
    set({ logs });
    persist({ goal: get().goal, logs });
  },

  setGoal: (goal) => {
    const clamped = Math.max(1000, Math.round(goal));
    set({ goal: clamped });
    persist({ goal: clamped, logs: get().logs });
  },

  reset: () => {
    set({ logs: {} });
    persist({ goal: get().goal, logs: {} });
  },
}));

export function lastSevenDays(logs: DayLog) {
  const out: { key: string; label: string; steps: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = format(d, "yyyy-MM-dd");
    out.push({ key, label: format(d, "EEEEE"), steps: logs[key] ?? 0 });
  }
  return out;
}
