import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';

@Component({
  selector: 'app-card-shared',
  imports: [],
  templateUrl: './card-shared.html',
  styleUrl: './card-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardShared {
  readonly cardTitle: InputSignal<string> = input.required();
  readonly cardIcon: InputSignal<string> = input.required();
}
