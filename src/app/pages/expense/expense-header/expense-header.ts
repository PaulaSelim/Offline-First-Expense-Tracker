import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  OnInit,
} from '@angular/core';
import { ExpenseStats } from '../expense-stats/expense-stats';
import { GroupFacade } from '../../../service/group/group.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../../../core/api/groupApi/groupApi.model';
@Component({
  selector: 'app-expense-header',
  imports: [ExpenseStats],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expense-header.html',
  styleUrl: './expense-header.scss',
})
export class ExpenseHeader implements OnInit {
  private readonly groupFacade: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly selectedGroup: Signal<Group | null> =
    this.groupFacade.getSelectedGroup();

  private groupId: string = '';
  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.groupId) {
      this.router.navigate(['/dashboard']);
    }
  }
  onAddExpense(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses', 'add']);
  }

  onBackToGroup(): void {
    this.router.navigate(['/groups', this.groupId]);
  }
}
