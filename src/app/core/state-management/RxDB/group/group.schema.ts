import { RxJsonSchema } from 'rxdb';

export interface GroupDocument {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  user_role?: GroupRole;
}
export enum GroupRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
}

export const groupsSchema: RxJsonSchema<GroupDocument> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    description: { type: 'string' },
    created_by: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    member_count: { type: 'number' },
    user_role: { enum: Object.values(GroupRole) },
  },
  required: [
    'id',
    'name',
    'description',
    'created_by',
    'created_at',
    'updated_at',
    'member_count',
  ],
};
