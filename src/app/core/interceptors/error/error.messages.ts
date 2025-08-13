export enum ERROR_MESSAGES {
  UNABLE_TO_CONNECT = 'Unable to connect to server',
  BAD_REQUEST = 'Bad Request: Invalid request data',
  UNAUTHORIZED = 'Authentication required or invalid',
  FORBIDDEN = 'Access denied',
  NOT_FOUND = 'Resource not found',
  CONFLICT = 'Resource conflict (e.g., duplicate email)',
  VALIDATION_ERROR = 'Validation errors',
  SERVER_ERROR = 'Internal Server Error',
  UNEXPECTED = 'An unexpected error occurred',
}
