import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../../../core/api/groupApi/groupApi.model';
import { GroupFacade } from '../../../../service/group/group.facade';
import { GroupMemberCard } from './group-member-card/group-member-card';
@Component({
  selector: 'app-group-member-list',
  imports: [GroupMemberCard],
  templateUrl: './group-member-list.html',
  styleUrl: './group-member-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMemberList {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);

  readonly members: Signal<GroupMember[]> =
    this.groupProvider.getGroupMembers();
  readonly isLoading: Signal<boolean> = this.groupProvider.isLoading();
  readonly group: Signal<Group | null> = this.groupProvider.getSelectedGroup();

  readonly isCurrentUserAdmin: Signal<boolean> = computed(
    () => this.group()?.user_role === GroupRole.ADMIN,
  );

  onToggleRole(memberId: string): void {
    const member: GroupMember | undefined = this.members().find(
      (m: GroupMember) => m.id === memberId,
    );
    if (!member) return;

    const newRole: GroupRole =
      member.role === GroupRole.ADMIN ? GroupRole.MEMBER : GroupRole.ADMIN;

    if (confirm(`Change ${member.email}'s role to ${newRole}?`)) {
      this.groupProvider.updateMemberRole(this.group()!.id, memberId, newRole);
    }
  }

  onRemoveMember(memberId: string): void {
    const member: GroupMember | undefined = this.members().find(
      (m: GroupMember) => m.id === memberId,
    );
    if (member && confirm(`Remove ${member.email} from this group?`)) {
      this.groupProvider.removeMember(this.group()!.id, memberId);
    }
  }
  onAddMember(): void {
    const email: string | null = prompt('Enter member email:');
    if (email && email.trim()) {
      this.groupProvider.addMember(this.group()!.id, {
        email: email.trim(),
        role: GroupRole.MEMBER,
      });
    }
  }
}
