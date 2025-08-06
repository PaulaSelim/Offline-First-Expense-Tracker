import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_PATHS, ROUTER_LINKS } from '../../../../../../routes.model';

@Component({
  selector: 'app-group-header-actions',
  imports: [CommonModule],
  templateUrl: './group-header-actions.html',
  styleUrl: './group-header-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupHeaderActions {
  readonly router: Router = inject(Router);
  readonly ROUTER_LINKS: typeof ROUTER_LINKS = ROUTER_LINKS;

  isAdmin: InputSignal<boolean> = input.required<boolean>();
  edit: OutputEmitterRef<void> = output<void>();
  delete: OutputEmitterRef<void> = output<void>();

  onEdit(): void {
    this.edit.emit();
  }
  onDelete(): void {
    this.delete.emit();
  }
  onBack(): void {
    this.router.navigate([ROUTE_PATHS.DASHBOARD]);
  }
}
