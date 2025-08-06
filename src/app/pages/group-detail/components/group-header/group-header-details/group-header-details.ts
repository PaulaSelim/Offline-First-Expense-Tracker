import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';

@Component({
  selector: 'app-group-header-details',
  imports: [],
  templateUrl: './group-header-details.html',
  styleUrl: './group-header-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupHeaderDetails {
  name: InputSignal<string | undefined> = input.required<string | undefined>();
  description: InputSignal<string | undefined> = input.required<
    string | undefined
  >();
}
