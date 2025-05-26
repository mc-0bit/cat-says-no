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

export interface AllPage {
    // Define the shape of individual page objects here based on their properties
    // For example:
    pageid: number; // Just an example, replace with actual property names
    title: string; // Replace with actual property names
    ns: number;
    category?: string;
}

interface Query {
    allpages: AllPage[]; // Array of page objects
}

export interface ApiResponse {
    warnings: Warnings;
    batchcomplete: boolean;
    continue: Continue;
    limits: Limits;
    query: Query;
}
