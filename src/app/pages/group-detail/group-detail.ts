import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { GroupFacade } from '../../service/group/group.facade';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './group-detail.html',
  styleUrls: ['./group-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetail implements OnInit {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly selectedGroup: Signal<Group | null> =
    this.groupProvider.getSelectedGroup();
  readonly groupMembers: Signal<GroupMember[]> =
    this.groupProvider.getGroupMembers();
  readonly isLoadingMembers: Signal<boolean> = this.groupProvider.isLoading();

  private groupId: string = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadGroupData();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadGroupData(): void {
    this.isLoading.set(true);

    this.groupProvider.fetchGroupById(this.groupId);

    this.groupProvider.fetchGroupMembers(this.groupId);

    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onEditGroup(): void {
    this.router.navigate(['/groups', this.groupId, 'edit']);
  }

  onDeleteGroup(): void {
    const group: Group | null = this.selectedGroup();
    if (
      group &&
      confirm(
        `Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`,
      )
    ) {
      this.groupProvider.deleteGroup(this.groupId);
      this.router.navigate(['/dashboard']);
    }
  }

  onRemoveMember(memberId: string, memberEmail: string): void {
    if (
      confirm(`Are you sure you want to remove ${memberEmail} from this group?`)
    ) {
      this.groupProvider.removeMember(this.groupId, memberId);
    }
  }

  onUpdateMemberRole(memberId: string, currentRole: GroupRole): void {
    const newRole: GroupRole =
      currentRole === GroupRole.ADMIN ? GroupRole.MEMBER : GroupRole.ADMIN;
    if (confirm(`Change member role to ${newRole}?`)) {
      this.groupProvider.updateMemberRole(this.groupId, memberId, newRole);
    }
  }

  onAddMember(): void {
    const email: string | null = prompt('Enter member email:');
    if (email && email.trim()) {
      this.groupProvider.addMember(this.groupId, {
        email: email.trim(),
        role: 'member' as GroupRole,
      });
    }
  }

  onViewExpenses(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses']);
  }

  isCurrentUserAdmin(): boolean {
    const group: Group | null = this.selectedGroup();
    return group?.user_role === 'admin';
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
