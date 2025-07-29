import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '../routes.model';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.ROOT,
    redirectTo: ROUTE_PATHS.LOGIN,
    pathMatch: 'full',
  },
  {
    path: ROUTE_PATHS.LOGIN,
    loadComponent: () =>
      import('./pages/login/login').then(
        (m: typeof import('./pages/login/login')) => m.Login,
      ),
  },
  // {
  // path: ROUTE_PATHS.REGISTER,
  // loadComponent: () =>
  //   import('./pages/register/register').then(
  //     (m: typeof import('./pages/register/register')) => m.Register,
  //   ),
  // },
];
