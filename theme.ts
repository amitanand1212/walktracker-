// Shared palette + design tokens so every screen uses the same color code.

export const C = {
  text: "#1E293B",
  subText: "#64748B",
  muted: "#94A3B8",
  purple: "#7C3AED",
  orange: "#F97316",
  green: "#22C55E",
  blue: "#3B82F6",
  red: "#EF4444",
  card: "#FFFFFF",
  purpleTint: "rgba(124,58,237,0.1)",
};

export const BG_GRADIENT = ["#E9F1FE", "#F4F4FB", "#FDF3F8"] as const;
export const GOAL_GRADIENT = ["#F43F6E", "#9333EA"] as const;

export const STEP_LENGTH_M = 0.762; // avg stride for distance estimate

// Soft card shadow reused across screens.
export const cardShadow = {
  shadowColor: "#1E293B",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;
