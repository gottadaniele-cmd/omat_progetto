import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChiSiamoComponent } from "../chi-siamo/chi-siamo.component";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-home',
  imports: [ChiSiamoComponent, SidebarComponent],
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
}
