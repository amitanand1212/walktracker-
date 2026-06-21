import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { lastSevenDays, todayKey, type DayLog } from "@/store/useWalkStore";
import { C, cardShadow, STEP_LENGTH_M } from "@/theme";

type Props = {
  logs: DayLog;
  goal: number;
  topInset: number;
};

export default function HistoryScreen({ logs, goal, topInset }: Props) {
  const week = lastSevenDays(logs);
  const today = todayKey();

  const total = week.reduce((sum, d) => sum + d.steps, 0);
  const avg = Math.round(total / 7);
  const best = week.reduce((m, d) => Math.max(m, d.steps), 0);
  const totalKm = (total * STEP_LENGTH_M) / 1000;

  const chartData = week.map((d) => ({
    value: d.steps,
    label: d.label,
    frontColor: d.key === today ? C.purple : "rgba(124,58,237,0.25)",
  }));
  const maxValue = Math.max(goal, best, 1000);

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{
        paddingTop: topInset + 14,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Your walking journey 📈</Text>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <Summary
          icon={<Ionicons name="footsteps" size={18} color={C.purple} />}
          tint="rgba(124,58,237,0.12)"
          label="Total"
          value={total.toLocaleString()}
          unit="steps"
        />
        <Summary
          icon={<Ionicons name="trending-up" size={18} color={C.green} />}
          tint="rgba(34,197,94,0.12)"
          label="Daily avg"
          value={avg.toLocaleString()}
          unit="steps"
        />
        <Summary
          icon={<Ionicons name="trophy" size={18} color={C.orange} />}
          tint="rgba(249,115,22,0.12)"
          label="Best day"
          value={best.toLocaleString()}
          unit="steps"
        />
      </View>

      {/* Weekly chart */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.kmPill}>
            <MaterialCommunityIcons name="map-marker-distance" size={13} color={C.purple} />
            <Text style={styles.kmPillText}>{totalKm.toFixed(1)} km</Text>
          </View>
        </View>
        <BarChart
          data={chartData}
          height={150}
          barWidth={20}
          barBorderRadius={6}
          spacing={14}
          initialSpacing={12}
          maxValue={maxValue}
          noOfSections={3}
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisLabelTextStyle={styles.axisLabel}
          yAxisTextStyle={styles.axisLabel}
          rulesColor="rgba(15,23,42,0.06)"
        />
      </View>

      {/* Daily breakdown */}
      <Text style={styles.section}>Daily Breakdown</Text>
      <View style={styles.card}>
        {[...week].reverse().map((d, i) => {
          const isToday = d.key === today;
          const pct = goal > 0 ? Math.min(100, Math.round((d.steps / goal) * 100)) : 0;
          const date = new Date(`${d.key}T00:00:00`);
          return (
            <View
              key={d.key}
              style={[styles.dayRow, i > 0 && styles.dayRowBorder]}
            >
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>
                  {isToday ? "Today" : format(date, "EEE")}
                </Text>
                <Text style={styles.dayDate}>{format(date, "d MMM")}</Text>
              </View>
              <View style={styles.dayBarWrap}>
                <View style={styles.dayBarTrack}>
                  <View
                    style={[
                      styles.dayBarFill,
                      {
                        width: `${Math.max(2, pct)}%`,
                        backgroundColor: pct >= 100 ? C.green : C.purple,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.dayRight}>
                <Text style={styles.daySteps}>{d.steps.toLocaleString()}</Text>
                <Text style={styles.dayPct}>{pct}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Summary({
  icon,
  tint,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: tint }]}>{icon}</View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryUnit}>{unit}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
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

  summaryRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    ...cardShadow,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryValue: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 16 },
  summaryUnit: { color: C.muted, fontFamily: "Inter_400Regular", fontSize: 10 },
  summaryLabel: {
    color: C.subText,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    marginTop: 4,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    paddingRight: 8,
    marginTop: 16,
    ...cardShadow,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
    marginBottom: 14,
  },
  cardTitle: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 16 },
  kmPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EDE9FE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kmPillText: { color: C.purple, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  axisLabel: {
    color: C.muted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },

  section: {
    color: C.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginTop: 24,
    marginBottom: 2,
  },

  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingRight: 8,
  },
  dayRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "rgba(15,23,42,0.06)",
  },
  dayInfo: { width: 56 },
  dayName: { color: C.text, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  dayDate: { color: C.muted, fontFamily: "Inter_400Regular", fontSize: 11 },
  dayBarWrap: { flex: 1, paddingHorizontal: 10 },
  dayBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(124,58,237,0.1)",
    overflow: "hidden",
  },
  dayBarFill: { height: 8, borderRadius: 4 },
  dayRight: { width: 64, alignItems: "flex-end" },
  daySteps: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 14 },
  dayPct: { color: C.subText, fontFamily: "Inter_400Regular", fontSize: 11 },
});
