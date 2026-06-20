# Walk Tracker

A simple Expo (React Native) walk/step tracker, built on the same config stack as hydroapp.

## Features
- **Auto step tracking** via the device pedometer (`expo-sensors`) — toggle on to count steps live
- Today's steps with an animated progress ring toward your daily goal
- Distance & calorie estimates
- Quick-add buttons (+100, +500, +1k, +2k) for manual logging
- Weekly bar chart (last 7 days)
- Adjustable daily goal
- Data persists locally via AsyncStorage (zustand store)

## Notes on the pedometer
- Needs a real device with a step sensor — the web/simulator reports "no sensor".
- iOS asks for **Motion** permission; Android asks for **Activity Recognition**.
- Live counting runs while the toggle is on and the app is open; it adds to (and
  combines with) any manual quick-adds for the day.

## Run
```bash
npm install
npm start        # then press a / i / w
```

## Structure
- `app/_layout.tsx` — root layout, fonts, store hydration
- `app/index.tsx` — the single home page
- `components/ProgressRing.tsx` — SVG progress ring
- `store/useWalkStore.ts` — zustand state + AsyncStorage persistence
