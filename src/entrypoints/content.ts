import Toast from '@/lib/components/Toast.svelte';
import { mount, unmount } from 'svelte';
import '~/assets/styles.css';
import { onMessage } from 'webext-bridge/content-script';

export default defineContentScript({
    matches: ['*://*/*'],
    main() {
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
