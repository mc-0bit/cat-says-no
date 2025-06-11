import { MetaData } from '@/lib/plugins/types';
import { Page } from './api-response';

export type PluginExecute =
    | {
          type: 'search';
          pluginId: string;
          url: string;
          data: Page[];
          metadata: MetaData;
          linkedom: string;
          code: string;
          activeTab: number;
      }
    | {
          type: 'metadata';
          pluginId: string;
          url: string;
          linkedom: string;
          code: string;
          activeTab: number;
      };
