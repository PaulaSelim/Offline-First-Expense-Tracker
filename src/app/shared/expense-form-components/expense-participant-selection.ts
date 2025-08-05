import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { GroupMember } from '../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-expense-participant-selection',
  standalone: true,
  imports: [],
  template: `
    <div class="form-group mb-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <label class="form-label text-white mb-0">Split Between</label>
        <div>
          <button
            type="button"
            class="btn btn-outline-light btn-sm me-2"
            (click)="selectAll.emit()"
          >
            Select All
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            (click)="clearAll.emit()"
          >
            Clear All
          </button>
        </div>
      </div>
      <div class="row">
        @for (member of members(); track member.id) {
          <div class="col-md-6 mb-2">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                [id]="'participant-' + member.id"
                [checked]="isSelected()(member.id)"
                (change)="toggleParticipant.emit({id: member.id, selected: $any($event.target).checked})"
              />
              <label class="form-check-label text-white" [for]="'participant-' + member.id">
                {{ member.username || member.email }}
              </label>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseParticipantSelection {
  readonly members: InputSignal<GroupMember[]> = input.required();
  readonly isSelected: InputSignal<(memberId: string) => boolean> = input.required();
  
  readonly selectAll: OutputEmitterRef<void> = output();
  readonly clearAll: OutputEmitterRef<void> = output();
  readonly toggleParticipant: OutputEmitterRef<{id: string, selected: boolean}> = output();
}