import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';

@Component({
  selector: 'app-group-header-stats',
  imports: [CommonModule],
  templateUrl: './group-header-stats.html',
  styleUrl: './group-header-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupHeaderStats {
  memberCount: InputSignal<number | undefined> = input.required<
    number | undefined
  >();
  role: InputSignal<string | undefined> = input.required<string | undefined>();
  createdAt: InputSignal<string | undefined> = input.required<
    string | undefined
  >();
}
