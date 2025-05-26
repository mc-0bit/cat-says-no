import Toast from '@/lib/components/Toast.svelte';
import { mount, unmount } from 'svelte';
import '~/assets/styles.css';
import { onMessage } from 'webext-bridge/content-script';
import { AllPage } from '@/types/api-response';
import { MetaData } from '@/lib/plugins/types';
import { PluginExecute } from '@/types/types';

function executeWorker(params: PluginExecute): Promise<AllPage[] | MetaData> {
    return new Promise((resolve) => {
        (async () => {
            const code =
                `
                "use strict;"
                ${params.linkedom}
                self.onmessage = async function(event) {
                    const doc = globalThis.parseHTML(event.data.html).document
                    ${
                        params.type === 'search'
                            ? 'postMessage(globalThis.search({ url: event.data.url, document: doc, data: event.data.data, metadata: event.data.metadata }));'
                            : ''
                    }
                    ${params.type === 'metadata' ? 'postMessage(await globalThis.collectMetadata({ url: event.data.url, document: doc }));' : ''}
                };
                ` + atob(params.code);

            const blob = new Blob([code], { type: 'text/javascript' });

            // TODO: read up of differences between classic and module
            // but we should use classic since I think type module might be blocked by csp in some cases
            const worker = new Worker(URL.createObjectURL(blob), { type: 'classic' });

            worker.addEventListener('message', (event) => {
                resolve(event.data);
                // Worker termination needed?
                worker.terminate();
            });

            if (params.type === 'search') {
                const { url, data, metadata } = params;
                worker.postMessage({ url, html: document.documentElement.innerHTML, data, metadata });
            } else if (params.type === 'metadata') {
                worker.postMessage({ url: params.url, html: document.documentElement.innerHTML });
            }
        })();
    });
}

export default defineContentScript({
    matches: ['*://*/*'],
    main() {
        onMessage('plugin:execute:search', async ({ data: { pluginId, url, data, metadata, linkedom, code } }) => {
            return (await executeWorker({ pluginId, url, data, metadata, type: 'search', linkedom, code })) as AllPage[];
        });

        onMessage('plugin:execute:metadata', async ({ data: { pluginId, url, linkedom, code } }) => {
            return (await executeWorker({ pluginId, url, type: 'metadata', linkedom, code })) as MetaData;
        });

        onMessage('toast:show', ({ data }) => {
            const toast = document.querySelector('.__CAT__-toast');
            if (toast) {
                toast.remove();
            }

            const root = document.createElement('div');
            const style = document.createElement('style');
            style.innerHTML =
                /* CSS */
                `.__CAT__-toast {
                position: fixed;
                top: 30px;
                right: 30px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                background-color: #fff;
                z-index: 1000;
            }`;

            root.append(style);
            root.classList.add('__CAT__-toast');

            document.body.append(root);

            const shadowRoot = root.attachShadow({ mode: 'open' });
            const container = document.createElement('div');
            shadowRoot.append(container);

            const app = mount(Toast, {
                target: shadowRoot,
                props: {
                    data,
                    injectStyle: true,
                    close: () => {
                        unmount(app);
                        root.remove();
                    },
                },
            });
        });
    },
});
