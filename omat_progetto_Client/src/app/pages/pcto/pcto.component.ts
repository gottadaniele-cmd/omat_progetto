import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { ChiSiamoComponent } from '../chi-siamo/chi-siamo.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { OmatApiService } from '../../core/api/omat-api.service';

@Component({
  selector: 'app-pcto',
  standalone: true,
  imports: [ReactiveFormsModule, ChiSiamoComponent, SidebarComponent, StatusBadgeComponent],
  templateUrl: './pcto.component.html',
  styleUrl: './pcto.component.css',
})
export class PctoComponent {
  private readonly formBuilder = new FormBuilder();
  private readonly api = inject(OmatApiService);

  protected readonly submitted = signal(false);
  protected readonly requestSent = signal(false);
  protected readonly submitError = signal('');

  public savedMail = ''

  protected readonly pctoForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    city: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    school: ['', [Validators.required, Validators.minLength(3)]],
    classYear: ['', Validators.required],
    studyProgram: ['', [Validators.required, Validators.minLength(3)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    motivation: ['', [Validators.required, Validators.minLength(30)]],
  });

  private readonly pctoFormValue = toSignal(
    this.pctoForm.valueChanges.pipe(startWith(this.pctoForm.getRawValue())),
    { initialValue: this.pctoForm.getRawValue() },
  );

  protected readonly summary = computed(() => {
    const value = this.pctoFormValue();

    return {
      student:
        value.firstName || value.lastName
          ? `${value.firstName} ${value.lastName}`.trim()
          : 'Studente non indicato',
      school: value.school || 'Scuola da indicare',
      classYear: value.classYear ? `${value.classYear}ª` : 'Classe da indicare',
      studyProgram: value.studyProgram || 'Indirizzo da indicare',
      period:
        value.startDate && value.endDate
          ? `${this.formatDate(value.startDate)} - ${this.formatDate(value.endDate)}`
          : 'Periodo da indicare',
    };
  });

  protected submitPctoRequest(): void {
    this.submitted.set(true);
    this.requestSent.set(false);
    this.submitError.set('');

    if (this.pctoForm.invalid || !this.hasValidDateRange()) {
      this.pctoForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.pctoForm.getRawValue(),
      email: this.pctoForm.getRawValue().email,
    };

    this.api.createPctoRequest(payload).subscribe({
      next: () => this.requestSent.set(true),
      error: (error) => {
        console.error(error);
        this.submitError.set('Impossibile inviare la richiesta PCTO. Riprova tra poco.');
      },
    });
  }

  protected hasValidDateRange(): boolean {
    const { startDate, endDate } = this.pctoForm.getRawValue();

    if (!startDate || !endDate) {
      return false;
    }

    return new Date(startDate) <= new Date(endDate);
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
}
