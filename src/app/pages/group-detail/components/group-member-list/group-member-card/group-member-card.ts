import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import {
  GroupMember,
  GroupRole,
} from '../../../../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-group-member-card',
  imports: [CommonModule],
  templateUrl: './group-member-card.html',
  styleUrl: './group-member-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMemberCard {
  member: InputSignal<GroupMember> = input.required();
  isAdmin: InputSignal<boolean> = input.required();

  updateRole: OutputEmitterRef<string> = output();
  remove: OutputEmitterRef<string> = output();

  GroupRole: typeof GroupRole = GroupRole;

  onToggleRole(): void {
    this.updateRole.emit(this.member().id);
  }

  onRemove(): void {
    this.remove.emit(this.member().id);
  }
}
