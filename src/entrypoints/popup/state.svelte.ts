import { AllPage } from '@/types/api-response';

export const props = $state<{ data: AllPage[]; domain?: string }>({ data: [], domain: '' });
