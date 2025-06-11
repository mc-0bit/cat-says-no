import type { PluginConfig } from '@/lib/plugins/plugin-config';
import { Page } from '@/types/api-response';
import { writable } from 'svelte/store';
import type { StorageItemKey } from 'wxt/utils/storage';

export const dataStorage = storage.defineItem<Page[], { lastUpdated: number }>('local:data', {
    fallback: [],
    init: () => [],
});

export const excludedDomainStorage = storage.defineItem<string[]>('local:excludedDomains', {
    fallback: [],
    init: () => [],
});

export const dismissedNotificationStorage = storage.defineItem<string[]>('local:dismissedNotifications', {
    fallback: [],
    init: () => [],
});

export const pluginStorage = storage.defineItem<PluginConfig[]>('local:plugins', {
    fallback: [],
    init: () => [],
});

export const pluginScriptStorage = storage.defineItem<Record<string, string>>('local:pluginScripts', {
    fallback: {},
    init: () => {
        return {};
    },
});

function createStore<T, TMetadata extends Record<string, unknown> = Record<string, unknown>>(value: T, storageKey: StorageItemKey, metadata?: TMetadata) {
    const { subscribe, set } = writable(value);

    const storageItem = storage.defineItem<T, TMetadata>(storageKey, {
        fallback: value,
    });

    if (metadata) {
        storageItem.setMeta(metadata);
    }

    storageItem.getValue().then(set);

    storageItem.watch(set);

    return {
        subscribe,
        set: (value: T) => {
            storageItem.setValue(value);
        },
        storageItem,
    };
}

export const PREFERENCES: Record<
    keyof Settings['preferences'],
    { label: string; description?: string } & (
        | { type: 'select'; default: string; options: { value: string; label: string }[] }
        | { type: 'toggle'; default: boolean }
    )
> = {
    enabled: { type: 'toggle', default: true, label: 'Enable extension' },
    checkForPluginUpdatesOnStart: { type: 'toggle', default: true, label: 'Check for plugin updates on start' },
    showExtensionPopupNotification: { type: 'toggle', default: false, label: 'Show extension popup notification' },
    showPageNotification: { type: 'toggle', default: false, label: 'Show page notification' },
    notificationDissmissBehavior: {
        type: 'select',
        default: 'domain',
        options: [
            { value: 'domain', label: 'Domain' },
            { value: 'page', label: 'Page' },
        ],
        label: 'Dismiss behavior',
        description: 'If the user dismisses the notification, should it be ignored for the whole domain or just for the current page?',
    },
    notificationDissmissTimeBehavior: {
        type: 'select',
        default: 'forever',
        options: [
            { value: 'forever', label: 'Forever' },
            { value: 'session', label: 'Session' },
            { value: 'timed', label: 'Timed' },
            { value: 'once', label: 'Once' },
        ],
        label: 'Dismiss behavior',
        description: 'For how long should the page notification be ignored after being dismissed?',
    },
    notificationDissmissTime: {
        type: 'select',
        default: 'week',
        options: [
            { value: 'month', label: 'Month' },
            { value: 'week', label: 'Week' },
            { value: 'day', label: 'Day' },
        ],
        label: 'Dismiss Time',
        description: 'When `Dismiss behavior` is set to `Timed`, how long should the page notification be ignored after being dismissed?',
    },
};

export type Settings = {
    excludedDomains: string[];
    preferences: {
        enabled: boolean;
        showExtensionPopupNotification: boolean;
        showPageNotification: boolean;
        notificationDissmissBehavior: 'domain' | 'page';
        notificationDissmissTimeBehavior: 'forever' | 'session' | 'timed' | 'once';
        notificationDissmissTime: 'month' | 'week' | 'day';
        checkForPluginUpdatesOnStart: boolean;
    };
};

export const runtimeStore = createStore<{ currentDomain?: string; results: Page[] }>({ currentDomain: undefined, results: [] }, 'session:runtime');
export const settingStore = createStore<Settings>(
    {
        excludedDomains: [],
        preferences: Object.fromEntries(Object.entries(PREFERENCES).map(([key, value]) => [key, value.default])) as Settings['preferences'],
    },
    'local:settings',
);
export const pluginStore = createStore<PluginConfig[]>([], 'local:plugins');
export const articleStore = createStore<Record<number, { content: string; lastUpdated: number }>>({}, 'local:articles');
