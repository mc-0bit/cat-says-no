import type { PluginConfig } from '@/lib/plugins/plugin-config';

export default {
    id: 'c8763c59-251b-41f8-bb76-65cf54933d03',
    type: 'search',
    author: 'John Fuzzy',
    allowDomains: [],
    changelog: {},
    description: 'Default fuzzy search plugin',
    iconUrl: 'http://192.168.178.21:8080/dist/search-plugin-fuzzy/icon.png',
    name: 'Fuzzy Search Plugin',
    pluginPublicKey: 'publicKey',
    pluginSignature: 'signature',
    version: 1,
    scriptUrl: 'http://192.168.178.21:8080/dist/bundle.js',
    sourceUrl: 'http://192.168.178.21:8080/dist/config.json',
    authorUrl: 'http://192.168.178.21:8080',
    repositoryUrl: 'http://192.168.178.21:8080',
} satisfies PluginConfig;
