import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS } from '../../../../../routes.model';
import { Group, GroupRole } from '../../../../core/api/groupApi/groupApi.model';
import { GroupFacade } from '../../../../service/group/group.facade';
import { GroupHeaderActions } from './group-header-actions/group-header-actions';
import { GroupHeaderDetails } from './group-header-details/group-header-details';
import { GroupHeaderStats } from './group-header-stats/group-header-stats';

@Component({
  selector: 'app-group-header',
  imports: [GroupHeaderDetails, GroupHeaderActions, GroupHeaderStats],
  templateUrl: './group-header.html',
  styleUrl: './group-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupHeader {
  private readonly router: Router = inject(Router);

  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  readonly selectedGroup: Signal<Group | null> =
    this.groupProvider.getSelectedGroup();
  readonly isCurrentUserAdmin: Signal<boolean> = computed(
    () => this.selectedGroup()?.user_role === GroupRole.ADMIN,
  );

  onEditGroup(): void {
    this.router.navigate(['/groups', this.selectedGroup()!.id, 'edit']);
  }
  onDeleteGroup(): void {
    const group: Group | null = this.selectedGroup();
    if (
      group &&
      confirm(
        `Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`,
      )
    ) {
      this.groupProvider.deleteGroup(this.selectedGroup()!.id);
      this.router.navigate([ROUTE_PATHS.DASHBOARD]);
    }
  }
  isAdmin(): boolean {
    return this.isCurrentUserAdmin();
  }
  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
