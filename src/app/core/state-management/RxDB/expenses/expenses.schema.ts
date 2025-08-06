import { RxJsonSchema } from 'rxdb';

export interface ExpenseDocument {
  id: string;
  group_id: string;
  group_name?: string;
  title: string;
  amount: number;
  payer_id?: string;
  category: string;
  date: string;
  created_at: string;
  updated_at: string;
  payer?: Participant;
  participants?: Participant[];
  participant_count?: number;
}

export interface Participant {
  user_id: string;
  id?: string;
  email?: string;
  username?: string;
}

export const expensesSchema: RxJsonSchema<ExpenseDocument> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    group_id: { type: 'string', maxLength: 100 },
    group_name: { type: 'string', maxLength: 100 },
    title: { type: 'string' },
    amount: { type: 'number' },
    payer_id: { type: 'string', maxLength: 100 },
    category: { type: 'string' },
    date: { type: 'string', format: 'date-time' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
    payer: {
      type: 'object',
      properties: {
        user_id: { type: 'string', maxLength: 100 },
        email: { type: 'string', maxLength: 100 },
        username: { type: 'string', maxLength: 100 },
      },
    },
    participants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user_id: { type: 'string', maxLength: 100 },
          id: { type: 'string', maxLength: 100 },
          email: { type: 'string', maxLength: 100 },
          username: { type: 'string', maxLength: 100 },
        },
      },
    },
    participant_count: { type: 'number' },
  },
  required: ['id'],
};
