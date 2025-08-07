export const CATEGORY_ICONS: Icons = {
  food: 'bi bi-egg-fried',
  transport: 'bi bi-car-front',
  entertainment: 'bi bi-film',
  utilities: 'bi bi-lightbulb',
  shopping: 'bi bi-bag',
  other: 'bi bi-box',
};
export type CategoryKey = keyof Icons;
export interface Icons {
  food: string;
  transport: string;
  entertainment: string;
  utilities: string;
  shopping: string;
  other: string;
}
