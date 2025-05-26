import type { PluginConfig } from '@/lib/plugins/plugin-config';

export default {
    id: 'ca72f219-a2a3-4f77-8481-99771f6ec323',
    type: 'metadata',
    author: 'John Meta',
    allowDomains: [],
    changelog: {},
    description: 'Default metadata plugin',
    iconUrl: 'http://192.168.178.21:8080',
    name: 'Metadata Plugin',
    pluginPublicKey: 'publicKey',
    pluginSignature: 'signature',
    version: 1,
    scriptUrl: 'http://192.168.178.21:8080/dist/bundle.js',
    sourceUrl: 'http://192.168.178.21:8080/dist/config.json',
    authorUrl: 'http://192.168.178.21:8080',
    repositoryUrl: 'http://192.168.178.21:8080',
} satisfies PluginConfig;
