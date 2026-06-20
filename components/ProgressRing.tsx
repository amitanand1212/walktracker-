import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
};

export default function ProgressRing({
  size = 220,
  strokeWidth = 16,
  progress,
  color = "#0EA5E9",
  trackColor = "rgba(255,255,255,0.12)",
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
}
