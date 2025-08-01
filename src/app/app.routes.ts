import { Routes } from '@angular/router';
import { ROUTE_PATHS, ROUTER_LINKS } from '../routes.model';
import { authGuard } from './core/guards/auth-guard/auth-guard';
import { GroupCreate } from './pages/group-create/group-create';
import { GroupDetail } from './pages/group-detail/group-detail';
import { GroupEdit } from './pages/group-edit/group-edit';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.ROOT,
    redirectTo: ROUTER_LINKS.DASHBOARD,
    pathMatch: 'full',
  },
  {
    path: ROUTE_PATHS.LOGIN,
    loadComponent: () =>
      import('./pages/login/login').then(
        (m: typeof import('./pages/login/login')) => m.Login,
      ),
  },
  {
    path: ROUTE_PATHS.REGISTER,
    loadComponent: () =>
      import('./pages/register/register').then(
        (m: typeof import('./pages/register/register')) => m.Register,
      ),
  },

  {
    path: ROUTE_PATHS.DASHBOARD,
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(
        (m: typeof import('./pages/dashboard/dashboard')) => m.Dashboard,
      ),
    canActivate: [authGuard],
  },
  {
    path: ROUTE_PATHS.GROUPS,
    component: GroupCreate,
    title: 'Create Group',
  },
  {
    path: ROUTE_PATHS.GROUP_DETAIL,
    component: GroupDetail,
    title: 'Group Details',
  },
  {
    path: ROUTE_PATHS.GROUP_EDIT,
    component: GroupEdit,
    title: 'Edit Group',
  },
];
