import { Page } from '@/types/api-response';

export type MetaData = {
    shop?: string;
    isProductPage?: boolean;
    vendor?: string;
    productName?: string;
    custom?: Record<string, unknown>;
};

export type SearchPluginParams = { url: string; document: Document; data: Page[]; metadata: MetaData };
