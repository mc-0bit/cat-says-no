async function collectMetadata({ url, document }: { url: string; document: Document }) {
    const urlObject = new URL(url);
    const shopDomains = ['amazon.com', 'amazon.de'];

    const checkIfShopifyStore = (document: Document) => {
        if ([...document.querySelectorAll('script')].some((script) => script.innerHTML.includes('window.Shopify = window.Shopify || {};'))) {
            return true;
        }
    };

    const getShop = (url: URL, document: Document) => {
        if (shopDomains.includes(url.hostname)) {
            return shopDomains.find((domain) => url.hostname.endsWith(domain));
        }

        if (checkIfShopifyStore(document)) {
            return 'shopify';
        }
    };

    const checkIfProductPage = (url: URL, document: Document) => {
        if (url.pathname.includes('/products/') || url.pathname.includes('/product/')) {
            return true;
        }

        return false;
    };

    const getVendor = async (url: URL, document: Document, shop?: string) => {
        if (shop === 'shopify') {
            const endpoint = url.origin + url.pathname + '.json';

            const response = await fetch(endpoint);
            const data = await response.json();
            return data?.product?.vendor;
        }
    };

    const getProductName = async (url: URL, document: Document, shop?: string) => {
        if (shop === 'shopify') {
            const endpoint = url.origin + url.pathname + '.json';

            const response = await fetch(endpoint);
            const data = await response.json();
            return data?.product?.title;
        }
    };

    const shop = getShop(urlObject, document);
    const isProductPage = shop ? checkIfProductPage(urlObject, document) : false;
    const vendor = isProductPage ? await getVendor(urlObject, document, shop) : undefined;
    const productName = isProductPage ? await getProductName(urlObject, document, shop) : undefined;

    return { shop, isProductPage, vendor, productName, custom: {} };
}

(globalThis as any).collectMetadata = collectMetadata;
