import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene,
               willConnectTo session: UISceneSession,
               options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        if window == nil {
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            let rootViewController = storyboard.instantiateInitialViewController() ?? ViewController()
            let window = UIWindow(windowScene: windowScene)
            window.rootViewController = rootViewController
            self.window = window
        }

        window?.makeKeyAndVisible()
    }
}
