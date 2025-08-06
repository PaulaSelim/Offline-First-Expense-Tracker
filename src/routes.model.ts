export enum ROUTE_PATHS {
  LOGIN = 'login',
  REGISTER = 'register',
  PROFILE = 'profile',
  ROOT = '',
  DASHBOARD = 'dashboard',
  GROUPS = 'groups/create',
  GROUP_DETAIL = 'groups/:id',
  GROUP_EDIT = 'groups/:id/edit',
  GROUP_EXPENSES = 'groups/:id/expenses',
  EXPENSE_ADD = 'groups/:id/expenses/add',
  EXPENSE_DETAIL = 'groups/:id/expenses/:expenseId',
  EXPENSE_EDIT = 'groups/:id/expenses/:expenseId/edit',
}

export enum ROUTER_LINKS {
  LOGIN = `/${ROUTE_PATHS.LOGIN}`,
  REGISTER = `/${ROUTE_PATHS.REGISTER}`,
  PROFILE = `/${ROUTE_PATHS.PROFILE}`,
  ROOT = `/${ROUTE_PATHS.ROOT}`,
  DASHBOARD = `/${ROUTE_PATHS.DASHBOARD}`,
  GROUPS = `/${ROUTE_PATHS.GROUPS}`,
  GROUP_DETAIL = `/${ROUTE_PATHS.GROUP_DETAIL}`,
  GROUP_EDIT = `/${ROUTE_PATHS.GROUP_EDIT}`,
  GROUP_EXPENSES = `/${ROUTE_PATHS.GROUP_EXPENSES}`,
  EXPENSE_ADD = `/${ROUTE_PATHS.EXPENSE_ADD}`,
  EXPENSE_DETAIL = `/${ROUTE_PATHS.EXPENSE_DETAIL}`,
  EXPENSE_EDIT = `/${ROUTE_PATHS.EXPENSE_EDIT}`,
}
