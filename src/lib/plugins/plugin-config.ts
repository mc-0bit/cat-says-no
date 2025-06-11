import { z } from 'zod/v4';
import { verifySignature } from '../helpers/crypto';

z.config({ jitless: true });

export const pluginConfigSchema = z.object({
    /**
     * Unique identifier for the plugin
     */
    id: z.uuidv4(),
    /**
     * Plugin name
     */
    name: z.string().trim(),
    /**
     * Plugin description
     */
    description: z.string().trim(),
    /**
     * Type of plugin
     */
    type: z.enum(['dataprovider', 'metadata', 'search']),

    /**
     * Author name
     */
    author: z.string().trim(),
    /**
     * Author URL
     */
    authorUrl: z.url().optional(),

    /**
     * Plugin config location
     */
    sourceUrl: z.url(),
    /**
     * Plugin source code URLs
     */
    scriptUrl: z.url(),
    /**
     * Repository URL
     */
    repositoryUrl: z.url().optional(),
    /**
     * Plugin version
     */
    version: z.number(),

    /**
     * Icon URL
     * TODO: maybe require b64 icons?
     */
    iconUrl: z.url(),
    /**
     * Plugin signature
     */
    pluginSignature: z.string(),
    /**
     * Plugin public key
     */
    pluginPublicKey: z.string(),

    /**
     * Domains where the plugin is active
     */
    allowDomains: z.array(z.string()).default(['*']),

    /**
     * Changelog
     */
    changelog: z.record(z.string(), z.array(z.string())),

    /**
     * Whether the plugin is active
     */
    active: z
        .boolean()
        .optional()
        .transform(() => false)
        .optional(),
});

export type PluginConfig = z.infer<typeof pluginConfigSchema>;

export function validatePluginConfig(config: unknown): PluginConfig {
    return pluginConfigSchema.parse(config) as PluginConfig;
}

export async function addPlugin(sourceUrl: string, active = false) {
    const urlSchema = z.url();
    const { success, data: url } = urlSchema.safeParse(sourceUrl);

    if (!success) {
        throw new Error('Invalid source URL');
    }

    const response = await fetch(url, {
        cache: 'no-cache',
    });
    const data = await response.json();

    const config = validatePluginConfig(data);

    if (config.type === 'dataprovider') {
        throw new Error('Data plugins are not supported yet');
    }

    config.active = active;

    const plugins = await pluginStorage.getValue();

    if (plugins.some((p) => p.id === config.id)) {
        throw new Error('Plugin already exists');
    }

    const script = await fetch(config.scriptUrl, {
        cache: 'no-cache',
    });
    const scriptData = await script.text();

    const validSignature = await verifySignature(scriptData, config.pluginSignature, config.pluginPublicKey);
    if (import.meta.env.DEV && !validSignature) {
        console.error('Invalid plugin signature of: ' + config.name);
    } else if (!validSignature) {
        throw new Error('Invalid plugin signature');
    }

    await pluginStorage.setValue([...plugins, config]);
    const pluginScripts = await pluginScriptStorage.getValue();
    await pluginScriptStorage.setValue({ ...pluginScripts, [config.id]: btoa(scriptData) });
}

export async function removePlugin(id: string) {
    const plugins = await pluginStorage.getValue();
    const newPlugins = plugins.filter((p) => p.id !== id);
    await pluginStorage.setValue(newPlugins);

    const pluginScripts = await pluginScriptStorage.getValue();
    const newPluginScripts = { ...pluginScripts };
    delete newPluginScripts[id];
    await pluginScriptStorage.setValue(newPluginScripts);
}

export async function updatePluginIfOutdated(id: string, active?: boolean) {
    const plugins = await pluginStorage.getValue();
    const plugin = plugins.find((p) => p.id === id);
    if (!plugin) return;

    const response = await fetch(plugin.sourceUrl, { cache: 'no-cache' });
    const data = await response.json();
    const config = validatePluginConfig(data);

    if (config.version <= plugin.version) {
        return;
    }

    config.active = active ?? plugin.active;

    const script = await fetch(config.scriptUrl, { cache: 'no-cache' });
    const scriptData = await script.text();

    const validSignature = await verifySignature(scriptData, config.pluginSignature, config.pluginPublicKey);
    if (import.meta.env.DEV && !validSignature) {
        console.error('Invalid plugin signature of: ' + config.name);
    } else if (!validSignature) {
        throw new Error('Invalid plugin signature');
    }

    const pluginScripts = await pluginScriptStorage.getValue();
    await pluginScriptStorage.setValue({ ...pluginScripts, [config.id]: btoa(scriptData) });
    await pluginStorage.setValue(plugins.map((p) => (p.id === id ? config : p)));

    return true;
}
