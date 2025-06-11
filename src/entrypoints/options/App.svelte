<script lang="ts">
    import { pluginStore, PREFERENCES, settingStore } from '@/utils/storage';
    import { addPlugin, removePlugin } from '@/lib/plugins/plugin-config';
    import { z } from 'zod/v4-mini';
    import { excludeDomain, getDomainName, removeDomainExclusion } from '@/lib/helpers/domain';
    import CodeBlock from '@/lib/components/CodeBlock.svelte';

    const urlSchema = z.url();

    async function addPluginHandler() {
        error = null;
        try {
            const url = urlSchema.parse(sourceUrl);
            await addPlugin(sourceUrl);
        } catch (e) {
            error = (e as Error).message;
        }
    }

    async function removePluginHandler(id: string) {
        await removePlugin(id);
    }

    async function excludeDomainHandler() {
        const domain = domainInput.value.trim();
        if (!checkDomainValidity(domain)) return;
        error = null;
        try {
            const excluded = await excludeDomain(domain);
            if (excluded) {
                domainInput.value = '';
                domainInput.setCustomValidity('');
            } else {
                error = 'Domain is already excluded';
            }
        } catch (e) {
            error = (e as Error).message;
        }
    }

    let error = $state<string | null>(null);
    let sourceUrl = $state('');

    function checkDomainValidity(value: string) {
        if (value === '') {
            domainInput.setCustomValidity('');
            return false;
        }

        const domainName = getDomainName(value);
        if (!domainName) {
            domainInput.setCustomValidity('Must be valid Domain');
            return false;
        }

        domainInput.setCustomValidity('');
        return true;
    }

    let domainInput: HTMLInputElement;
    onMount(() => {
        domainInput.oninput = () => {
            checkDomainValidity(domainInput.value.trim());
        };
    });
</script>

<main class="flex w-full items-center">
    <div class="max-w-2xl mx-auto my-8 w-full">
        <div>
            <h2 class="text-2xl font-bold pb-2">Plugins</h2>
            <ul class="list bg-base-100 rounded-box shadow-md">
                {#each $pluginStore as plugin}
                    <li class="list-row">
                        <div><img class="size-10 rounded-box" src={plugin.iconUrl} alt={plugin.name} /></div>
                        <div>
                            <div class="text-base">{plugin.name}</div>
                            <div class="text-xs uppercase font-semibold opacity-60">{plugin.author}</div>
                        </div>
                        <div class="list-col-wrap text-xs">
                            <span> {plugin.description} </span>
                        </div>
                        <div class="!col-start-3 !row-start-2 text-xs flex items-end">
                            <p>Version: {plugin.version}</p>
                        </div>

                        <div class="gap-4">
                            <input type="checkbox" bind:checked={plugin.active} class="toggle" />

                            <button class="btn btn-square btn-ghost" onclick={() => removePluginHandler(plugin.id)} aria-label="Remove plugin">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-[1.2em]"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                </svg>
                            </button>
                        </div>

                        <details class="collapse bg-base-100 border-base-300 border !col-start-1 !row-start-3 col-span-3">
                            <summary class="collapse-title font-semibold">Config</summary>
                            <div class="collapse-content text-sm">
                                <CodeBlock code={JSON.stringify(plugin, null, 2)} lang="js" />
                            </div>
                        </details>
                    </li>
                {/each}
            </ul>
            <div class="join mt-8 w-full">
                <div class="w-full">
                    <label class="input validator join-item w-full">
                        <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </g>
                        </svg>
                        <input type="url" required placeholder="https://plugin.url/config.json" bind:value={sourceUrl} title="Must be valid URL" />
                    </label>
                    <p class="validator-hint">Must be valid URL</p>
                </div>
                <button class="btn join-item" onclick={addPluginHandler}>Add plugin</button>
            </div>
        </div>
        <p style="color: red">{error || ''}</p>

        <h2 class="text-2xl font-bold pb-2">Excluded Domains</h2>
        <div style="display: flex; flex-direction: column; gap: 10px">
            <ul class="list gap-2">
                {#each $settingStore.excludedDomains as domain}
                    <li class="bg-base-100 border-base-300 border rounded-box flex justify-between items-center">
                        <div class="font-semibold ml-4">{domain}</div>
                        <button class="btn btn-square btn-ghost" onclick={() => removeDomainExclusion(domain)} aria-label="Remove excluded domain">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-[1.2em]"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                            </svg>
                        </button>
                    </li>
                {/each}
            </ul>

            <div class="join w-full">
                <div class="w-full">
                    <label class="input validator join-item w-full">
                        <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </g>
                        </svg>
                        <input type="text" placeholder="consumerrights.wiki" bind:this={domainInput} title="Must be valid Domain" />
                    </label>
                    <p class="validator-hint">Must be valid Domain</p>
                </div>
                <button class="btn join-item" onclick={excludeDomainHandler}>Exclude Domain</button>
            </div>
        </div>

        <div>
            <h2 class="text-2xl font-bold pb-2">Preferences</h2>
            <ul class="list bg-base-100 rounded-box shadow-md">
                {#each Object.entries(PREFERENCES) as [key, preference]}
                    <li class="list-row items-center">
                        <div>
                            {#if preference.type === 'toggle'}
                                <div class="flex gap-4 items-center">
                                    <span class="text-sm font-semibold">{preference.label}:</span>
                                    <input
                                        type="checkbox"
                                        class="toggle"
                                        bind:checked={$settingStore.preferences[key as keyof typeof PREFERENCES] as boolean}
                                    />
                                </div>
                                {#if preference.description}
                                    <div class="text-sm opacity-60 mt-2">{preference.description}</div>
                                {/if}
                            {:else if preference.type === 'select'}
                                <div class="flex gap-4 items-center">
                                    <span class="text-sm font-semibold">{preference.label}:</span>
                                    <select
                                        class="select select-none hover:cursor-pointer"
                                        bind:value={$settingStore.preferences[key as keyof typeof PREFERENCES]}
                                    >
                                        {#each preference.options as option}
                                            <option class="capitalize" value={option.value}>{option.label}</option>
                                        {/each}
                                    </select>
                                </div>
                                {#if preference.description}
                                    <div class="text-sm opacity-60 mt-2">{preference.description}</div>
                                {/if}
                            {/if}
                        </div>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
</main>

<style>
</style>
