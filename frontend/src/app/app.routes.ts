import { Routes } from '@angular/router';

/**
 * Application routes configuration
 * Defines all routes for the file browser application
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/browse',
    pathMatch: 'full'
  },
  {
    path: 'browse',
    loadComponent: () => import('./file-browser/file-browser.component').then(m => m.FileBrowserComponent)
  },
  {
    path: 'browse/:path',
    loadComponent: () => import('./file-browser/file-browser.component').then(m => m.FileBrowserComponent)
  },
  {
    path: '**',
    redirectTo: '/browse'
  }
];
