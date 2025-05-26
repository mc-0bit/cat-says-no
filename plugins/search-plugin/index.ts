import { SearchPluginParams } from '@/lib/plugins/types';
import psl from 'psl';

const search = ({ url, data, metadata }: SearchPluginParams) => {
    const urlObject = new URL(url);
    const parsed = psl.parse(urlObject.hostname);
    if (parsed.error) {
        console.error('parsed.error', parsed.error.message);
        return [];
    }
    const domain = parsed.sld!;
    const domainData = data.filter((page) => page.title.toLowerCase().includes(domain));
    const productNameData = metadata.productName ? data.filter((page) => page.title.toLowerCase().includes(metadata.productName!.toLowerCase())) : [];
    return [...domainData, ...productNameData];
};

(globalThis as any).search = search;
