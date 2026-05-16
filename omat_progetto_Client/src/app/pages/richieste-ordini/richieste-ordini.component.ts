import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { ChiSiamoComponent } from '../chi-siamo/chi-siamo.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ORDER_PRIORITY_LABELS } from '../../core/models/order.model';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

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
export class RichiesteOrdiniComponent {
  private readonly formBuilder = new FormBuilder();

  protected readonly uploadedFiles = signal<File[]>([]);
  protected readonly submitted = signal(false);
  protected readonly requestSent = signal(false);
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
    this.orderForm.valueChanges.pipe(startWith(this.orderForm.getRawValue())),
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

  protected onFilesChanged(files: File[]): void {
    this.uploadedFiles.set(files);
    this.requestSent.set(false);
  }

  protected submitOrder(): void {
    this.submitted.set(true);
    this.requestSent.set(false);

    if (this.orderForm.invalid || !this.uploadedFiles().length) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.orderForm.getRawValue(),
      attachments: this.uploadedFiles().map((file) => ({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      })),
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    console.log('Order request ready for API', payload);
    this.requestSent.set(true);
  }
}
