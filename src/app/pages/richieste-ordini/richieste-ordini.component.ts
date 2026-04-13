import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-richieste-ordini',
  imports: [],
  templateUrl: './richieste-ordini.component.html',
  styleUrl: './richieste-ordini.component.css',
})
export class RichiesteOrdiniComponent {
  private router = inject(Router)

  goToPCTO() {
    this.router.navigate(['/pcto'])
  }

  goToHome() {
    this.router.navigate(['/home'])
  }
}
