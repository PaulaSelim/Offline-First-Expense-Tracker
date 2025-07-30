import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  port: 8000,
  get apiUrl() {
    return `http://localhost:${this.port}/api/v1`;
  },
};
