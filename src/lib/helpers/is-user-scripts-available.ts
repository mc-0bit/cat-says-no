export function isUserScriptsAvailable() {
    try {
        // Method call which throws if API permission or toggle is not enabled.
        browser.userScripts.getScripts();
        return true;
    } catch {
        // Not available.
        return false;
    }
}
