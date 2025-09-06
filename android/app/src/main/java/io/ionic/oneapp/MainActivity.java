package io.ionic.oneapp;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.cashfree.capacitor.CFBridge;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

import com.ionicframework.capacitor.Checkout;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
 @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(CFBridge.class);
    registerPlugin(Checkout.class);

    createNotificationChannel();
  }

private void createNotificationChannel() {
        // Only run on Android 8.0+ (Oreo and up), as channels were introduced in API 26
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            String channelId = "default";
            CharSequence channelName = "Default Channel";
            String channelDescription = "Used for general app notifications";
            int importance = NotificationManager.IMPORTANCE_HIGH; // High priority

            NotificationChannel channel = new NotificationChannel(channelId, channelName, importance);
            channel.setDescription(channelDescription);
            channel.enableLights(true);
            channel.enableVibration(true);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

}
