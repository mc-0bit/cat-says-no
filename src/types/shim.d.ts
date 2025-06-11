import { ProtocolWithReturn } from 'webext-bridge';
import { Page } from './api-response';

declare module 'webext-bridge' {
    export interface ProtocolMap {
        'toast:show': Page[];
        'tab:open': string;
    }
}

declare global {
    interface Window {
        search: (params: SearchPluginParams) => Page[];
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
