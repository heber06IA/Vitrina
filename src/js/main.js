/*
 * Entry point. `npm run build:js` bundles this file and its imports into assets/js/main.js
 * (a classic script, so the pages also open straight from disk without a server).
 * Edit the sources in src/js/, never the generated bundle.
 */
import { initCatalogFilters } from './features/catalog-filters.js';
import { initDemoForms } from './features/demo-forms.js';
import {
  initFavorites,
  initFileSummaries,
  initGalleries,
  initNavigation,
  initSteppers,
  initTabs,
} from './features/ui.js';
import { initAccountPage, initHeaderAccount } from './marketplace/account.js';
import { initAuthForms } from './marketplace/auth-forms.js';
import { renderCommunity } from './marketplace/community.js';
import { initSellerPage } from './marketplace/seller.js';

document.documentElement.classList.add('js');

initNavigation();
initGalleries();
initSteppers();
initFavorites();
initCatalogFilters();
initTabs();
initFileSummaries();
initDemoForms();

initAuthForms();
initSellerPage();
initAccountPage();
initHeaderAccount();
renderCommunity();
