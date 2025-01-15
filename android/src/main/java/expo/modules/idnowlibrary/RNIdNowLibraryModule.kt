package expo.modules.idnowlibrary


import android.content.Context
import android.content.Intent
import de.idnow.core.IDnowConfig
import de.idnow.core.IDnowSDK
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition


class RNIdNowLibraryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RNIdNowLibrary")
    Function("startIdent") { token: String ->
      print("token")

      val context: Context? = appContext.reactContext?.applicationContext
      val intent = Intent(context, IDNowStartActivity::class.java)
      intent.putExtra("token", token)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context?.startActivity(intent)
      return@Function "system"

    }
  }
}