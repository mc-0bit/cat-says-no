<script module>
    import DOMPurify from 'dompurify';
    import { createHighlighterCoreSync } from 'shiki/core';
    import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
    // Themes
    // https://shiki.style/themes
    import themeDarkPlus from 'shiki/themes/dark-plus.mjs';
    // Languages
    // https://shiki.style/languages
    import console from 'shiki/langs/console.mjs';
    import html from 'shiki/langs/html.mjs';
    import css from 'shiki/langs/css.mjs';
    import js from 'shiki/langs/javascript.mjs';

    // https://shiki.style/guide/sync-usage
    const shiki = createHighlighterCoreSync({
        engine: createJavaScriptRegexEngine(),
        // Implement your import theme.
        themes: [themeDarkPlus],
        // Implement your imported and supported languages.
        langs: [console, html, css, js],
    });
</script>

<script lang="ts">
    interface CodeBlockProps {
        code?: string;
        lang?: 'console' | 'html' | 'css' | 'js';
        theme?: 'dark-plus';
        // Base Style Props
        base?: string;
        rounded?: string;
        shadow?: string;
        classes?: string;
        // Pre Style Props
        preBase?: string;
        prePadding?: string;
        preClasses?: string;
    }

    let {
        code = '',
        lang = 'console',
        theme = 'dark-plus',
        // Base Style Props
        base = ' overflow-hidden',
        rounded = 'rounded-container',
        shadow = '',
        classes = '',
        // Pre Style Props
        preBase = '',
        prePadding = '[&>pre]:p-4',
        preClasses = '',
    }: CodeBlockProps = $props();

    // Shiki convert to HTML
    const generatedHtml = shiki.codeToHtml(code, { lang, theme });
    const cleanHtml = DOMPurify.sanitize(generatedHtml);
</script>

<div class="{base} {rounded} {shadow} {classes} {preBase} {prePadding} {preClasses}">
    <!-- Output Shiki's Generated HTML -->
    {@html cleanHtml}
</div>
