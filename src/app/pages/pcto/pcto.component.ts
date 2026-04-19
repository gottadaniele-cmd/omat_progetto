import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChiSiamoComponent } from "../chi-siamo/chi-siamo.component";

@Component({
  selector: 'app-pcto',
  imports: [ChiSiamoComponent],
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
}
