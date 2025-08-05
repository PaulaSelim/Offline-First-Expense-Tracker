import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../core/api/groupApi/groupApi.model';
import { GroupFacade } from '../../service/group/group.facade';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { Unauthorized } from '../unauthorized/unauthorized';
import { GroupHeader } from './components/group-header/group-header';
import { GroupMemberList } from './components/group-member-list/group-member-list';
import { ViewExpenses } from './components/view-expenses/view-expenses';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    GroupMemberList,
    GroupHeader,
    Unauthorized,
    ViewExpenses,
    LoadingSpinner,
  ],
  templateUrl: './group-detail.html',
  styleUrls: ['./group-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetail implements OnInit {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly GroupRole: typeof GroupRole = GroupRole;

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

  onViewExpenses(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses']);
  }
}
