import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Group } from '../../../../core/api/groupApi/groupApi.model';
import { AuthFacade } from '../../../../service/auth/auth.facade';
import { GroupFacade } from '../../../../service/group/group.facade';
import { GroupCard } from '../group-card/group-card';

@Component({
  selector: 'app-dashboard-group-list',
  imports: [GroupCard],
  standalone: true,
  templateUrl: './dashboard-group-list.html',
  styleUrls: ['./dashboard-group-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGroupList implements OnInit {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly userProvider: AuthFacade = inject(AuthFacade);
  private readonly router: Router = inject(Router);

  readonly groupList: Signal<Group[]> = this.groupProvider.getGroups();
  readonly username: Signal<string> = this.userProvider.getCurrentUsername();
  readonly isLoading: Signal<boolean> = this.groupProvider.isLoading();
  readonly error: Signal<string | null> = this.groupProvider.getError();

  ngOnInit(): void {
    this.groupProvider.fetchGroups();
  }

  onDelete(groupId: string, groupName: string): void {
    if (
      confirm(
        `Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`,
      )
    ) {
      this.groupProvider.deleteGroup(groupId);
    }
  }

  onViewGroup(groupId: string): void {
    this.router.navigate(['/groups', groupId]);
  }

  onCreateGroup(): void {
    this.router.navigate(['/groups/create']);
  }

  onEditGroup(groupId: string): void {
    this.router.navigate(['/groups', groupId, 'edit']);
  }
}
