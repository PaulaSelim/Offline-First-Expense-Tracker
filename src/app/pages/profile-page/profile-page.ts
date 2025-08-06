import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Signal,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { ROUTER_LINKS } from '../../../routes.model';
import { AuthFacade } from '../../service/auth/auth.facade';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private router: Router = inject(Router);
  private readonly userProvider: AuthFacade = inject(AuthFacade);
  readonly ROUTER_LINKS: typeof ROUTER_LINKS = ROUTER_LINKS;

  ngOnInit(): void {
    this.userProvider.getProfile();
  }

  readonly username: Signal<string> = this.userProvider.getCurrentUsername();
  readonly userEmail: Signal<string> = this.userProvider.getCurrentUserEmail();
  readonly userCreatedAt: Signal<string | undefined> = computed(() => {
    const dateTime: string | undefined =
      this.userProvider.getCurrentUserCreatedAt()();
    return dateTime?.split('T')[0];
  });
  readonly userId: Signal<string> = this.userProvider.getCurrentUserId();

  logout(): void {
    this.userProvider.logout();
  }

  navigateToDashboard(): void {
    this.router.navigate([ROUTER_LINKS.DASHBOARD]);
  }
}
