import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { Group } from '../../../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-group-card',
  imports: [CommonModule],
  templateUrl: './group-card.html',
  styleUrl: './group-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCard {
  group: InputSignal<Group> = input.required();

  view: OutputEmitterRef<string> = output();
  edit: OutputEmitterRef<string> = output();
  delete: OutputEmitterRef<{ id: string; name: string }> = output();

  onView(): void {
    this.view.emit(this.group().id);
  }

  onEdit(): void {
    this.edit.emit(this.group().id);
  }

  onDelete(): void {
    this.delete.emit({ id: this.group().id, name: this.group().name });
  }
}
