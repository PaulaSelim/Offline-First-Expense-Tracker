import { Routes } from '@angular/router';
import { ROUTE_PATHS, ROUTER_LINKS } from '../routes.model';
import { authGuard } from './core/guards/auth-guard/auth-guard';
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
    loadComponent: () =>
      import('./pages/group-create/group-create').then(
        (m: typeof import('./pages/group-create/group-create')) =>
          m.GroupCreate,
      ),
    canActivate: [authGuard],
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
  {
    path: ROUTE_PATHS.GROUP_EXPENSES,
    loadComponent: () =>
      import('./pages/expenses/expenses').then(
        (m: typeof import('./pages/expenses/expenses')) => m.Expenses,
      ),
    canActivate: [authGuard],
    title: 'Group Expenses',
  },
  {
    path: ROUTE_PATHS.EXPENSE_CREATE,
    loadComponent: () =>
      import('./pages/expenses/expense-create-form/expense-create-form').then(
        (m: typeof import('./pages/expenses/expense-create-form/expense-create-form')) => m.ExpenseCreateForm,
      ),
    canActivate: [authGuard],
    title: 'Create Expense',
  },
  {
    path: ROUTE_PATHS.EXPENSE_EDIT,
    loadComponent: () =>
      import('./pages/expenses/expense-edit-form/expense-edit-form').then(
        (m: typeof import('./pages/expenses/expense-edit-form/expense-edit-form')) => m.ExpenseEditForm,
      ),
    canActivate: [authGuard],
    title: 'Edit Expense',
  },
];
