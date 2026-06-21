package expo.modules.stepcounter

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.Build
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class StepCounterModule : Module() {

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private var receiver: BroadcastReceiver? = null

  override fun definition() = ModuleDefinition {
    Name("StepCounter")

    Events("onStepUpdate")

    OnCreate {
      receiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context?, intent: Intent?) {
          sendEvent(
            "onStepUpdate",
            mapOf(
              "steps" to (intent?.getIntExtra(StepCounterService.EXTRA_STEPS, 0) ?: 0),
              "date" to (intent?.getStringExtra(StepCounterService.EXTRA_DATE) ?: "")
            )
          )
        }
      }
      val filter = IntentFilter(StepCounterService.ACTION_STEP_UPDATE)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
      } else {
        @Suppress("UnspecifiedRegisterReceiverFlag")
        context.registerReceiver(receiver, filter)
      }
    }

    OnDestroy {
      receiver?.let { runCatching { context.unregisterReceiver(it) } }
      receiver = null
    }

    Function("isAvailable") {
      val sm = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
      sm?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null
    }

    Function("isRunning") {
      StepCounterService.isRunning
    }

    AsyncFunction("getTodaySteps") {
      StepStore.getTodaySteps(context)
    }

    // Starting requires the ACTIVITY_RECOGNITION runtime permission, which JS
    // requests via PermissionsAndroid before calling this. We re-check here.
    AsyncFunction("start") { promise: Promise ->
      if (!hasActivityRecognition()) {
        promise.resolve(false)
        return@AsyncFunction
      }
      ContextCompat.startForegroundService(
        context, Intent(context, StepCounterService::class.java)
      )
      promise.resolve(true)
    }

    AsyncFunction("stop") { promise: Promise ->
      context.stopService(Intent(context, StepCounterService::class.java))
      promise.resolve(null)
    }
  }

  private fun hasActivityRecognition(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return true
    return ContextCompat.checkSelfPermission(
      context, Manifest.permission.ACTIVITY_RECOGNITION
    ) == PackageManager.PERMISSION_GRANTED
  }
}
