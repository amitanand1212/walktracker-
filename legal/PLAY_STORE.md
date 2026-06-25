# Google Play submission — privacy & data checklist

Everything Play Store needs around privacy/data for **Walk Tracker**, plus the
exact answers to give. All step/activity data stays **on-device only** (no
account, no network, no analytics). The app **does show Google AdMob banner
ads**, so the advertising answers below reflect that.

---

## 1. Privacy policy URL (required)

Play requires a **publicly reachable URL** because the app uses the sensitive
`ACTIVITY_RECOGNITION` permission. Host `legal/privacy-policy.html` and paste the
URL in **Play Console → App content → Privacy policy**.

Easiest free hosting options:
- **GitHub Pages**: push the repo, enable Pages, the file is served at
  `https://<user>.github.io/<repo>/legal/privacy-policy.html`.
- **Netlify / Vercel / Cloudflare Pages**: drag-drop the `legal/` folder.
- Any static host. The same text is shown in-app (Settings → Privacy Policy).

---

## 2. Data safety form (Play Console → App content → Data safety)

Step/activity data stays **only on the device**. But the app uses **Google
AdMob**, which collects the **Advertising ID** and some device/usage info to
serve ads — under Google's definitions this **is** collection + sharing.

Recommended answers:
- **Does your app collect or share any of the required user data types?** → **Yes**
  - Data type: **Device or other IDs** (Advertising ID), collected & shared by
    Google AdMob for **Advertising or marketing**.
  - Your step/distance/activity data is **not** collected (stays on-device).
- **Is data encrypted in transit?** → **Yes** (AdMob uses HTTPS).
- **Do you provide a way for users to request data deletion?** → **Yes** — in-app
  Settings → Reset progress (and uninstalling removes all on-device data).

> ⚠️ The AdMob plugin adds the `com.google.android.gms.permission.AD_ID`
> permission. In Play Console this triggers the **Advertising ID** declaration —
> answer that the app uses Advertising ID for **advertising**.
> If you later add analytics, crash reporting, or cloud sync, revisit this form.

---

## 3. Permissions declarations

In **Play Console → App content**, you may be asked to justify:

- **`ACTIVITY_RECOGNITION` (Physical activity)** — "Counts the user's steps using
  the device step-counter sensor. Used only on-device to show steps, distance,
  calories and goal progress."
- **Foreground service (`FOREGROUND_SERVICE_HEALTH`)** — Play has a *Foreground
  service* declaration. Use type **Health/Fitness** and justify: "Keeps counting
  the user's steps with a persistent notification while the app is backgrounded,
  so daily step tracking continues." Provide a short screen recording showing the
  ongoing notification (Play sometimes requests this).
- **`POST_NOTIFICATIONS`** — for the ongoing step-tracking notification.

---

## 4. Store listing essentials

- **App category:** Health & Fitness
- **Short description (≤80 chars):** "Count your daily steps, distance & calories — all kept private on your phone."
- **Full description:** see `ABOUT_BLOCKS` in `legal/content.ts` for accurate copy.
- **Content rating:** complete the questionnaire → answer **Yes** to "contains
  ads"; still expect around **Everyone / PEGI 3** for a simple step tracker.
- **Target audience:** 13+ (the app is not directed at children).
- **Ads:** declare **Contains ads = Yes** (Google AdMob banner).
- **App access:** all features available without special access/login.

---

## 5. In-app (already implemented)

- Settings → **About Walk Tracker** and **Privacy Policy** open in-app pages.
- Text lives in `legal/content.ts` and matches `legal/privacy-policy.html`.

Keep the in-app text, the hosted HTML, and the Data safety form **consistent** —
if you change one, change all three.
