import Capacitor
import WebKit

class ViewController: CAPBridgeViewController {
    #if DEBUG
    private struct CodexLaunchConfiguration {
        var mode: String?
        var recordId: String?
        var base64Script: String?
    }

    private var codexLaunchConfiguration: CodexLaunchConfiguration? {
        let arguments = ProcessInfo.processInfo.arguments
        var config = CodexLaunchConfiguration()

        if arguments.contains("--codex-open-parts") {
            config.mode = "parts"
        }
        if arguments.contains("--codex-open-records") {
            config.mode = "records"
        }
        if let recordFlagIndex = arguments.firstIndex(of: "--codex-open-part-record"),
           arguments.indices.contains(recordFlagIndex + 1) {
            config.recordId = arguments[recordFlagIndex + 1]
        }
        if let scriptFlagIndex = arguments.firstIndex(of: "--codex-js-base64"),
           arguments.indices.contains(scriptFlagIndex + 1) {
            config.base64Script = arguments[scriptFlagIndex + 1]
        }

        if config.mode == nil, config.recordId == nil, config.base64Script == nil {
            return nil
        }
        return config
    }
    #endif

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(DentCameraBridgePlugin())
        bridge?.registerPluginInstance(DentDriveUploadPlugin())
        guard let webView = bridge?.webView else { return }

        webView.backgroundColor = .black
        webView.isOpaque = false

        let scrollView = webView.scrollView
        scrollView.backgroundColor = .black
        scrollView.contentInsetAdjustmentBehavior = .never
        scrollView.keyboardDismissMode = .interactive
        // Let the scroll view resolve scroll intent before forwarding touches into the web content.
        scrollView.delaysContentTouches = true
        scrollView.canCancelContentTouches = true
        if #available(iOS 13.0, *) {
            scrollView.automaticallyAdjustsScrollIndicatorInsets = false
        }

        #if DEBUG
        if let codexLaunchConfiguration {
            runCodexLaunchConfiguration(codexLaunchConfiguration, in: webView)
        }
        #endif
    }

    #if DEBUG
    private func runCodexLaunchConfiguration(_ config: CodexLaunchConfiguration, in webView: WKWebView) {
        let readinessChecks = [
            config.mode != nil ? "typeof switchMode === 'function'" : nil,
            config.recordId != nil ? "typeof openPartDetail === 'function'" : nil
        ].compactMap { $0 }.joined(separator: " && ")
        let modeScript = config.mode.map { mode in
            "if (typeof switchMode === 'function') { switchMode('\(mode)'); }"
        } ?? ""
        let recordScript = config.recordId.map { recordId in
            "if (typeof openPartDetail === 'function') { openPartDetail('\(recordId)'); }"
        } ?? ""
        let customScript = config.base64Script.flatMap { encoded in
            guard let decodedData = Data(base64Encoded: encoded),
                  let decodedScript = String(data: decodedData, encoding: .utf8) else {
                return nil
            }
            return decodedScript
        } ?? ""

        let script = """
        (() => {
            if (typeof document === 'undefined') return false;
            if (\(readinessChecks.isEmpty ? "true" : readinessChecks) !== true) return false;
            \(modeScript)
            \(recordScript)
            \(customScript)
            return true;
        })();
        """

        func attempt(remaining: Int) {
            guard remaining > 0 else { return }
            webView.evaluateJavaScript(script) { result, _ in
                if let opened = result as? Bool, opened {
                    return
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                    attempt(remaining: remaining - 1)
                }
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            attempt(remaining: 20)
        }
    }
    #endif
}
