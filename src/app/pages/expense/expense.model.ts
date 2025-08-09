export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'Food', name: 'Food & Dining', icon: 'bi bi-egg-fried' },
  { id: 'Transport', name: 'Transportation', icon: 'bi bi-truck' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'bi bi-film' },
  { id: 'Utilities', name: 'Utilities', icon: 'bi bi-lightbulb-fill' },
  { id: 'other', name: 'Other', icon: 'bi bi-box' },
];
