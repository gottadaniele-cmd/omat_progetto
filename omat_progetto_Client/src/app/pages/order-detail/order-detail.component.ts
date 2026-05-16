import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChiSiamoComponent } from '../chi-siamo/chi-siamo.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MOCK_ORDERS } from '../../core/data/admin-mock-data';
import { ORDER_PRIORITY_LABELS } from '../../core/models/order.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, ChiSiamoComponent, SidebarComponent, StatusBadgeComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderId = this.route.snapshot.paramMap.get('id');

  protected readonly priorityLabels = ORDER_PRIORITY_LABELS;
  protected readonly order = computed(() => MOCK_ORDERS.find((item) => item.id === this.orderId));

  protected formatDate(value?: string): string {
    if (!value) {
      return 'Non disponibile';
    }

    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  protected formatSize(size: number): string {
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
}
