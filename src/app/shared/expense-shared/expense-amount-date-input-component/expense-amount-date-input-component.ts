import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-amount-date-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './expense-amount-date-input-component.html',
  styleUrls: ['./expense-amount-date-input-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseAmountDateInputComponent {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
}
