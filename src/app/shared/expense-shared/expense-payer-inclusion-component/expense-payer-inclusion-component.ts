import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-payer-inclusion',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './expense-payer-inclusion-component.html',
  styleUrls: ['./expense-payer-inclusion-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensePayerInclusionComponent {
  form: InputSignal<FormGroup> = input.required();
}
