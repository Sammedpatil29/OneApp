package io.ionic.oneapp;

import com.getcapacitor.BridgeActivity;
import com.cashfree.capacitor.CFBridge;

import com.ionicframework.capacitor.Checkout;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends BridgeActivity {
 @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(CFBridge.class);
    registerPlugin(Checkout.class);
  }
}
