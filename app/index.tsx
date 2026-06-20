import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProgressRing from "@/components/ProgressRing";
import { usePedometer } from "@/hooks/usePedometer";
import { lastSevenDays, todayKey, useWalkStore } from "@/store/useWalkStore";

const ACCENT = "#0EA5E9";
const STEP_LENGTH_M = 0.75; // avg stride for distance estimate

export default function Home() {
  const insets = useSafeAreaInsets();
  const goal = useWalkStore((s) => s.goal);
  const logs = useWalkStore((s) => s.logs);
  const hydrated = useWalkStore((s) => s.hydrated);
  const addSteps = useWalkStore((s) => s.addSteps);
  const setGoal = useWalkStore((s) => s.setGoal);
  const { status, enabled, setEnabled } = usePedometer();

  const steps = logs[todayKey()] ?? 0;
  const progress = goal > 0 ? steps / goal : 0;
  const distanceKm = (steps * STEP_LENGTH_M) / 1000;
  const calories = Math.round(steps * 0.04);

  const week = useMemo(() => lastSevenDays(logs), [logs]);
  const chartData = week.map((d) => ({
    value: d.steps,
    label: d.label,
    frontColor: d.key === todayKey() ? ACCENT : "rgba(255,255,255,0.25)",
  }));
  const maxVal = Math.max(goal, ...week.map((d) => d.steps), 1000);

  const tap = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addSteps(amount);
  };

  const bumpGoal = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setGoal(goal + delta);
  };

  if (!hydrated) {
    return <View style={styles.flexCenter} />;
  }

  return (
    <LinearGradient colors={["#0B1220", "#0F1B2D", "#0B1220"]} style={styles.fill}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>WALK TRACKER</Text>
        <Text style={styles.title}>Today</Text>

        <View style={styles.ringWrap}>
          <ProgressRing progress={progress} color={ACCENT}>
            <View style={styles.flexCenter}>
              <Text style={styles.steps}>{steps.toLocaleString()}</Text>
              <Text style={styles.stepsLabel}>steps</Text>
              <Text style={styles.goalLabel}>
                {Math.min(100, Math.round(progress * 100))}% of {goal.toLocaleString()}
              </Text>
            </View>
          </ProgressRing>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Distance" value={`${distanceKm.toFixed(2)} km`} />
          <Stat label="Calories" value={`${calories} kcal`} />
          <Stat
            label="Goal"
            value={progress >= 1 ? "Done 🎉" : `${Math.max(0, goal - steps).toLocaleString()} left`}
          />
        </View>

        <View style={styles.liveCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.liveTitle}>Auto step tracking</Text>
            <Text style={styles.liveSub}>{statusText(status)}</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(v) => {
              Haptics.selectionAsync().catch(() => {});
              setEnabled(v);
            }}
            trackColor={{ false: "rgba(255,255,255,0.15)", true: "rgba(14,165,233,0.6)" }}
            thumbColor={enabled ? ACCENT : "#f4f4f5"}
          />
        </View>

        <Text style={styles.section}>Add steps</Text>
        <View style={styles.addRow}>
          {[100, 500, 1000, 2000].map((n) => (
            <Pressable
              key={n}
              onPress={() => tap(n)}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            >
              <Text style={styles.addBtnText}>+{n >= 1000 ? `${n / 1000}k` : n}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>This week</Text>
        <View style={styles.card}>
          <BarChart
            data={chartData}
            height={150}
            barWidth={18}
            barBorderRadius={6}
            spacing={16}
            initialSpacing={10}
            maxValue={maxVal}
            noOfSections={3}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={styles.axisLabel}
            yAxisTextStyle={styles.axisLabel}
            hideRules={false}
            rulesColor="rgba(255,255,255,0.06)"
          />
        </View>

        <Text style={styles.section}>Daily goal</Text>
        <View style={styles.goalRow}>
          <Pressable
            onPress={() => bumpGoal(-1000)}
            style={({ pressed }) => [styles.goalBtn, pressed && styles.pressed]}
          >
            <Text style={styles.goalBtnText}>−1k</Text>
          </Pressable>
          <Text style={styles.goalValue}>{goal.toLocaleString()}</Text>
          <Pressable
            onPress={() => bumpGoal(1000)}
            style={({ pressed }) => [styles.goalBtn, pressed && styles.pressed]}
          >
            <Text style={styles.goalBtnText}>+1k</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function statusText(status: ReturnType<typeof usePedometer>["status"]) {
  switch (status) {
    case "tracking":
      return "● Counting your steps live";
    case "checking":
      return "Starting sensor…";
    case "unavailable":
      return "No step sensor on this device";
    case "denied":
      return "Motion permission denied";
    default:
      return "Turn on to count steps with your phone's sensor";
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flexCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  kicker: {
    color: ACCENT,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 2,
  },
  title: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    marginBottom: 8,
  },
  ringWrap: { alignItems: "center", marginVertical: 16 },
  steps: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 44 },
  stepsLabel: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: -4,
  },
  goalLabel: {
    color: ACCENT,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 8,
  },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  liveCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
  },
  liveTitle: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  liveSub: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 3,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginTop: 26,
    marginBottom: 12,
  },
  addRow: { flexDirection: "row", gap: 10 },
  addBtn: {
    flex: 1,
    backgroundColor: "rgba(14,165,233,0.15)",
    borderColor: "rgba(14,165,233,0.4)",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnText: { color: ACCENT, fontFamily: "Inter_700Bold", fontSize: 16 },
  pressed: { opacity: 0.6, transform: [{ scale: 0.97 }] },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 16,
    paddingRight: 8,
  },
  axisLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 12,
  },
  goalBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  goalBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  goalValue: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
});
