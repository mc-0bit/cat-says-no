import { MetaData } from '@/lib/plugins/types';
import { AllPage } from './api-response';

export type PluginExecute =
    | {
          type: 'search';
          pluginId: string;
          url: string;
          data: AllPage[];
          metadata: MetaData;
          linkedom: string;
          code: string;
      }
    | {
          type: 'metadata';
          pluginId: string;
          url: string;
          linkedom: string;
          code: string;
      };
