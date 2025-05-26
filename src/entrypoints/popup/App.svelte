<script lang="ts">
    import Results from '@/lib/components/Results.svelte';
    import { excludeDomain, removeDomainExclusion } from '@/lib/helpers';
    import { settingStore } from '@/utils/storage';
    import { runtimeStore } from '@/utils/storage';

    let pages = $derived($runtimeStore.results.sort((p1, p2) => p1.title.localeCompare(p2.title)));
    let domain = $derived($runtimeStore.currentDomain);
</script>

<main class="w-md p-4">
    {#if domain}
        {#if !$settingStore.excludedDomains.includes(domain)}
            <Results {pages}></Results>
        {/if}
        <div class="card flex flex-col items-center">
            <div class="flex flex-col gap-2.5 mt-4">
                {#if $settingStore.excludedDomains.includes(domain)}
                    <p class="text-sm font-semibold">This domain is excluded from the results.</p>
                    <button
                        class="btn"
                        onclick={async () => {
                            await removeDomainExclusion(domain);
                        }}>Remove exclusion</button
                    >
                {:else}
                    <button
                        class="btn"
                        onclick={async () => {
                            await excludeDomain(domain);
                        }}>Exclude this domain</button
                    >
                {/if}
                <button class="btn" onclick={() => browser.runtime.openOptionsPage()}>Open Options</button>
            </div>
        </div>
    {/if}
</main>
