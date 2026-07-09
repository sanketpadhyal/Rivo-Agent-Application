package com.rivoapp

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ClipboardModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "RivoClipboard"

  @ReactMethod
  fun setString(value: String, promise: Promise) {
    try {
      val clipboard = reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      clipboard.setPrimaryClip(ClipData.newPlainText("Rivo", value))
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("RIVO_CLIPBOARD_FAILED", error)
    }
  }
}
