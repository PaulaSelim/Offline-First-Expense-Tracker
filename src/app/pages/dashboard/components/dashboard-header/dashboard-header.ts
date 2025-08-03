import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { AuthFacade } from '../../../../service/auth/auth.facade';

@Component({
  selector: 'app-dashboard-header',
  imports: [CommonModule],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeader implements OnInit {
  private readonly userProvider: AuthFacade = inject(AuthFacade);
  ngOnInit(): void {
    this.userProvider.getProfile();
  }
  readonly username: Signal<string> = this.userProvider.getCurrentUsername();
  readonly userEmail: Signal<string> = this.userProvider.getCurrentUserEmail();
}
