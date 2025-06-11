import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { createRollupLicensePlugin } from './scripts/util/licenses';
import fs from 'fs-extra';
import 'dotenv/config';

let isDevBuild = false;

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-svelte'],
    manifest: (config) => {
        if (config.browser === 'chrome') {
            return {
                permissions: ['scripting', 'activeTab', 'storage', 'alarms', 'notifications', 'webNavigation', 'tabs', 'userScripts'],
                host_permissions: ['<all_urls>'],
            };
        } else if (config.browser === 'firefox') {
            return {
                permissions: ['scripting', 'activeTab', 'storage', 'alarms', 'notifications', 'webNavigation', 'tabs'],
                host_permissions: ['<all_urls>'],
                optional_permissions: ['userScripts'],
            };
        } else {
            throw new Error('Unsupported browser');
        }
    },
    webExt: {
        openConsole: true,
        openDevtools: true,
        chromiumArgs: ['--auto-open-devtools-for-tabs', '--accept-lang=en-GB', '--lang=en_US'],
        binaries: {
            chrome: process.env.CHROME_PATH ?? '',
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
