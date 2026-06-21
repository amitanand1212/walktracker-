import Svg, { Polyline } from "react-native-svg";

type Props = {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
};

/**
 * Tiny inline trend line used in the stat cards. Normalises the data to fill
 * the available height with a little padding so the stroke never clips.
 */
export default function Sparkline({
  data,
  color,
  width = 70,
  height = 28,
  strokeWidth = 2.5,
}: Props) {
  const pts = data.length >= 2 ? data : [0, 0];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const range = max - min || 1;
  const pad = strokeWidth;
  const usable = height - pad * 2;
  const stepX = width / (pts.length - 1);

  const points = pts
    .map((v, i) => {
      const x = i * stepX;
      const y = pad + (usable - ((v - min) / range) * usable);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
