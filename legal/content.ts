// Single source of truth for the in-app About / Privacy text. The hostable
// legal/privacy-policy.html mirrors the privacy content for the Play Store URL.

export type LegalBlock = { heading?: string; body: string };

export const SUPPORT_EMAIL = "amitanand1212@gmail.com";
export const APP_NAME = "Walk Tracker";
export const PRIVACY_UPDATED = "Last updated: 25 June 2026";

export const ABOUT_TITLE = "About Walk Tracker";
export const ABOUT_BLOCKS: LegalBlock[] = [
  {
    body:
      "Walk Tracker helps you stay active by counting your daily steps and turning them into distance, calories, active time, daily-goal progress, and history.",
  },
  {
    heading: "How it works",
    body:
      "The app reads your phone's built-in step-counter sensor. With the live step counter on, a foreground service keeps counting even when the app is closed, and shows an ongoing notification with your steps, calories, and distance.",
  },
  {
    heading: "Your data",
    body:
      "Everything stays on your device. There is no account, no sign-in, and nothing is uploaded. You can clear your data anytime from Settings → Reset progress, or by uninstalling the app.",
  },
  {
    heading: "Contact",
    body: `Questions or feedback? Email ${SUPPORT_EMAIL}.`,
  },
];

export const PRIVACY_TITLE = "Privacy Policy";
export const PRIVACY_BLOCKS: LegalBlock[] = [
  {
    heading: "Overview",
    body:
      "Walk Tracker (“the app”, “we”) respects your privacy. This policy explains what data the app uses and how. By using the app you agree to this policy.",
  },
  {
    heading: "Data we use",
    body:
      "The app uses your device's physical-activity / motion sensor (step counter) to count your steps. From your step count it calculates distance, calories, and active time. This information is stored only on your device, is never transmitted to us or any third party, and is not linked to your identity (the app has no account or login).",
  },
  {
    heading: "Permissions we request",
    body:
      "• Physical activity (Activity Recognition): to count steps using the device's step sensor.\n• Notifications: to show an ongoing notification while the live step counter is on.\n• Foreground service: to keep counting steps while the app is in the background.",
  },
  {
    heading: "Advertising",
    body:
      "The app shows ads provided by Google AdMob. To serve ads, AdMob may collect device and usage information, including your device's advertising identifier (Advertising ID), as described in Google's privacy policy (https://policies.google.com/privacy). Your step data is never shared for advertising. You can reset or limit your Advertising ID in your device settings.",
  },
  {
    heading: "Data sharing",
    body:
      "We do not sell your data. Apart from the advertising data handled by Google AdMob (described above), the app contains no analytics and no other third-party SDKs that collect data. Your step, distance, and activity data stays on your device.",
  },
  {
    heading: "Data retention & deletion",
    body:
      "All data is stored locally on your device. You can delete it anytime from Settings → Reset progress, or by uninstalling the app, which removes all stored data.",
  },
  {
    heading: "Children's privacy",
    body:
      "The app is not directed at children and does not knowingly collect any data from children.",
  },
  {
    heading: "Changes to this policy",
    body:
      "We may update this policy from time to time. Material changes will be reflected here with a new “last updated” date.",
  },
  {
    heading: "Contact",
    body: `If you have any questions about this policy, contact us at ${SUPPORT_EMAIL}.`,
  },
];
