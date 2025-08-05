export enum ROUTE_PATHS {
  LOGIN = 'login',
  REGISTER = 'register',
  ROOT = '',
  DASHBOARD = 'dashboard',
  GROUPS = 'groups/create',
  GROUP_DETAIL = 'groups/:id',
  GROUP_EDIT = 'groups/:id/edit',
  GROUP_EXPENSES = 'groups/:id/expenses',
  EXPENSE_CREATE = 'groups/:id/expenses/create',
  EXPENSE_EDIT = 'groups/:id/expenses/:expenseId/edit',
}

export enum ROUTER_LINKS {
  LOGIN = `/${ROUTE_PATHS.LOGIN}`,
  REGISTER = `/${ROUTE_PATHS.REGISTER}`,
  ROOT = `/${ROUTE_PATHS.ROOT}`,
  DASHBOARD = `/${ROUTE_PATHS.DASHBOARD}`,
  GROUPS = `/${ROUTE_PATHS.GROUPS}`,
  GROUP_DETAIL = `/${ROUTE_PATHS.GROUP_DETAIL}`,
  GROUP_EDIT = `/${ROUTE_PATHS.GROUP_EDIT}`,
  GROUP_EXPENSES = `/${ROUTE_PATHS.GROUP_EXPENSES}`,
  EXPENSE_CREATE = `/${ROUTE_PATHS.EXPENSE_CREATE}`,
  EXPENSE_EDIT = `/${ROUTE_PATHS.EXPENSE_EDIT}`,
}
