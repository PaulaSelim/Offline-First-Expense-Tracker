import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTER_LINKS } from '../../../routes.model';

@Component({
  selector: 'app-unauthorized',
  imports: [],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Unauthorized {
  readonly ROUTER_LINKS: typeof ROUTER_LINKS = ROUTER_LINKS;
  private router: Router = inject(Router);

  backToDashboard(): void {
    this.router.navigate([ROUTER_LINKS.LOGIN]);
  }
}
