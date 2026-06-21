package expo.modules.stepcounter

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Foreground service that keeps the process alive so the hardware step counter
 * is read continuously — even with the app backgrounded or the screen off.
 */
class StepCounterService : Service(), SensorEventListener {

  companion object {
    const val ACTION_STEP_UPDATE = "expo.modules.stepcounter.STEP_UPDATE"
    const val EXTRA_STEPS = "steps"
    const val EXTRA_DATE = "date"

    private const val CHANNEL_ID = "walk_tracker_steps"
    private const val NOTIF_ID = 4815

    @Volatile
    var isRunning = false
      private set
  }

  private var sensorManager: SensorManager? = null
  private var stepSensor: Sensor? = null

  override fun onCreate() {
    super.onCreate()
    createChannel()
    startForegroundWithNotif(StepStore.getTodaySteps(this))

    sensorManager = getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    stepSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
    stepSensor?.let {
      sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
    }
    isRunning = true
  }

  // Restart if the OS kills us for memory; onCreate re-registers the listener.
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int =
    START_STICKY

  override fun onSensorChanged(event: SensorEvent?) {
    val cumulative = event?.values?.firstOrNull() ?: return
    val steps = StepStore.update(this, cumulative)
    updateNotification(steps)

    sendBroadcast(
      Intent(ACTION_STEP_UPDATE).apply {
        setPackage(packageName)
        putExtra(EXTRA_STEPS, steps)
        putExtra(EXTRA_DATE, StepStore.today())
      }
    )
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

  override fun onDestroy() {
    sensorManager?.unregisterListener(this)
    isRunning = false
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val mgr = getSystemService(NotificationManager::class.java)
      if (mgr.getNotificationChannel(CHANNEL_ID) == null) {
        mgr.createNotificationChannel(
          NotificationChannel(
            CHANNEL_ID,
            "Step tracking",
            NotificationManager.IMPORTANCE_LOW
          ).apply { description = "Keeps counting your steps in the background" }
        )
      }
    }
  }

  private fun buildNotification(steps: Int): Notification {
    val pi = packageManager.getLaunchIntentForPackage(packageName)?.let {
      PendingIntent.getActivity(
        this, 0, it,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Walk Tracker")
      .setContentText("$steps steps today — keep walking 👟")
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setContentIntent(pi)
      .build()
  }

  private fun startForegroundWithNotif(steps: Int) {
    val notif = buildNotification(steps)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIF_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH)
    } else {
      startForeground(NOTIF_ID, notif)
    }
  }

  private fun updateNotification(steps: Int) {
    getSystemService(NotificationManager::class.java)
      .notify(NOTIF_ID, buildNotification(steps))
  }
}
