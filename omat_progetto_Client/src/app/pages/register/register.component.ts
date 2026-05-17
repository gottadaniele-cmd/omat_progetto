import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OmatApiService } from '../../core/api/omat-api.service';

type RegisterType = 'azienda' | 'studente' | 'admin';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly formBuilder = new FormBuilder();
  private readonly api = inject(OmatApiService);
  private readonly router = inject(Router);

  protected readonly selectedType = signal<RegisterType>('azienda');
  protected readonly submitError = signal('');
  protected readonly submitSuccess = signal('');

  protected readonly title = computed(() => {
    const labels: Record<RegisterType, string> = {
      azienda: 'Registrazione azienda',
      studente: 'Registrazione studente',
      admin: 'Registrazione admin',
    };

    return labels[this.selectedType()];
  });

  protected readonly companyForm = this.formBuilder.nonNullable.group({
    nomeAzienda: ['', [Validators.required, Validators.minLength(2)]],
    emailAzienda: ['', [Validators.required, Validators.email]],
    luogo: ['', Validators.required],
    contattoTelefonico: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly studentForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    cognome: [''],
    numeroTelefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    citta: [''],
    cap: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly adminForm = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    cognome: ['', [Validators.required, Validators.minLength(2)]],
    ruolo: ['', Validators.required],
    dataNascita: ['', Validators.required],
    numeroTelefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected selectType(type: RegisterType): void {
    this.selectedType.set(type);
    this.submitError.set('');
    this.submitSuccess.set('');
  }

  protected submitRegister(): void {
    this.submitError.set('');
    this.submitSuccess.set('');

    if (this.selectedType() === 'azienda') {
      this.registerCompany();
      return;
    }

    if (this.selectedType() === 'studente') {
      this.registerStudent();
      return;
    }

    this.registerAdmin();
  }

  private registerCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.api.registerCompany(this.companyForm.getRawValue()).subscribe({
      next: () => this.handleSuccess('Azienda registrata correttamente. Ora puoi effettuare il login.'),
      error: (error) => this.handleError(error),
    });
  }

  private registerStudent(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const value = this.studentForm.getRawValue();

    this.api
      .registerStudent({
        ...value,
        cap: Number(value.cap),
      })
      .subscribe({
        next: () =>
          this.handleSuccess('Studente registrato correttamente. Ora puoi accedere e prenotare il PCTO.'),
        error: (error) => this.handleError(error),
      });
  }

  private registerAdmin(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.api.registerAdmin(this.adminForm.getRawValue()).subscribe({
      next: () => this.handleSuccess('Admin registrato correttamente. Ora puoi accedere alla dashboard.'),
      error: (error) => this.handleError(error),
    });
  }

  private handleSuccess(message: string): void {
    this.submitSuccess.set(message);
    setTimeout(() => this.router.navigate(['/login']), 900);
  }

  private handleError(error: unknown): void {
    console.error(error);
    this.submitError.set('Registrazione non completata. Verifica i dati inseriti o riprova.');
  }
}
