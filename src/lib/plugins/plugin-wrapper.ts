import { Page } from '@/types/api-response';
import { updatePluginIfOutdated, PluginConfig } from './plugin-config';
import { MetaData } from './types';
import { fetchAllPages } from '../client';
import { NAMESPACES } from '@/data/namespaces';
import merge from 'deepmerge';
import { executePluginCode } from '../helpers/execute-plugin-code';

export class BasePluginWrapper {
    private readonly config: PluginConfig;
    protected readonly script: string;

    constructor(config: PluginConfig, script: string) {
        this.config = config;
        this.script = script;
    }

    get id() {
        return this.config.id;
    }

    get active() {
        return this.config.active;
    }

    get name() {
        return this.config.name;
    }
}

export type SearchParams = {
    url: string;
    activeTab: number;
    data: Page[];
    metadata: MetaData;
    linkedom: string;
};

export class SearchPluginWrapper extends BasePluginWrapper {
    readonly type = 'search';
    constructor({ config, script }: { config: PluginConfig; script: string }) {
        super(config, script);
    }

    async search({ url, activeTab, metadata, data, linkedom }: SearchParams) {
        const searchResult = await executePluginCode({ type: 'search', url, activeTab, metadata, data, linkedom, code: this.script, pluginId: this.id });
        return searchResult as Page[];
    }
}

export class SiteMetaDataPluginWrapper extends BasePluginWrapper {
    readonly type = 'metadata';
    constructor({ config, script }: { config: PluginConfig; script: string }) {
        super(config, script);
    }

    async collectMetadata({ url, activeTab, linkedom }: { url: string; activeTab: number; linkedom: string }) {
        const metadataResults = await executePluginCode({ type: 'metadata', url, activeTab, linkedom, code: this.script, pluginId: this.id });
        return metadataResults as MetaData;
    }
}

export class DataProviderPluginWrapper extends BasePluginWrapper {
    readonly type = 'dataprovider';
    constructor({ config, script }: { config: PluginConfig; script: string }) {
        super(config, script);
    }

    async load() {
        const results: Page[] = [];
        return results;
    }
}

class DataStore {
    readonly data: Page[] = [];
    constructor() {}

    get(id: number | string) {
        return this.data.find((p) => p.pageid.toString() === id.toString());
    }

    getAll() {
        return this.data;
    }

    add(page: Page) {
        if (this.data.some((p) => p.pageid === page.pageid)) {
            console.warn(`Page ${page.pageid} already exists in data store, ignoring...`);
            return;
        }
        this.data.push(page);
    }

    addMany(pages: Page[]) {
        for (const page of pages) {
            this.add(page);
        }
    }
}

type PluginWrapper = SearchPluginWrapper | SiteMetaDataPluginWrapper;

export class PluginWrapperHandler {
    plugins: PluginWrapper[] = [];
    readonly options: { checkForUpdatesOnStart?: boolean };
    readonly dataStore = new DataStore();
    private linkedom: string = '';

    constructor(plugins: PluginConfig[], pluginScripts: Record<string, string>, options: { checkForUpdatesOnStart?: boolean } = {}) {
        this.options = options;
        for (const plugin of plugins) {
            switch (plugin.type) {
                case 'search': {
                    this.plugins.push(new SearchPluginWrapper({ config: plugin, script: pluginScripts[plugin.id] }));

                    break;
                }
                case 'metadata': {
                    this.plugins.push(new SiteMetaDataPluginWrapper({ config: plugin, script: pluginScripts[plugin.id] }));

                    break;
                }
                case 'dataprovider': {
                    this.plugins.push(new SiteMetaDataPluginWrapper({ config: plugin, script: pluginScripts[plugin.id] }));

                    break;
                }
                default: {
                    console.error(`Unknown plugin type: ${plugin.type}`);
                }
            }
        }

        pluginStorage.watch((plugins) => {
            this.plugins = plugins
                .map((p) => {
                    if (p.type === 'search') {
                        return new SearchPluginWrapper({ config: p, script: pluginScripts[p.id] });
                    } else if (p.type === 'metadata') {
                        return new SiteMetaDataPluginWrapper({ config: p, script: pluginScripts[p.id] });
                    } else {
                        console.error(`Unknown plugin type: ${p.type}`);
                        return undefined;
                    }
                })
                .filter((p) => p !== undefined);
        });
    }

    async init() {
        // check for updates and data updates, if enabled
        // maybe handle this in a better way at some point since allSettled might block for too long if the server is down/slow to respond
        if (this.options.checkForUpdatesOnStart) {
            await Promise.allSettled(this.plugins.map((plugin) => updatePluginIfOutdated(plugin.id, plugin.active)));
        }

        /* see TODOs for why this is disabled
        // load data from cache or remote
        for (const plugin of this.plugins.filter((plugin) => plugin.type === 'dataprovider')) {
            try {
                let data = await storage.getItem<Page[]>(`local:data:${plugin.id}`);
                if (data) {
                    this.dataStore.addMany(data);
                    continue;
                }

                data = await plugin.load();
                this.dataStore.addMany(data);
                await storage.setItem(`local:data:${plugin.id}`, data);
            } catch (error) {
                console.error(`Error loading plugin data from plugin: ${plugin.name}`, error);
            }
        }
        */

        const { lastUpdated } = await dataStorage.getMeta();
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

        if (!lastUpdated || lastUpdated < Date.now() - SEVEN_DAYS) {
            const pages = await fetchAllPages(NAMESPACES.Main);
            this.dataStore.addMany(pages);
            await dataStorage.setValue(pages);
            await dataStorage.setMeta({ lastUpdated: Date.now() });
        } else {
            const pages = await dataStorage.getValue();
            this.dataStore.addMany(pages);
        }

        const linkedomUrl = await browser.runtime.getURL('/linkedom-bundle.js');
        const res = await fetch(linkedomUrl);
        this.linkedom = await res.text();
    }

    async search({ url, metadata, activeTab }: { url: string; metadata: MetaData; activeTab: number }) {
        const results: Page[] = [];
        const searchPlugins = this.plugins.filter((plugin) => plugin.type === 'search').filter((plugin) => plugin.active);

        const promiseResult = await Promise.allSettled(
            searchPlugins.map((plugin) => plugin.search({ url, metadata, data: this.dataStore.getAll(), activeTab, linkedom: this.linkedom })),
        );

        for (const result of promiseResult) {
            if (result.status === 'fulfilled') {
                results.push(...(result.value as Page[]));
            } else {
                console.error(result.reason);
            }
        }

        return results.filter((result, index, self) => self.findIndex((r) => r.pageid === result.pageid) === index);
    }

    async collectMetadata(url: string, activeTab: number) {
        const results: MetaData = {};
        for (const plugin of this.plugins.filter((plugin) => plugin.type === 'metadata').filter((plugin) => plugin.active)) {
            const result = await plugin.collectMetadata({
                url,
                activeTab,
                linkedom: this.linkedom,
            });

            for (const key in result) {
                if (key === 'custom') {
                    results[key] = merge(results[key] as Record<string, unknown>, result[key] as Record<string, unknown>);
                }
                if (results[key as keyof MetaData]) {
                    console.warn(`${key} already set to ${results[key as keyof MetaData]}, ignoring...`);
                } else {
                    results[key as keyof MetaData] = result[key as keyof MetaData] as any;
                }
            }
        }

        return results;
    }
}
