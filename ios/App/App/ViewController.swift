import Capacitor

class ViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
    }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(DentCameraBridgePlugin())
        bridge?.webView?.backgroundColor = .black
        bridge?.webView?.scrollView.backgroundColor = .black
    }
}
