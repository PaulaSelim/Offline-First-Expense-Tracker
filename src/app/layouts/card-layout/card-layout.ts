import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';

@Component({
  selector: 'app-card-layout',
  imports: [],
  templateUrl: './card-layout.html',
  styleUrl: './card-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLayout {
  readonly cardTitle: InputSignal<string> = input.required();
  readonly cardIcon: InputSignal<string> = input.required();
}
