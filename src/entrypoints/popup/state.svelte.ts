import { Page } from '@/types/api-response';

export const props = $state<{ data: Page[]; domain?: string }>({ data: [], domain: '' });
