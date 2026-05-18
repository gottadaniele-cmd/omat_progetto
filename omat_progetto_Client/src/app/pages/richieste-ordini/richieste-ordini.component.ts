import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { ChiSiamoComponent } from '../chi-siamo/chi-siamo.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ORDER_PRIORITY_LABELS } from '../../core/models/order.model';
import { OmatApiService } from '../../core/api/omat-api.service';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AuthStateService } from '../../core/auth/auth-state.service';

@Component({
  selector: 'app-richieste-ordini',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ChiSiamoComponent,
    SidebarComponent,
    FileUploadComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './richieste-ordini.component.html',
  styleUrl: './richieste-ordini.component.css',
})
export class RichiesteOrdiniComponent implements OnInit {
  private readonly formBuilder = new FormBuilder();
  private readonly api = inject(OmatApiService);
  private readonly auth = inject(AuthStateService);

  protected readonly uploadedFiles = signal<File[]>([]);
  protected readonly submitted = signal(false);
  protected readonly requestSent = signal(false);
  protected readonly submitError = signal('');
  protected readonly priorityLabels = ORDER_PRIORITY_LABELS;

  protected readonly orderForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    customer: ['', [Validators.required, Validators.minLength(2)]],
    material: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    priority: ['standard', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]],
    notes: [''],
  });

  private readonly orderFormValue = toSignal(
    this.orderForm.valueChanges.pipe(
      startWith(null),
      map(() => this.orderForm.getRawValue()),
    ),
    { initialValue: this.orderForm.getRawValue() },
  );

  protected readonly summary = computed(() => {
    const value = this.orderFormValue();

    return {
      customer: value.customer || 'Cliente non indicato',
      material: value.material || 'Materiale da definire',
      quantity: value.quantity || 1,
      priority: this.priorityLabels[value.priority as keyof typeof ORDER_PRIORITY_LABELS],
      files: this.uploadedFiles().length,
    };
  });

  ngOnInit(): void {
    const currentUser = this.auth.user();
    if (currentUser && currentUser.role === 'azienda') {
      this.orderForm.controls.customer.setValue(currentUser.name);
      this.orderForm.controls.customer.disable();
    }
  }

  protected onFilesChanged(files: File[]): void {
    this.uploadedFiles.set(files);
    this.requestSent.set(false);
  }

  protected submitOrder(): void {
    this.submitted.set(true);
    this.requestSent.set(false);
    this.submitError.set('');

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const value = this.orderForm.getRawValue();
    const payload = {
      title: value.title,
      idAzienda: value.customer, // Se admin, qui dovrebbe esserci l'ID numerico
      material: value.material,
      description: value.description,
      priority: value.priority,
      quantity: value.quantity,
      notes: value.notes,
      attachments: this.uploadedFiles().map((file) => ({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      })),
    };

    this.api.createOrder(payload).subscribe({
      next: () => {
        this.requestSent.set(true);
        // Reset del form mantenendo il valore del cliente se azienda
        const customerValue = this.orderForm.controls.customer.value;
        this.orderForm.reset();
        this.orderForm.patchValue({ customer: customerValue, quantity: 1, priority: 'standard' });
        this.uploadedFiles.set([]);
        this.submitted.set(false);
      },
      error: (error) => {
        console.error(error);
        if (error.status === 401 || error.status === 403) {
          this.submitError.set('Sessione scaduta o permessi insufficienti. Prova a rifare il login.');
        } else if (error.status === 400) {
          this.submitError.set('Dati dell\'ordine non validi. Controlla i campi inseriti.');
        } else {
          this.submitError.set('Errore del server. Riprova più tardi.');
        }
      },
    });
  }
}
