import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { appConfig } from './app.config';
// Server config: on-demand rendering only (no static route extraction/pre-rendering)
// This avoids NG0401 errors during build
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};
export const config = mergeApplicationConfig(appConfig, serverConfig);
