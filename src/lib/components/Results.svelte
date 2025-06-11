<script lang="ts">
    import type { Page } from '@/types/api-response';
    import { Readability } from '@mozilla/readability';
    import DOMPurify from 'dompurify';
    import { articleStore } from '@/utils/storage';
    import { sendMessage } from 'webext-bridge/popup';

    let { pages, close }: { pages: Page[]; close?: () => void } = $props();

    async function getArticle(pageId: number) {
        const article = $articleStore[pageId];
        if (article && article.lastUpdated > Date.now() - 7 * 24 * 60 * 60 * 1000) {
            return;
        }

        const url = `https://consumerrights.wiki/Special:Redirect/page/${pageId}`;

        const response = await fetch(url);
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const oldBase = doc.querySelector('base');
        if (oldBase) {
            oldBase.remove();
        }
        const base = doc.createElement('base');
        base.href = 'https://consumerrights.wiki/';
        doc.head.appendChild(base);

        doc.querySelectorAll('.mw-editsection').forEach((section) => {
            section.remove();
        });

        doc.querySelectorAll('a').forEach((a) => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });

        const readableArticle = new Readability(doc).parse();
        if (!readableArticle || !readableArticle.content) {
            $articleStore[pageId] = { content: '<p>No content found.</p>', lastUpdated: Date.now() };
            return;
        }

        const cleanHtml = DOMPurify.sanitize(readableArticle.content);
        $articleStore[pageId] = { content: readableArticle.content, lastUpdated: Date.now() };
    }

    onMount(() => {
        document.addEventListener('click', (event) => {
            if (event.target instanceof HTMLAnchorElement && event.target.tagName === 'A') {
                event.preventDefault();
                sendMessage('tab:open', event.target.href);
                return false;
            }
        });
    });
</script>

<div class={`${close ? 'max-h-[80vh] overflow-y-auto overflow-x-hidden max-w-xl p-6 pb-0' : ''}`}>
    <div class="flex justify-between bg-[#ffe4e4] rounded-box p-6 relative">
        <div>
            <span class="flex items-center gap-2">
                <span
                    ><svg class="size-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                </span>
                <h4 class="text-3xl font-bold mr-3">CAT alert</h4>
                <div class="badge">{pages.length} pages found</div>
            </span>
        </div>
        {#if close !== undefined}
            <button class="btn btn-neutral btn-circle absolute top-0 right-0 translate-x-1/4 -translate-y-1/4" onclick={close} aria-label="Close">
                <svg class="size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        {/if}
    </div>

    <ul class="list px-2">
        {#each pages as page}
            <li class="collapse border-base-300 border-b rounded-b-none">
                <input type="checkbox" class="group" onchange={() => getArticle(page.pageid)} />
                <div class="collapse-title font-semibold flex gap-6 items-center justify-between" style="padding-inline-end: 0;">
                    <span>{page.title}</span>
                    <a
                        href="https://consumerrights.wiki/Special:Redirect/page/{page.pageid}"
                        target="_blank"
                        class="hover:cursor-pointer hover:!text-blue-500 relative z-[9999]"
                        aria-label={page.title}
                        ><svg
                            aria-label="Open page in new tab"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-6"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                        </svg>
                    </a>
                </div>
                <div class="collapse-content overflow-y-auto prose prose-sm !max-w-full border-amber-400 border-y-2 bg-[#fffef3]">
                    {@html $articleStore[page.pageid]?.content || ''}
                </div>
            </li>
        {/each}
        <li></li>
    </ul>
</div>

<style>
</style>
