import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { createRollupLicensePlugin } from './scripts/util/licenses';
import fs from 'fs-extra';

let isDevBuild = false;

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-svelte'],
    manifest: () => {
        return {
            permissions: ['scripting', 'activeTab', 'storage', 'alarms', 'notifications', 'webNavigation', 'tabs'],
            host_permissions: ['<all_urls>'],
        };
    },
    webExt: {
        openConsole: true,
        openDevtools: true,
        chromiumArgs: ['--auto-open-devtools-for-tabs', '--accept-lang=en-GB', '--lang=en_US'],
        binaries: {
            chrome: './chrome/win64-138.0.7204.4/chrome-win64/chrome.exe',
        },
    },
    hooks: {
        'vite:build:extendConfig': (entrypoints, viteConfig) => {
            if (isDevBuild) return;
            const licensePlugin = createRollupLicensePlugin(entrypoints[0].name);
            viteConfig.plugins?.push(licensePlugin);
        },
        'build:before'(wtx) {
            isDevBuild = wtx.config.mode === 'development' ? true : false;
        },
        'build:done'() {
            if (isDevBuild) return;
            const licenses = [];
            for (const file of fs.readdirSync('./tmp/licenses')) {
                licenses.push(fs.readFileSync(`./tmp/licenses/${file}`));
            }

            const deduplicatedLicenses = new Set(licenses);

            fs.writeFileSync('./THIRD_PARTY_LICENSES.md', [...deduplicatedLicenses].join('\n\n'));
            fs.rmSync('./tmp/licenses', { recursive: true });
        },
    },
    publicDir: 'src/public',
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});
