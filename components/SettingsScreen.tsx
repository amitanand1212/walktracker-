import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ABOUT_BLOCKS,
  ABOUT_TITLE,
  PRIVACY_BLOCKS,
  PRIVACY_TITLE,
  PRIVACY_UPDATED,
} from "@/legal/content";
import { C, cardShadow, GOAL_GRADIENT } from "@/theme";

type Status = "idle" | "checking" | "unavailable" | "tracking";

type Props = {
  goal: number;
  setGoal: (goal: number) => void;
  reset: () => void;
  status: Status;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  background: boolean;
  topInset: number;
};

const PRESETS = [5000, 8000, 10000, 12000];

export default function SettingsScreen({
  goal,
  setGoal,
  reset,
  status,
  enabled,
  setEnabled,
  background,
  topInset,
}: Props) {
  const [reminders, setReminders] = useState(true);
  const [sound, setSound] = useState(false);
  const [legal, setLegal] = useState<"privacy" | "about" | null>(null);
  const version = Constants.expoConfig?.version ?? "1.0.0";

  const bumpGoal = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setGoal(goal + delta);
  };

  const pickPreset = (n: number) => {
    Haptics.selectionAsync().catch(() => {});
    setGoal(n);
  };

  const confirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      "Reset progress?",
      "This clears all your recorded steps. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => reset() },
      ]
    );
  };

  return (
    <>
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{
        paddingTop: topInset + 14,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage your walk experience ⚙️</Text>

      {/* Profile */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={GOAL_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Image
            source={require("../assets/assets/images/walking-man.png")}
            style={styles.avatarImg}
            resizeMode="contain"
          />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>Keep walking strong 💪</Text>
          <Text style={styles.profileSub}>Every step counts ❤️</Text>
        </View>
      </View>

      {/* Daily goal */}
      <Text style={styles.section}>Daily Goal</Text>
      <View style={styles.card}>
        <View style={styles.goalStepper}>
          <Pressable
            onPress={() => bumpGoal(-1000)}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <View style={styles.goalValueWrap}>
            <Text style={styles.goalValue}>{goal.toLocaleString()}</Text>
            <Text style={styles.goalValueUnit}>steps / day</Text>
          </View>
          <Pressable
            onPress={() => bumpGoal(1000)}
            style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
        <View style={styles.presetRow}>
          {PRESETS.map((n) => {
            const active = goal === n;
            return (
              <Pressable
                key={n}
                onPress={() => pickPreset(n)}
                style={[styles.presetChip, active && styles.presetChipActive]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    active && styles.presetChipTextActive,
                  ]}
                >
                  {n / 1000}k
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tracking */}
      <Text style={styles.section}>Tracking & Alerts</Text>
      <View style={styles.card}>
        <Row
          icon="walk"
          tint="rgba(124,58,237,0.12)"
          iconColor={C.purple}
          label="Live step counter"
          sub={statusText(status, background)}
        >
          <Switch
            value={enabled}
            onValueChange={(v) => {
              Haptics.selectionAsync().catch(() => {});
              setEnabled(v);
            }}
            trackColor={{ false: "#E2E8F0", true: "rgba(124,58,237,0.5)" }}
            thumbColor={enabled ? C.purple : "#fff"}
          />
        </Row>
        <Row
          icon="notifications"
          tint="rgba(249,115,22,0.12)"
          iconColor={C.orange}
          label="Daily reminders"
          sub="Nudge me to hit my goal"
          border
        >
          <Switch
            value={reminders}
            onValueChange={(v) => {
              Haptics.selectionAsync().catch(() => {});
              setReminders(v);
            }}
            trackColor={{ false: "#E2E8F0", true: "rgba(124,58,237,0.5)" }}
            thumbColor={reminders ? C.purple : "#fff"}
          />
        </Row>
        <Row
          icon="volume-high"
          tint="rgba(34,197,94,0.12)"
          iconColor={C.green}
          label="Sound effects"
          sub="Play sounds on milestones"
          border
        >
          <Switch
            value={sound}
            onValueChange={(v) => {
              Haptics.selectionAsync().catch(() => {});
              setSound(v);
            }}
            trackColor={{ false: "#E2E8F0", true: "rgba(124,58,237,0.5)" }}
            thumbColor={sound ? C.purple : "#fff"}
          />
        </Row>
      </View>

      {/* Data */}
      <Text style={styles.section}>Data</Text>
      <View style={styles.card}>
        <Pressable
          onPress={confirmReset}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Row
            icon="trash"
            tint="rgba(239,68,68,0.12)"
            iconColor={C.red}
            label="Reset progress"
            sub="Clear all recorded steps"
          >
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </Row>
        </Pressable>
      </View>

      {/* About & Legal */}
      <Text style={styles.section}>About & Legal</Text>
      <View style={styles.card}>
        <Pressable
          onPress={() => setLegal("about")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Row
            icon="information-circle"
            tint="rgba(59,130,246,0.12)"
            iconColor={C.blue}
            label="About Walk Tracker"
            sub="What this app does"
          >
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </Row>
        </Pressable>
        <Pressable
          onPress={() => setLegal("privacy")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Row
            icon="shield-checkmark"
            tint="rgba(34,197,94,0.12)"
            iconColor={C.green}
            label="Privacy Policy"
            sub="How your data is handled"
            border
          >
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </Row>
        </Pressable>
        <Row
          icon="pricetag"
          tint="rgba(124,58,237,0.12)"
          iconColor={C.purple}
          label="Version"
          sub="Walk Tracker"
          border
        >
          <Text style={styles.versionText}>{version}</Text>
        </Row>
      </View>

      <Text style={styles.footer}>Made for a healthier you ❤️</Text>
    </ScrollView>
    <LegalModal kind={legal} onClose={() => setLegal(null)} />
    </>
  );
}

function LegalModal({
  kind,
  onClose,
}: {
  kind: "privacy" | "about" | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const isPrivacy = kind === "privacy";
  const title = isPrivacy ? PRIVACY_TITLE : ABOUT_TITLE;
  const blocks = isPrivacy ? PRIVACY_BLOCKS : ABOUT_BLOCKS;
  return (
    <Modal
      visible={kind !== null}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.modalClose}>
            <Ionicons name="close" size={22} color={C.text} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {isPrivacy && (
            <Text style={styles.modalUpdated}>{PRIVACY_UPDATED}</Text>
          )}
          {blocks.map((b, i) => (
            <View key={i}>
              {b.heading ? (
                <Text style={styles.modalHeading}>{b.heading}</Text>
              ) : null}
              <Text style={styles.modalParagraph}>{b.body}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function Row({
  icon,
  tint,
  iconColor,
  label,
  sub,
  border,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
  label: string;
  sub: string;
  border?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, border && styles.rowBorder]}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {children}
    </View>
  );
}

function statusText(status: Status, background: boolean) {
  switch (status) {
    case "tracking":
      return background ? "● Counting steps 24/7" : "● Counting your steps live";
    case "checking":
      return "Starting step sensor…";
    case "unavailable":
      return "No step sensor on this device";
    default:
      return background
        ? "Off — turn on for background counting"
        : "Off — counts only while app is open";
  }
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  title: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 26 },
  subtitle: {
    color: C.subText,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
    ...cardShadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: 40, height: 40 },
  profileName: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 18 },
  profileSub: {
    color: C.subText,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },

  section: {
    color: C.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginTop: 22,
    marginBottom: 10,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    ...cardShadow,
  },

  goalStepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  goalValueWrap: { alignItems: "center" },
  goalValue: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 26 },
  goalValueUnit: {
    color: C.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(124,58,237,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: C.purple, fontFamily: "Inter_700Bold", fontSize: 24 },
  pressed: { opacity: 0.6, transform: [{ scale: 0.97 }] },

  presetRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 16,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.08)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  presetChipActive: {
    backgroundColor: "#EDE9FE",
    borderColor: C.purple,
  },
  presetChipText: {
    color: C.subText,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  presetChipTextActive: { color: C.purple },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(15,23,42,0.06)",
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { color: C.text, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  rowSub: {
    color: C.subText,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  versionText: {
    color: C.muted,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  footer: {
    color: C.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },

  modalRoot: { flex: 1, backgroundColor: "#F7F8FC" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,23,42,0.08)",
    backgroundColor: "#fff",
  },
  modalTitle: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 18 },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalUpdated: {
    color: C.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 12,
  },
  modalHeading: {
    color: C.purple,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginTop: 18,
    marginBottom: 4,
  },
  modalParagraph: {
    color: C.text,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
});
