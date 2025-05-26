import { ProtocolWithReturn } from 'webext-bridge';
import { AllPage } from './api-response';

declare module 'webext-bridge' {
    export interface ProtocolMap {
        'settings:open': undefined;
        'settings:data': { excludedDomains: string[]; plugins: PluginConfig[] };
        'plugin:execute:search': ProtocolWithReturn<
            { pluginId: string; url: string; data: AllPage[]; metadata: MetaData; linkedom: string; code: string },
            AllPage[]
        >;
        'plugin:execute:metadata': ProtocolWithReturn<{ pluginId: string; url: string; linkedom: string; code: string }, MetaData>;
        'toast:show': AllPage[];
        'tab:open': string;
    }
}

declare global {
    interface Window {
        search: (params: SearchPluginParams) => AllPage[];
    }
}

declare module 'esbuild-plugin-license' {
    import { Plugin } from 'esbuild';
    interface LicensePluginOptions {
        thirdParty?: {
            output?: string;
            includePrivate?: boolean;
            allow?: string[];
            deny?: string[];
        };
    }
    export function licensePlugin(options?: LicensePluginOptions): Plugin;
}
