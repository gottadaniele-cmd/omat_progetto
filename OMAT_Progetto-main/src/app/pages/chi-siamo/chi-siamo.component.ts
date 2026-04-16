import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chi-siamo',
  imports: [],
  templateUrl: './chi-siamo.component.html',
  styleUrl: './chi-siamo.component.css',
})
export class ChiSiamoComponent {
  private router = inject(Router)

  goToPCTO() {
    this.router.navigate(['/pcto'])
  }

  goToHome() {
    this.router.navigate(['/home'])
  }
    goToOrdini() {
    this.router.navigate(['/richieste-ordini'])
    }
}
