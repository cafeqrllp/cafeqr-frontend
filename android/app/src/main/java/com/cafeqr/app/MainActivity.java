package com.cafeqr.app;

import android.content.Intent;
import android.content.IntentSender;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.cafeqr.app.DevicePrinterPlugin;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;
import com.google.android.play.core.tasks.Task;

public class MainActivity extends BridgeActivity {
  private static final String TAG = "CafeQR";
  private static final int UPDATE_REQUEST_CODE = 9001;
  private AppUpdateManager appUpdateManager;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(DevicePrinterPlugin.class);
    super.onCreate(savedInstanceState);

    // Check for Play Store updates on app launch
    checkForAppUpdate();
  }

  /**
   * Checks Google Play for a newer version of the app.
   * If an update is available, shows a full-screen IMMEDIATE update dialog
   * that the user cannot dismiss — they must update before using the app.
   */
  private void checkForAppUpdate() {
    appUpdateManager = AppUpdateManagerFactory.create(this);
    Task<AppUpdateInfo> appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();

    appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
      if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
          && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
        Log.i(TAG, "Play Store update available! Launching immediate update flow.");
        try {
          appUpdateManager.startUpdateFlowForResult(
              appUpdateInfo,
              AppUpdateType.IMMEDIATE,
              this,
              UPDATE_REQUEST_CODE);
        } catch (IntentSender.SendIntentException e) {
          Log.e(TAG, "Failed to start app update flow", e);
        }
      } else {
        Log.i(TAG, "No Play Store update available (or update type not allowed).");
      }
    });

    appUpdateInfoTask.addOnFailureListener(e -> {
      // This is normal for debug builds or sideloaded APKs not from the Play Store
      Log.w(TAG, "App update check failed (expected for debug/sideloaded builds): " + e.getMessage());
    });
  }

  /**
   * If the user returns to the app while an immediate update was in progress
   * (e.g. they switched apps during download), resume the update flow so they
   * cannot bypass it.
   */
  @Override
  protected void onResume() {
    super.onResume();
    if (appUpdateManager != null) {
      appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
        if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
          Log.i(TAG, "Update was in progress, resuming immediate update flow.");
          try {
            appUpdateManager.startUpdateFlowForResult(
                appUpdateInfo,
                AppUpdateType.IMMEDIATE,
                this,
                UPDATE_REQUEST_CODE);
          } catch (IntentSender.SendIntentException e) {
            Log.e(TAG, "Failed to resume app update flow", e);
          }
        }
      });
    }
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == UPDATE_REQUEST_CODE) {
      if (resultCode != RESULT_OK) {
        // User cancelled or update failed — re-check to block them again
        Log.w(TAG, "Update flow cancelled or failed (resultCode=" + resultCode + "). Re-checking.");
        checkForAppUpdate();
      }
    }
  }
}
