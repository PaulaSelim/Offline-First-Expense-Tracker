import { RxJsonSchema } from 'rxdb';

export interface UserDocument {
  id: string;
  email: string;
  username: string;
  token?: string;
  refresh_token?: string;
  created_at?: string;
  updated_at?: string;
}

export const usersSchema: RxJsonSchema<UserDocument> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    email: { type: 'string', format: 'email' },
    username: { type: 'string' },
    token: { type: 'string' },
    refresh_token: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'email', 'username'],
};
