import { AfterViewChecked, Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OmatApiService } from '../../core/api/omat-api.service';
import { AuthStateService } from '../../core/auth/auth-state.service';

declare const lucide: any

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})

export class SidebarComponent implements AfterViewChecked {
  private router = inject(Router);
  private api = inject(OmatApiService);
  protected readonly auth = inject(AuthStateService);
  protected readonly user = this.auth.user;
  protected readonly roleLabel = this.auth.displayRole;
  protected readonly canSeeOrders = computed(() => this.auth.role() === 'azienda');
  protected readonly canSeePcto = computed(() => this.auth.role() === 'studente');
  protected readonly canSeeAdmin = computed(() => this.auth.role() === 'admin');

  ngAfterViewChecked(): void {
    lucide.createIcons();
  }

  protected logout(): void {
    this.api.logout().subscribe({
      next: () => {
        this.auth.clearUser();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error(error);
        this.auth.clearUser();
        this.router.navigate(['/login']);
      },
    });
  }
}
