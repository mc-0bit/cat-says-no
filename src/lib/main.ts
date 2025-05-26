import type { ApiQueryAllPagesParams } from 'types-mediawiki/api_params';
import { NAMESPACES } from '../data/namespaces';
import type { ApiResponse } from '../types/api-response';

const fetchNextPage = async (params: ApiQueryAllPagesParams) => {
    const response = await fetch(`https://consumerrights.wiki/api.php?${new URLSearchParams(params as Record<string, string>)}`);

    return (await response.json()) as Promise<ApiResponse>;
};

export const main = async () => {
    const paramsV2: ApiQueryAllPagesParams = {
        action: 'query',
        list: 'allpages',
        format: 'json',
        formatversion: 'latest',
        wrappedhtml: '0',
        aplimit: 'max',
        continue: '-||',
    };

    const params = {
        action: 'query',
        format: 'json',
        list: 'allpages',
        formatversion: '2',
        aplimit: 'max',
        wrappedhtml: '0',
        apnamespace: NAMESPACES['Category'],
        apfilterredir: 'nonredirects',
    };

    /*const response = await fetch(`https://consumerrights.wiki/api.php?${new URLSearchParams(params)}`);

    const result: ApiResponse = await response.json();

    console.log(result.query.allpages[0]);*/

    let result = await fetchNextPage(params);
    const results = [...result.query.allpages];
    while (result.continue?.apcontinue !== undefined) {
        result = await fetchNextPage({ ...params, apcontinue: result.continue.apcontinue, continue: result.continue.continue });
        results.push(...result.query.allpages);
    }

    return results;

    //fs.writeFileSync('categories.json', JSON.stringify(results, undefined, 4));
    //console.log('Done!');
};
