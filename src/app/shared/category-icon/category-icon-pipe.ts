// category-icon.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { CATEGORY_ICONS, CategoryKey } from './category-icon.model';

@Pipe({ name: 'categoryIcon' })
export class CategoryIconPipe implements PipeTransform {
  transform(category: string): string {
    const key: CategoryKey = category.toLowerCase() as CategoryKey;
    return CATEGORY_ICONS[key] || CATEGORY_ICONS.other;
  }
}
