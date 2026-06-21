import { View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

type Props = {
  size?: number;
  progress: number; // 0..1
  ticks?: number;
  activeColor?: string;
  trackColor?: string;
  dotColor?: string;
  children?: React.ReactNode;
};

/**
 * Speedometer-style dial: a ring of tick marks that fill up with the day's
 * progress, plus a coloured indicator dot sitting at the current position.
 * Anything passed as children is centred inside the dial.
 */
export default function StepDial({
  size = 260,
  progress,
  ticks = 60,
  activeColor = "#7C3AED",
  trackColor = "#E2E8F0",
  dotColor = "#C026D3",
  children,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const cx = size / 2;
  const cy = size / 2;
  const rOut = size / 2 - 4;
  const tickShort = 8;
  const tickLong = 13;

  const lines = [];
  for (let i = 0; i < ticks; i++) {
    const frac = i / ticks;
    const angle = (-90 + frac * 360) * (Math.PI / 180);
    const isLong = i % 5 === 0;
    const len = isLong ? tickLong : tickShort;
    const r1 = rOut - len;
    const active = clamped > 0 && frac <= clamped + 1e-6;
    lines.push(
      <Line
        key={i}
        x1={cx + r1 * Math.cos(angle)}
        y1={cy + r1 * Math.sin(angle)}
        x2={cx + rOut * Math.cos(angle)}
        y2={cy + rOut * Math.sin(angle)}
        stroke={active ? activeColor : trackColor}
        strokeWidth={isLong ? 2.6 : 1.6}
        strokeLinecap="round"
      />
    );
  }

  const dotAngle = (-90 + clamped * 360) * (Math.PI / 180);
  const dotX = cx + rOut * Math.cos(dotAngle);
  const dotY = cy + rOut * Math.sin(dotAngle);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* soft inner band */}
        <Circle
          cx={cx}
          cy={cy}
          r={size / 2 - 34}
          stroke="rgba(15,23,42,0.04)"
          strokeWidth={26}
          fill="none"
        />
        {lines}
        {/* indicator dot with a light halo so it reads above the ticks */}
        <Circle cx={dotX} cy={dotY} r={9} fill="#FFFFFF" />
        <Circle cx={dotX} cy={dotY} r={6.5} fill={dotColor} />
      </Svg>
      {children}
    </View>
  );
}
