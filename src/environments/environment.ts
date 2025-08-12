import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  port: 8000,
  get apiUrl() {
    return `http://localhost:${this.port}/api/v1`;
  },
};

export const webSocketEnvironment: Environment = {
  production: false,
  webSocketPort: 8000,
  get webSocketUrl() {
    return `ws://localhost:${this.webSocketPort}/api/v2`;
  },
};
