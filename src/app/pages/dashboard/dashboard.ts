import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardGroupList } from './components/dashboard-Group-list/dashboard-group-list';
import { DashboardHeader } from './components/dashboard-header/dashboard-header';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardGroupList, DashboardHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
