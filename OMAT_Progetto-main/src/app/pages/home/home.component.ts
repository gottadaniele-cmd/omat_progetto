import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private router = inject(Router)

  goToOrdini() {
    this.router.navigate(['/richieste-ordini'])
  }

  goToPCTO() {
    this.router.navigate(['/pcto'])
  }

  goToChiSiamo() {
    this.router.navigate(['/chi-siamo'])
  }
} 