import {
  Component,
  inject,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
import { GroupFacade } from '../../service/group/group.facade';
import { AuthFacade } from '../../service/auth/auth.facade';
import { Group } from '../../core/api/groupApi/groupApi.model';
import { DashboardGroupList } from './components/dashboard-todo-list/dashboard-group-list';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardGroupList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly userProvider: AuthFacade = inject(AuthFacade);

  readonly groupList: Signal<Group[]> = this.groupProvider.getGroups();
  readonly username: Signal<string> = this.userProvider.getCurrentUsername();

  onAdd(name: string, description: string): void {
    this.groupProvider.createGroup({
      name,
      description,
    });
  }
}
