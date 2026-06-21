package expo.modules.stepcounter

import android.content.Context
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Persists the day's step count derived from the hardware step counter.
 *
 * TYPE_STEP_COUNTER reports the cumulative number of steps since the device
 * last booted. We keep a per-day baseline so we can report "steps today", and
 * handle the two edge cases that break a naive diff:
 *   - midnight rollover  -> start a fresh baseline for the new day
 *   - device reboot      -> the hardware counter resets to 0, so we rebase
 */
object StepStore {
  private const val PREFS = "walk_tracker_step_counter"
  private const val KEY_DATE = "date"
  private const val KEY_STEPS = "steps"
  private const val KEY_BASELINE = "baseline"
  private const val KEY_LAST = "last_cumulative"

  fun today(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())

  private fun prefs(ctx: Context) =
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun getTodaySteps(ctx: Context): Int {
    val p = prefs(ctx)
    return if (p.getString(KEY_DATE, null) == today()) p.getInt(KEY_STEPS, 0) else 0
  }

  @Synchronized
  fun update(ctx: Context, cumulative: Float): Int {
    val p = prefs(ctx)
    val today = today()

    if (p.getString(KEY_DATE, null) != today) {
      // New day (or very first reading): count from the current total.
      p.edit()
        .putString(KEY_DATE, today)
        .putFloat(KEY_BASELINE, cumulative)
        .putFloat(KEY_LAST, cumulative)
        .putInt(KEY_STEPS, 0)
        .apply()
      return 0
    }

    var baseline = p.getFloat(KEY_BASELINE, cumulative)
    val last = p.getFloat(KEY_LAST, cumulative)
    val prevSteps = p.getInt(KEY_STEPS, 0)

    // Reboot resets the sensor to 0; rebase so today's count keeps climbing.
    if (cumulative < last) {
      baseline = cumulative - prevSteps
    }

    val steps = (cumulative - baseline).toInt().coerceAtLeast(0)
    p.edit()
      .putFloat(KEY_BASELINE, baseline)
      .putFloat(KEY_LAST, cumulative)
      .putInt(KEY_STEPS, steps)
      .apply()
    return steps
  }
}
