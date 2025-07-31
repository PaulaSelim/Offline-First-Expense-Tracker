export enum ROUTE_PATHS {
  LOGIN = 'login',
  REGISTER = 'register',
  ROOT = '',
}

export enum ROUTER_LINKS {
  LOGIN = `/${ROUTE_PATHS.LOGIN}`,
  REGISTER = `/${ROUTE_PATHS.REGISTER}`,
  ROOT = `/${ROUTE_PATHS.ROOT}`,
}
