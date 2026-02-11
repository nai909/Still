import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure audio session for playback
        configureAudioSession()

        // Observe audio interruptions (phone calls, Siri, etc.)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAudioInterruption),
            name: AVAudioSession.interruptionNotification,
            object: AVAudioSession.sharedInstance()
        )

        // Observe route changes (headphones, bluetooth, etc.)
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRouteChange),
            name: AVAudioSession.routeChangeNotification,
            object: AVAudioSession.sharedInstance()
        )

        return true
    }

    private func configureAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            // Use .playback for media apps - allows audio to continue and mix properly
            try audioSession.setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try audioSession.setActive(true)
            print("[Audio] Session configured and activated")
        } catch {
            print("[Audio] Failed to configure audio session: \(error)")
        }
    }

    @objc private func handleAudioInterruption(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
            return
        }

        switch type {
        case .began:
            print("[Audio] Interruption began")
            // Audio was interrupted (phone call, Siri, etc.)

        case .ended:
            print("[Audio] Interruption ended")
            // Check if we should resume
            if let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt {
                let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
                if options.contains(.shouldResume) {
                    // Reactivate audio session
                    configureAudioSession()
                }
            } else {
                // Always try to reactivate on interruption end
                configureAudioSession()
            }

        @unknown default:
            break
        }
    }

    @objc private func handleRouteChange(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else {
            return
        }

        switch reason {
        case .oldDeviceUnavailable:
            print("[Audio] Route change: old device unavailable (headphones unplugged?)")
            // Reactivate audio session when headphones are unplugged
            configureAudioSession()

        case .newDeviceAvailable:
            print("[Audio] Route change: new device available")

        case .categoryChange:
            print("[Audio] Route change: category changed")
            // Another app may have changed audio category, reconfigure ours
            configureAudioSession()

        default:
            break
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // App is about to become inactive
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // App entered background
        print("[Audio] App entering background")
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // App returning from background - reactivate audio session
        print("[Audio] App entering foreground - reactivating audio session")
        configureAudioSession()
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // App became active - ensure audio session is active
        print("[Audio] App became active - ensuring audio session is active")
        configureAudioSession()

        // Notify the WebView to reinitialize audio
        // Small delay to ensure WebView is ready
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.notifyWebViewAudioReactivated()
        }
    }

    private func notifyWebViewAudioReactivated() {
        // Find the Capacitor WebView and execute JS to reinit audio
        guard let window = self.window,
              let rootViewController = window.rootViewController as? CAPBridgeViewController else {
            return
        }

        let js = """
        (function() {
            console.log('[Native] Audio session reactivated - triggering JS reinit');
            window.dispatchEvent(new CustomEvent('nativeAudioReactivated'));
        })();
        """

        rootViewController.bridge?.webView?.evaluateJavaScript(js) { result, error in
            if let error = error {
                print("[Audio] Failed to notify WebView: \(error)")
            } else {
                print("[Audio] WebView notified to reinit audio")
            }
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Clean up observers
        NotificationCenter.default.removeObserver(self)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
