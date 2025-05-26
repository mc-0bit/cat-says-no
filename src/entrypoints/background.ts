import { sendMessage, onMessage } from 'webext-bridge/background';
import { getDomainName, isDomainExcluded } from '@/lib/helpers';
import { PluginWrapperHandler } from '@/lib/plugins/plugin-wrapper';
import { addPlugin } from '@/lib/plugins/plugin-config';
import { get } from 'svelte/store';

export default defineBackground(() => {
    (async () => {
        const plugins = await pluginStorage.getValue();
        const pluginScripts = await pluginScriptStorage.getValue();

        if (plugins.length === 0) {
            await addPlugin('http://localhost:8080/dist/search-plugin/config.json', true);
            await addPlugin('http://localhost:8080/dist/search-plugin-fuzzy/config.json', false);
            await addPlugin('http://localhost:8080/dist/site-metadata-plugin/config.json', true);
            browser.runtime.reload();
        }

        const pluginWrapperHandler = new PluginWrapperHandler(plugins, pluginScripts, {
            checkForUpdatesOnStart: get(settingStore).preferences.checkForPluginUpdatesOnStart,
        });
        await pluginWrapperHandler.init();

        let activeTab = -1;

        const handleTab = async (tab: globalThis.Browser.tabs.Tab) => {
            if (!tab || !tab.url || tab.status !== 'complete' || !tab.id) return;

            const domain = getDomainName(tab.url);

            if (!domain || (await isDomainExcluded(domain))) {
                if (import.meta.env.MANIFEST_VERSION === 3) {
                    browser.action.setBadgeText({ text: '' });
                }
                runtimeStore.set({ currentDomain: domain, results: [] });
                return;
            }

            const metadata = await pluginWrapperHandler.collectMetadata(tab.url, tab.id);
            const result = await pluginWrapperHandler.search({ url: tab.url, metadata, activeTab: tab.id });

            console.log('result', result);

            runtimeStore.set({ currentDomain: domain, results: result });

            if (result.length > 0) {
                if (import.meta.env.MANIFEST_VERSION === 3) {
                    browser.action.setBadgeText({ text: result.length.toString() });
                }
                const preferences = get(settingStore).preferences;
                if (preferences.showExtensionPopupNotification) {
                    browser.action.openPopup();
                }
                if (preferences.showPageNotification) {
                    sendMessage('toast:show', result, 'content-script@' + activeTab);
                }
            } else {
                if (import.meta.env.MANIFEST_VERSION === 3) {
                    browser.action.setBadgeText({ text: '' });
                }
            }
        };

        browser.tabs.onActivated.addListener(async (activeInfo) => {
            activeTab = activeInfo.tabId;
            const tab = await browser.tabs.get(activeInfo.tabId);
            if (!tab || !tab.url || tab.status !== 'complete') return;
            handleTab(tab);
        });

        browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.status !== 'complete' || !tab.url) return;
            if (activeTab !== tabId) return;
            handleTab(tab);
        });

        onMessage('tab:open', ({ data: url }) => {
            browser.tabs.create({ url, active: false });
        });
    })();
});
