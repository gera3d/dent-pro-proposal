import Foundation
import Capacitor
import AVFoundation
import MediaPlayer
import os.log

private let log = OSLog(subsystem: "com.dentexperts.scoper", category: "DentCameraBridge")

@objc(DentCameraBridge)
public class DentCameraBridgePlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "DentCameraBridgePlugin"
    public let jsName = "DentCameraBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startVolumeShutter", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopVolumeShutter",  returnType: CAPPluginReturnPromise)
    ]

    private static var volumeContext: UInt8 = 0
    private var isListening = false
    private var volumeView: MPVolumeView?
    private var lastFireTime: TimeInterval = 0
    private let debounceDuration: TimeInterval = 0.35

    // MARK: - Plugin Methods

    @objc func startVolumeShutter(_ call: CAPPluginCall) {
        os_log("startVolumeShutter called, isListening=%{public}d", log: log, type: .debug, isListening ? 1 : 0)
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            guard !self.isListening else {
                os_log("Already listening — resolving early", log: log, type: .debug)
                call.resolve()
                return
            }

            let session = AVAudioSession.sharedInstance()
            os_log("Current volume before setup: %{public}f", log: log, type: .debug, session.outputVolume)

            do {
                try session.setCategory(.ambient, options: .mixWithOthers)
                try session.setActive(true)
                os_log("AVAudioSession activated, category=ambient", log: log, type: .debug)
            } catch {
                os_log("AVAudioSession setup failed: %{public}@", log: log, type: .error, error.localizedDescription)
                call.reject("AVAudioSession setup failed: \(error.localizedDescription)")
                return
            }

            // Off-screen MPVolumeView suppresses system HUD
            let vv = MPVolumeView(frame: CGRect(x: -2000, y: -2000, width: 100, height: 100))
            vv.alpha = 1.0
            if let scene = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .first(where: { $0.activationState == .foregroundActive }),
               let window = scene.windows.first(where: { $0.isKeyWindow }) ?? scene.windows.first {
                window.addSubview(vv)
                os_log("MPVolumeView added to window", log: log, type: .debug)
            } else {
                os_log("No window found for MPVolumeView", log: log, type: .error)
            }
            self.volumeView = vv

            // Force layout so slider subview is created
            vv.layoutIfNeeded()

            // Preset volume to 0.5 so BOTH up and down buttons always trigger a change.
            // Without this, pressing Up at max-volume or Down at min-volume does nothing.
            if let slider = vv.subviews.compactMap({ $0 as? UISlider }).first {
                slider.value = 0.5
                os_log("Volume preset to 0.5 — both buttons armed", log: log, type: .debug)
            } else {
                os_log("MPVolumeView slider not found — subview count: %{public}d", log: log, type: .error, vv.subviews.count)
            }

            // Stamp lastFireTime to absorb the KVO triggered by our own volume-preset above.
            // The preset fires immediately; any button press >0.35 s later will pass the debounce.
            self.lastFireTime = Date().timeIntervalSinceReferenceDate

            // Register KVO after a short delay so the preset's KVO notification is fully settled.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                guard let self = self else { return }
                session.addObserver(
                    self,
                    forKeyPath: "outputVolume",
                    options: [.new, .old],
                    context: &DentCameraBridgePlugin.volumeContext
                )
                self.isListening = true
                os_log("KVO observer registered — volume buttons armed", log: log, type: .debug)
                call.resolve()
            }
        }
    }

    @objc func stopVolumeShutter(_ call: CAPPluginCall) {
        os_log("stopVolumeShutter called", log: log, type: .debug)
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.teardown()
            call.resolve()
        }
    }

    // MARK: - KVO

    public override func observeValue(
        forKeyPath keyPath: String?,
        of object: Any?,
        change: [NSKeyValueChangeKey: Any]?,
        context: UnsafeMutableRawPointer?
    ) {
        guard keyPath == "outputVolume", isListening else {
            super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
            return
        }

        let oldVol = change?[.oldKey] as? Float ?? 0
        let newVol = change?[.newKey] as? Float ?? 0
        os_log("outputVolume KVO: %{public}f -> %{public}f", log: log, type: .debug, oldVol, newVol)

        let now = Date().timeIntervalSinceReferenceDate
        guard (now - lastFireTime) >= debounceDuration else {
            os_log("Debounced (%.3f s since last fire) — skipping", log: log, type: .debug, now - lastFireTime)
            return
        }
        // Stamp lastFireTime BEFORE the volume-reset below.
        // The reset triggers its own KVO, which will be caught by the debounce (Δt < 0.35 s).
        lastFireTime = now

        os_log("Firing dent:native-volume-shutter", log: log, type: .debug)

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            // Reset volume to 0.5 immediately so the NEXT button press always works.
            // Because lastFireTime was stamped above, this reset's KVO will be debounced.
            if let slider = self.volumeView?.subviews.compactMap({ $0 as? UISlider }).first {
                slider.value = 0.5
                os_log("Volume reset to 0.5 after shutter", log: log, type: .debug)
            }

            // Dispatch CustomEvent directly — does not depend on window.DentNative being defined.
            let js = "window.dispatchEvent(new CustomEvent('dent:native-volume-shutter'));"
            self.webView?.evaluateJavaScript(js) { _, err in
                if let err = err {
                    os_log("evaluateJavaScript failed: %{public}@", log: log, type: .error, err.localizedDescription)
                } else {
                    os_log("dent:native-volume-shutter dispatched to JS", log: log, type: .debug)
                }
            }
        }
    }

    // MARK: - Teardown

    private func teardown() {
        guard isListening else { return }
        AVAudioSession.sharedInstance().removeObserver(
            self,
            forKeyPath: "outputVolume",
            context: &DentCameraBridgePlugin.volumeContext
        )
        volumeView?.removeFromSuperview()
        volumeView = nil
        isListening = false
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        os_log("Teardown complete", log: log, type: .debug)
    }

    deinit {
        if isListening {
            AVAudioSession.sharedInstance().removeObserver(
                self,
                forKeyPath: "outputVolume",
                context: &DentCameraBridgePlugin.volumeContext
            )
        }
    }
}
