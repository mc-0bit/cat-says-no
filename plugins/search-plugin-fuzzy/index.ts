import { SearchPluginParams } from '@/lib/plugins/types';
import Fuse from 'fuse.js';

const search = ({ data, metadata }: SearchPluginParams) => {
    const fuse = new Fuse(data, {
        keys: ['title'],
        threshold: 0.15,
    });
    const productResults = metadata.productName ? fuse.search(metadata.productName) : [];
    return productResults.map((result) => result.item);
};

(globalThis as any).search = search;
