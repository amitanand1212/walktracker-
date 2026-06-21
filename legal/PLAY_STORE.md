# Google Play submission — privacy & data checklist

Everything Play Store needs around privacy/data for **Walk Tracker**, plus the
exact answers to give. The app stores everything **on-device only** (no account,
no network, no analytics, no ads), which keeps all of this simple.

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

Because all step/activity data is **processed and stored only on the device** and
never leaves it, under Google's definitions this is **not "collection" or
"sharing"**.

Recommended answers:
- **Does your app collect or share any of the required user data types?** → **No**
  - Rationale: data is only on-device, never transmitted off the device.
- **Does your app use encryption in transit?** → N/A (no data leaves the device).
- **Do you provide a way for users to request data deletion?** → **Yes** — in-app
  Settings → Reset progress (and uninstalling removes all data).

> ⚠️ If you ever add analytics, crash reporting, ads, cloud sync, or any network
> call that sends user/device data off the device, you MUST revisit this form.

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
- **Content rating:** complete the questionnaire → expect **Everyone** (no ads,
  no user-generated content, no data collection).
- **Target audience:** 13+ (the app is not directed at children).
- **Ads:** declare **No ads**.
- **App access:** all features available without special access/login.

---

## 5. In-app (already implemented)

- Settings → **About Walk Tracker** and **Privacy Policy** open in-app pages.
- Text lives in `legal/content.ts` and matches `legal/privacy-policy.html`.

Keep the in-app text, the hosted HTML, and the Data safety form **consistent** —
if you change one, change all three.
