import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HistoryScreen from "@/components/HistoryScreen";
import SettingsScreen from "@/components/SettingsScreen";
import Sparkline from "@/components/Sparkline";
import StepDial from "@/components/StepDial";
import { usePedometer } from "@/hooks/usePedometer";
import { lastSevenDays, todayKey, useWalkStore } from "@/store/useWalkStore";
import { BG_GRADIENT, C, GOAL_GRADIENT, STEP_LENGTH_M } from "@/theme";

export type Tab = "home" | "history" | "settings";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("home");

  const goal = useWalkStore((s) => s.goal);
  const logs = useWalkStore((s) => s.logs);
  const hydrated = useWalkStore((s) => s.hydrated);
  const addSteps = useWalkStore((s) => s.addSteps);
  const setGoal = useWalkStore((s) => s.setGoal);
  const reset = useWalkStore((s) => s.reset);
  const { status, enabled, setEnabled, background } = usePedometer();

  const steps = logs[todayKey()] ?? 0;
  const progress = goal > 0 ? steps / goal : 0;
  const pct = Math.min(100, Math.round(progress * 100));

  const distanceKm = (steps * STEP_LENGTH_M) / 1000;
  const calories = Math.round(steps * 0.04);
  const activeMin = Math.round(steps / 110);

  const week = useMemo(() => lastSevenDays(logs), [logs]);
  const weekSteps = week.map((d) => d.steps);
  const hasData = weekSteps.some((v) => v > 0);
  const spark = (seed: number[]) => (hasData ? weekSteps : seed);

  const pctColor =
    progress >= 1 ? C.green : progress >= 0.5 ? C.purple : C.red;
  const greeting = getGreeting();
  const motivate = getMotivation(progress);

  const tap = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addSteps(amount);
  };
  const bumpGoal = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setGoal(goal + delta);
  };

  return (
    <LinearGradient colors={BG_GRADIENT} style={styles.fill}>
      {tab === "home" &&
        (hydrated ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={{
              paddingTop: insets.top + 14,
              paddingBottom: 24,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Greeting */}
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.greetingSub}>
              Let&apos;s walk towards a healthier you ❤️
            </Text>

            {/* Dial */}
            <View style={styles.dialWrap}>
              <StepDial progress={progress}>
                <View style={styles.dialCenter}>
                  <Text style={styles.shoe}>👟</Text>
                  <Text style={styles.stepsNum}>{steps.toLocaleString()}</Text>
                  <Text style={styles.stepsLabel}>Steps</Text>
                  <Text style={styles.ofGoal}>
                    <Text style={{ color: pctColor }}>{pct}%</Text> of{" "}
                    {goal.toLocaleString()}
                  </Text>
                  <View style={styles.goalPill}>
                    <Text style={styles.goalPillText}>Daily Goal</Text>
                  </View>
                </View>
              </StepDial>
            </View>

            {/* Date */}
            <View style={styles.dateRow}>
              <View style={styles.datePill}>
                <Ionicons name="calendar" size={16} color={C.purple} />
                <Text style={styles.dateText}>
                  Today, {format(new Date(), "d MMMM yyyy")}
                </Text>
              </View>
            </View>

            {/* Stat cards */}
            <View style={styles.statsRow}>
              <StatCard
                icon={
                  <MaterialCommunityIcons name="walk" size={20} color={C.purple} />
                }
                tint="rgba(124,58,237,0.12)"
                label="Distance"
                value={distanceKm.toFixed(2)}
                unit="km"
                data={spark([2, 4, 3, 5, 4, 6, 7])}
                lineColor={C.purple}
              />
              <StatCard
                icon={<Ionicons name="flame" size={20} color={C.orange} />}
                tint="rgba(249,115,22,0.12)"
                label="Calories"
                value={`${calories}`}
                unit="kcal"
                data={spark([1, 2, 3, 3, 4, 5, 6])}
                lineColor={C.orange}
              />
              <StatCard
                icon={<Ionicons name="speedometer" size={20} color={C.green} />}
                tint="rgba(34,197,94,0.12)"
                label="Active Time"
                value={`${activeMin}`}
                unit="min"
                data={spark([2, 3, 4, 5, 5, 6, 7])}
                lineColor={C.green}
              />
            </View>

            {/* Daily goal progress */}
            <LinearGradient
              colors={GOAL_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goalCard}
            >
              <View style={styles.targetCircle}>
                <MaterialCommunityIcons name="target" size={30} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.goalCardTop}>
                  <Text style={styles.goalCardTitle}>Daily Goal Progress</Text>
                  <Text style={styles.goalCardSteps}>
                    {steps.toLocaleString()} / {goal.toLocaleString()} steps
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(2, pct)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.goalCardPct}>{pct}%</Text>
              </View>
            </LinearGradient>

            {/* Motivation */}
            <View style={styles.motivateCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.keepPill}>
                  <Text style={styles.keepPillText}>🔥 Keep going</Text>
                </View>
                <Text style={styles.motivateTitle}>{motivate.title}</Text>
                <Text style={styles.motivateSub}>{motivate.sub}</Text>
              </View>
              <View style={styles.walkerCircle}>
                <Image
                  source={require("../assets/assets/images/walking-man.png")}
                  style={styles.walker}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Tracking + quick actions (functional controls) */}
            <View style={styles.toggleCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Live step counter</Text>
                <Text style={styles.toggleSub}>
                  {statusText(status, background)}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(v) => {
                  Haptics.selectionAsync().catch(() => {});
                  setEnabled(v);
                }}
                trackColor={{ false: "#E2E8F0", true: "rgba(124,58,237,0.5)" }}
                thumbColor={enabled ? C.purple : "#fff"}
              />
            </View>

            <View style={styles.addRow}>
              {[100, 500, 1000, 2000].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => tap(n)}
                  style={({ pressed }) => [
                    styles.addBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.addBtnText}>
                    +{n >= 1000 ? `${n / 1000}k` : n}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.goalEditRow}>
              <Text style={styles.goalEditLabel}>Daily goal</Text>
              <View style={styles.goalEditCtrls}>
                <Pressable
                  onPress={() => bumpGoal(-1000)}
                  style={({ pressed }) => [
                    styles.stepBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </Pressable>
                <Text style={styles.goalEditValue}>
                  {goal.toLocaleString()}
                </Text>
                <Pressable
                  onPress={() => bumpGoal(1000)}
                  style={({ pressed }) => [
                    styles.stepBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.flexCenter} />
        ))}

      {tab === "history" && (
        <HistoryScreen logs={logs} goal={goal} topInset={insets.top} />
      )}

      {tab === "settings" && (
        <SettingsScreen
          goal={goal}
          setGoal={setGoal}
          reset={reset}
          status={status}
          enabled={enabled}
          setEnabled={setEnabled}
          background={background}
          topInset={insets.top}
        />
      )}

      {/* Bottom tab bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
        <TabItem
          tab="home"
          active={tab}
          onPress={setTab}
          icon="home"
          label="Home"
        />
        <TabItem
          tab="history"
          active={tab}
          onPress={setTab}
          icon="stats-chart"
          label="History"
        />
        <TabItem
          tab="settings"
          active={tab}
          onPress={setTab}
          icon="settings"
          label="Settings"
        />
      </View>
    </LinearGradient>
  );
}

/* ---------- pieces ---------- */

function StatCard({
  icon,
  tint,
  label,
  value,
  unit,
  data,
  lineColor,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
  unit: string;
  data: number[];
  lineColor: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <View style={styles.sparkWrap}>
        <Sparkline data={data} color={lineColor} width={60} height={22} />
      </View>
    </View>
  );
}

function TabItem({
  tab,
  active,
  onPress,
  icon,
  label,
}: {
  tab: Tab;
  active: Tab;
  onPress: (t: Tab) => void;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const isActive = active === tab;
  const color = isActive ? C.purple : C.muted;
  return (
    <Pressable
      style={styles.tabItem}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress(tab);
      }}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- helpers ---------- */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getMotivation(progress: number) {
  if (progress >= 1)
    return { title: "Goal smashed! Amazing! 🎉", sub: "You hit your daily goal." };
  if (progress >= 0.5)
    return { title: "Over halfway there! 🚀", sub: "Keep the momentum going." };
  if (progress > 0)
    return { title: "Keep it up! You're doing great! 💪", sub: "Every step counts." };
  return { title: "Let's get moving! 🚶", sub: "Your first steps await." };
}

function statusText(
  status: ReturnType<typeof usePedometer>["status"],
  background: boolean
) {
  switch (status) {
    case "tracking":
      return background
        ? "● Counting steps 24/7 — even in your pocket"
        : "● Counting your steps live — keep walking";
    case "checking":
      return "Starting step sensor…";
    case "unavailable":
      return "No step sensor on this device";
    default:
      return background
        ? "Turn on for background step counting"
        : "Turn on to count steps while the app is open";
  }
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flexCenter: { flex: 1, alignItems: "center", justifyContent: "center" },

  greeting: {
    color: C.text,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    textAlign: "center",
  },
  greetingSub: {
    color: C.subText,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },

  dialWrap: { alignItems: "center", marginTop: 10 },
  dialCenter: { alignItems: "center", justifyContent: "center" },
  shoe: { fontSize: 38, marginBottom: 2 },
  stepsNum: {
    color: C.text,
    fontFamily: "Inter_700Bold",
    fontSize: 52,
    lineHeight: 58,
  },
  stepsLabel: {
    color: C.subText,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginTop: -2,
  },
  ofGoal: {
    color: C.subText,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 8,
  },
  goalPill: {
    marginTop: 8,
    backgroundColor: "#EDE9FE",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  goalPillText: {
    color: C.purple,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  dateRow: { alignItems: "flex-start", marginTop: 14 },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: "#1E293B",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  dateText: {
    color: C.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    shadowColor: "#1E293B",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    color: C.subText,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  statValue: {
    color: C.text,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 2,
  },
  statUnit: {
    color: C.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 10,
  },
  sparkWrap: { marginTop: 8, height: 22, justifyContent: "center" },

  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
    shadowColor: "#9333EA",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  targetCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  goalCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalCardTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    flexShrink: 1,
  },
  goalCardSteps: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginTop: 12,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4, backgroundColor: "#fff" },
  goalCardPct: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    alignSelf: "flex-end",
    marginTop: 6,
  },

  motivateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(237,233,254,0.7)",
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
  },
  keepPill: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  keepPillText: {
    color: C.purple,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  motivateTitle: {
    color: C.text,
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  motivateSub: {
    color: C.subText,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 3,
  },
  walkerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  walker: { width: 70, height: 70 },

  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    shadowColor: "#1E293B",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  toggleTitle: {
    color: C.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  toggleSub: {
    color: C.subText,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 3,
  },

  addRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  addBtn: {
    flex: 1,
    backgroundColor: "rgba(124,58,237,0.1)",
    borderColor: "rgba(124,58,237,0.25)",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  addBtnText: {
    color: C.purple,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  pressed: { opacity: 0.6, transform: [{ scale: 0.97 }] },

  goalEditRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    shadowColor: "#1E293B",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  goalEditLabel: {
    color: C.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  goalEditCtrls: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(124,58,237,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    color: C.purple,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  goalEditValue: {
    color: C.text,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    minWidth: 64,
    textAlign: "center",
  },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#1E293B",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 4 },
  tabLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
});
