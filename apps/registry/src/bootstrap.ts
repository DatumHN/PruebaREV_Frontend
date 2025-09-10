import { bootstrapApplication } from '@angular/platform-browser';
import { PRIME_NG_CONFIG } from 'primeng/config';

import { appConfig } from './app/app.config';
import { RemoteEntry } from './app/remote-entry/entry';

bootstrapApplication(RemoteEntry, appConfig)
  .then((appRef) => {
    const primengConfig: any = appRef.injector.get(PRIME_NG_CONFIG);

    primengConfig.unstyled = true;
  })
  .catch((err) => console.error(err));
