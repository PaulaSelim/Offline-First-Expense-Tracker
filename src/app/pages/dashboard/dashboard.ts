import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { Group } from '../../core/api/groupApi/groupApi.model';
import { AuthFacade } from '../../service/auth/auth.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { DashboardGroupList } from './components/dashboard-todo-list/dashboard-group-list';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardGroupList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly userProvider: AuthFacade = inject(AuthFacade);
  ngOnInit(): void {
    this.userProvider.getProfile();
  }

  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  readonly groupList: Signal<Group[]> = this.groupProvider.getGroups();
  readonly username: Signal<string> = this.userProvider.getCurrentUsername();
  readonly userEmail: Signal<string> = this.userProvider.getCurrentUserEmail();

  onAdd(name: string, description: string): void {
    this.groupProvider.createGroup({
      name,
      description,
    });
  }
}
