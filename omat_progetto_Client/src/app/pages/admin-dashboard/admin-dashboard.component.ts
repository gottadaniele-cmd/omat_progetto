import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChiSiamoComponent } from '../chi-siamo/chi-siamo.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ORDER_PRIORITY_LABELS, OrderStatus } from '../../core/models/order.model';
import { PctoRequestStatus } from '../../core/models/pcto-request.model';
import { MOCK_ORDERS, MOCK_PCTO_REQUESTS } from '../../core/data/admin-mock-data';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, ChiSiamoComponent, SidebarComponent, StatusBadgeComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  protected readonly orders = signal(MOCK_ORDERS);
  protected readonly pctoRequests = signal(MOCK_PCTO_REQUESTS);
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<OrderStatus | 'all'>('all');
  protected readonly pctoSearchTerm = signal('');
  protected readonly pctoStatusFilter = signal<PctoRequestStatus | 'all'>('all');
  protected readonly priorityLabels = ORDER_PRIORITY_LABELS;

  protected readonly filteredOrders = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.orders().filter((order) => {
      const matchesStatus = status === 'all' || order.status === status;
      const matchesSearch =
        !search ||
        [order.code, order.title, order.customer, order.material, order.assignedAdmin].some((value) =>
          value.toLowerCase().includes(search),
        );

      return matchesStatus && matchesSearch;
    });
  });

  protected readonly activeOrders = computed(
    () =>
      this.orders().filter((order) =>
        ['under-review', 'approved', 'in-production'].includes(order.status),
      ).length,
  );

  protected readonly completedOrders = computed(
    () => this.orders().filter((order) => order.status === 'completed').length,
  );

  protected readonly urgentOrders = computed(
    () => this.orders().filter((order) => order.priority !== 'standard').length,
  );

  protected readonly filteredPctoRequests = computed(() => {
    const search = this.pctoSearchTerm().trim().toLowerCase();
    const status = this.pctoStatusFilter();

    return this.pctoRequests().filter((request) => {
      const student = `${request.studentName} ${request.studentSurname}`;
      const matchesStatus = status === 'all' || request.status === status;
      const matchesSearch =
        !search ||
        [student, request.email, request.school, request.studyProgram, request.city].some((value) =>
          value.toLowerCase().includes(search),
        );

      return matchesStatus && matchesSearch;
    });
  });

  protected readonly pendingPctoRequests = computed(
    () =>
      this.pctoRequests().filter((request) => ['sent', 'under-review'].includes(request.status))
        .length,
  );

  protected readonly approvedPctoRequests = computed(
    () => this.pctoRequests().filter((request) => request.status === 'approved').length,
  );

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
}
