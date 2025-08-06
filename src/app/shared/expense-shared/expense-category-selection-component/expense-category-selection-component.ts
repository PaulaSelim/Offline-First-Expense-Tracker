import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../../pages/expense/expense.model';

@Component({
  selector: 'app-expense-category-selection',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './expense-category-selection-component.html',
  styleUrls: ['./expense-category-selection-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCategorySelectionComponent {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  categories: InputSignal<Category[]> = input.required();
}
