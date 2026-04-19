import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pcto',
  imports: [],
  templateUrl: './pcto.component.html',
  styleUrl: './pcto.component.css',
})
export class PctoComponent {
  private router = inject(Router)

  goToOrdini() {
    this.router.navigate(['/richieste-ordini'])
  }

  goToHome() {
    this.router.navigate(['/home'])
  }

  goToChiSiamo() {
    this.router.navigate(['/chi-siamo'])
  }
}
