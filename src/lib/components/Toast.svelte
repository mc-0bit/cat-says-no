<script lang="ts">
    import type { Page } from '@/types/api-response';
    import Results from './Results.svelte';

    let { data, close, injectStyle = false }: { data: Page[]; close: () => void; injectStyle?: boolean } = $props();

    let pages = $derived($state.snapshot(data).sort((p1, p2) => p1.title.localeCompare(p2.title)));

    onMount(() => {
        if (injectStyle) {
            // overwrite collapsible height
            styleElement!.innerHTML += /* css */ `
            .collapse:is([open], :focus:not(.collapse-close)) > .collapse-content,
            .collapse:not(.collapse-close) > :where(input:is([type='checkbox'], [type='radio']):checked ~ .collapse-content) {
                min-height: 50% !important;
                max-height: 60vh !important;
            }`;
        }
    });

    let styleElement: HTMLStyleElement;
</script>

<div class="z-[999]">
    <Results {pages} {close}></Results>
    <br />
</div>
