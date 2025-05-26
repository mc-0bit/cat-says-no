/*! cat-says-no v0.0.0 |  */
'use strict';
(() => {
    async function D({ url: d, document: e }) {
        let s = new URL(d),
            r = ['amazon.com', 'amazon.de'],
            u = (t) => {
                if ([...t.querySelectorAll('script')].some((n) => n.innerHTML.includes('window.Shopify = window.Shopify || {};'))) return !0;
            },
            p = (t, n) => {
                if (r.includes(t.hostname)) return r.find((o) => t.hostname.endsWith(o));
                if (u(n)) return 'shopify';
            },
            m = (t, n) => !!(t.pathname.includes('/products/') || t.pathname.includes('/product/')),
            f = async (t, n, o) => {
                if (o === 'shopify') {
                    let i = t.origin + t.pathname + '.json';
                    return (await (await fetch(i)).json())?.product?.vendor;
                }
            },
            h = async (t, n, o) => {
                if (o === 'shopify') {
                    let i = t.origin + t.pathname + '.json';
                    return (await (await fetch(i)).json())?.product?.title;
                }
            },
            c = p(s, e),
            a = c ? m(s, e) : !1,
            l = a ? await f(s, e, c) : void 0,
            y = a ? await h(s, e, c) : void 0;
        return { shop: c, isProductPage: a, vendor: l, productName: y, custom: {} };
    }
    globalThis.collectMetadata = D;
})();
