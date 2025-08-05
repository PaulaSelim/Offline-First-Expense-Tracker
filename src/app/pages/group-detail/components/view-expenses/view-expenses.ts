import {
  ChangeDetectionStrategy,
  Component,
  output,
  OutputEmitterRef,
} from '@angular/core';

@Component({
  selector: 'app-view-expenses',
  imports: [],
  templateUrl: './view-expenses.html',
  styleUrl: './view-expenses.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewExpenses {
  viewExpenses: OutputEmitterRef<void> = output<void>();

  onViewExpenses(): void {
    this.viewExpenses.emit();
  }
}
