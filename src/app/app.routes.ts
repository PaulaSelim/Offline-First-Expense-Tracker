import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '../routes.model';
import { GroupCreate } from './pages/group-create/group-create';
import { GroupDetail } from './pages/group-detail/group-detail';
import { GroupEdit } from './pages/group-edit/group-edit';
import { Dashboard } from './pages/dashboard/dashboard';

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
  {
    path: ROUTE_PATHS.REGISTER,
    loadComponent: () =>
      import('./pages/register/register').then(
        (m: typeof import('./pages/register/register')) => m.Register,
      ),
  },

  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard',
  },
  {
    path: 'groups/create',
    component: GroupCreate,
    title: 'Create Group',
  },
  {
    path: 'groups/:id',
    component: GroupDetail,
    title: 'Group Details',
  },
  {
    path: 'groups/:id/edit',
    component: GroupEdit,
    title: 'Edit Group',
  },
];
