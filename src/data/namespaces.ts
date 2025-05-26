export const namespaces_data = {
    '-2': {
        id: -2,
        case: 'first-letter',
        name: 'Media',
        subpages: false,
        canonical: 'Media',
        content: false,
        nonincludable: false,
    },
    '-1': {
        id: -1,
        case: 'first-letter',
        name: 'Special',
        subpages: false,
        canonical: 'Special',
        content: false,
        nonincludable: false,
    },
    '0': {
        id: 0,
        case: 'first-letter',
        name: 'Main',
        subpages: false,
        content: true,
        nonincludable: false,
    },
    '1': {
        id: 1,
        case: 'first-letter',
        name: 'Talk',
        subpages: true,
        canonical: 'Talk',
        content: false,
        nonincludable: false,
    },
    '2': {
        id: 2,
        case: 'first-letter',
        name: 'User',
        subpages: true,
        canonical: 'User',
        content: false,
        nonincludable: false,
    },
    '3': {
        id: 3,
        case: 'first-letter',
        name: 'User talk',
        subpages: true,
        canonical: 'User talk',
        content: false,
        nonincludable: false,
    },
    '4': {
        id: 4,
        case: 'first-letter',
        name: 'Consumer Action Taskforce',
        subpages: true,
        canonical: 'Project',
        content: false,
        nonincludable: false,
        namespaceprotection: 'edit-cat',
    },
    '5': {
        id: 5,
        case: 'first-letter',
        name: 'Consumer Action Taskforce talk',
        subpages: true,
        canonical: 'Project talk',
        content: false,
        nonincludable: false,
    },
    '6': {
        id: 6,
        case: 'first-letter',
        name: 'File',
        subpages: false,
        canonical: 'File',
        content: false,
        nonincludable: false,
    },
    '7': {
        id: 7,
        case: 'first-letter',
        name: 'File talk',
        subpages: true,
        canonical: 'File talk',
        content: false,
        nonincludable: false,
    },
    '8': {
        id: 8,
        case: 'first-letter',
        name: 'MediaWiki',
        subpages: true,
        canonical: 'MediaWiki',
        content: false,
        nonincludable: false,
        namespaceprotection: 'editinterface',
    },
    '9': {
        id: 9,
        case: 'first-letter',
        name: 'MediaWiki talk',
        subpages: true,
        canonical: 'MediaWiki talk',
        content: false,
        nonincludable: false,
    },
    '10': {
        id: 10,
        case: 'first-letter',
        name: 'Template',
        subpages: true,
        canonical: 'Template',
        content: false,
        nonincludable: false,
    },
    '11': {
        id: 11,
        case: 'first-letter',
        name: 'Template talk',
        subpages: true,
        canonical: 'Template talk',
        content: false,
        nonincludable: false,
    },
    '12': {
        id: 12,
        case: 'first-letter',
        name: 'Help',
        subpages: true,
        canonical: 'Help',
        content: false,
        nonincludable: false,
    },
    '13': {
        id: 13,
        case: 'first-letter',
        name: 'Help talk',
        subpages: true,
        canonical: 'Help talk',
        content: false,
        nonincludable: false,
    },
    '14': {
        id: 14,
        case: 'first-letter',
        name: 'Category',
        subpages: false,
        canonical: 'Category',
        content: false,
        nonincludable: false,
    },
    '15': {
        id: 15,
        case: 'first-letter',
        name: 'Category talk',
        subpages: true,
        canonical: 'Category talk',
        content: false,
        nonincludable: false,
    },
    '828': {
        id: 828,
        case: 'first-letter',
        name: 'Module',
        subpages: true,
        canonical: 'Module',
        content: false,
        nonincludable: false,
    },
    '829': {
        id: 829,
        case: 'first-letter',
        name: 'Module talk',
        subpages: true,
        canonical: 'Module talk',
        content: false,
        nonincludable: false,
    },
} as const;

// This could be probably done better but i'll just take what copilot gives me since i'm tired (-_-)zzz

type NamespaceEnum = {
    [K in keyof typeof namespaces_data as (typeof namespaces_data)[K]['name']]: K;
};

function createNamespaceEnum(data: typeof namespaces_data): NamespaceEnum {
    const result = {
        Category: '14',
    } as NamespaceEnum;

    for (const key in data) {
        // @ts-ignore
        result[data[key].name] = key;
    }

    return result;
}

export const NAMESPACES = createNamespaceEnum(namespaces_data);
