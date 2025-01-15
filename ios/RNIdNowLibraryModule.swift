import ExpoModulesCore
import UIKit
import IDNowSDKCore
import React


public class RNIdNowLibraryModule: Module {
    var message = ""
  public func definition() -> ModuleDefinition {
    Name("RNIdNowLibrary")
      Function("startIdent") { (token: String) -> String in
        DispatchQueue.main.async {
            let currentViewController = RCTPresentedViewController()
    
            IDNowSDK.shared.start(token: token, fromViewController: currentViewController!, listener:{[weak self] (result: IDNowSDK.IdentResult.type, statusCode: IDNowSDK.IdentResult.statusCode, message: String) in
                print ("SDK finished")
                if result == .ERROR {
                    let localMessage = NSLocalizedString("idnow.platform.error.generic", comment: "").replacingOccurrences(of: "{errorCode}", with: statusCode.description)
                    print(localMessage)
                    
                } else if result == .FINISHED {
                }
            })
        }
     return message
    }
  }
}
