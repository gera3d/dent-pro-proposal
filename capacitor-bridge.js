(function () {

    // Evaluated lazily on each call so Capacitor is guaranteed to be ready
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

    async function postToNative(pluginName, action, args) {
        try {
            // Capacitor 7 plugins are Proxy objects — don't check typeof, just call
            const plugins = window.Capacitor && window.Capacitor.Plugins;
            if (plugins && plugins[pluginName] && typeof plugins[pluginName][action] === 'function') {
                return await plugins[pluginName][action](args || {});
            }
            // Fallback: raw WKWebView message handler
            if (pluginName === 'DentCameraBridge') {
                const handler = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.dentCameraBridge;
                if (handler) {
                    handler.postMessage({ action: action });
                    return true;
                }
            }
        } catch (err) {
            console.warn('Native bridge call failed:', action, err);
        }
        return false;
    }

    window.DentNative = {
        // Lazy getter — re-evaluated every call, never stale
        get isNativeWrapper() { return isNativeWrapper(); },
        startVolumeShutter: function () { return postToNative('DentCameraBridge', 'startVolumeShutter'); },
        stopVolumeShutter:  function () { return postToNative('DentCameraBridge', 'stopVolumeShutter'); },
        persistDrivePhoto: function (payload) { return postToNative('DentDriveUpload', 'persistPhoto', payload); },
        deleteDriveFiles: function (payload) { return postToNative('DentDriveUpload', 'deleteFiles', payload); },
        uploadDriveBatch: function (payload) { return postToNative('DentDriveUpload', 'uploadBatch', payload); },
        emitVolumeShutter:  function () {
            window.dispatchEvent(new CustomEvent('dent:native-volume-shutter'));
        }
    };

})();
