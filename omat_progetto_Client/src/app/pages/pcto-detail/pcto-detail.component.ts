import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChiSiamoComponent } from '../chi-siamo/chi-siamo.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MOCK_PCTO_REQUESTS } from '../../core/data/admin-mock-data';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-pcto-detail',
  standalone: true,
  imports: [RouterLink, ChiSiamoComponent, SidebarComponent, StatusBadgeComponent],
  templateUrl: './pcto-detail.component.html',
  styleUrl: './pcto-detail.component.css',
})
export class PctoDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly requestId = this.route.snapshot.paramMap.get('id');

  protected readonly request = computed(() =>
    MOCK_PCTO_REQUESTS.find((item) => item.id === this.requestId),
  );

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
}
