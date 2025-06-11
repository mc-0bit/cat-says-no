import { Page } from '@/types/api-response';
import { PluginExecute } from '@/types/types';
import { MetaData } from '../plugins/types';

// ty copilot <3
function btoaUTF8(str: string) {
    // Create a new TextEncoder instance
    const encoder = new TextEncoder();
    // Encode the string to a Uint8Array
    const data = encoder.encode(str);
    // Convert the Uint8Array to a string
    let binaryString = '';
    for (const datum of data) {
        binaryString += String.fromCodePoint(datum);
    }
    // Use btoa to encode the binary string to Base64
    return btoa(binaryString);
}

export function executePluginCode(params: PluginExecute): Promise<Page[] | MetaData> {
    return new Promise((resolve) => {
        (async () => {
            const workerCode = btoa(
                /* JS */ `
                "use strict;"
                ${params.linkedom}
                self.onmessage = async function(event) {
                    const doc = globalThis.parseHTML(event.data.html).document
                    ${params.type === 'search' ? /* JS */ `postMessage(globalThis.search({ url: event.data.url, document: doc, data: event.data.data, metadata: event.data.metadata }))` : ''}
                    ${params.type === 'metadata' ? /* JS */ `postMessage(await globalThis.collectMetadata({ url: event.data.url, document: doc }))` : ''}
                };
                ` + atob(params.code),
            );

            let code = '';

            if (params.type === 'search') {
                code = /* JS */ `
                        new Promise((resolve) => {
                            (async () => {
                                const blob = new Blob([atob("${workerCode}")], { type: 'text/javascript' });
                                const worker = new Worker(URL.createObjectURL(blob), { type: 'classic' });

                                worker.addEventListener('message', (event) => {
                                    resolve(event.data);
                                    // Worker termination needed?
                                    worker.terminate();
                                });
                                
                                // hahahaha
                                const data = JSON.parse(atob('${btoaUTF8(JSON.stringify(params.data))}'))
                                const metadata = JSON.parse(atob('${btoaUTF8(JSON.stringify(params.metadata))}'))

                                worker.postMessage({ url: '${params.url}', html: document.documentElement.innerHTML, data, metadata });
                            })();
                        });
                    `;
            } else if (params.type === 'metadata') {
                code = /* JS */ `
                        new Promise((resolve) => {
                            (async () => {
                                const blob = new Blob([atob("${workerCode}")], { type: 'text/javascript' });
                                const worker = new Worker(URL.createObjectURL(blob), { type: 'classic' });

                                worker.addEventListener('message', (event) => {
                                    resolve(event.data);
                                    // Worker termination needed?
                                    worker.terminate();
                                });
                                
                                worker.postMessage({ url: '${params.url}', html: document.documentElement.innerHTML });
                            })();
                        });
                    `;
            }
            const result = await browser.userScripts.execute({
                js: [
                    {
                        code,
                    },
                ],
                target: {
                    tabId: params.activeTab,
                },
                injectImmediately: true,
                world: 'USER_SCRIPT',
            });

            const searchResult = result[0].result as Page[] | MetaData;
            resolve(searchResult);
        })();
    });
}
