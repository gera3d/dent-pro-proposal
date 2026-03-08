(function () {
    function isNativeWrapper() {
        try {
            if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
                return window.Capacitor.isNativePlatform();
            }
        } catch (err) {
            console.warn('Capacitor detection failed:', err);
        }

        return !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.dentCameraBridge);
    }

    async function postToNative(action) {
        try {
            const plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.DentCameraBridge;
            if (plugin && typeof plugin[action] === 'function') {
                await plugin[action]();
                return true;
            }

            const handler = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.dentCameraBridge;
            if (handler && typeof handler.postMessage === 'function') {
                handler.postMessage({ action: action });
                return true;
            }
        } catch (err) {
            console.warn('Native bridge call failed:', action, err);
        }

        return false;
    }

    window.DentNative = window.DentNative || {
        isNativeWrapper: isNativeWrapper(),
        startVolumeShutter: function () {
            return postToNative('startVolumeShutter');
        },
        stopVolumeShutter: function () {
            return postToNative('stopVolumeShutter');
        },
        emitVolumeShutter: function () {
            window.dispatchEvent(new CustomEvent('dent:native-volume-shutter'));
        }
    };
})();