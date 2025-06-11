interface Warnings {
    main: {
        warnings: string;
    };
}

interface Continue {
    apcontinue: string;
    continue: string;
}

interface Limits {
    allpages: number;
}

export interface Page {
    pageid: number;
    title: string;
    ns: number;
    category?: string;
}

interface Query {
    allpages: Page[];
}

export interface ApiResponse {
    warnings: Warnings;
    batchcomplete: boolean;
    continue: Continue;
    limits: Limits;
    query: Query;
}
