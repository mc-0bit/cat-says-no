import { NAMESPACES } from '@/data/namespaces';
import { ApiResponse } from '@/types/api-response';

const defaultParams = {
    action: 'query',
    list: 'allpages',
    format: 'json',
    formatversion: 'latest',
    wrappedhtml: '0',
    aplimit: 'max',
    continue: '-||',
    apfilterredir: 'nonredirects',
};

export const fetchNextPage = async (namespace: (typeof NAMESPACES)[keyof typeof NAMESPACES], params: { apcontinue?: string; continue?: string } = {}) => {
    const response = await fetch(
        `https://consumerrights.wiki/api.php?${new URLSearchParams({ ...defaultParams, ...params, apnamespace: namespace.toString() })}`,
    );

    return (await response.json()) as Promise<ApiResponse>;
};

export const fetchAllPages = async (namespace: (typeof NAMESPACES)[keyof typeof NAMESPACES]) => {
    let result = await fetchNextPage(namespace);
    const results = [...result.query.allpages];
    while (result.continue?.apcontinue !== undefined) {
        result = await fetchNextPage(namespace, { apcontinue: result.continue.apcontinue, continue: result.continue.continue });
        results.push(...result.query.allpages);
    }

    return results;
};
