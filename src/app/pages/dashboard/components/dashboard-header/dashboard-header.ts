import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ROUTER_LINKS } from '../../../../../routes.model';
import { AuthFacade } from '../../../../service/auth/auth.facade';

@Component({
  selector: 'app-dashboard-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeader implements OnInit {
  private router: Router = inject(Router);
  private readonly userProvider: AuthFacade = inject(AuthFacade);
  readonly ROUTER_LINKS: typeof ROUTER_LINKS = ROUTER_LINKS;
  ngOnInit(): void {
    this.userProvider.getProfile();
  }
  readonly username: Signal<string> = this.userProvider.getCurrentUsername();
  readonly userEmail: Signal<string> = this.userProvider.getCurrentUserEmail();

  logout(): void {
    this.userProvider.logout();
  }

  navigateToProfile(): void {
    this.router.navigate([ROUTER_LINKS.PROFILE]);
  }
}
