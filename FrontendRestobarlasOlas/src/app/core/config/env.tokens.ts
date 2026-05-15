import { InjectionToken } from '@angular/core';

export interface EnvConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const ENV_CONFIG = new InjectionToken<EnvConfig>('ENV_CONFIG');

