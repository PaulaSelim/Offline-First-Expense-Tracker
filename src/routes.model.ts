export enum ROUTE_PATHS {
  LOGIN = 'login',
  REGISTER = 'register',
  PROFILE = 'profile',
  ROOT = '',
  DASHBOARD = 'dashboard',
  GROUPS = 'groups/create',
  GROUP_DETAIL = 'groups/:id',
  GROUP_EDIT = 'groups/:id/edit',
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
}
