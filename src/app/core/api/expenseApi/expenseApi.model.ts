import { Pagination } from '../groupApi/groupApi.model';

export interface ExpenseRequest {
  title: string;
  amount: number;
  payer_id: string;
  category: string;
  date: string;
  is_payer_included: boolean;
  participants_id: string[];
}

export interface Participant {
  user_id: string;
  id?: string;
  email?: string;
  username?: string;
}

export interface Expense {
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

export interface InterfaceUpdateExpenseRequest {
  title: string;
  amount: number;
  category: string;
  date: string;
  participants: Participant[];
}

export interface UserExpense {
  expense_id: string;
  amount: number;
}

export interface UserBalanceResponse {
  data: {
    user_id: string;
    net_balance: number;
    expenses: UserExpense[];
  };
}

export interface ExpenseResponse {
  data: { expense: Expense };
}
export interface ExpenseListResponse {
  data: { expenses: Expense[]; pagination: Pagination };
}

export interface ExpenseUpdateRequest {
  title: string;
  amount: number;
  category: string;
  payer_id: string;
  date: string;
  participants_id: string[];
}
